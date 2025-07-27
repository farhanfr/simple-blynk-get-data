import axios from "axios";

const BLYNK_TOKEN = '...';
const SHEET_WEBHOOK = '...';

const dataMap = { /* your data map */ };

function formatTimestamp(date) {
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function fetchBlynkValues() {
  const result = {
    timestamp: formatTimestamp(new Date())
  };

  for (const [label, vPin] of Object.entries(dataMap)) {
    const url = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}&${vPin}`;
    try {
      const res = await axios.get(url);
      result[label] = res.data;
    } catch (err) {
      result[label] = "";
    }
  }

  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const data = await fetchBlynkValues();
    await axios.post(SHEET_WEBHOOK, data);
    res.status(200).json({ message: '✅ Data sent successfully', data });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: '❌ Failed to send data', error: error.message });
  }
}
