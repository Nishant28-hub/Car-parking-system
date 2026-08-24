// script.js

// ---------- Load Dashboard Status ----------
async function loadStatus() {
  const res = await fetch('/api/status');
  const data = await res.json();
  document.getElementById('totalSlots').textContent = data.total;
  document.getElementById('availableSlots').textContent = data.available;
  document.getElementById('occupiedSlots').textContent = data.occupied;
}

// ---------- Load Vehicle List ----------
async function loadVehicles() {
  const res = await fetch('/api/vehicles');
  const vehicles = await res.json();
  const tbody = document.getElementById('vehicleTableBody');
  tbody.innerHTML = '';

  vehicles.forEach(v => {
    const row = document.createElement('tr');
    const entryTime = new Date(v.entry_time).toLocaleString();
    row.innerHTML = `
      <td>${v.slot}</td>
      <td>${v.owner}</td>
      <td>${v.number}</td>
      <td>${v.type}</td>
      <td>${entryTime}</td>
    `;
    tbody.appendChild(row);
  });
}

// ---------- Refresh Everything ----------
function refreshAll() {
  loadStatus();
  loadVehicles();
}

// ---------- Vehicle Entry ----------
document.getElementById('entryForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const owner = document.getElementById('ownerName').value.trim();
  const number = document.getElementById('vehicleNumber').value.trim();
  const type = document.getElementById('vehicleType').value;
  const msgEl = document.getElementById('entryMessage');

  const res = await fetch('/api/entry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, number, type })
  });
  const data = await res.json();

  if (res.ok) {
    msgEl.textContent = `Parked in slot ${data.slot}`;
    msgEl.className = 'message success';
    e.target.reset();
    refreshAll();
  } else {
    msgEl.textContent = data.error;
    msgEl.className = 'message error';
  }
});

// ---------- Vehicle Exit ----------
document.getElementById('exitForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const number = document.getElementById('exitVehicleNumber').value.trim();
  const msgEl = document.getElementById('exitMessage');

  const res = await fetch('/api/exit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ number })
  });
  const data = await res.json();

  if (res.ok) {
    msgEl.textContent = `Slot ${data.freedSlot} freed`;
    msgEl.className = 'message success';
    e.target.reset();
    refreshAll();
  } else {
    msgEl.textContent = data.error;
    msgEl.className = 'message error';
  }
});

// ---------- Initial Load ----------
refreshAll();
