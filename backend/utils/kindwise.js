// backend/utils/kindwise.js
const axios = require('axios');
// FormData is no longer needed — switching to JSON + base64

const KINDWISE_API_KEY = process.env.KINDWISE_API_KEY;

if (!KINDWISE_API_KEY) {
  console.error("❌ KINDWISE_API_KEY missing in .env");
}

const analyzeWithKindwise = async (imageBuffer) => {
  // ROOT CAUSE FIX: The crop.kindwise.com API only accepts `similar_images`
  // as a modifier in multipart/form-data requests. Sending `details` or `language`
  // via form.append() causes a 400 "Unknown modifier" error.
  //
  // The `details` parameter (which unlocks treatment, biological, chemical,
  // prevention) is ONLY accepted when the body is JSON with base64-encoded images.
  const base64Image = imageBuffer.toString('base64');

  const response = await axios.post(
    'https://crop.kindwise.com/api/v1/identification',
    {
      images: [`data:image/jpeg;base64,${base64Image}`],
      details: "common_names,description,treatment,classification,url",
      similar_images: false
    },
    {
      headers: {
        'Api-Key':      KINDWISE_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  const result = response.data?.result;

  // ── Crop name ──────────────────────────────────────────────────────────────
  const cropSug         = result?.crop?.suggestions || [];
  const topCrop         = cropSug[0];
  const cropCommonNames = topCrop?.details?.common_names || [];
  // Prefer human-readable common name (e.g. "Tomato") over scientific name
  let cropName = cropCommonNames[0]
    || topCrop?.name?.split('(')?.[0]?.trim()
    || "Unknown Crop";

  // ── Disease ────────────────────────────────────────────────────────────────
  const diseaseSug      = result?.disease?.suggestions?.[0];
  const diseaseDetails  = diseaseSug?.details;
  const diseaseProbability = diseaseSug?.probability ?? 0;
  const rawDiseaseName  = diseaseSug?.name || null;

  // Strip crop prefix from disease name only when it leaves a non-empty string
  let diseaseName = rawDiseaseName;
  if (diseaseName && cropName !== "Unknown Crop") {
    const cleaned = diseaseName
      .replace(new RegExp(`^${cropName}\\s*`, 'i'), '')
      .trim();
    if (cleaned.length > 0) diseaseName = cleaned;
  }

  // ── Health determination ───────────────────────────────────────────────────
  // Use the API's own is_healthy.binary as primary truth instead of a hardcoded threshold
  const isHealthyBinary = result?.is_healthy?.binary;
  const isHealthyProb   = result?.is_healthy?.probability ?? 0;

  const isHealthy = isHealthyBinary !== undefined
    ? isHealthyBinary
    : (diseaseProbability < 0.5 || !diseaseName || diseaseName.toLowerCase().includes('healthy'));

  const rawConfidence = isHealthy
    ? (isHealthyProb > 0 ? isHealthyProb : (1 - diseaseProbability))
    : diseaseProbability;
  const confidence = Math.round(rawConfidence * 100); // integer 0–100

  // ── Treatment (from API details — now actually returned) ──────────────────
  let pesticide           = null;
  let biologicalTreatment = null;
  let prevention          = null;
  let dosage              = null;
  let sprayInterval       = null;
  let recommendation      = "Consult local agricultural expert";

  if (!isHealthy && diseaseName) {
    const treatment = diseaseDetails?.treatment || {};
    const chemList  = Array.isArray(treatment.chemical)   ? treatment.chemical   : [];
    const bioList   = Array.isArray(treatment.biological) ? treatment.biological : [];
    const prevList  = Array.isArray(treatment.prevention) ? treatment.prevention : [];

    // PRIMARY: use what the API returned for this specific disease
    if (chemList.length > 0)  pesticide           = chemList[0];
    if (bioList.length > 0)   biologicalTreatment = bioList[0];
    if (prevList.length > 0)  prevention          = prevList[0];

    // FALLBACK: keyword lookup only when API returned no chemical data
    if (!pesticide) {
      const d = diseaseName.toLowerCase();
      if (d.includes('downy mildew') || d.includes('peronospora')) {
        pesticide = "Metalaxyl-M 4% + Mancozeb 40% WP"; dosage = "2.5 g/L"; sprayInterval = "10 days";
      } else if (d.includes('powdery mildew') || (d.includes('mildew') && !d.includes('downy'))) {
        pesticide = "Sulphur 80% WP"; dosage = "3 g/L"; sprayInterval = "7 days";
      } else if (d.includes('blight')) {
        pesticide = "Mancozeb 75% WP"; dosage = "2.5 g/L"; sprayInterval = "7 days";
      } else if (d.includes('anthracnose') || d.includes('cercospora') || d.includes('leaf spot')) {
        pesticide = "Chlorothalonil 75% WP"; dosage = "2 g/L"; sprayInterval = "10 days";
      } else if (d.includes('alternaria') || d.includes('scab')) {
        pesticide = "Mancozeb 75% WP"; dosage = "2.5 g/L"; sprayInterval = "10 days";
      } else if (d.includes('fusarium') || d.includes('wilt')) {
        pesticide = "Thiophanate-methyl 70% WP"; dosage = "2 g/L"; sprayInterval = "14 days";
      } else if (d.includes('rot') || d.includes('damping')) {
        pesticide = "Carbendazim 50% WP"; dosage = "1 g/L"; sprayInterval = "10 days";
      } else if (d.includes('rust')) {
        pesticide = "Propiconazole 25% EC"; dosage = "1 ml/L"; sprayInterval = "14 days";
      } else if (d.includes('bacterial') || d.includes('canker') || d.includes('fire blight')) {
        pesticide = "Copper Oxychloride 50% WP"; dosage = "3 g/L"; sprayInterval = "7 days";
      } else if (d.includes('mosaic') || d.includes('virus') || d.includes('yellow leaf curl')) {
        pesticide = "Imidacloprid 17.8% SL"; dosage = "0.5 ml/L"; sprayInterval = "14 days";
      }
    }

    if (pesticide) {
      recommendation = dosage
        ? `Chemical: ${pesticide} @ ${dosage}, every ${sprayInterval}`
        : `Chemical: ${pesticide}`;
      if (biologicalTreatment) {
        recommendation += ` | Bio: ${biologicalTreatment}`;
      }
    } else if (biologicalTreatment) {
      recommendation = `Bio: ${biologicalTreatment}`;
    } else {
      recommendation = "Consult local agricultural expert for proper diagnosis";
    }
  } else if (isHealthy) {
    recommendation = "Plant is healthy. Keep monitoring regularly.";
  }

  return {
    cropName,
    diseaseDetected:     isHealthy ? "Healthy" : (diseaseName || "Unknown Disease"),
    confidence,
    isHealthy,
    pesticide,
    dosage,
    sprayInterval,
    biologicalTreatment,
    prevention,
    recommendation,
    diseaseDescription:  diseaseDetails?.description || null,
  };
};

module.exports = { analyzeWithKindwise };
