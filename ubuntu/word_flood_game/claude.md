# LetsWord - Project Documentation

## Project Overview

LetsWord is a Danish word puzzle game where players form words from randomly placed letters on a 6x6 grid before it fills up completely.

**Domain**: https://letsword.app

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components + Framer Motion
- **Backend**: Supabase (PostgreSQL database + Auth)
- **Deployment**: Vercel
- **Repository**: GitHub

## External Services

### Supabase
- **Project ID**: `ktglmdwhoqqpooekfbmg`
- **URL**: `https://ktglmdwhoqqpooekfbmg.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/ktglmdwhoqqpooekfbmg

### GitHub
- **Repository**: https://github.com/bbb36845/OrdStorm
- **Branch**: main

### Vercel
- **Project**: ord-storm
- **Domain**: letsword.app
- **Deployment**: Automatic via GitHub integration - just push to main branch

## MCP Servers

When working on this project, use the following MCP servers:

1. **Supabase MCP** - For database operations, schema management, and auth
2. **Playwright MCP** - For testing the web application
3. **Vercel MCP** - For deployment management

## Project Structure

```
/src
  /components
    /Auth         - Authentication components (AuthForm.tsx)
    /Game         - Core game components
      GameBoard.tsx      - Main game board UI
      GameLogic.ts       - Game mechanics and state
      HowToPlayModal.tsx - Game instructions
      Leaderboard.tsx    - Score leaderboard
    /ui           - shadcn/ui component library
  /hooks          - Custom React hooks
  /lib            - Utility functions
  /types          - TypeScript type definitions
  App.tsx         - Main application component
  SupabaseClient.ts - Supabase client configuration
  main.tsx        - Application entry point
/public
  /assets
    danish_words.txt - Danish word dictionary (~1.8M words)
```

## Game Mechanics

- 6x6 grid with letters appearing every second
- Players click letters to form words (minimum 3 letters)
- Words validated against Danish dictionary
- Scoring: base points + bonus for longer words + 2x for bonus letters
- Game ends when board is completely full

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Preview production build
pnpm preview
```

## iOS App (Capacitor)

The app is configured for iOS using Capacitor. To build and run:

```bash
# Build web assets
pnpm build

# Sync to iOS project
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### iOS Configuration
- **Bundle ID**: `app.letsword.game`
- **App Name**: LetsWord
- **Xcode Project**: `ios/App/App.xcworkspace`

### Requirements for iOS Development
- Mac with Xcode installed
- Apple Developer Account ($99/year) for App Store submission
- CocoaPods (install with `sudo gem install cocoapods`)

### App Store Submission Checklist
1. Build the app in Xcode (Product > Archive)
2. Upload to App Store Connect
3. Fill in App Store listing (screenshots, description, keywords)
4. Submit for review

## Android App (Capacitor)

The app is configured for Android using Capacitor. To build and run:

```bash
# Build web assets
pnpm build

# Sync to Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

### Android Configuration
- **Package ID**: `app.letsword.game`
- **App Name**: LetsWord
- **Android Studio Project**: `android/`

### Requirements for Android Development
- Android Studio installed
- Android SDK (API level 22+ recommended)
- Google Play Developer Account ($25 one-time) for Play Store submission

### Google Play Submission Checklist
1. Generate signed AAB in Android Studio (Build > Generate Signed Bundle)
2. Create app in Google Play Console
3. Fill in store listing (screenshots, description, feature graphic)
4. Complete Data Safety form
5. Submit for review

## Language

- **Frontend UI**: Danish (Dansk)
- **Code/Comments**: English

## Current Status

The game has core functionality implemented:
- Game board with letter placement
- Word validation against Danish dictionary
- Scoring system with bonus letters
- Supabase Auth integration (email/password)
- Leaderboard connected to Supabase
- Guest mode with optional account creation

## Supabase Auth Settings

- **Email confirmation**: DISABLED (instant signup, no email verification required)
- **Bot protection**: Supabase built-in rate limits

## Known Issues / TODO

1. ~~Authentication uses localStorage instead of Supabase Auth~~ DONE
2. ~~Scores save locally but leaderboard fetches from Supabase~~ DONE
3. ~~API keys are hardcoded~~ DONE (using env variables)
4. ~~No environment file (.env) configured~~ DONE

## Environment Variables

```env
VITE_SUPABASE_URL=https://ktglmdwhoqqpooekfbmg.supabase.co
VITE_SUPABASE_ANON_KEY=<see .env file>
```

## Test Credentials

For testing authentication:
- **Email**: markjensen@sapu.dk
- **Password**: Xo23pnrb
- **Username**: markjensen
