// Backend-URL (anpassen, wenn du Netlify oder andere Dienste nutzt)
const API_URL = 'http://localhost:3005';

// Dropdowns für WG und Zimmer befüllen
async function populateDropdowns() {
  try {
    // WGs abrufen
    const wgsResponse = await fetch(`${API_URL}/wgs`);
    const wgs = await wgsResponse.json();
    const wgSelect = document.getElementById('wg');

    wgs.forEach(wg => {
      const option = document.createElement('option');
      option.value = wg.id;
      option.textContent = wg.address;
      wgSelect.appendChild(option);
    });

    // Wenn eine WG ausgewählt wird, Zimmer abrufen
    wgSelect.addEventListener('change', async () => {
      const roomSelect = document.getElementById('room');
      roomSelect.innerHTML = ''; // Vorherige Optionen entfernen

      const roomsResponse = await fetch(`${API_URL}/rooms?wg_id=${wgSelect.value}`);
      const rooms = await roomsResponse.json();

      rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.room_name;
        roomSelect.appendChild(option);
      });
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Dropdown-Daten:', error);
  }
}

// Registrierungsformular abschicken
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      alert('Registrierung erfolgreich! Bitte bestätige deine E-Mail.');
    } else {
      alert(`Fehler: ${result.error}`);
    }
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
  }
});

// Dropdowns beim Laden der Seite befüllen
document.addEventListener('DOMContentLoaded', populateDropdowns);
