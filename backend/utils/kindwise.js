const axios = require('axios');
const FormData = require('form-data');

const KINDWISE_API_KEY = process.env.KINDWISE_API_KEY;

// ── Pesticide lookup map ──────────────────────────────────────────────────────
// Kindwise returns disease names like "Tomato Early blight" — we map them to
// structured treatment data. Keys are lowercase for case-insensitive matching.
const DISEASE_TREATMENT_MAP = {
  // Tomato
  "early blight":              { pesticide: "Mancozeb 75% WP",       dosage: "2.5 g per litre of water",  interval: "Every 7 days" },
  "late blight":               { pesticide: "Metalaxyl 35% WS",      dosage: "2 g per litre of water",    interval: "Every 5 days" },
  "leaf curl":                 { pesticide: "Imidacloprid 17.8% SL", dosage: "0.5 ml per litre of water", interval: "Every 10 days" },
  "septoria leaf spot":        { pesticide: "Chlorothalonil 75% WP", dosage: "2 g per litre of water",    interval: "Every 7 days" },
  "mosaic virus":              { pesticide: "Thiamethoxam 25% WG",   dosage: "0.5 g per litre of water",  interval: "Every 14 days" },
  "powdery mildew":            { pesticide: "Sulphur 80% WP",        dosage: "3 g per litre of water",    interval: "Every 7 days" },
  "downy mildew":              { pesticide: "Cymoxanil 8% WP",       dosage: "2.5 g per litre of water",  interval: "Every 7 days" },
  "gray mold":                 { pesticide: "Iprodione 50% WP",      dosage: "2 g per litre of water",    interval: "Every 10 days" },
  "bacterial spot":            { pesticide: "Copper Oxychloride 50% WP", dosage: "3 g per litre of water", interval: "Every 7 days" },
  "fusarium wilt":             { pesticide: "Carbendazim 50% WP",    dosage: "1 g per litre of water",    interval: "Every 10 days" },
  // Potato
  "common scab":               { pesticide: "Thiram 75% WP",         dosage: "3 g per litre of water",    interval: "Every 10 days" },
  "black scurf":               { pesticide: "Pencycuron 25% WP",     dosage: "2 g per litre of water",    interval: "Every 14 days" },
  // Chilli / Pepper
  "anthracnose":               { pesticide: "Propiconazole 25% EC",  dosage: "1 ml per litre of water",   interval: "Every 10 days" },
  "fruit rot":                 { pesticide: "Carbendazim 50% WP",    dosage: "1.5 g per litre of water",  interval: "Every 7 days" },
  // Rice
  "blast":                     { pesticide: "Tricyclazole 75% WP",   dosage: "0.6 g per litre of water",  interval: "Every 10 days" },
  "brown spot":                { pesticide: "Mancozeb 75% WP",       dosage: "2.5 g per litre of water",  interval: "Every 10 days" },
  "sheath blight":             { pesticide: "Hexaconazole 5% EC",    dosage: "2 ml per litre of water",   interval: "Every 14 days" },
  // Wheat
  "rust":                      { pesticide: "Propiconazole 25% EC",  dosage: "1 ml per litre of water",   interval: "Every 14 days" },
  "loose smut":                { pesticide: "Carbendazim 50% WP",    dosage: "2.5 g per kg of seed",      interval: "Seed treatment" },
  // Cotton
  "boll rot":                  { pesticide: "Copper Hydroxide 77% WP", dosage: "3 g per litre of water",  interval: "Every 7 days" },
  "leaf spot":                 { pesticide: "Mancozeb 75% WP",       dosage: "2.5 g per litre of water",  interval: "Every 10 days" },
  // Maize
  "northern leaf blight":      { pesticide: "Azoxystrobin 23% SC",   dosage: "1 ml per litre of water",   interval: "Every 14 days" },
  "grey leaf spot":            { pesticide: "Propiconazole 25% EC",  dosage: "1 ml per litre of water",   interval: "Every 14 days" },
  // Mango
  "mango malformation":        { pesticide: "NAA 4.5% SL",           dosage: "1 ml per 4.5 litres",       interval: "Once per season" },
  "anthracnose mango":         { pesticide: "Carbendazim 50% WP",    dosage: "1 g per litre of water",    interval: "Every 10 days" },
  // General fallback
  "default":                   { pesticide: "Mancozeb 75% WP",       dosage: "2.5 g per litre of water",  interval: "Every 7 days" },
};

// Find treatment by matching disease name substring (case-insensitive)
const getTreatment = (diseaseName) => {
  if (!diseaseName) return null;
  const lower = diseaseName.toLowerCase();
  for (const [key, treatment] of Object.entries(DISEASE_TREATMENT_MAP)) {
    if (key !== "default" && lower.includes(key)) return treatment;
  }
  return DISEASE_TREATMENT_MAP["default"];
};

// ── Main analysis function ────────────────────────────────────────────────────
const analyzeWithKindwise = async (imageBuffer) => {
  const form = new FormData();
  form.append('images', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });

  try {
    const response = await axios.post(
      'https://crop.kindwise.com/api/v1/identification',
      form,
      {
        headers: {
          'Api-Key': KINDWISE_API_KEY,
          ...form.getHeaders(),
        },
        params: {
          details: 'disease,treatment,description',
        },
      }
    );

    const result = response.data?.result;
    if (!result) {
      console.error("Unexpected Kindwise response:", JSON.stringify(response.data, null, 2));
      throw new Error("Unexpected API response structure");
    }

    // ── Crop name ─────────────────────────────────────────────────────────────
    const cropSuggestion = result.crop?.suggestions?.[0];
    // Kindwise often returns "Tomato (Solanum lycopersicum)" — clean it up
    const rawCropName = cropSuggestion?.name || "Unknown Crop";
    const cropName = rawCropName.split("(")[0].trim(); // strip Latin name in brackets

    // ── Disease ───────────────────────────────────────────────────────────────
    const diseaseSuggestion = result.disease?.suggestions?.[0];
    // Kindwise disease names often include the crop prefix e.g. "Tomato Early blight"
    // Strip crop name prefix if present for cleaner display
    let rawDiseaseName = diseaseSuggestion?.name || null;
    let diseaseName = rawDiseaseName;
    if (rawDiseaseName && cropName !== "Unknown Crop") {
      diseaseName = rawDiseaseName
        .replace(new RegExp(`^${cropName}\\s*`, "i"), "")
        .trim();
    }

    const confidence = diseaseSuggestion?.probability ?? cropSuggestion?.probability ?? 0;
    const isHealthy = !diseaseName || confidence < 0.1;

    // ── Treatment ─────────────────────────────────────────────────────────────
    // First try Kindwise's own treatment text
    const kindwiseTreatment =
      diseaseSuggestion?.details?.treatment?.chemical?.[0] ||
      diseaseSuggestion?.details?.treatment?.biological?.[0] ||
      diseaseSuggestion?.details?.treatment?.prevention?.[0] ||
      null;

    // Then enrich with structured pesticide data from our map
    const treatmentData = isHealthy ? null : getTreatment(diseaseName || rawDiseaseName);

    return {
      cropName,
      disease:        isHealthy ? null : diseaseName,
      confidence,
      isHealthy,
      // Structured fields for frontend cards
      pesticide:      treatmentData?.pesticide   || null,
      dosage:         treatmentData?.dosage       || null,
      sprayInterval:  treatmentData?.interval     || null,
      // Raw Kindwise treatment text as fallback description
      recommendation: kindwiseTreatment || treatmentData?.pesticide || "Consult a local agricultural expert.",
      details: result, // full result for debugging
    };

  } catch (error) {
    if (error.response) {
      console.error("Kindwise API Error:", error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Kindwise Error:", error.message);
    }
    throw new Error("AI Analysis failed: " + (error.response?.data?.message || error.message));
  }
};

module.exports = { analyzeWithKindwise };