# OrdStorm Roadmap

## Vision

OrdStorm er et dansk ordspil hvor spillere danner ord fra tilfældigt placerede bogstaver på et 6x6 gitter. Spillet kombinerer hurtig tænkning med ordforråd og strategi.

---

## Design Principles

### User Experience (UX)
- **Zero friction start**: Users can play immediately without any signup
- **Anonymous play first**: Game remembers user via browser (localStorage/cookies)
- **Optional account**: Only prompt for account when saving to global leaderboard
- **Super accessible**: No barriers to entry, hassle-free experience
- **Progressive engagement**: Play → See score → Want to save? → Create account

### User Interface (UI)
- **Modern & Premium**: High-end game aesthetic, not generic
- **Fluid animations**: Smooth, satisfying micro-interactions
- **Visual polish**: Attention to detail in every element
- **Mobile-first**: Touch-optimized, responsive design
- **Dark/Light modes**: Beautiful in both themes

### Authentication Strategy
1. **Guest Mode (Default)**:
   - Play immediately, no signup
   - Local high scores saved in browser
   - Can see global leaderboard (read-only)

2. **Account Creation (Optional)**:
   - Triggered when user wants to save score to global leaderboard
   - Simple: just email + password (or social login later)
   - Username chosen during first save
   - Sync local scores to account on signup

3. **Returning Users**:
   - Auto-login via session token
   - "Welcome back, [username]" subtle indicator
   - Seamless experience

### Multi-Language Support
- **Two versions**: Danish (Dansk) and English
- **User choice**: Language selector in UI (flag icons or dropdown)
- **Separate ecosystems per language**:
  - Each language has its own word dictionary
  - Separate leaderboards (Danish leaderboard, English leaderboard)
  - Separate daily challenges
  - Achievements can be shared across languages
- **URL structure**: `/da` for Danish, `/en` for English (or query param)
- **Remember preference**: Store language choice in localStorage/profile
- **Default**: Detect browser language, fallback to Danish

---

## Phase 1: MVP - Core + Auth + Leaderboard

**Goal**: Fix current issues, frictionless auth, working leaderboard

### 1.1 Infrastructure & Security
- [x] Create `.env` file with Supabase credentials
- [x] Move hardcoded API keys to environment variables
- [x] Configure Vite to use env variables
- [ ] Set up Vercel environment variables

### 1.2 Supabase Database Schema
- [x] Design and create `profiles` table
- [x] Create `scores` table (game results)
- [x] Create `achievements` table
- [x] Set up Row Level Security (RLS) policies
- [x] Create database indexes for leaderboard queries
- [x] Create triggers for auto-profile creation and stats update

### 1.3 Authentication (Frictionless)
- [ ] Guest mode: Play immediately without account
- [ ] Local score tracking (browser storage)
- [ ] "Save to Leaderboard" prompt after game (if not logged in)
- [ ] Simple signup: email + password + username
- [ ] Auto-login via Supabase session persistence
- [ ] Logout functionality
- [ ] Password reset (email link)

### 1.4 Leaderboard Integration
- [ ] Save scores to Supabase on game end
- [ ] Fetch global leaderboard (all-time top scores)
- [ ] Fetch daily leaderboard (today's best)
- [ ] Show personal best scores
- [ ] Real-time leaderboard updates (Supabase subscriptions)

### 1.5 Testing & Deployment
- [ ] Write Playwright tests for core game flow
- [ ] Test authentication flow
- [ ] Test leaderboard functionality
- [ ] Deploy to Vercel
- [ ] Verify production environment

---

## Phase 2: Game Modes

### 2.1 Endless Mode (Current Default)
- [ ] Refine current gameplay
- [ ] Add pause functionality
- [ ] Improve game over screen with stats

### 2.2 Timed Mode
- [ ] Add countdown timer (2 min, 5 min options)
- [ ] Timer UI component
- [ ] Time-based scoring bonuses
- [ ] Separate leaderboard for timed modes

### 2.3 Daily Challenge
- [ ] Generate daily seed for consistent puzzles
- [ ] Same letter sequence for all players each day
- [ ] One attempt per day per user
- [ ] Daily leaderboard
- [ ] Shareable result cards (Wordle-style)
- [ ] Track completion streaks

### 2.4 Difficulty Levels
- [ ] Easy: Slower letter appearance (1.5s)
- [ ] Medium: Normal speed (1s) - current
- [ ] Hard: Faster letters (0.7s)
- [ ] Expert: Very fast (0.5s)
- [ ] Separate leaderboards per difficulty

---

## Phase 3: User Profiles & Progression

### 3.1 User Profiles
- [ ] Profile page with avatar
- [ ] Username selection
- [ ] Stats dashboard (games played, words found, best scores)
- [ ] Game history
- [ ] Favorite/longest words found

### 3.2 Streaks System
- [ ] Track daily play streaks
- [ ] Streak counter on profile
- [ ] Streak milestones (7 days, 30 days, 100 days)
- [ ] Streak recovery (grace period or power-up)

### 3.3 Levels & XP
- [ ] XP earned per game (based on score)
- [ ] Level progression system
- [ ] Level-up rewards
- [ ] XP bonuses for streaks and achievements

### 3.4 Achievements System
- [ ] Design achievement categories:
  - Word length achievements (7+ letter words)
  - Score milestones (1000+, 5000+, 10000+)
  - Streak achievements
  - Games played milestones
  - Special achievements (use all vowels, etc.)
- [ ] Achievement notifications
- [ ] Achievement showcase on profile
- [ ] Database schema for achievements

---

## Phase 4: Social Features

### 4.1 Friends System
- [ ] Friend requests (by username or link)
- [ ] Friends list
- [ ] Friends leaderboard
- [ ] See friends' recent games

### 4.2 Share Results
- [ ] Generate shareable score cards
- [ ] Copy to clipboard functionality
- [ ] Social media share buttons
- [ ] Custom OG images for link previews

### 4.3 Async Multiplayer (Challenge Mode)
- [ ] Challenge a friend to beat your score
- [ ] Same seed/letter sequence for both players
- [ ] Notification when challenged
- [ ] Results comparison screen
- [ ] Challenge history

---

## Phase 5: Power-ups & Mechanics

### 5.1 Power-ups
- [ ] **Shuffle**: Rearrange all letters on board
- [ ] **Freeze**: Pause letter spawning for 10 seconds
- [ ] **Hint**: Highlight a valid word
- [ ] **Clear Row/Column**: Remove letters from one line
- [ ] **Slow Motion**: Reduce spawn speed temporarily
- [ ] Power-up earn/purchase system

### 5.2 Word Categories (Themed Rounds)
- [ ] Category database (animals, food, nature, etc.)
- [ ] Themed daily challenges
- [ ] Bonus points for category words
- [ ] Category-specific achievements

---

## Phase 6: Themes & Customization

### 6.1 Visual Themes
- [ ] Default theme
- [ ] Dark mode
- [ ] High contrast (accessibility)
- [ ] Seasonal themes (Christmas, Easter, etc.)
- [ ] Premium themes (unlockable)

### 6.2 Board Customization
- [ ] Letter tile styles
- [ ] Background patterns
- [ ] Animation styles
- [ ] Sound effects toggle

---

## Phase 7: Monetization (Future)

### 7.1 Free Tier
- [ ] Full core gameplay
- [ ] Daily challenge access
- [ ] Basic themes
- [ ] Ads between games (optional)

### 7.2 Premium Features (Paywall or Ad Removal)
- [ ] Ad-free experience
- [ ] Premium themes
- [ ] Extra power-ups
- [ ] Detailed statistics
- [ ] Priority matchmaking (multiplayer)

### 7.3 Technical Preparation
- [ ] Design modular feature flags
- [ ] Implement paywall infrastructure
- [ ] Ad integration preparation (AdMob, etc.)
- [ ] In-app purchase setup (for mobile)

---

## Phase 8: Mobile Apps (Capacitor)

### 8.1 iOS App (Apple App Store)

**Setup (DONE)**
- [x] Install Capacitor (@capacitor/core, @capacitor/ios, @capacitor/cli)
- [x] Initialize Capacitor with bundle ID `app.letsword.game`
- [x] Add iOS platform (`npx cap add ios`)
- [x] Configure app icon (1024x1024)
- [x] Update capacitor.config.ts with iOS settings

**Development & Testing**
- [ ] Test on iOS Simulator
- [ ] Test on physical iPhone device
- [ ] Handle safe area insets (notch, home indicator)
- [ ] Test all game features on iOS
- [ ] Optimize touch interactions for iOS

**App Store Submission**
- [ ] Create Apple Developer Account ($99/year)
- [ ] Create App ID in Apple Developer Portal
- [ ] Create app in App Store Connect
- [ ] Prepare App Store listing:
  - [ ] App name: LetsWord
  - [ ] Subtitle (30 chars): Dansk Ordspil / Word Game
  - [ ] Description (Danish & English)
  - [ ] Keywords (100 chars max)
  - [ ] Screenshots (6.7", 6.5", 5.5" iPhones + iPad)
  - [ ] App preview video (optional)
  - [ ] App icon (1024x1024, no transparency)
  - [ ] Privacy policy URL
  - [ ] Support URL
  - [ ] Category: Games > Word
  - [ ] Age rating questionnaire
- [ ] Archive and upload build from Xcode
- [ ] Submit for App Review (typically 1-3 days)
- [ ] Address any review feedback
- [ ] Release to App Store

**Post-Launch iOS**
- [ ] Push notifications setup
- [ ] App Store Optimization (ASO)
- [ ] Monitor crash reports
- [ ] Respond to user reviews

### 8.2 Android App (Google Play Store)

**Setup**
- [ ] Add Android platform (`npx cap add android`)
- [ ] Configure app icon for Android (adaptive icons)
- [ ] Update capacitor.config.ts with Android settings
- [ ] Configure splash screen

**Development & Testing**
- [ ] Test on Android Emulator
- [ ] Test on physical Android device
- [ ] Handle different screen sizes
- [ ] Test all game features on Android
- [ ] Handle Android back button behavior

**Google Play Submission**
- [ ] Create Google Play Developer Account ($25 one-time)
- [ ] Create app in Google Play Console
- [ ] Prepare Play Store listing:
  - [ ] App name: LetsWord
  - [ ] Short description (80 chars)
  - [ ] Full description (4000 chars, Danish & English)
  - [ ] Screenshots (phone & tablet, 7" and 10")
  - [ ] Feature graphic (1024x500)
  - [ ] App icon (512x512)
  - [ ] Privacy policy URL
  - [ ] Category: Games > Word
  - [ ] Content rating questionnaire
  - [ ] Target audience and content
- [ ] Generate signed AAB (Android App Bundle)
- [ ] Upload to Play Console
- [ ] Complete Data Safety form
- [ ] Submit for review (typically 1-3 days)
- [ ] Release to Google Play

**Post-Launch Android**
- [ ] Push notifications setup (Firebase Cloud Messaging)
- [ ] Play Store Optimization
- [ ] Monitor Android Vitals
- [ ] Respond to user reviews

### 8.3 Shared Mobile Features
- [ ] Offline mode with data sync
- [ ] Deep linking support
- [ ] Share functionality (native share sheet)
- [ ] Haptic feedback
- [ ] App rating prompts (after X games)
- [ ] In-app updates (Android)

---

## Technical Debt & Improvements

### Performance
- [ ] Optimize word dictionary loading
- [ ] Implement word list caching
- [ ] Lazy load components
- [ ] Image/asset optimization

### Code Quality
- [ ] Add comprehensive TypeScript types
- [ ] Unit tests for game logic
- [ ] E2E tests with Playwright
- [ ] Error tracking (Sentry)
- [ ] Analytics integration

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color blind friendly modes
- [ ] Reduced motion options

---

## Current Priority Order

1. **Phase 1** - MVP (Auth + Leaderboard) ← START HERE
2. **Phase 2.3** - Daily Challenge (viral potential)
3. **Phase 3.2** - Streaks (retention)
4. **Phase 4.2** - Share Results (growth)
5. **Phase 3** - Full progression system
6. **Phase 4** - Social features
7. **Phase 5-6** - Power-ups & customization
8. **Phase 7** - Monetization
9. **Phase 8** - Mobile apps

---

## Notes

- All UI text in Danish (Dansk)
- Design for mobile-first (responsive)
- Build with monetization hooks but keep free initially
- Focus on daily challenge for viral growth (like Wordle)
