// Global state
let socket;
let currentRoom = null;
let playlist = [];
let currentSongIndex = 0;
let isPlaying = false;
let serverTimeOffset = 0;
let isSeeking = false;

// Audio element
const audio = document.getElementById('audio');

// Initialize
function init() {
  socket = io('http://localhost:3001');

  socket.on('connect', () => {
    console.log('Connected to server');
    updateStatus('Connected', true);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateStatus('Disconnected', false);
  });

  // Room state received when joining
  socket.on('room-state', (state) => {
    console.log('Room state received:', state);
    playlist = state.playlist;
    currentSongIndex = state.currentSongIndex;
    isPlaying = state.isPlaying;

    renderPlaylist();
    loadSong(state.currentSong, state.position);

    if (state.isPlaying) {
      syncTimeOffset(state.serverTime);
      audio.play().catch(e => console.error('Play error:', e));
    }
  });

  // Play event
  socket.on('play', (data) => {
    console.log('Play event:', data);
    syncTimeOffset(data.serverTime);

    if (!isSeeking) {
      audio.currentTime = data.position;
    }

    audio.play().catch(e => console.error('Play error:', e));
    isPlaying = true;
    updatePlayPauseButton();
  });

  // Pause event
  socket.on('pause', (data) => {
    console.log('Pause event:', data);

    if (!isSeeking) {
      audio.currentTime = data.position;
    }

    audio.pause();
    isPlaying = false;
    updatePlayPauseButton();
  });

  // Seek event
  socket.on('seek', (data) => {
    console.log('Seek event:', data);

    if (!isSeeking) {
      audio.currentTime = data.position;
    }
  });

  // Change song event
  socket.on('change-song', (data) => {
    console.log('Change song event:', data);
    currentSongIndex = data.songIndex;
    loadSong(data.song, data.position);

    if (data.isPlaying) {
      audio.play().catch(e => console.error('Play error:', e));
    }

    renderPlaylist();
  });

  // Sync event (heartbeat)
  socket.on('sync', (data) => {
    if (!isPlaying || isSeeking) return;

    const expectedPosition = data.position;
    const actualPosition = audio.currentTime;
    const drift = Math.abs(expectedPosition - actualPosition);

    // If drift is significant, adjust playback
    if (drift > 0.5) {
      console.log(`Sync correction: drift=${drift.toFixed(2)}s`);
      audio.currentTime = expectedPosition;
    } else if (drift > 0.2) {
      // Subtle playback rate adjustment for small drift
      audio.playbackRate = drift > 0 ? 1.05 : 0.95;
      setTimeout(() => {
        audio.playbackRate = 1.0;
      }, 1000);
    }
  });

  // User joined/left
  socket.on('user-joined', (data) => {
    console.log('User joined:', data);
    updateMemberCount(data.memberCount);
  });

  socket.on('user-left', (data) => {
    console.log('User left:', data);
    updateMemberCount(data.memberCount);
  });

  // Audio event listeners
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', handleSongEnd);
  audio.addEventListener('loadedmetadata', () => {
    updateDuration();
  });

  // Time sync
  setInterval(syncTimeWithServer, 10000);
}

// Time synchronization
function syncTimeWithServer() {
  const t0 = Date.now();
  socket.emit('time-sync-request');

  socket.once('time-sync-response', (data) => {
    const t1 = Date.now();
    const roundTripTime = t1 - t0;
    const serverTime = data.serverTime + (roundTripTime / 2);
    serverTimeOffset = serverTime - Date.now();
    console.log(`Time offset: ${serverTimeOffset}ms`);
  });
}

function syncTimeOffset(serverTime) {
  serverTimeOffset = serverTime - Date.now();
}

// Room management
async function createRoom() {
  try {
    const response = await fetch('http://localhost:3001/api/rooms', {
      method: 'POST'
    });
    const data = await response.json();

    currentRoom = data.roomId;
    socket.emit('join-room', currentRoom);

    showSection('player');
    document.getElementById('roomCode').textContent = currentRoom;
  } catch (error) {
    console.error('Error creating room:', error);
    alert('Failed to create room');
  }
}

function joinRoom() {
  const roomInput = document.getElementById('joinRoomInput');
  const roomId = roomInput.value.trim().toUpperCase();

  if (!roomId || roomId.length !== 6) {
    alert('Please enter a valid 6-character room code');
    return;
  }

  currentRoom = roomId;
  socket.emit('join-room', currentRoom);

  showSection('player');
  document.getElementById('roomCode').textContent = currentRoom;
}

function leaveRoom() {
  socket.disconnect();
  currentRoom = null;
  audio.pause();
  audio.src = '';

  showSection('landing');
  document.getElementById('joinRoomInput').value = '';

  setTimeout(() => {
    socket.connect();
  }, 100);
}

// Playback controls
function togglePlayPause() {
  if (isPlaying) {
    socket.emit('pause');
  } else {
    socket.emit('play');
  }
}

function previousSong() {
  if (currentSongIndex > 0) {
    socket.emit('change-song', currentSongIndex - 1);
  }
}

function nextSong() {
  if (currentSongIndex < playlist.length - 1) {
    socket.emit('change-song', currentSongIndex + 1);
  }
}

function handleSeek(event) {
  const progressBar = document.getElementById('progressBar');
  const rect = progressBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = clickX / rect.width;
  const newPosition = percentage * audio.duration;

  if (isNaN(newPosition)) return;

  isSeeking = true;
  socket.emit('seek', newPosition);
  audio.currentTime = newPosition;

  setTimeout(() => {
    isSeeking = false;
  }, 500);
}

function handleSongEnd() {
  if (currentSongIndex < playlist.length - 1) {
    socket.emit('change-song', currentSongIndex + 1);
  } else {
    socket.emit('pause');
  }
}

function selectSong(index) {
  socket.emit('change-song', index);
}

// UI helpers
function loadSong(song, position = 0) {
  audio.src = song.url;
  audio.currentTime = position;

  document.getElementById('songTitle').textContent = song.title;
  document.getElementById('songArtist').textContent = song.artist;
}

function updateProgress() {
  if (audio.duration) {
    const percentage = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
  }
}

function updateDuration() {
  if (audio.duration) {
    document.getElementById('duration').textContent = formatTime(audio.duration);
  }
}

function updatePlayPauseButton() {
  const btn = document.getElementById('playPauseBtn');
  btn.textContent = isPlaying ? '⏸️' : '▶️';
}

function updateStatus(message, isConnected) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + (isConnected ? 'connected' : 'disconnected');
}

function updateMemberCount(count) {
  const text = count === 1 ? '1 listener' : `${count} listeners`;
  document.getElementById('memberCountText').textContent = text;
}

function renderPlaylist() {
  const container = document.getElementById('playlistContainer');
  container.innerHTML = '';

  playlist.forEach((song, index) => {
    const item = document.createElement('div');
    item.className = 'playlist-item' + (index === currentSongIndex ? ' active' : '');
    item.onclick = () => selectSong(index);

    item.innerHTML = `
      <div>
        <div style="font-weight: 600;">${song.title}</div>
        <div style="font-size: 12px; opacity: 0.8;">${song.artist}</div>
      </div>
      <div style="font-size: 12px;">${formatTime(song.duration)}</div>
    `;

    container.appendChild(item);
  });
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(sectionId).classList.add('active');
}

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize on load
init();
