// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
const TOTAL_SLOTS = 20;

app.use(express.json());
app.use(express.static(__dirname)); // serve index.html, style.css, script.js

// ---------- Database Setup ----------
const db = new sqlite3.Database('./parking.db');

db.serialize(() => {
  // Create slots table
  db.run(`
    CREATE TABLE IF NOT EXISTS slots (
      id INTEGER PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'available'
    )
  `);

  // Create vehicles table
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner TEXT NOT NULL,
      number TEXT NOT NULL,
      type TEXT NOT NULL,
      slot INTEGER NOT NULL,
      entry_time TEXT NOT NULL
    )
  `);

  // Seed 20 slots only if table is empty
  db.get('SELECT COUNT(*) AS count FROM slots', (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO slots (id, status) VALUES (?, ?)');
      for (let i = 1; i <= TOTAL_SLOTS; i++) {
        stmt.run(i, 'available');
      }
      stmt.finalize();
      console.log(`Seeded ${TOTAL_SLOTS} parking slots.`);
    }
  });
});

// ---------- API Routes ----------

// GET /api/status -> dashboard counts
app.get('/api/status', (req, res) => {
  db.get(
    `SELECT
       (SELECT COUNT(*) FROM slots) AS total,
       (SELECT COUNT(*) FROM slots WHERE status = 'available') AS available,
       (SELECT COUNT(*) FROM slots WHERE status = 'occupied') AS occupied
     `,
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
});

// GET /api/vehicles -> list all parked vehicles
app.get('/api/vehicles', (req, res) => {
  db.all('SELECT * FROM vehicles ORDER BY slot ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /api/entry -> add a vehicle, assign first available slot
app.post('/api/entry', (req, res) => {
  const { owner, number, type } = req.body;

  if (!owner || !number || !type) {
    return res.status(400).json({ error: 'owner, number, and type are required' });
  }

  db.get(
    "SELECT id FROM slots WHERE status = 'available' ORDER BY id ASC LIMIT 1",
    (err, slotRow) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!slotRow) return res.status(400).json({ error: 'No available slots' });

      const slotId = slotRow.id;
      const entryTime = new Date().toISOString();

      db.run(
        'INSERT INTO vehicles (owner, number, type, slot, entry_time) VALUES (?, ?, ?, ?, ?)',
        [owner, number, type, slotId, entryTime],
        function (insertErr) {
          if (insertErr) return res.status(500).json({ error: insertErr.message });

          db.run(
            "UPDATE slots SET status = 'occupied' WHERE id = ?",
            [slotId],
            (updateErr) => {
              if (updateErr) return res.status(500).json({ error: updateErr.message });
              res.json({
                message: 'Vehicle parked successfully',
                slot: slotId,
                owner,
                number,
                type,
                entry_time: entryTime
              });
            }
          );
        }
      );
    }
  );
});

// POST /api/exit -> remove a vehicle by number, free its slot
app.post('/api/exit', (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ error: 'Vehicle number is required' });
  }

  db.get('SELECT * FROM vehicles WHERE number = ?', [number], (err, vehicle) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    db.run('DELETE FROM vehicles WHERE id = ?', [vehicle.id], (delErr) => {
      if (delErr) return res.status(500).json({ error: delErr.message });

      db.run(
        "UPDATE slots SET status = 'available' WHERE id = ?",
        [vehicle.slot],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: updateErr.message });
          res.json({ message: 'Vehicle exited successfully', freedSlot: vehicle.slot });
        }
      );
    });
  });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`Parking system running at http://localhost:${PORT}`);
});
