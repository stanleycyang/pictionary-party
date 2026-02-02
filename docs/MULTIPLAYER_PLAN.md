# Real-Time Multiplayer Plan for Pictionary Party

## Overview

Transform Pictionary Party from a local party game to a real-time multiplayer experience where players can join rooms, see drawings live, and swap drawing duties within their team.

---

## Recommended Tech Stack

### Option A: Supabase Realtime (Recommended) ⭐
**Pros:**
- Easy setup, hosted infrastructure
- Built-in presence (who's online)
- PostgreSQL for game state persistence
- Free tier generous (500 concurrent connections)
- Works great with React Native

**Cons:**
- Slight latency vs raw WebSockets (~50-100ms)

### Option B: Socket.io + Node.js Server
**Pros:**
- Full control, lowest latency
- Battle-tested for real-time games

**Cons:**
- Need to host/manage server
- More complex scaling

### Option C: Ably or Pusher
**Pros:**
- Managed WebSocket infrastructure
- Global edge network = low latency

**Cons:**
- Costs scale with usage
- Less flexible than Supabase

**My Recommendation:** Start with **Supabase Realtime** - fast to implement, free tier, and handles presence/rooms elegantly.

---

## Core Features

### 1. Room System
```
┌─────────────────────────────────────┐
│  Room: PARTY-2847                   │
│  Host: Stanley                      │
├─────────────────────────────────────┤
│  Team 1 (Blue)    │  Team 2 (Red)   │
│  - Stanley ✏️     │  - Mike         │
│  - Sarah          │  - Emma ✏️      │
│  - John           │  - Alex         │
└─────────────────────────────────────┘
```

- **Create Room**: Host generates 4-6 character code
- **Join Room**: Players enter code to join
- **Team Assignment**: Auto-balance or manual pick
- **Ready Check**: All players ready before starting

### 2. Real-Time Drawing Sync
```typescript
// Drawing events streamed to all players
interface DrawingEvent {
  type: 'start' | 'move' | 'end' | 'clear' | 'undo';
  x?: number;
  y?: number;
  color: string;
  brushSize: number;
  timestamp: number;
}
```

- Broadcast drawing strokes as they happen
- Batch events (every 16ms = 60fps) to reduce bandwidth
- Use path compression for efficiency

### 3. Team Drawing Rotation
```
Round 1: Team 1 draws, Team 2 guesses
  └─ Stanley draws first (60s)
  └─ Sarah tags in to continue (tap "Tag Team" button)
  └─ John finishes the drawing

Round 2: Team 2 draws, Team 1 guesses
  └─ Rotation continues...
```

- "Tag Team" button lets teammates swap drawer mid-round
- Only one person draws at a time (token passing)
- Visual indicator showing who has the "pen"

### 4. Guessing System
- Guessing team sees drawing + chat input
- Real-time chat for guesses
- Host/system validates correct answer
- Points awarded on correct guess

---

## Data Model (Supabase)

```sql
-- Rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY,
  code VARCHAR(6) UNIQUE,
  host_id UUID REFERENCES players(id),
  status VARCHAR(20), -- 'lobby' | 'playing' | 'finished'
  settings JSONB, -- timer, difficulty, etc.
  current_round INT,
  current_word VARCHAR(100),
  drawing_team INT,
  created_at TIMESTAMP
);

-- Players
CREATE TABLE players (
  id UUID PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  name VARCHAR(50),
  team INT,
  is_drawing BOOLEAN,
  score INT DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE
);

-- Drawing Events (could also be ephemeral via broadcast)
-- For replay/reconnect functionality
CREATE TABLE drawing_strokes (
  id SERIAL,
  room_id UUID REFERENCES rooms(id),
  round INT,
  player_id UUID,
  stroke_data JSONB, -- compressed path data
  created_at TIMESTAMP
);
```

---

## Implementation Phases

### Phase 1: Basic Multiplayer (MVP) - ✅ COMPLETED
- [x] Room creation/joining with codes
- [x] Player presence (who's in room)
- [x] Real-time drawing sync
- [x] Basic turn management

### Phase 2: Full Game Logic - ✅ COMPLETED
- [x] Team assignment
- [x] Round management
- [x] Word selection (one player sees word)
- [x] Scoring system
- [x] Win conditions

### Phase 3: Polish - ✅ COMPLETED
- [x] Tag-team drawing swap
- [x] Chat/guessing interface
- [ ] Reconnection handling (TODO)
- [ ] Sound effects for events (TODO)
- [ ] Spectator mode (TODO)

### Phase 4: Advanced Features - Optional
- [ ] Private/public rooms
- [ ] Leaderboards
- [ ] Custom word packs
- [ ] Voice chat integration
- [ ] Replay system

---

## 🚀 What Was Built (Feb 2, 2026)

### Files Created:
```
src/
├── lib/
│   ├── supabase.ts          # Supabase client config
│   └── gameStore.ts         # Zustand state management
├── hooks/
│   └── useMultiplayer.ts    # Main multiplayer hook
├── screens/
│   ├── HomeScreen.tsx       # Mode selection
│   ├── CreateRoomScreen.tsx # Create room + get code
│   ├── JoinRoomScreen.tsx   # Join with code
│   ├── LobbyScreen.tsx      # Team selection + ready
│   └── MultiplayerGameScreen.tsx # Drawing + guessing
├── types/
│   └── multiplayer.ts       # TypeScript types
├── App.multiplayer.tsx      # Multiplayer app wrapper
└── index.ts                 # Exports
```

### Dependencies Added:
- `@supabase/supabase-js` - Realtime communication
- `zustand` - State management  
- `@react-native-async-storage/async-storage` - Persistence

### Setup Required:
1. Create a Supabase project at https://supabase.com
2. Copy `.env.example` to `.env`
3. Add your Supabase URL and anon key

---

## User Flow

```
1. HOME SCREEN
   ├─ [Create Game] → Generate room code → Share with friends
   ├─ [Join Game]   → Enter room code → Join lobby
   └─ [Local Play]  → Current single-device mode

2. LOBBY
   ├─ See all players
   ├─ Pick/assign teams
   ├─ Host adjusts settings
   └─ Everyone clicks "Ready" → Game starts

3. GAMEPLAY
   ├─ Drawing team sees word
   ├─ One player draws (can tag teammate)
   ├─ Guessing team watches + types guesses
   ├─ Correct guess = points + next round
   └─ Timer runs out = no points, switch teams

4. END GAME
   ├─ Final scores
   ├─ MVP highlights
   └─ Play again or return to lobby
```

---

## Bandwidth Optimization

Drawing data can be heavy. Optimizations:

1. **Delta compression**: Only send changes
2. **Batching**: Collect 16ms of strokes, send as batch
3. **Path simplification**: Reduce points using Douglas-Peucker algorithm
4. **Binary encoding**: Use MessagePack instead of JSON

Expected bandwidth: ~5-10 KB/s per active drawer

---

## Estimated Timeline

| Phase | Duration | Effort |
|-------|----------|--------|
| Setup Supabase + basic rooms | 2 days | Medium |
| Real-time drawing sync | 2 days | High |
| Game logic (turns, scoring) | 3 days | Medium |
| Tag-team feature | 1 day | Low |
| Polish + testing | 2 days | Medium |
| **Total** | **~10 days** | |

---

## Cost Estimate (Supabase)

- **Free tier**: 500 concurrent connections, 2GB database
- **Pro ($25/mo)**: 10K concurrent connections, 8GB database

For launch, free tier should handle 50-100 simultaneous games easily.

---

## Next Steps

1. ✅ Review and approve this plan
2. Set up Supabase project
3. Implement room creation/joining
4. Add real-time drawing channel
5. Build game state machine
6. Test with multiple devices
7. Deploy updated version

---

*Questions? Let me know which approach you prefer or if you want to adjust the scope!*
