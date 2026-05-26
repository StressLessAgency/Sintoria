# THREES

Real-money multiplayer dice game. Also known as **Tripps** — a street game traditionally played in alleyways and living rooms with five dice and a pot of cash.

## Rules

- Each player **antes one unit** (typically a dollar) into the pot
- Players take turns rolling five dice
- Each player has **up to 5 rolls**, but must set **at least 1 die aside** after every throw
- Once a die is set aside, it can't be rolled again
- **3s count as zero**; all other dice add their face value
- **Lowest total wins the pot**
- Five 6s on a single roll — "**Shooting the Moon**" — wins instantly
- Tied players ante one more unit and play again
- The house takes a 2% rake from the winner's payout

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand, React Query, Socket.io-client
- **Backend:** Node.js, Express, Socket.io, Prisma ORM
- **Database:** PostgreSQL 15, Redis 7
- **Payments:** Stripe (PaymentIntents + webhooks)
- **Auth:** JWT access/refresh tokens, bcrypt, httpOnly cookies

## Quick Start

### Docker (recommended)

```bash
cp .env.example .env
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

All dice rolls use `crypto.randomBytes` on the server. Clients never generate their own rolls. Per-player game state (set-aside dice, current roll, rolls used, score) is stored in Redis for real-time operations and persisted to Postgres on game completion.

### Turn-Based Flow

1. All players ready up → server debits everyone's ante, builds turn order (winner of last game rolls first), and broadcasts `game_started`
2. Current player emits `roll_dice` → server rolls `(5 - setAside.length)` dice, broadcasts `dice_rolled`
3. Player picks which indices to keep, emits `set_aside { indices }` → server moves those to `setAside`, broadcasts `dice_set_aside`
4. If the player still has dice and rolls left, repeat from step 2; else mark done and advance the turn
5. When everyone is done, server runs `resolveScores` → either one winner (game over, pot paid out) or multiple winners (tie replay: tied players re-ante, only they play again)

### Double-Entry Ledger

All money operations use Prisma interactive transactions with `SELECT FOR UPDATE` to prevent race conditions. Every balance change creates a Transaction record. Deposits are idempotent (keyed on Stripe PaymentIntent ID).

### Payout Math

```
pot          = sum of all antes (plus any tie-replay re-antes)
rake         = floor(pot * HOUSE_RAKE_PERCENT / 100)   # default 2%
winnerCents  = pot - rake
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with live stats |
| `/login` | Authentication |
| `/register` | Account creation (18+ enforced) |
| `/lobby` | Browse and create tables |
| `/room/:id` | **The game** — turn-based dice play, chat |
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
