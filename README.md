# THREES

Real-money multiplayer dice game. Roll six dice, dodge the threes, keep your money.

## Rules

- Everyone rolls 6 dice simultaneously
- **3s are worth zero** - they're locked and can't help your score
- **All 3s = instant elimination** (0 score, auto-lose)
- Lowest score loses their wager
- Winners split the losers' pot minus a 5% house rake
- Elimination mode: losers are knocked out round by round until one remains

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand, React Query
- **Backend:** Node.js, Express, Socket.io, Prisma ORM
- **Database:** PostgreSQL 15, Redis 7
- **Payments:** Stripe (PaymentIntents + webhooks)
- **Auth:** JWT access/refresh tokens, bcrypt, httpOnly cookies

## Quick Start

### Docker (recommended)

```bash
cp .env.example .env
# Edit .env with your Stripe keys if testing payments
docker compose up --build
```

- Client: http://localhost:5173
- Server: http://localhost:3001
- Health: http://localhost:3001/api/health

### Local Development

```bash
# Terminal 1: Start databases
docker compose up postgres redis

# Terminal 2: Server
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev

# Terminal 3: Client
cd client
npm install
npm run dev
```

### Test Accounts (after seeding)

| Email | Password | Role | Balance |
|-------|----------|------|---------|
| player1@test.com | testpass123 | Player | $500 |
| player2@test.com | testpass123 | Player | $500 |
| admin@threes.game | testpass123 | Admin | $1,000 |

## Architecture

### Server-Authoritative

All dice rolls use `crypto.randomBytes` on the server. Clients never generate their own rolls. Game state is stored in Redis for real-time operations and persisted to Postgres for history/audit.

### Double-Entry Ledger

All money operations use Prisma interactive transactions with `SELECT FOR UPDATE` to prevent race conditions. Every balance change creates a Transaction record. Deposits are idempotent (keyed on Stripe PaymentIntent ID).

### Payout Math

```
totalPot = wagerCents * playerCount
loserContribution = wagerCents * loserCount
rake = floor(loserContribution * rakePercent / 100)
profitPerWinner = floor((loserContribution - rake) / winnerCount)
returnPerWinner = wagerCents + profitPerWinner
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with live stats |
| `/login` | Authentication |
| `/register` | Account creation (18+ enforced) |
| `/lobby` | Browse and create tables |
| `/room/:id` | **The game** - circular table, dice, chat |
| `/wallet` | Deposit, withdraw, transaction history |
| `/profile` | Stats, game history, responsible gambling |
| `/admin` | Dashboard, users, KYC, financials |

## Responsible Gambling

- Age verification (18+) at registration
- Daily deposit limits with 24h cooling period for increases
- Self-exclusion (24h / 7d / 30d / permanent)
- Session limits
- Resource links (NCPG, GamCare, 1-800-GAMBLER)

## Compliance Warning

**This application requires jurisdiction-specific gambling licensing before any real-money deployment.** Stripe may not permit gambling transactions without proper merchant category setup. Consult a gaming attorney and obtain all required licenses before going live.

## Design System

- **Background:** Void #0A0907, Surface #111009, Felt #0C1C10
- **Accent:** Gold #C8862A, Bright Gold #F5C842
- **Status:** Win #2A7A4A, Loss #C63535
- **Fonts:** Cinzel Decorative (display), DM Mono (scores/money), Lora (body)
- **Aesthetic:** Premium underground casino - dark, textured, cinematic
