# Zefender — Full System Documentation

This document covers the complete architecture, every file, every API endpoint, and every design decision made in the Zefender ad management system. Written so you can trace the code with Claude or any other tool.

---

## What Is Zefender?

Zefender is a vending machine ad management system. It has three parts:

1. **Admin UI** (`zefender-admin-ui`) — React dashboard where the admin uploads ads, assigns them to vending machines, sets priority ads, and monitors live playback.
2. **Backend** (`zefender-backend`) — Node/Express API server that stores ads, playlists, and device info. Connects to PostgreSQL.
3. **Pi / Vending Machine side** (`zefender-frontend-System-side`) — Raspberry Pi running a kiosk that fetches its playlist from the backend and plays ads. Not covered in this doc — that's a separate system.

---

## Project Structure

```
zefender/
├── zefender-admin-ui/          # React frontend (Vite)
│   └── src/
│       ├── api.js              # All axios calls to backend
│       ├── App.jsx             # Root — goes straight to Dashboard
│       └── pages/
│           ├── Dashboard.jsx   # Shell: sidebar nav + topbar
│           ├── Ads.jsx         # Upload, list, toggle, delete ads
│           ├── Playlists.jsx   # Assign ads to devices, set priority
│           ├── Events.jsx      # Manually trigger payment event
│           └── Monitor.jsx     # Live device preview + simulation
│
└── zefender-backend/           # Node/Express backend
    ├── .env                    # Environment variables
    ├── devices.json            # Registered Pi devices (file-based store)
    ├── uploads/                # Locally stored ad files (temp, until R2)
    └── src/
        ├── server.js           # Express app entry point
        ├── config/
        │   ├── db.js           # Sequelize + PostgreSQL connection
        │   └── r2.js           # File storage (local for now, R2 later)
        ├── models/
        │   ├── ad.model.js         # Ad table
        │   ├── playlist.model.js   # Playlist table
        │   └── playlistItem.model.js # Junction: playlist ↔ ad
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── ad.controller.js
        │   ├── playlist.controller.js
        │   ├── event.controller.js
        │   └── device.controller.js
        ├── routes/
        │   ├── auth.routes.js
        │   ├── ad.routes.js
        │   ├── playlist.routes.js
        │   ├── event.routes.js
        │   └── device.routes.js
        ├── middleware/
        │   ├── auth.middleware.js    # JWT verify (passthrough for now)
        │   └── device.middleware.js  # Pi device token verify
        ├── validators/
        │   ├── ad.validator.js
        │   └── playlist.validator.js
        └── utils/
            └── deviceManager.js     # Read/write devices.json
```

---

## How To Run

### Backend
```bash
cd zefender-backend
npm install
# Make sure PostgreSQL is running and .env is configured
npm run dev       # nodemon src/server.js — runs on port 5000
```

### Frontend
```bash
cd zefender-admin-ui
npm install
npm run dev       # Vite dev server — runs on port 5173
```

Vite proxies `/api` and `/uploads` to `http://localhost:5000` so the frontend never needs to hardcode the backend URL.

---

## Environment Variables (`zefender-backend/.env`)

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=zefender
DB_USER=postgres
DB_PASSWORD=postgres123

JWT_SECRET=your_super_secret_key_here
DEVICE_SECRET=zefender_device_secret_123

# Cloudflare R2 (not active yet — using local storage)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY=your_access_key
R2_SECRET_KEY=your_secret_key
R2_BUCKET_NAME=zefender-media
```

Frontend `.env`:
```env
VITE_DEVICE_SECRET=zefender_device_secret_123
```

---

## Database Models

### Ad
Stored in PostgreSQL via Sequelize.

| Column    | Type    | Notes                                      |
|-----------|---------|--------------------------------------------|
| id        | UUID    | Primary key, auto-generated                |
| title     | STRING  | Display name of the ad                     |
| file_url  | STRING  | Path like `/uploads/uuid.jpg`              |
| active    | BOOLEAN | Default true. Admin can deactivate without deleting |

### Playlist
One playlist per device. Version increments on every update so the Pi knows when to sync.

| Column    | Type    | Notes                          |
|-----------|---------|--------------------------------|
| id        | UUID    | Primary key                    |
| device_id | STRING  | Which vending machine this is for |
| version   | INTEGER | Starts at 1, increments on update |

### PlaylistItem
Junction table linking a Playlist to its Ads with ordering and priority.

| Column      | Type    | Notes                                              |
|-------------|---------|----------------------------------------------------|
| id          | UUID    | Primary key                                        |
| playlist_id | UUID    | FK → Playlist                                      |
| ad_id       | UUID    | FK → Ad                                            |
| order_index | INTEGER | Position in normal loop (1, 2, 3...)               |
| priority    | INTEGER | 0 = normal. 1,2,3... = plays after payment in that order |

**Associations:**
- `Playlist.hasMany(PlaylistItem)` with `onDelete: CASCADE`
- `PlaylistItem.belongsTo(Playlist)`
- `PlaylistItem.belongsTo(Ad)`
- `Ad.hasMany(PlaylistItem)`

---

## Backend API Reference

All routes are prefixed with `/api`.

### Auth — `/api/auth`

#### `POST /api/auth/login`
Public. No token required.

Request:
```json
{ "username": "admin", "password": "admin123" }
```
Response:
```json
{ "token": "<jwt>", "message": "Login successful" }
```
Note: Auth is currently disabled (middleware is a passthrough). This endpoint still exists for when auth is re-enabled.

---

### Ads — `/api/ads`

All routes pass through `verifyToken` (currently passthrough).

#### `POST /api/ads`
Upload a new ad. Uses `multer` to handle `multipart/form-data`.

Form fields:
- `title` (string, required)
- `file` (video or image file, required)

The file is saved to `/uploads/` locally and `file_url` is stored as `/uploads/uuid.ext`.

Response:
```json
{ "message": "Ad uploaded successfully", "ad": { ...adObject } }
```

#### `GET /api/ads`
Returns all ads.
```json
[{ "id": "...", "title": "...", "file_url": "/uploads/...", "active": true }]
```

#### `DELETE /api/ads/:id`
Deletes the ad from DB and removes the file from `/uploads/`.

#### `PATCH /api/ads/:id/toggle`
Flips `active` between true/false.

---

### Playlists — `/api/playlists`

#### `POST /api/playlists`
Create or update a playlist for a device. If a playlist already exists for that `device_id`, it deletes all old items and replaces them. Version increments.

Request:
```json
{
  "device_id": "vm-delhi-001",
  "ads": [
    { "ad_id": "uuid", "order_index": 1, "priority": 0 },
    { "ad_id": "uuid", "order_index": 2, "priority": 0 }
  ]
}
```

#### `GET /api/playlists/preview/:device_id`
Admin route — no device token needed. Returns full playlist with ad details.

**Important:** This route must be registered BEFORE `/:device_id` in Express, otherwise Express matches "preview" as a device_id and hits the wrong middleware.

Response:
```json
{
  "version": 3,
  "device_id": "vm-delhi-001",
  "ads": [
    {
      "id": "uuid",
      "title": "Coke Ad",
      "file_url": "/uploads/uuid.mp4",
      "order_index": 1,
      "priority": 0,
      "active": true
    }
  ]
}
```

#### `GET /api/playlists/:device_id`
Pi device route. Requires `x-device-token` header matching `DEVICE_SECRET`. Same response shape as above.

#### `PUT /api/playlists/priority`
Set priority order for post-transaction ads.

Request:
```json
{
  "device_id": "vm-delhi-001",
  "priority_ads": [
    { "ad_id": "uuid", "priority": 1 },
    { "ad_id": "uuid", "priority": 2 }
  ]
}
```
Updates `priority` on the matching `PlaylistItem` rows. Increments playlist version.

#### `DELETE /api/playlists/priority`
Resets all `priority` values to 0 for a device's playlist. Increments version.

Request body: `{ "device_id": "vm-delhi-001" }`

---

### Events — `/api/events`

#### `POST /api/events`
Called by the Pi or payment server after a successful transaction. Requires `x-device-token` header.

#### `POST /api/events/admin`
Same logic, but authenticated with admin JWT. Used by the admin UI to simulate a payment.

Request: `{ "device_id": "vm-delhi-001" }`

Response:
```json
{
  "message": "Event triggered successfully",
  "priority_ads": [
    { "id": "uuid", "title": "Whey Ad", "file_url": "/uploads/...", "priority": 1 },
    { "id": "uuid", "title": "Coke Ad", "file_url": "/uploads/...", "priority": 2 }
  ]
}
```

Returns 404 if no priority ads are configured for that device.

---

### Devices — `/api/devices`

#### `POST /api/devices/register`
No auth. Called by Pi on boot to register itself.

Request: `{ "id": "vm-delhi-001", "name": "Delhi Mall #1", "port": 8080 }`

Saves to `devices.json`. Captures IP from request automatically.

#### `GET /api/devices`
Returns all known devices. Merges two sources:
1. `devices.json` — devices registered by Pi
2. PostgreSQL `Playlists` table — any `device_id` that has a playlist

This means even if a device was never registered via Pi (e.g. you created a playlist for it manually), it still shows up in the list.

Response:
```json
[
  { "id": "vm-delhi-001", "name": "Delhi Mall #1", "ip": "192.168.1.5", "port": 8080, "last_seen": 1234567890 },
  { "id": "machine-bangalore-001", "name": "machine-bangalore-001", "ip": null, "port": null, "last_seen": null }
]
```

---

## Middleware

### `auth.middleware.js` — `verifyToken`
Currently a passthrough (`next()` immediately). Auth strategy is pending founder discussion. All routes that use `verifyToken` will be protected once this is re-enabled.

### `device.middleware.js` — `verifyDeviceToken`
Checks `x-device-token` header against `process.env.DEVICE_SECRET`. Used on Pi-facing routes (`GET /api/playlists/:device_id` and `POST /api/events`).

---

## File Storage (`config/r2.js`)

Currently using local disk storage as a placeholder for Cloudflare R2.

- `uploadToR2(file)` — saves file to `/uploads/uuid.ext`, returns `/uploads/uuid.ext`
- `deleteFromR2(key)` — deletes the file from `/uploads/`
- `getSignedUrl(key)` — returns the key as-is (it's already a valid URL path)

When switching to real R2, only this file needs to change. The rest of the system uses `file_url` as an opaque string.

**Migration note:** Old ads uploaded before this fix had `file_url = "ads/uuid.ext"` (wrong format). A migration script `migrate-file-urls.js` was run to fix all existing records to `/uploads/uuid.ext`.

---

## Frontend — `api.js`

Single file that exports all API calls. Auth headers removed temporarily.

```js
export const api = (_token) => ({
  // Ads
  getAds()                    // GET /api/ads
  uploadAd(formData)          // POST /api/ads  (multipart)
  deleteAd(id)                // DELETE /api/ads/:id
  toggleAd(id)                // PATCH /api/ads/:id/toggle

  // Playlists
  createPlaylist(data)        // POST /api/playlists
  getPlaylist(deviceId)       // GET /api/playlists/preview/:deviceId
  setPriority(data)           // PUT /api/playlists/priority
  clearPriority(data)         // DELETE /api/playlists/priority

  // Devices
  getDevices()                // GET /api/devices
  registerDevice(data)        // POST /api/devices/register

  // Events
  triggerEvent(deviceId)      // POST /api/events/admin
})
```

---

## Frontend Pages

### `App.jsx`
Renders `<Dashboard />` directly. No login wall. Auth is pending.

### `Dashboard.jsx`
Shell component. Fixed sidebar with 4 nav items: ADS, PLAYLISTS, EVENTS, MONITOR. Topbar with theme toggle (dark/light). Renders the active page in the content area.

### `Ads.jsx`
- Upload form: title + file input → `POST /api/ads`
- Grid of all ads showing title, file_url, active status
- Toggle button → `PATCH /api/ads/:id/toggle`
- Delete button → `DELETE /api/ads/:id`

### `Playlists.jsx`
- Custom dropdown to select device (loads from `GET /api/devices`)
- Dropdown has "＋ Add New Device" at the bottom which expands an inline form → `POST /api/devices/register`
- Auto-fetches playlist when device changes
- Checkbox grid to select ads for the playlist → `POST /api/playlists`
- Second checkbox grid to select priority ads (first clicked = priority 1) → `PUT /api/playlists/priority`
- Clear all priorities button → `DELETE /api/playlists/priority`

### `Events.jsx`
- Device dropdown (loads from `GET /api/devices`)
- Trigger button → `POST /api/events/admin`
- Shows returned priority ads in order

### `Monitor.jsx`
The most complex page. Three-column top row + full-width player below.

**Column 1 — Devices:**
- Lists all devices from `GET /api/devices`
- Click a device to select it
- "+ NEW DEVICE" button expands inline form → `POST /api/devices/register`

**Column 2 — Ad Status Board:**
- Shows ads from the selected device's playlist (not all ads globally)
- Each row: title, file type, active/inactive status

**Column 3 — Priority Ads + Simulate:**
- Shows priority ads for the selected device
- "⚡ SIMULATE PAYMENT" button

**Player (full width below):**
- Auto-loads when device is selected (no manual sync needed)
- Loops through playlist ads. Images advance every 6 seconds. Videos advance on `onEnded`.
- `▶ PLAYLIST` badge in corner during normal playback
- On simulate payment: 1.5s payment success flash overlay inside the player, then switches to priority queue with `⚡ PRIORITY MODE` badge and amber glow border
- After all priority ads finish → automatically returns to playlist loop
- Strip of ad titles below player, clickable to jump

**Key bug fix — `playerKey`:**
React uses the `key` prop to decide whether to remount a component. If the last priority ad and the first playlist ad have the same `file_url`, React won't remount the `<video>` element and it won't replay. Fix: a `playerKey` integer that increments every time we switch modes or loop back. The media element key is `${playerKey}-${adUrl}`, guaranteeing a fresh mount.

---

## Data Flow — Normal Playback

```
Admin uploads ad → stored in /uploads/, file_url saved in DB
Admin creates playlist for device → PlaylistItems created in DB
Pi (or Monitor page) fetches GET /api/playlists/preview/:device_id
→ Returns ads array with order_index, active, priority
→ Filter active:true → set as queue → start playing
```

## Data Flow — Payment Event

```
Customer pays at vending machine
→ Payment server calls POST /api/events with device_id + x-device-token
→ Backend finds playlist for device
→ Queries PlaylistItems where priority > 0 AND Ad.active = true
→ Returns sorted priority_ads array
→ Pi plays them in order 1,2,3 then resumes normal loop

In admin UI (simulation):
→ POST /api/events/admin with device_id
→ Same response
→ Monitor shows payment flash, switches player to priority queue
→ After last priority ad, returns to playlist
```

## Data Flow — Version Sync (for Pi)

```
Pi stores its current playlist version locally
Pi calls GET /api/playlists/:device_id with x-device-token
If response.version > local version → download new playlist and update local
If same version → keep playing current playlist
```

---

## Known TODOs / Pending

| Item | Status |
|------|--------|
| Auth (JWT login/signup) | Disabled — pending founder discussion |
| Cloudflare R2 storage | Using local `/uploads/` — swap `config/r2.js` when ready |
| Device token strategy | Using single shared `DEVICE_SECRET` — confirm with founders |
| Pi sync logic | Backend ready, Pi-side implementation separate |
| Pagination on `GET /api/ads` | Not implemented — fine for MVP |

---

## Vite Proxy Config

```js
// zefender-admin-ui/vite.config.js
server: {
  proxy: {
    '/api':     { target: 'http://localhost:5000', changeOrigin: true },
    '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
  }
}
```

This means in development, all `/api/...` and `/uploads/...` requests from the React app are forwarded to the Express server. No CORS issues, no hardcoded URLs.

---

## One-Time Migration

If you have old ads with `file_url = "ads/uuid.ext"` (uploaded before the storage fix), run:

```bash
cd zefender-backend
node migrate-file-urls.js
```

This updates all existing records to `/uploads/uuid.ext` format.
