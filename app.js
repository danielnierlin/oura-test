const HEART_RATE_ENDPOINT = "https://api.ouraring.com/v2/usercollection/heartrate";
const DAILY_SLEEP_ENDPOINT = "https://api.ouraring.com/v2/usercollection/daily_sleep";

const form = document.getElementById("controls");
const statusEl = document.getElementById("status");
const demoBtn = document.getElementById("loadDemo");

const heartRateCtx = document.getElementById("heartRateChart");
const hrvCtx = document.getElementById("hrvChart");

const now = new Date();
const weekAgo = new Date();
weekAgo.setDate(now.getDate() - 7);

document.getElementById("endDate").value = now.toISOString().slice(0, 10);
document.getElementById("startDate").value = weekAgo.toISOString().slice(0, 10);

let heartRateChart;
let hrvChart;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff9b9b" : "#b8efc9";
}

function buildUrl(baseUrl, startDate, endDate) {
  const url = new URL(baseUrl);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  return url;
}

async function fetchOuraData(token, startDate, endDate) {
  const headers = { Authorization: `Bearer ${token}` };

  const [heartRateResponse, sleepResponse] = await Promise.all([
    fetch(buildUrl(HEART_RATE_ENDPOINT, startDate, endDate), { headers }),
    fetch(buildUrl(DAILY_SLEEP_ENDPOINT, startDate, endDate), { headers })
  ]);

  if (!heartRateResponse.ok || !sleepResponse.ok) {
    throw new Error(
      `Fehler beim API-Aufruf (HeartRate ${heartRateResponse.status}, Sleep ${sleepResponse.status})`
    );
  }

  const heartRateData = await heartRateResponse.json();
  const sleepData = await sleepResponse.json();

  return {
    heartRate: heartRateData.data || [],
    hrvDaily: (sleepData.data || []).map((day) => ({
      date: day.day,
      hrv: day.average_hrv
    }))
  };
}

function renderCharts({ heartRate, hrvDaily }) {
  const heartLabels = heartRate.map((point) => new Date(point.timestamp).toLocaleString("de-DE"));
  const heartValues = heartRate.map((point) => point.bpm);

  const hrvLabels = hrvDaily.map((point) => point.date);
  const hrvValues = hrvDaily.map((point) => point.hrv);

  if (heartRateChart) heartRateChart.destroy();
  if (hrvChart) hrvChart.destroy();

  heartRateChart = new Chart(heartRateCtx, {
    type: "line",
    data: {
      labels: heartLabels,
      datasets: [
        {
          label: "Herzfrequenz (BPM)",
          data: heartValues,
          borderColor: "#5eead4",
          backgroundColor: "rgba(94, 234, 212, 0.2)",
          tension: 0.25,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { maxTicksLimit: 8 } }
      }
    }
  });

  hrvChart = new Chart(hrvCtx, {
    type: "bar",
    data: {
      labels: hrvLabels,
      datasets: [
        {
          label: "HRV (ms)",
          data: hrvValues,
          backgroundColor: "rgba(129, 140, 248, 0.6)",
          borderColor: "#818cf8",
          borderWidth: 1
        }
      ]
    }
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = document.getElementById("token").value.trim();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!token) {
    setStatus("Bitte gib einen Personal Access Token ein.", true);
    return;
  }

  try {
    setStatus("Lade Daten aus der Oura API...");
    const data = await fetchOuraData(token, startDate, endDate);
    renderCharts(data);
    setStatus(`Daten erfolgreich geladen: ${data.heartRate.length} HR Punkte, ${data.hrvDaily.length} HRV Tage.`);
  } catch (error) {
    setStatus(error.message, true);
  }
});

demoBtn.addEventListener("click", () => {
  const demoData = {
    heartRate: [
      { timestamp: "2026-01-01T06:00:00+01:00", bpm: 52 },
      { timestamp: "2026-01-01T08:00:00+01:00", bpm: 64 },
      { timestamp: "2026-01-01T10:00:00+01:00", bpm: 72 },
      { timestamp: "2026-01-01T12:00:00+01:00", bpm: 78 },
      { timestamp: "2026-01-01T14:00:00+01:00", bpm: 75 },
      { timestamp: "2026-01-01T16:00:00+01:00", bpm: 70 }
    ],
    hrvDaily: [
      { date: "2025-12-26", hrv: 32 },
      { date: "2025-12-27", hrv: 29 },
      { date: "2025-12-28", hrv: 35 },
      { date: "2025-12-29", hrv: 38 },
      { date: "2025-12-30", hrv: 34 },
      { date: "2025-12-31", hrv: 41 },
      { date: "2026-01-01", hrv: 36 }
    ]
  };

  renderCharts(demoData);
  setStatus("Demo-Daten geladen.");
});
