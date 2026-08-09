# Partner

> **24/7-Ready Personal Voice Assistant**

A production-quality, multi-platform personal voice assistant activated by **"Hey Partner"**, with local wake-word detection, streaming AI responses via Google Gemini, and platform-compliant background listening.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start web app in development
pnpm dev:web

# Start backend server
pnpm dev:server
```

## Architecture

| Platform | Always-Ready | Mechanism |
|----------|-------------|-----------|
| Android | ✅ Primary | Native Foreground Service + Porcupine |
| Desktop | ✅ Full | Electron + System Tray + Porcupine |
| Web/PWA | ⚠️ Active only | Porcupine WASM while tab is active |
| iOS | ⚠️ Limited | Apple-supported APIs + Siri Shortcuts |

## Environment Setup

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

**Required keys:**
- `GOOGLE_API_KEY` — Google Gemini API key (server-side only)
- `GOOGLE_MODEL` — Gemini model name (default: `gemini-3.6-flash`)
- `PICOVOICE_ACCESS_KEY` — Picovoice Porcupine access key

> ⚠️ Never commit `.env` to source control. Never expose API keys in client-side code.

## Project Structure

```
partner/
├── apps/
│   ├── web/        # Next.js PWA
│   ├── android/    # Kotlin + Jetpack Compose
│   ├── desktop/    # Electron
│   └── ios/        # Swift + SwiftUI
├── packages/
│   ├── shared/     # State machine, types
│   ├── ai/         # AI provider abstraction
│   ├── voice/      # TTS abstraction
│   ├── wakeword/   # Wake word engine
│   └── tools/      # Tool/function calling
└── server/         # Express API backend
```

## License

Private — All rights reserved.
