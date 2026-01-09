# How to Add Your Own Audio Files

## Quick Steps

### 1. Add Audio Files to the Project

Copy your audio files into the `public/audio/` folder:

```
SYNC/
├── public/
│   ├── audio/           ← Put your audio files here
│   │   ├── song1.mp3
│   │   ├── song2.mp3
│   │   └── song3.mp3
```

**Supported formats:** MP3, WAV, OGG, M4A

### 2. Update the Playlist in server.js

Open `server.js` and find the `SAMPLE_PLAYLIST` section (around line 37).

**Replace the current playlist with:**

```javascript
const SAMPLE_PLAYLIST = [
  {
    id: 1,
    title: "Song Name 1",
    artist: "Artist Name",
    url: "/audio/song1.mp3",    // Local file path
    duration: 180                // Duration in seconds
  },
  {
    id: 2,
    title: "Song Name 2",
    artist: "Artist Name",
    url: "/audio/song2.mp3",
    duration: 210
  },
  {
    id: 3,
    title: "Song Name 3",
    artist: "Artist Name",
    url: "/audio/song3.mp3",
    duration: 195
  }
];
```

**How to get the duration:**
- On Mac: Right-click file → Get Info → look for duration
- On Windows: Right-click file → Properties → Details tab
- Or use an online tool to check MP3 duration
- Convert to seconds (e.g., 3:00 = 180 seconds)

### 3. Restart the Server

Kill the current server and restart:

```bash
# Find the process
ps aux | grep "node server.js"

# Kill it (replace <pid> with actual process ID)
kill <pid>

# Restart
npm start
```

Or simply press `Ctrl+C` in the terminal where the server is running, then:

```bash
npm start
```

### 4. Test It

1. Open http://localhost:3001
2. Create or join a room
3. Your songs should appear in the playlist!

---

## Important Notes

### Audio Files Must Stay Local

- The audio files are served from **your computer**
- If you share the room code with someone on a different network, they **won't** be able to access your local audio files
- For remote access, you need to either:
  - Host audio files on a CDN (like AWS S3, Cloudflare, etc.)
  - Deploy your entire app to a cloud server

### Server is Still Required

**You CANNOT remove the server!** Here's why:

✅ **What the server does:**
- Keeps everyone's playback synchronized in real-time
- Manages rooms and connections
- Sends play/pause/seek commands to all users
- Serves the audio files and web interface

❌ **Without the server:**
- No synchronization between users
- No real-time updates
- App won't work at all

The server is the **brain** of the app. The audio files are just **data**.

### Using Remote Audio (CDN)

If you want others to access your music remotely:

1. Upload audio to a cloud storage service:
   - AWS S3 + CloudFront
   - Cloudflare R2
   - Google Cloud Storage
   - Firebase Storage

2. Get public URLs for your files

3. Update server.js with full URLs:

```javascript
const SAMPLE_PLAYLIST = [
  {
    id: 1,
    title: "Song Name",
    artist: "Artist",
    url: "https://your-cdn.com/audio/song1.mp3",  // Full URL
    duration: 180
  }
];
```

---

## Example: Complete Setup

**Step 1:** Copy 3 MP3 files to `public/audio/`:
- love_song.mp3 (3:24 = 204 seconds)
- dance_track.mp3 (4:12 = 252 seconds)
- chill_vibes.mp3 (5:00 = 300 seconds)

**Step 2:** Edit server.js:

```javascript
const SAMPLE_PLAYLIST = [
  {
    id: 1,
    title: "Love Song",
    artist: "Romantic Artist",
    url: "/audio/love_song.mp3",
    duration: 204
  },
  {
    id: 2,
    title: "Dance Track",
    artist: "DJ Party",
    url: "/audio/dance_track.mp3",
    duration: 252
  },
  {
    id: 3,
    title: "Chill Vibes",
    artist: "Relaxation Music",
    url: "/audio/chill_vibes.mp3",
    duration: 300
  }
];
```

**Step 3:** Restart server:

```bash
npm start
```

**Done!** Your custom playlist is now live.

---

## Legal Reminder

⚠️ **Only use music you have rights to:**
- Your own recordings
- Creative Commons licensed music
- Royalty-free music
- Music you have permission to use

**Do NOT use:**
- Copyrighted commercial music without licenses
- Songs from Spotify, Apple Music, etc.
- Any music you don't have legal rights to share

---

## Troubleshooting

**Audio won't play:**
- Check file format (MP3 is most compatible)
- Verify file is in `public/audio/` folder
- Check file path in server.js matches exactly
- Make sure server restarted after changes

**Audio plays but cuts off:**
- Check the duration value is correct
- Make sure file isn't corrupted

**Can't find audio files:**
- File paths are case-sensitive on some systems
- Use `/audio/song.mp3` not `\audio\song.mp3`
- Don't include spaces in filenames

---

Need help? Check the README.md or review the server logs for errors.
