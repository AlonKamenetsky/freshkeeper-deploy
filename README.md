# FreshKeeper — Full Stack Application (Assignment 4)

A food inventory and recipe management system.

## Stack

- **Frontend:** React 18, React Router v6, Socket.IO client
- **Backend:** Node.js, Express, Socket.IO
- **Database:** MySQL 8 via Sequelize ORM
- **AI:** Anthropic Claude (Haiku) via REST API

---

## Prerequisites

- Node.js 18+
- MySQL 8 running locally
- An Anthropic API key → https://console.anthropic.com/

---

## Installation

### 1. Clone / extract the project

```bash
cd freshkeeper
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set DB_PASSWORD and ANTHROPIC_API_KEY
```

### 3. Database setup

Option A — let Sequelize handle it (recommended):

```bash
# Just start the server; sequelize.sync({ alter: true }) creates all tables automatically
npm run dev
```

Option B — run SQL manually:

```bash
mysql -u root -p < migrations/001_initial_schema.sql
mysql -u root -p < migrations/002_seed.sql
```

### 4. Frontend setup

```bash
cd frontend
npm install
npm start     # runs on http://localhost:3001
```

---

## Environment Variables

### `backend/.env`

| Variable          | Description                        | Default              |
|-------------------|------------------------------------|----------------------|
| `DB_HOST`         | MySQL host                         | `localhost`          |
| `DB_PORT`         | MySQL port                         | `3306`               |
| `DB_NAME`         | Database name                      | `freshkeeper`        |
| `DB_USER`         | MySQL username                     | `root`               |
| `DB_PASSWORD`     | MySQL password                     | *(required)*         |
| `PORT`            | Backend port                       | `3000`               |
| `FRONTEND_URL`    | Allowed CORS origin                | `http://localhost:3001` |
| `ANTHROPIC_API_KEY` | Claude API key                   | *(required for AI)*  |

---

## ORM Setup (Sequelize)

Models live in `backend/models/`:

| File        | Table      | Description                     |
|-------------|------------|---------------------------------|
| `User.js`   | `Users`    | App users (admin/employee/consumer) |
| `Item.js`   | `Items`    | Pantry food items               |
| `Recipe.js` | `Recipes`  | Recipes with JSON ingredients   |
| `Tag.js`    | `Tags`     | Recipe tags (vegetarian, etc.)  |
| `index.js`  | —          | Sequelize init + associations   |

### Relationships

- **One-to-many:** `User → Items` (a user owns many items)
- **Many-to-many:** `Recipe ↔ Tags` (via `RecipeTags` junction table)

---

## API Endpoints

All responses use the format:
```json
{ "success": true, "data": {}, "error": null }
```

### Auth
| Method | Path           | Description       |
|--------|----------------|-------------------|
| POST   | `/users/login` | Login (returns role + userId) |

### Users (`x-user-role: admin` header required for write ops)
| Method | Path         | Roles         |
|--------|--------------|---------------|
| GET    | `/users`     | admin, employee |
| GET    | `/users/:id` | admin, employee |
| POST   | `/users`     | admin         |
| PUT    | `/users/:id` | admin, employee |
| DELETE | `/users/:id` | admin         |

### Items
| Method | Path         | Roles                        |
|--------|--------------|------------------------------|
| GET    | `/items`     | all (supports `?storageType=fridge&category=dairy&expiringSoon=true`) |
| GET    | `/items/:id` | all                          |
| POST   | `/items`     | admin, employee              |
| PUT    | `/items/:id` | admin, employee, consumer    |
| DELETE | `/items/:id` | admin                        |

### Recipes
| Method | Path                         | Notes                        |
|--------|------------------------------|------------------------------|
| GET    | `/recipes`                   | `?tags=vegetarian,quick`     |
| GET    | `/recipes/:id`               |                              |
| POST   | `/recipes`                   | admin only                   |
| PUT    | `/recipes/:id`               | admin, employee              |
| DELETE | `/recipes/:id`               | admin                        |
| POST   | `/recipes/suggest`           | Logic-based suggestion       |
| POST   | `/recipes/predict-expiration`| Shelf-life estimate          |

### AI (requires valid role header)
| Method | Path                  | Description                       |
|--------|-----------------------|-----------------------------------|
| POST   | `/ai/suggest-recipe`  | AI recipe suggestions from pantry |
| POST   | `/ai/food-tips`       | AI storage tips for a specific item |

---

## WebSocket Feature

### Connection

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
```

### Events (client → server)

| Event              | Payload                         | Description                        |
|--------------------|---------------------------------|------------------------------------|
| `user_join`        | `{ userId, email, role }`       | Announce presence, receive online list |
| `subscribe_expiry` | —                               | Join expiry notification room      |
| `pantry_message`   | `{ text, from }`                | Send a chat message to all clients |

### Events (server → client)

| Event          | Payload                              | Description                  |
|----------------|--------------------------------------|------------------------------|
| `online_users` | `[ { userId, email, role }, … ]`     | Updated list of online users |
| `subscribed`   | `{ room }`                           | Subscription confirmed       |
| `pantry_message` | `{ text, from, ts }`               | Broadcast chat message       |
| `item:created` | `{ itemId, name, category, storageType }` | New item added         |
| `item:updated` | `{ itemId, name, quantity }`         | Item modified                |
| `item:deleted` | `{ itemId }`                         | Item removed                 |

**Testing multi-tab:** Open two browser tabs, log in with different accounts (e.g. admin + consumer). Use the 💬 chat button — messages appear in both tabs in real time. Creating/deleting items also appears as system notifications in the chat.

---

## AI Feature

### `POST /ai/suggest-recipe`

Sends your current pantry items to Claude and gets back 2 recipe ideas, prioritising items expiring soon.

**Request:**
```json
{
  "items": [{ "name": "Eggs", "category": "dairy", "expirationDate": "2025-05-10" }],
  "preferences": "vegetarian"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "name": "Veggie Scramble",
        "description": "Quick and healthy egg dish.",
        "keyIngredients": ["eggs", "spinach"],
        "estimatedTime": "15 minutes",
        "difficulty": "Easy",
        "tip": "Use the eggs first — they expire soonest!"
      }
    ]
  }
}
```

### `POST /ai/food-tips`

Get storage and freshness tips for a specific pantry item.

**Request:** `{ "item": { "name": "Milk", "category": "dairy", "storageType": "fridge", "expirationDate": "2025-05-05" } }`

---

## Known Limitations

- Passwords stored in plain text (no bcrypt) — demo only, not production-safe.
- No JWT authentication — role sent via `x-user-role` header (demo convention).
- AI calls go to Anthropic's API; require a valid `ANTHROPIC_API_KEY` in `.env`.
- `sequelize.sync({ alter: true })` is used for convenience; use proper migrations in production.
