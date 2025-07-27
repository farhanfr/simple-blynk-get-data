import axios from "axios";

const BLYNK_TOKEN = '0HxCTZ-kULtjM8-IW71oeOgaEaJmZJOF';
const SHEET_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyfoK2gdxwhg3Prw7gu8f8M08JO4O2ArYXxkFnoDJXrgtCaCZuSuyv0CBTiYfzEz7WU/exec';

const dataMap = {
  "FREQUEN": "V0",
  "V_RS": "V1",
  "V_ST": "V2",
  "V_TR": "V3",
  "I_R": "V4",
  "I_S": "V5",
  "I_T": "V6",
  "VAVE": "V7",
  "IAVE": "V8",
  "POWER FACTOR": "V9",
  "P_Watt": "V10",
  "Q_VAR": "V11",
  "S_VA": "V12",
  "HUBUNGAN GENERATOR": "V13",
  "CURRENT UNBALANCED": "V14",
  "ONload or OVERload": "V15",
  "IN": "V16",
  "VOLTAGE UNBALANCED": "V17",
  "REGULASI TEGANGAN": "V18",
  "SWITCH": "V25"
};

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
