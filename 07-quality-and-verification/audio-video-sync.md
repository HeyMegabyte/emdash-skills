---
name: "Audio-Video Sync for Form Evidence"
description: "Merge real-time phone call audio with Playwright form submission recordings via ffmpeg. Creates synchronized evidence videos proving what was submitted during live calls."
updated: "2026-04-23"
---

# Audio-Video Sync Pattern
## Architecture
`activeCallAudio` Map keyed by echoId stores live mulaw audio chunks from Twilio WebSocket. `registerCallAudio(echoId, chunks)` called when profile with applications detected. `unregisterCallAudio(echoId)` on stream stop. Form automation checks map before R2 upload.

## Merge Pipeline
1. Collect mulaw base64 chunks from `activeCallAudio.get(echoId)`. 2. Decode base64→Buffer, concatenate. 3. Convert mulaw 8kHz→PCM 16-bit signed LE. 4. Write WAV header (44 bytes: RIFF, fmt chunk, data chunk) with 8000Hz/16-bit/mono params. 5. Write WAV to temp file. 6. `ffmpeg -i video.webm -i audio.wav -c:v copy -c:a libopus -shortest synced.webm`. 7. Replace original video with synced version. 8. Cleanup temp WAV.

## Mulaw Decode
Mulaw→PCM lookup: flip bits, extract sign/exponent/mantissa, compute `((mantissa << (exponent + 3)) + bias[exponent]) * (sign ? -1 : 1)`. Bias table: [33,66,132,264,528,1056,2112,4224].

## Error Recovery
ffmpeg missing or fails → return original video (graceful degradation). WAV write fails → skip merge. All errors logged but never block form submission. Temp files cleaned in finally block.

## Integration Points
`app.js` WebSocket: push `msg.media.payload` to chunks array on every media event. `form-automation-service.js`: call `mergeAudioWithVideo(videoPath, echoId)` after Playwright recording stops, before R2 upload.
