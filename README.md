# Pitch

A real-time, multiplayer card game built by team JACC'd (Jordan, Amber, Caleb, Charlie).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Redux Toolkit, Socket.IO client |
| Backend | Node.js, Express 5, TypeScript, Socket.IO |
| Hot storage | Redis (live game state, 1-hour TTL) |
| Cold storage | MongoDB / AWS DocumentDB (accounts, profiles, leaderboard) |
| Infrastructure | AWS ECS Fargate, S3 + CloudFront, ElastiCache, DocumentDB |
| IaC | Terraform |
| CI/CD | GitHub Actions |

---

## Local Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Node.js 20+ (only needed if running the frontend outside Docker)

### 1. Clone the repository

```bash
git clone https://github.com/Caleb-Kelly-25/pitch.git
cd pitch
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The defaults in both files work out of the box for local Docker Compose. No edits required for local development.

### 3. Start backend services

```bash
docker compose up --build
```

This starts three containers:

| Container | Port | Purpose |
|---|---|---|
| `backend` | 3000 | Express + Socket.IO API |
| `redis` | 6379 | Live game state cache |
| `mongo` | 27017 | User accounts and profiles |

### 4. Start the frontend

In a separate terminal:

```bash
cd client
npm install
npm run dev
```

### 5. Open the app

Go to [http://localhost:5173/signup](http://localhost:5173/signup) and create an account.

To play a full game locally, open three more browser tabs or use different browsers. One player hosts a game, the others join with the game code. You can also fill empty seats with bot players from the lobby.

---

## Running Tests

Tests live in `server/src/tests/` and cover domain logic, application use cases, REST adapters, WebSocket handlers, and integration scenarios.

```bash
cd server
npm test
```

---

## AWS Deployment

The production environment runs on AWS. Deployment is handled by three manual GitHub Actions workflows (`.github/workflows/`). You must configure the required secrets in your GitHub repository before running them.

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID |
| `AWS_REGION` | e.g. `us-east-1` |
| `AWS_ROLE_ARN` | IAM role ARN with ECS/ECR/S3/CloudFront permissions (OIDC) |
| `TF_VAR_docdb_username` | DocumentDB admin username |
| `TF_VAR_docdb_password` | DocumentDB admin password |

### Step 1 — Provision infrastructure (first time only)

Run the **Deploy Infrastructure** workflow (`deploy-infra.yml`) from the GitHub Actions tab. This uses Terraform to create:

- VPC, subnets, security groups
- ECS Fargate cluster and task definition
- ECR container registry
- ElastiCache Redis cluster
- DocumentDB cluster (MongoDB-compatible)
- S3 bucket + CloudFront distribution for the frontend
- Route 53 DNS records
- SSM Parameter Store entries for secrets

Review the Terraform plan output in the Actions log before the apply step.

### Step 2 — Deploy the backend

Run the **Deploy Backend** workflow (`deploy-backend.yml`). It:

1. Builds the server Docker image
2. Pushes it to ECR
3. Updates the ECS task definition with the new image
4. Deploys the updated service and waits for stability

### Step 3 — Deploy the frontend

Run the **Deploy Frontend** workflow (`deploy-frontend.yml`). It:

1. Installs dependencies and runs `vite build`
2. Syncs the `dist/` output to S3
3. Invalidates the CloudFront cache so users get the latest version

### Re-deploying

For subsequent deployments after code changes, run only the backend or frontend workflow depending on what changed. Infrastructure only needs to be re-applied when Terraform files change.

---

## Project Structure

```
pitch/
├── client/             # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── app/        # Redux store and router
│   │   ├── components/ # Reusable UI components
│   │   ├── features/   # auth, game, profile slices and hooks
│   │   ├── pages/      # Login, Signup, LandingPage, Host, JoinGame, GamePlay, Leaderboard
│   │   └── lib/        # Socket.IO connection
│   └── Dockerfile.prod
├── server/             # Node.js backend (Express + Socket.IO)
│   ├── src/
│   │   ├── adapters/   # REST controllers, WebSocket controller, DB/auth adapters
│   │   ├── application/# Use cases (PlaceBid, PlayCard, PickSuit, BlindCard, ...)
│   │   ├── domain/     # Entities, enums, error types
│   │   └── ports/      # Interface definitions (hexagonal architecture)
│   └── Dockerfile
├── infrastructure/
│   └── terraform/      # All AWS infrastructure definitions
├── docker-compose.yml  # Local development (backend + Redis + MongoDB)
└── .github/workflows/  # CI/CD pipelines
```

---

## Stretch Goals

Stretch goals were explicitly labeled as such in the requirements task list. All of the following were implemented:

- Player profile statistics — implemented as a modal in the top bar
- Stats and leaderboard backend logic
- Animations (blind selection phase, card movement, bids)

The following stretch goals were not completed:

- Tutorial quick-reference pop-up during gameplay
- Two-factor authentication (2FA) — labeled "super stretch"

## Beyond Requirements

The following features were not in the original requirements document but were added during development:

- AI bot players to fill empty lobby seats
- Leaderboard page with paginated ranked stats
- Ambient music (Web Audio API) with a toggle button
- Sound effects for card play, trick win, and shuffle
- Particle effects and 3D card hover animations

The following were explicitly cut before development began and were never planned: mobile ports (Android, iOS, PWA), in-game chat, keyboard card selection, custom profile photo upload, 5+ player support, dark theme, player removal on inactivity, and a scrollable rules reference panel.

See [DESIGN.md](DESIGN.md) for a full comparison of planned vs. implemented features.
