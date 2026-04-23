---
name: "Picovoice Eagle Voice Biometric"
description: "Tier-2 voice biometric using @picovoice/eagle-node. On-device, zero-network, free tier. Sits between ONNX ECAPA-TDNN (tier-1) and MFCC cosine (tier-3) in the verification chain."
updated: "2026-04-23"
---

# Picovoice Eagle Voice Biometric Pattern
## Integration
`@picovoice/eagle-node` v1.2+ as optionalDependency. Lazy-loaded on first use — never imported if ONNX model loads successfully. Requires `PICOVOICE_ACCESS_KEY` env var (free tier: 3 voice profiles).

## Three-Tier Chain
Tier 1: ONNX ECAPA-TDNN (192-dim embedding, best accuracy). Tier 2: Picovoice Eagle (on-device, free tier, no model download). Tier 3: MFCC cosine similarity (zero dependencies, zero cost). `loadModel()` tries each tier in order, first success wins. Response includes `engine` field ('ecapa-tdnn'|'eagle'|'mfcc').

## Eagle Enrollment
`EagleProfiler` processes Int16 PCM frames at `profiler.frameLength` samples. Feed frames until `result.percentage >= 100` (minimum 50% for usable profile). Export profile bytes → store as Float32Array embedding. `profiler.reset()` after each enrollment.

## Eagle Verification
`Eagle` instance created with access key + stored profile. `eagle.process(frame)` returns score 0.0-1.0. Threshold: 0.5. Process all frames, take max score. Cleanup: `eagle.release()` after verification.

## Audio Format
Input: Float32 PCM 16kHz. Convert to Int16: `s < 0 ? s * 0x8000 : s * 0x7FFF`. Frame size from `eagleProfiler.frameLength`. If enrollment percentage < 50%, falls back to MFCC fingerprint extraction.
