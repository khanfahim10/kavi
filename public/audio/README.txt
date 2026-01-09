HOW TO ADD YOUR OWN AUDIO FILES
================================

1. Copy your audio files (MP3, WAV, etc.) into this folder
   Example: song1.mp3, song2.mp3, etc.

2. Edit server.js and update the SAMPLE_PLAYLIST array:

   const SAMPLE_PLAYLIST = [
     {
       id: 1,
       title: "Your Song Name",
       artist: "Artist Name",
       url: "/audio/song1.mp3",    // Your local file
       duration: 180                // Duration in seconds
     },
     {
       id: 2,
       title: "Another Song",
       artist: "Another Artist",
       url: "/audio/song2.mp3",
       duration: 210
     }
   ];

3. Restart the server:
   npm start

IMPORTANT NOTES:
- Audio files will be served from YOUR computer
- The synchronization server MUST stay running for real-time sync
- Supported formats: MP3, WAV, OGG, M4A
- Keep file sizes reasonable (under 20MB per song)

LEGAL REMINDER:
- Only upload music you have rights to use
- Don't upload copyrighted music without permission
