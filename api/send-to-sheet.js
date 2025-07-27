const axios = require('axios');

const BLYNK_TOKEN = '0HxCTZ-kULtjM8-IW71oeOgaEaJmZJOF'; // Replace with your real token
const SHEET_WEBHOOK = 'https://script.google.com/macros/s/YOUR-SHEET-ID/exec'; // Replace with your real Google Apps Script webhook

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

async function fetchBlynkValues() {
  const result = {
    timestamp: new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false
    }).replace(',', '') // Format: 27/07/2025 22:07:00
  };

  for (const [label, vPin] of Object.entries(dataMap)) {
    const url = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}&${vPin}`;
    try {
      const res = await axios.get(url);
      result[label] = res.data;
    } catch {
      result[label] = "";
    }
  }

  return result;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' });
  }

  try {
    const data = await fetchBlynkValues();
    await axios.post(SHEET_WEBHOOK, data);
    return res.status(200).json({ success: true, sent: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
