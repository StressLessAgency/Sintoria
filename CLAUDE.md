# THREES — Claude Code Context

## What This Is
Full-stack real-money multiplayer dice game. Six dice, threes worth zero, lowest score loses their wager. Server-authoritative, real-time via Socket.io, Stripe for money movement.

## Owner
Quinn Blalock (product/creative) + Bryan (engineering/ops, owns Supabase + deployments). Stressless Studio.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand, React Query, Socket.io-client
- **Backend:** Node.js (ESM), Express, Socket.io, Prisma ORM, PostgreSQL 15, Redis 7
- **Payments:** Stripe (PaymentIntents, webhooks, idempotent deposits)
- **Auth:** JWT access (15m) / refresh (7d), bcrypt, httpOnly cookies
- **Infra:** Docker Compose (postgres, redis, server, client)

## Project State
Backend is complete and functional. Frontend has all pages, stores, hooks, components — but the **design needs to be upgraded to match the v2 design language** in `/design/threes-v2.jsx`.

### What's Done
- Full game engine (crypto.randomBytes dice, scoring, payout math)
- Double-entry ledger with SELECT FOR UPDATE (no race conditions)
- Redis-backed room state management
- All socket handlers (join, ready, roll, reroll, resolve, eliminate, end)
- Auth routes (register, verify, login, refresh, forgot/reset password)
- Wallet routes (balance, deposit via Stripe, withdraw with KYC check)
- Room routes (list, create, get, live stats)
- Profile routes (stats, history, responsible gambling, self-exclusion)
- Admin routes (dashboard, users, KYC, game logs, financials)
- Webhook handler (Stripe signature verification, idempotent crediting)
- Compliance middleware (age validation, self-exclusion, deposit limits)
- Rate limiting (API + socket)
- All frontend stores, hooks, lib utilities
- All 8 pages (Landing, Login, Register, Lobby, Room, Wallet, Profile, Admin)
- All component groups (UI, Dice, Table, Wallet, Lobby)
- Docker Compose, Dockerfiles, seed script, env config

### What Needs Work
1. **Design upgrade** — The v2 design in `/design/threes-v2.jsx` is the target. Current frontend pages need to be rewritten to match this design language. Key changes:
   - Font swap: Playfair Display (display) + Inter (body) + JetBrains Mono (numbers)
   - Color refinement: bg #08070C, gold #D4972E, goldHot #FFCC44, red #E23B3B
   - Full-screen immersive game room (no sidebar layout)
   - Single overhead light source aesthetic
   - Dice with weight (ground shadows, steep lighting gradients, proportional radius)
   - Restrained result overlays (no emoji, no decorations — just typography and light)
   - Glass panels with backdrop-blur for floating UI
   - Killed decorative noise (particles, rotating rings, multiple glows)

2. **Prisma migration** — Schema is written but `npx prisma migrate dev --name init` hasn't been run against a live database yet.

3. **Stripe integration testing** — PaymentIntent flow works in code but needs real test keys and webhook endpoint verification.

4. **Responsive / mobile** — Current design is desktop-first. Needs mobile breakpoints.

5. **Sound design** — No audio yet. Dice roll sound, win/loss stingers, ambient table hum would elevate the experience.

## Design System (V2 — the target)

### Colors
```
bg:       #08070C     (near-black, cold)
surface:  #0F0E14
card:     #13121A
felt:     #0A1F10     (dark green)
feltLt:   #0E2A16
gold:     #D4972E     (warm authoritative)
goldHot:  #FFCC44     (highlights, wins, P&L)
goldMute: rgba(212,151,46,0.07)
red:      #E23B3B     (losses, threes, danger)
green:    #34B86A     (ready, success)
text:     #DCD5C8     (primary)
sub:      #7A756C     (secondary)
dim:      #3E3A34     (tertiary, receding)
border:   rgba(212,151,46,0.08)
borderHi: rgba(212,151,46,0.18)
```

### Typography
- **Display:** Playfair Display 700/900, letter-spacing 0.06-0.1em
- **Body:** Inter 400-700
- **Numbers/Money/Data:** JetBrains Mono 400-700, letter-spacing -0.02em
- Three fonts, three jobs, zero overlap

### Key Design Principles
- Single overhead light source (radial gradient cone from top center)
- No decorative noise — every element earns its place
- Full-screen immersive game room, no sidebar
- Dice with physical weight (ground shadows, inset highlights, steep face gradients)
- Restrained result moments (typography + light, no emoji/icons)
- Glass panels (backdrop-blur + border) for floating UI over the felt
- The red "3" in the logo communicates the core mechanic
- 8px grid spacing throughout

### Anti-Patterns (DO NOT)
- No emoji as functional UI
- No particles/floating elements
- No multiple ambient glows
- No sidebar layout in game room
- No Cinzel Decorative (too ornamental)
- No DM Mono (JetBrains Mono is sharper)
- No decorative border rings on the table
- No white/light backgrounds anywhere
- No generic AI aesthetic (purple gradients, rounded everything)

## Game Rules
1. Everyone rolls 6 dice simultaneously (server-generated, crypto.randomBytes)
2. Sum your dice — but 3s are worth 0
3. All 3s = instant elimination (score 0)
4. Lowest score loses their wager
5. Winners split losers' pot minus 5% house rake
6. Elimination mode: losers knocked out each round until one remains

## Payout Math
```
totalPot = wagerCents × playerCount
loserContribution = wagerCents × loserCount
rake = floor(loserContribution × 0.05)
profitPerWinner = floor((loserContribution - rake) / winnerCount)
returnPerWinner = wagerCents + profitPerWinner
```

## Key Architecture Decisions
- **Ledger uses SELECT FOR UPDATE** — prevents double-spend race condition the spec originally had
- **Pot = wager × playerCount** — corrected from spec which had wager × loserCount
- **Redis for live state, Postgres for history** — room state in Redis with TTL, completed games persisted to Postgres
- **Idempotent deposits** — keyed on Stripe PaymentIntent ID, safe to replay webhooks
- **Server-authoritative dice** — client never generates rolls, period

## File Structure
```
threes/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dice/index.jsx      # Die, DiceRow, ScoreDisplay
│   │   │   ├── table/index.jsx     # GameTable, PlayerSeat, PotDisplay, ChatPanel
│   │   │   ├── wallet/index.jsx    # BalanceDisplay, DepositForm, WithdrawForm, TxHistory
│   │   │   ├── lobby/index.jsx     # RoomCard, RoomFilters, CreateRoomModal
│   │   │   └── ui/index.jsx        # Button, Input, Modal, Badge, Toast, Skeleton
│   │   ├── hooks/                  # useAuth, useGame, useSocket, useWallet
│   │   ├── store/                  # authStore, gameStore, walletStore (Zustand)
│   │   ├── lib/                    # api.js (axios), socket.js, utils.js
│   │   ├── pages/                  # Landing, Login, Register, Lobby, Room, Wallet, Profile, Admin
│   │   ├── App.jsx                 # Router with protected/admin routes
│   │   ├── main.jsx                # React root
│   │   └── index.css               # Tailwind + custom styles
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
├── server/
│   ├── src/
│   │   ├── game/
│   │   │   ├── engine.js           # rollDice, scoreRoll, resolveRound, calculatePayout
│   │   │   └── roomManager.js      # Redis CRUD for room state
│   │   ├── services/
│   │   │   ├── ledger.js           # Double-entry with SELECT FOR UPDATE
│   │   │   ├── stripe.js           # PaymentIntent, webhooks
│   │   │   └── email.js            # Transactional emails
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verify, token generation
│   │   │   ├── rateLimit.js        # API + socket rate limiting
│   │   │   └── compliance.js       # Age, self-exclusion, deposit limits
│   │   ├── routes/
│   │   │   ├── auth.js             # Register, login, verify, refresh, reset
│   │   │   ├── wallet.js           # Balance, deposit, withdraw, history
│   │   │   ├── rooms.js            # List, create, get, live stats
│   │   │   ├── profile.js          # Stats, history, responsible gambling
│   │   │   ├── webhooks.js         # Stripe webhook handler
│   │   │   └── admin.js            # Dashboard, users, KYC, financials
│   │   ├── socket/
│   │   │   ├── index.js            # Socket.io setup + JWT auth
│   │   │   ├── roomHandlers.js     # Join, leave, ready, startGame
│   │   │   └── gameHandlers.js     # Roll, reroll, resolve, end
│   │   └── app.js                  # Express + Socket.io entry
│   ├── prisma/
│   │   ├── schema.prisma           # 7 models
│   │   └── seed.js                 # 3 test users
│   └── Dockerfile
├── design/
│   └── threes-v2.jsx               # V2 design reference (React artifact)
├── docker-compose.yml
├── .env / .env.example
├── CLAUDE.md                       # This file
└── README.md
```

## Commands
```bash
# Full stack with Docker
docker compose up --build

# Local dev
cd server && npm install && npx prisma generate && npx prisma migrate dev --name init && npm run db:seed && npm run dev
cd client && npm install && npm run dev

# Build check
cd client && npx vite build
cd server && node --check src/app.js
```

## Test Accounts (after seed)
- player1@test.com / testpass123 ($500)
- player2@test.com / testpass123 ($500)
- admin@threes.game / testpass123 (admin, $1000)

## Compliance
Real-money gambling requires jurisdiction-specific licensing. This is a development build. Consult a gaming attorney before any production deployment. Stripe merchant category must be configured for gambling. KYC/AML implementation required.
