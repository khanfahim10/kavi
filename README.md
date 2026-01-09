# 🎵 Its for you kavitha

A real-time synchronized music playback system that keeps multiple listeners perfectly in sync, regardless of location.

## Features

- **Real-time Synchronization**: All listeners hear the same part of the song at the same time
- **Room-based Sessions**: Create or join rooms using simple 6-character codes
- **Shared Controls**: Any listener can play, pause, seek, or change songs
- **Time Drift Correction**: Automatic correction for network latency and clock drift
- **Live Member Count**: See how many people are listening with you
- **Beautiful UI**: Modern, responsive web interface

## How It Works

The system uses an **authoritative server model**:
- The server maintains the single source of truth for playback state
- Clients stream audio independently but receive sync commands via WebSocket
- Time synchronization ensures playback stays aligned (±200ms)
- Heartbeat sync corrections every 3 seconds keep long sessions perfectly synchronized

## Tech Stack

**Backend:**
- Node.js + Express
- Socket.IO (WebSocket real-time communication)
- In-memory room storage

**Frontend:**
- Vanilla JavaScript (no framework overhead)
- HTML5 Audio API
- Socket.IO client

**Audio:**
- Creative Commons music from Bensound
- Streamed directly from CDN

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

Server will run on `http://localhost:3001`

### 3. Open in Browser

Open `http://localhost:3001` in **two different browser windows** (or on different devices on the same network)

### 4. Test Synchronization

**Window 1:**
1. Click "Create New Room"
2. Copy the 6-character room code

**Window 2:**
1. Enter the room code
2. Click "Join Room"

**Both windows:**
- Press play and watch both players stay perfectly in sync
- Try seeking, pausing, or changing songs
- Notice how both players mirror each other instantly

## Project Structure

```
Its for you kavitha/
├── server.js           # Backend server with WebSocket logic
├── package.json        # Dependencies
├── public/
│   ├── index.html      # UI interface
│   └── app.js          # Client-side sync logic
└── README.md
```

## API Reference

### REST Endpoints

**Create Room**
```
POST /api/rooms
Response: { roomId: "ABC123", room: {...} }
```

**Get Room State**
```
GET /api/rooms/:roomId
Response: { id, playlist, currentSong, position, isPlaying, memberCount }
```

### WebSocket Events

**Client → Server**
- `join-room(roomId)` - Join a listening room
- `play()` - Start playback
- `pause()` - Pause playback
- `seek(position)` - Seek to position in seconds
- `change-song(index)` - Change to different song
- `time-sync-request()` - Request server time for sync

**Server → Client**
- `room-state(state)` - Initial state when joining
- `play(data)` - Play command with position and serverTime
- `pause(data)` - Pause command
- `seek(data)` - Seek command
- `change-song(data)` - Song change notification
- `sync(data)` - Heartbeat sync correction (every 3s)
- `user-joined/left(data)` - Member updates

## How Sync Works

### Time Synchronization
```javascript
Client calculates offset:
  serverTimeOffset = serverTime - clientTime

When playing:
  adjustedPosition = serverPosition + (clientTime + offset - serverTime)
```

### Drift Correction
- **Large drift (>500ms)**: Hard seek to correct position
- **Medium drift (200-500ms)**: Adjust playback rate temporarily
- **Small drift (<200ms)**: Ignore (within acceptable range)

## Customization

### Adding Your Own Music

Edit `server.js`:

```javascript
const SAMPLE_PLAYLIST = [
  {
    id: 1,
    title: "Your Song Title",
    artist: "Artist Name",
    url: "https://your-cdn.com/song.mp3",
    duration: 180 // in seconds
  }
];
```

**Important**: Ensure you have rights to use the audio files!

### Changing Sync Interval

In `server.js`, modify the heartbeat interval:

```javascript
const syncInterval = setInterval(() => {
  // ... sync logic
}, 3000); // Change this value (in milliseconds)
```

### Network Configuration

To access from other devices on your network:

1. Find your local IP address:
   - Mac/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`

2. Update `public/app.js`:
   ```javascript
   socket = io('http://YOUR_LOCAL_IP:3001');
   ```

3. Update `public/app.js` fetch URL:
   ```javascript
   fetch('http://YOUR_LOCAL_IP:3001/api/rooms', ...)
   ```

4. Access from other devices: `http://YOUR_LOCAL_IP:3001`

## Development

Run with auto-restart on changes:

```bash
npm run dev
```

## Limitations & Future Improvements

**Current Limitations:**
- In-memory storage (rooms clear on server restart)
- No user authentication
- Sample audio only (3 songs)
- Single playlist per room
- No chat or reactions

**Potential Improvements:**
- Add Redis for persistent room storage
- User accounts and friend lists
- Upload your own music
- Multiple playlists
- Real-time chat
- Emoji reactions
- Mobile app (React Native / Flutter)
- Song recommendations
- Queue management

## Troubleshooting

**Audio won't play:**
- Modern browsers require user interaction before playing audio
- Click the play button (don't let it auto-play on page load)

**Out of sync:**
- Check network connection
- Hard refresh both clients (Cmd+Shift+R or Ctrl+Shift+R)
- Rejoin the room

**Can't join room:**
- Verify room code is exactly 6 characters
- Ensure server is running
- Check browser console for errors

## License

This project uses Creative Commons music from Bensound.
For your own deployment, ensure you have proper licenses for audio content.

## Credits

Built with:
- Socket.IO for real-time communication
- Bensound for sample audio
- Modern web standards (HTML5 Audio API)

---

**Enjoy synchronized listening!** 🎵
