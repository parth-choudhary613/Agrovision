// backend/utils/kindwise.js
const axios = require('axios');
const FormData = require('form-data');

const KINDWISE_API_KEY = process.env.KINDWISE_API_KEY;

if (!KINDWISE_API_KEY) {
  console.error("❌ KINDWISE_API_KEY missing in .env");
}

const analyzeWithKindwise = async (imageBuffer) => {
  const form = new FormData();
  form.append('images', imageBuffer, 'plant.jpg');

  const response = await axios.post(
    'https://crop.kindwise.com/api/v1/identification',
    form,
    {
      headers: {
        'Api-Key': KINDWISE_API_KEY,
        ...form.getHeaders()
      }
    }
  );

  const result = response.data?.result;
  const diseaseSug = result?.disease?.suggestions?.[0];
  const cropSug = result?.crop?.suggestions || [];

  let cropName = cropSug[0]?.name?.split('(')[0]?.trim() || "Unknown Crop";

  const rawDisease = diseaseSug?.name || null;
  let diseaseName = rawDisease 
    ? rawDisease.replace(new RegExp(`^${cropName}\\s*`, 'i'), '').trim() 
    : null;

  const confidence = diseaseSug?.probability ?? 0;
  const isHealthy = confidence < 0.12 || !diseaseName || 
                    diseaseName.toLowerCase().includes("healthy");

  // ✅ Only return pesticide if we have a real disease
  let pesticide = null;
  let dosage = null;
  let sprayInterval = null;
  let recommendation = "Consult local agricultural expert";

  if (!isHealthy && diseaseName) {
    const lowerDisease = diseaseName.toLowerCase();
    
    if (lowerDisease.includes("blight")) {
      pesticide = "Mancozeb 75% WP";
      dosage = "2.5 g/L";
      sprayInterval = "7 days";
    } else if (lowerDisease.includes("mildew") || lowerDisease.includes("powdery")) {
      pesticide = "Sulphur 80% WP";
      dosage = "3 g/L";
      sprayInterval = "7 days";
    } else if (lowerDisease.includes("spot")) {
      pesticide = "Mancozeb 75% WP";
      dosage = "2 g/L";
      sprayInterval = "10 days";
    } else if (lowerDisease.includes("rot") || lowerDisease.includes("wilt")) {
      pesticide = "Carbendazim 50% WP";
      dosage = "1 g/L";
      sprayInterval = "10 days";
    } else if (lowerDisease.includes("rust")) {
      pesticide = "Propiconazole 25% EC";
      dosage = "1 ml/L";
      sprayInterval = "14 days";
    }
  }

  if (pesticide) {
    recommendation = `${pesticide} - ${dosage}, every ${sprayInterval}`;
  } else if (!isHealthy) {
    recommendation = "Consult local agricultural expert for proper diagnosis";
  }

  return {
    cropName,
    diseaseDetected: isHealthy ? "Healthy" : diseaseName,
    confidence: Math.round(confidence * 100),
    isHealthy,
    pesticide,
    dosage,
    sprayInterval,
    recommendation
  };
};

module.exports = { analyzeWithKindwise };