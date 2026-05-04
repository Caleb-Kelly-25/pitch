# Design Document: Planned vs. Actual System

This document compares the system as originally designed in the UI Prototype / System Architecture milestone against the system that was actually built.

---

## Architecture

### Planned

The original architecture document called for:
- REST endpoints for static operations (auth, lobby creation)
- Real-time WebSocket connections for in-game play
- MongoDB for static, long-lasting data (Player, Stats)
- Redis for highly dynamic game state (Game, HandCycle, RoundPhase) with pub/sub for scalability
- A clean, simple UI emphasizing ease of use

### Actual

The architecture was implemented exactly as designed. The notable addition is the formal use of **hexagonal (ports and adapters) architecture** on the backend, which was implied but not explicitly named in the original plan:

- **Domain layer** — pure entities and business logic (no framework dependencies)
- **Application layer** — use case functions (PlaceBid, PlayCard, PickSuit, BlindCard, DiscardHandCard)
- **Ports** — interfaces decoupling domain from infrastructure (IGamePublisherPort, IShortTermStoragePort, ILongTermStoragePort)
- **Adapters** — concrete implementations (Express REST, Socket.IO WebSocket, Redis, MongoDB, JWT)

AWS deployment uses ECS Fargate for the backend and S3 + CloudFront for the frontend, with ElastiCache Redis and DocumentDB (MongoDB-compatible).

**Delta:** DocumentDB is used instead of self-managed MongoDB in production for managed AWS compatibility. The local development environment still uses standard MongoDB 7.0 via Docker.

---

## Database

### Planned

| Data type | Store |
|---|---|
| Player, Stats (static) | MongoDB |
| Game, HandCycle, RoundPhase (dynamic) | Redis |

### Actual

| Data type | Store |
|---|---|
| User (auth), UserProfile (stats/leaderboard) | MongoDB / DocumentDB |
| GameState (entire live game) | Redis (1-hour TTL) |

**Delta:** The original diagram modeled `Game`, `Hand_Cycle`, `Round_Phase`, `Team`, `Hand`, `Card`, and `GameParticipants` as separate database entities. In the actual system, the entire live game is serialized as a single `GameState` object stored in Redis. This reduces round-trips and simplifies the concurrency model at the cost of granularity.

The `Stats` entity from the planned diagram maps to `UserProfile` in the actual system, with essentially the same fields.

---

## Class Structure

### Planned (UML diagram)

- Game → HandCycle → RoundPhase
- Team (2 Participants per Team)
- Participant → Hand → Card
- Player/User → PlayerStat
- Suit (enum)

### Actual

| Planned | Actual | Notes |
|---|---|---|
| Game | GameState | Flattened; holds teams, current cycle, and scores directly |
| HandCycle | HandCycle | Core state machine — closely matches plan |
| RoundPhase | Trick | Renamed for clarity |
| Team | Embedded in GameState | Not a separate class; represented as team 0 / team 1 indices |
| Participant | Player | Simplified; `hand` is tracked via a separate Hand entity |
| Player/User | User | Separated into User (auth) and Player (game participant) |
| PlayerStat | UserProfile | Same fields, different name |
| Hand | Hand | Unchanged |
| Card | Card | Unchanged; Suit and Value are enums |
| — | BiddingCycle | New: encapsulates bidding state not covered by original diagram |
| — | BotDecision / BotTrigger | New: AI player logic |

---

## Frontend / UI

### Planned

The Figma prototype defined these major views:
- Login / Signup
- Game lobby (host and join flows)
- Game board with player seats around a table
- Card hand display
- Bidding UI
- Trump suit selection
- Blind card phase

### Actual

All planned views were implemented. The following were added beyond the original prototype:

| Addition | Description |
|---|---|
| Leaderboard page | Paginated ranked stats for all players |
| Profile modal | User stats accessible from the top bar during any screen |
| Trick result overlay | Animated display of trick winner before next trick begins |
| Hand result overlay | Point summary shown at end of each hand |
| Game over overlay | Final score and winner declaration |
| Ambient music | Web Audio API synthesized background music with toggle |
| Sound effects | Card play, trick win, and shuffle audio events |
| Particle animations | Ember and floating suit-symbol background effects |
| 3D card hover | Perspective tilt effect on cards in hand |
| Bot player support | Add AI players to fill empty lobby seats |

---

## Features: Implemented vs. Stretch Goals

### Implemented (Core Requirements)

- User registration and login with secure password hashing (bcrypt) and JWT authentication
- Game hosting and joining with shareable 6-character game codes
- Standard 4-player Pitch game loop: bidding → blind cards → trump selection → tricks → scoring → game over
- Real-time multiplayer via Socket.IO with Redis pub/sub adapter
- Visual card hand with fan layout and playable/non-playable distinction
- 4-player seating arrangement around a virtual table
- Running score display during gameplay
- Cards-won strip showing captured trick cards
- Drag-and-drop / click-based card interaction

### Stretch Goals

These were explicitly labeled as stretch goals in the requirements task list — aspirational work attempted after core requirements were met.

| Stretch Goal | Status |
|---|---|
| Player profile page with stats | Implemented as a modal (not a dedicated page) |
| Stats and leaderboard backend logic | Implemented |
| Animations (blind selection, card movement, bids) | Implemented |
| Tutorial pop-up / quick-reference during gameplay | Not implemented |
| Two-factor authentication (2FA) — super stretch | Not implemented |

### Added Beyond Requirements

The following features were not in the original requirements document but were added during development.

- **AI bot players** — bots can fill empty lobby seats with basic bidding and card-play strategy
- **Leaderboard** — paginated ranked stats page sorted by games won
- **Ambient music** — synthesized background music via Web Audio API with a toggle button
- **Sound effects** — audio cues for card play, trick win, and shuffle events
- **Particle effects** — animated embers and floating suit symbols in the background
- **3D card hover** — perspective tilt effect on cards in the player's hand

### Out of Scope

The following requirements were explicitly cut before development began (marked red in the requirements document). They were never planned for this release.

- Mobile ports (Android, iOS, Progressive Web App)
- In-game live chat
- Keyboard-based card selection
- Custom profile photo upload
- Expanded 5+ player support
- High-contrast / dark visual theme
- Player removal on prolonged inactivity
- Scrollable rules reference panel during gameplay

---

## What Stayed the Same

- Dual-database strategy (hot Redis + cold MongoDB) — implemented exactly as planned
- MERN + TypeScript stack — confirmed before development and used throughout
- Clean architecture separating domain from infrastructure — designed and maintained
- REST for lobby/auth, WebSocket for gameplay — implemented as designed
- AWS deployment target — completed with Terraform IaC and GitHub Actions CI/CD
