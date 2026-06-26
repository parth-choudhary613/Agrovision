const axios = require('axios');
const FormData = require('form-data');

const KINDWISE_API_KEY = process.env.KINDWISE_API_KEY;

// ── Pesticide lookup map ──────────────────────────────────────────────────────
const DISEASE_TREATMENT_MAP = {
  // Fungal - Mold
  "white mold":                { pesticide: "Iprodione 50% WP",        dosage: "2 g per litre of water",    interval: "Every 10 days" },
  "gray mold":                 { pesticide: "Iprodione 50% WP",        dosage: "2 g per litre of water",    interval: "Every 10 days" },
  "grey mold":                 { pesticide: "Iprodione 50% WP",        dosage: "2 g per litre of water",    interval: "Every 10 days" },
  "botrytis":                  { pesticide: "Iprodione 50% WP",        dosage: "2 g per litre of water",    interval: "Every 10 days" },
  "black mold":                { pesticide: "Thiram 75% WP",           dosage: "3 g per litre of water",    interval: "Every 7 days"  },
  // Blight
  "early blight":              { pesticide: "Mancozeb 75% WP",         dosage: "2.5 g per litre of water",  interval: "Every 7 days"  },
  "late blight":               { pesticide: "Metalaxyl 35% WS",        dosage: "2 g per litre of water",    interval: "Every 5 days"  },
  "northern leaf blight":      { pesticide: "Azoxystrobin 23% SC",     dosage: "1 ml per litre of water",   interval: "Every 14 days" },
  "southern blight":           { pesticide: "Carbendazim 50% WP",      dosage: "1 g per litre of water",    interval: "Every 10 days" },
  // Mildew
  "powdery mildew":            { pesticide: "Sulphur 80% WP",          dosage: "3 g per litre of water",    interval: "Every 7 days"  },
  "downy mildew":              { pesticide: "Cymoxanil 8% WP",         dosage: "2.5 g per litre of water",  interval: "Every 7 days"  },
  // Wilt & Rot
  "fusarium wilt":             { pesticide: "Carbendazim 50% WP",      dosage: "1 g per litre of water",    interval: "Every 10 days" },
  "fusarium":                  { pesticide: "Carbendazim 50% WP",      dosage: "1 g per litre of water",    interval: "Every 10 days" },
  "verticillium wilt":         { pesticide: "Thiophanate-methyl 70% WP", dosage: "1 g per litre of water",  interval: "Every 14 days" },
  "root rot":                  { pesticide: "Metalaxyl 35% WS",        dosage: "2 g per litre of water",    interval: "Every 10 days" },
  "crown rot":                 { pesticide: "Metalaxyl 35% WS",        dosage: "2 g per litre of water",    interval: "Every 10 days" },
  "collar rot":                { pesticide: "Copper Oxychloride 50% WP", dosage: "3 g per litre of water",  interval: "Every 10 days" },
  "stem rot":                  { pesticide: "Carbendazim 50% WP",      dosage: "1.5 g per litre of water",  interval: "Every 7 days"  },
  "fruit rot":                 { pesticide: "Carbendazim 50% WP",      dosage: "1.5 g per litre of water",  interval: "Every 7 days"  },
  "soft rot":                  { pesticide: "Copper Hydroxide 77% WP", dosage: "3 g per litre of water",    interval: "Every 7 days"  },
  "boll rot":                  { pesticide: "Copper Hydroxide 77% WP", dosage: "3 g per litre of water",    interval: "Every 7 days"  },
  // Leaf diseases
  "leaf curl":                 { pesticide: "Imidacloprid 17.8% SL",   dosage: "0.5 ml per litre of water", interval: "Every 10 days" },
  "leaf spot":                 { pesticide: "Mancozeb 75% WP",         dosage: "2.5 g per litre of water",  interval: "Every 10 days" },
  "septoria leaf spot":        { pesticide: "Chlorothalonil 75% WP",   dosage: "2 g per litre of water",    interval: "Every 7 days"  },
  "grey leaf spot":            { pesticide: "Propiconazole 25% EC",    dosage: "1 ml per litre of water",   interval: "Every 14 days" },
  "brown spot":                { pesticide: "Mancozeb 75% WP",         dosage: "2.5 g per litre of water",  interval: "Every 10 days" },
  "cercospora":                { pesticide: "Carbendazim 50% WP",      dosage: "1 g per litre of water",    interval: "Every 10 days" },
  // Bacterial
  "bacterial spot":            { pesticide: "Copper Oxychloride 50% WP", dosage: "3 g per litre of water",  interval: "Every 7 days"  },
  "bacterial blight":          { pesticide: "Streptomycin 90% SP",     dosage: "0.5 g per litre of water",  interval: "Every 7 days"  },
  "bacterial wilt":            { pesticide: "Copper Hydroxide 77% WP", dosage: "3 g per litre of water",    interval: "Every 7 days"  },
  // Virus
  "mosaic virus":              { pesticide: "Thiamethoxam 25% WG",     dosage: "0.5 g per litre of water",  interval: "Every 14 days" },
  "mosaic":                    { pesticide: "Thiamethoxam 25% WG",     dosage: "0.5 g per litre of water",  interval: "Every 14 days" },
  "yellow virus":              { pesticide: "Imidacloprid 17.8% SL",   dosage: "0.5 ml per litre of water", interval: "Every 14 days" },
  // Rust
  "rust":                      { pesticide: "Propiconazole 25% EC",    dosage: "1 ml per litre of water",   interval: "Every 14 days" },
  // Anthracnose
  "anthracnose":               { pesticide: "Propiconazole 25% EC",    dosage: "1 ml per litre of water",   interval: "Every 10 days" },
  // Scab & Smut
  "scab":                      { pesticide: "Thiram 75% WP",           dosage: "3 g per litre of water",    interval: "Every 10 days" },
  "smut":                      { pesticide: "Carbendazim 50% WP",      dosage: "2.5 g per kg of seed",      interval: "Seed treatment"},
  "black scurf":               { pesticide: "Pencycuron 25% WP",       dosage: "2 g per litre of water",    interval: "Every 14 days" },
  // Rice
  "blast":                     { pesticide: "Tricyclazole 75% WP",     dosage: "0.6 g per litre of water",  interval: "Every 10 days" },
  "sheath blight":             { pesticide: "Hexaconazole 5% EC",      dosage: "2 ml per litre of water",   interval: "Every 14 days" },
  // Insect / pest damage
  "aphid":                     { pesticide: "Imidacloprid 17.8% SL",   dosage: "0.5 ml per litre of water", interval: "Every 7 days"  },
  "whitefly":                  { pesticide: "Thiamethoxam 25% WG",     dosage: "0.5 g per litre of water",  interval: "Every 10 days" },
  "mite":                      { pesticide: "Abamectin 1.8% EC",       dosage: "1 ml per litre of water",   interval: "Every 7 days"  },
  "thrips":                    { pesticide: "Spinosad 45% SC",          dosage: "0.5 ml per litre of water", interval: "Every 10 days" },
  "shoot borer":               { pesticide: "Chlorpyrifos 20% EC",     dosage: "2 ml per litre of water",   interval: "Every 14 days" },
  "fruit borer":               { pesticide: "Chlorpyrifos 20% EC",     dosage: "2 ml per litre of water",   interval: "Every 14 days" },
  // Carrot specific
  "alternaria":                { pesticide: "Iprodione 50% WP",        dosage: "2 g per litre of water",    interval: "Every 10 days" },
  "cavity spot":               { pesticide: "Metalaxyl 35% WS",        dosage: "2 g per litre of water",    interval: "Every 14 days" },
  "carrot fly":                { pesticide: "Chlorpyrifos 20% EC",     dosage: "2 ml per litre of water",   interval: "Every 14 days" },
  // Mango
  "malformation":              { pesticide: "NAA 4.5% SL",             dosage: "1 ml per 4.5 litres",       interval: "Once per season"},
  // General fallback — do NOT return this unless nothing else matches
  "default":                   { pesticide: "Mancozeb 75% WP",         dosage: "2.5 g per litre of water",  interval: "Every 7 days"  },
};

// Find treatment — longest matching key wins to avoid "rust" matching "fusarium wilt" etc.
const getTreatment = (diseaseName) => {
  if (!diseaseName) return null;
  const lower = diseaseName.toLowerCase();
  let bestMatch = null;
  let bestLen = 0;
  for (const [key, treatment] of Object.entries(DISEASE_TREATMENT_MAP)) {
    if (key !== "default" && lower.includes(key) && key.length > bestLen) {
      bestMatch = treatment;
      bestLen = key.length;
    }
  }
  return bestMatch || DISEASE_TREATMENT_MAP["default"];
};

// ── Smart crop name resolver ──────────────────────────────────────────────────
// Kindwise sometimes returns the wrong top crop. Cross-check against the
// disease name — if the disease name contains a crop prefix that matches
// a lower-ranked suggestion, prefer that one.
const resolveCropName = (suggestions = [], rawDiseaseName = "") => {
  const diseaseLower = rawDiseaseName.toLowerCase();

  // Try to find a suggestion whose name appears inside the disease name
  for (const s of suggestions) {
    const name = s.name?.split("(")?.[0]?.trim() || "";
    if (name && diseaseLower.startsWith(name.toLowerCase())) {
      return name;
    }
  }

  // Fallback: use highest-confidence suggestion
  const raw = suggestions[0]?.name || "Unknown Crop";
  return raw.split("(")[0].trim();
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

    // ── Disease (resolve first — used to fix crop name) ───────────────────────
    const diseaseSuggestion = result.disease?.suggestions?.[0];
    const rawDiseaseName = diseaseSuggestion?.name || null;

    // ── Crop name — smart resolution using disease name prefix ────────────────
    // Kindwise often mis-ranks crops. If disease is "Carrot White mold",
    // resolveCropName finds "Carrot" among suggestions even if it wasn't #1.
    const cropSuggestions = result.crop?.suggestions || [];
    const cropName = resolveCropName(cropSuggestions, rawDiseaseName || "");

    // Strip crop prefix from disease name for clean display
    // e.g. "Carrot White mold" → "White mold"
    let diseaseName = rawDiseaseName;
    if (rawDiseaseName && cropName && cropName !== "Unknown Crop") {
      diseaseName = rawDiseaseName
        .replace(new RegExp(`^${cropName}\\s*`, "i"), "")
        .trim();
    }
    // Capitalise first letter
    if (diseaseName) {
      diseaseName = diseaseName.charAt(0).toUpperCase() + diseaseName.slice(1);
    }

    const confidence = diseaseSuggestion?.probability ?? cropSuggestions[0]?.probability ?? 0;
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