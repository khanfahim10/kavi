const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for rooms
const rooms = new Map();

// ==========================================
// PLAYLIST CONFIGURATION
// ==========================================
//
// TO USE YOUR OWN AUDIO FILES:
// 1. Copy your MP3/WAV files to: public/audio/
// 2. Update the playlist below with your songs
// 3. Use local paths: "/audio/yourfile.mp3"
// 4. Restart the server
//
// TO USE REMOTE AUDIO (like CDN):
// - Use full URLs: "https://example.com/song.mp3"
// ==========================================

const SAMPLE_PLAYLIST = [
  // Your local audio files
  
  {
    id: 1,
    title: "FOR YOU KAVITHAA",
    artist: "Fahim",
    url: "/audio/FOR YOU KAVITHAA.mp3",
    duration: 147
  },
  {
    id: 2,
    title: "Jhol",
    artist: "Maanu x Annural Khalid",
    url: "/audio/Jhol  Coke Studio Pakistan  Season 15  Maanu x Annural Khalid.mp3",
    duration: 158
  },
  {
    id: 3,
    title: "Ae Dil Hai Mushkil",
    artist: "Fahim",
    url: "/audio/Ae Dil Hai Mushkil(KoshalWorld.Com).mp3",
    duration: 142
  },
  {
    id: 4,
    title: "Kalyani",
    artist: "Fahim",
    url: "/audio/KALYANI  ARJN, KDS, FIFTY4, RONN SONG.mp3",
    duration: 147
  }

  // Example with LOCAL audio (uncomment after adding files to public/audio/)
  // {
  //   id: 1,
  //   title: "Your Song Title",
  //   artist: "Your Artist Name",
  //   url: "/audio/song1.mp3",
  //   duration: 180
  // },
  // {
  //   id: 2,
  //   title: "Another Song",
  //   artist: "Another Artist",
  //   url: "/audio/song2.mp3",
  //   duration: 210
  // }
];

// Room state structure
function createRoom(roomId) {
  return {
    id: roomId,
    playlist: SAMPLE_PLAYLIST,
    currentSongIndex: 0,
    position: 0,
    isPlaying: false,
    lastUpdateTime: Date.now(),
    members: new Set()
  };
}

// REST API endpoints
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json({
    id: room.id,
    playlist: room.playlist,
    currentSong: room.playlist[room.currentSongIndex],
    position: getCurrentPosition(room),
    isPlaying: room.isPlaying,
    memberCount: room.members.size
  });
});

app.post('/api/rooms', (req, res) => {
  const roomId = generateRoomId();
  const room = createRoom(roomId);
  rooms.set(roomId, room);

  res.json({ roomId, room });
});

// Helper function to calculate current position
function getCurrentPosition(room) {
  if (!room.isPlaying) {
    return room.position;
  }

  const elapsed = (Date.now() - room.lastUpdateTime) / 1000;
  return room.position + elapsed;
}

// Generate random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join room
  socket.on('join-room', (roomId) => {
    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, createRoom(roomId));
    }

    const room = rooms.get(roomId);
    room.members.add(socket.id);
    socket.join(roomId);
    socket.roomId = roomId;

    console.log(`Client ${socket.id} joined room ${roomId}`);

    // Send current room state to the new member
    socket.emit('room-state', {
      playlist: room.playlist,
      currentSong: room.playlist[room.currentSongIndex],
      currentSongIndex: room.currentSongIndex,
      position: getCurrentPosition(room),
      isPlaying: room.isPlaying,
      serverTime: Date.now()
    });

    // Notify others
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      memberCount: room.members.size
    });
  });

  // Play
  socket.on('play', () => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.position = getCurrentPosition(room);
    room.isPlaying = true;
    room.lastUpdateTime = Date.now();

    // Broadcast to all clients in room
    io.to(roomId).emit('play', {
      songId: room.playlist[room.currentSongIndex].id,
      position: room.position,
      serverTime: Date.now()
    });

    console.log(`Room ${roomId}: Play at position ${room.position}`);
  });

  // Pause
  socket.on('pause', () => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.position = getCurrentPosition(room);
    room.isPlaying = false;
    room.lastUpdateTime = Date.now();

    io.to(roomId).emit('pause', {
      songId: room.playlist[room.currentSongIndex].id,
      position: room.position,
      serverTime: Date.now()
    });

    console.log(`Room ${roomId}: Pause at position ${room.position}`);
  });

  // Seek
  socket.on('seek', (newPosition) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.position = newPosition;
    room.lastUpdateTime = Date.now();

    io.to(roomId).emit('seek', {
      songId: room.playlist[room.currentSongIndex].id,
      position: newPosition,
      serverTime: Date.now()
    });

    console.log(`Room ${roomId}: Seek to position ${newPosition}`);
  });

  // Change song
  socket.on('change-song', (songIndex) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || songIndex < 0 || songIndex >= room.playlist.length) return;

    room.currentSongIndex = songIndex;
    room.position = 0;
    room.lastUpdateTime = Date.now();

    io.to(roomId).emit('change-song', {
      song: room.playlist[songIndex],
      songIndex: songIndex,
      position: 0,
      isPlaying: room.isPlaying,
      serverTime: Date.now()
    });

    console.log(`Room ${roomId}: Changed to song ${songIndex}`);
  });

  // Time sync request
  socket.on('time-sync-request', () => {
    socket.emit('time-sync-response', {
      serverTime: Date.now()
    });
  });

  // Heartbeat sync (sent by server periodically)
  const syncInterval = setInterval(() => {
    const roomId = socket.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || !room.isPlaying) return;

    socket.emit('sync', {
      songId: room.playlist[room.currentSongIndex].id,
      position: getCurrentPosition(room),
      serverTime: Date.now()
    });
  }, 3000);

  // Disconnect
  socket.on('disconnect', () => {
    clearInterval(syncInterval);

    const roomId = socket.roomId;
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.members.delete(socket.id);

      socket.to(roomId).emit('user-left', {
        userId: socket.id,
        memberCount: room.members.size
      });

      // Clean up empty rooms
      if (room.members.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      }
    }

    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎵 Its for you kavitha - Music Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});
