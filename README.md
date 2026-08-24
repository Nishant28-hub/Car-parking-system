# Car Parking Management System

A simple full-stack car parking management prototype built with Node.js, Express, SQLite, and vanilla HTML/CSS/JS.

## Features

- **Dashboard**: Total, available, and occupied slot counts.
- **Vehicle Entry**: Enter owner name, vehicle number, and type — automatically assigned to the first free slot.
- **Vehicle Exit**: Enter a vehicle number to remove it and free its slot.
- **Vehicle List**: Live table of all currently parked vehicles.

## Tech Stack

- Node.js + Express.js (backend/API)
- SQLite (`sqlite3` package) for storage
- Plain HTML, CSS, and vanilla JavaScript for the frontend (no frameworks)

## Project Structure

```
parking-system/
├── server.js       # Express server + API routes + SQLite setup
├── package.json
├── parking.db       # created automatically on first run
├── index.html        # frontend markup
├── style.css         # styling
├── script.js         # frontend logic (fetch calls, DOM updates)
└── README.md
```

## Setup & Run

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser at:
   ```
   http://localhost:3000
   ```

The SQLite database file (`parking.db`) and its tables (`slots`, `vehicles`) are created automatically the first time the server runs, and 20 parking slots are seeded automatically.

## API Endpoints

| Method | Endpoint       | Description                              |
|--------|----------------|-------------------------------------------|
| GET    | `/api/status`  | Returns total/available/occupied counts   |
| GET    | `/api/vehicles`| Returns list of all parked vehicles       |
| POST   | `/api/entry`   | Body: `{ owner, number, type }` — parks a vehicle in the first available slot |
| POST   | `/api/exit`    | Body: `{ number }` — removes the vehicle and frees its slot |

## Notes

- No authentication/login — this is a simple prototype.
- Total slots fixed at 20 (change `TOTAL_SLOTS` in `server.js` to adjust).
- Database resets only if you delete `parking.db` (tables/slots are re-seeded on next start).
