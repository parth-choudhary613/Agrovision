// backend/utils/kindwise.js
const axios = require('axios');
const FormData = require('form-data');

const KINDWISE_API_KEY = process.env.KINDWISE_API_KEY;

if (!KINDWISE_API_KEY) {
  console.error("❌ KINDWISE_API_KEY missing in .env");
}

const analyzeWithKindwise = async (imageBuffer) => {
  const form = new FormData();

  // BUG FIX #7: Pass image with explicit filename + contentType object
  // Old: form.append('images', imageBuffer, 'plant.jpg')  ← unreliable MIME detection
  form.append('images', imageBuffer, { filename: 'plant.jpg', contentType: 'image/jpeg' });

  // BUG FIX #1: Add the 'details' parameter — this was MISSING entirely.
  // Without it, the API never returns treatment/biological/chemical/prevention data,
  // so the code always fell through to the hardcoded keyword fallback ("Mancozeb 75% WP").
  form.append('details', 'common_names,description,treatment,classification,url');
  form.append('language', 'en');

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

  // ── Crop name ─────────────────────────────────────────────────────────────
  const cropSug = result?.crop?.suggestions || [];
  const topCrop = cropSug[0];

  // BUG FIX #5: Use common_names from details first (now available since we request details).
  // Old code only used topCrop?.name?.split('(')[0] which gave scientific names like
  // "Solanum lycopersicum" instead of "Tomato".
  const cropCommonNames = topCrop?.details?.common_names || [];
  let cropName = cropCommonNames[0]
    || topCrop?.name?.split('(')?.[0]?.trim()
    || "Unknown Crop";

  // ── Disease ───────────────────────────────────────────────────────────────
  const diseaseSug = result?.disease?.suggestions?.[0];
  const diseaseDetails = diseaseSug?.details;
  const diseaseProbability = diseaseSug?.probability ?? 0;
  const rawDiseaseName = diseaseSug?.name || null;

  // BUG FIX #6: Safe crop-prefix stripping — only apply cleaned name if non-empty.
  // Old code could produce diseaseName = "" when disease name matched crop exactly,
  // causing downstream logic inconsistencies.
  let diseaseName = rawDiseaseName;
  if (diseaseName && cropName !== "Unknown Crop") {
    const cleaned = diseaseName
      .replace(new RegExp(`^${cropName}\\s*`, 'i'), '')
      .trim();
    if (cleaned.length > 0) diseaseName = cleaned;
  }

  // ── Health determination ───────────────────────────────────────────────────
  // BUG FIX #2: Use the API's own is_healthy.binary as the primary source of truth.
  // Old code used a hardcoded threshold (confidence < 0.12) which was far too low and
  // caused healthy plants (e.g. 40% disease probability) to be reported as diseased,
  // and legitimately sick ones near the threshold to be flipped to healthy.
  const isHealthyBinary    = result?.is_healthy?.binary;       // true = healthy, false = diseased
  const isHealthyProb      = result?.is_healthy?.probability ?? 0;

  const isHealthy = isHealthyBinary !== undefined
    ? isHealthyBinary
    : (diseaseProbability < 0.5 || !diseaseName || diseaseName.toLowerCase().includes('healthy'));

  // Confidence: when healthy → report how confident the plant is healthy;
  // when diseased → report how confident the disease call is.
  const rawConfidence = isHealthy
    ? (isHealthyProb > 0 ? isHealthyProb : (1 - diseaseProbability))
    : diseaseProbability;
  const confidence = Math.round(rawConfidence * 100);

  // ── Treatment (from API details — the real fix for repeated "Mancozeb") ──
  let pesticide          = null;
  let biologicalTreatment = null;
  let prevention         = null;
  let dosage             = null;
  let sprayInterval      = null;
  let recommendation     = "Consult local agricultural expert";

  if (!isHealthy && diseaseName) {
    const treatment  = diseaseDetails?.treatment || {};
    const chemList   = Array.isArray(treatment.chemical)   ? treatment.chemical   : [];
    const bioList    = Array.isArray(treatment.biological) ? treatment.biological : [];
    const prevList   = Array.isArray(treatment.prevention) ? treatment.prevention : [];

    // PRIMARY: Use what the API actually returns for this specific disease
    if (chemList.length > 0)  pesticide           = chemList[0];
    if (bioList.length > 0)   biologicalTreatment = bioList[0];
    if (prevList.length > 0)  prevention          = prevList[0];

    // FALLBACK: keyword-based logic — only runs when API gives no chemical data.
    // Now also more precise: distinguishes downy vs powdery mildew, adds more diseases.
    if (!pesticide) {
      const d = diseaseName.toLowerCase();
      if (d.includes('downy mildew') || d.includes('peronospora')) {
        pesticide     = "Metalaxyl-M 4% + Mancozeb 40% WP";
        dosage        = "2.5 g/L";
        sprayInterval = "10 days";
      } else if (d.includes('powdery mildew') || (d.includes('mildew') && !d.includes('downy'))) {
        pesticide     = "Sulphur 80% WP";
        dosage        = "3 g/L";
        sprayInterval = "7 days";
      } else if (d.includes('blight')) {
        pesticide     = "Mancozeb 75% WP";
        dosage        = "2.5 g/L";
        sprayInterval = "7 days";
      } else if (d.includes('anthracnose') || d.includes('cercospora') || d.includes('leaf spot')) {
        pesticide     = "Chlorothalonil 75% WP";
        dosage        = "2 g/L";
        sprayInterval = "10 days";
      } else if (d.includes('alternaria') || d.includes('scab')) {
        pesticide     = "Mancozeb 75% WP";
        dosage        = "2.5 g/L";
        sprayInterval = "10 days";
      } else if (d.includes('fusarium') || d.includes('wilt')) {
        pesticide     = "Thiophanate-methyl 70% WP";
        dosage        = "2 g/L";
        sprayInterval = "14 days";
      } else if (d.includes('rot') || d.includes('damping')) {
        pesticide     = "Carbendazim 50% WP";
        dosage        = "1 g/L";
        sprayInterval = "10 days";
      } else if (d.includes('rust')) {
        pesticide     = "Propiconazole 25% EC";
        dosage        = "1 ml/L";
        sprayInterval = "14 days";
      } else if (d.includes('bacterial') || d.includes('canker') || d.includes('fire blight')) {
        pesticide     = "Copper Oxychloride 50% WP";
        dosage        = "3 g/L";
        sprayInterval = "7 days";
      } else if (d.includes('mosaic') || d.includes('virus') || d.includes('yellow leaf curl')) {
        pesticide     = "Imidacloprid 17.8% SL (vector control)";
        dosage        = "0.5 ml/L";
        sprayInterval = "14 days";
      }
    }

    // Build recommendation string
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
    confidence,          // integer 0–100
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
