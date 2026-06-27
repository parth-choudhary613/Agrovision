// backend/utils/kindwise.js
const axios = require('axios');

const KINDWISE_API_KEY = process.env.KINDWISE_API_KEY;
if (!KINDWISE_API_KEY) console.error("❌ KINDWISE_API_KEY missing in .env");

// ─────────────────────────────────────────────────────────────────────────────
// DISEASE → PESTICIDE DATABASE
// The Kindwise API returns treatment as long prose strings like
// "If necessary, apply Mancozeb at 2.5g/L every 7 days..."
// We parse those strings AND keep a curated fallback table for 60+ diseases.
// ─────────────────────────────────────────────────────────────────────────────
const DISEASE_DB = {
  // FUNGAL - BLIGHT
  'early blight':           { pesticide: 'Mancozeb 75% WP',            dosage: '2.5 g/L',    interval: '7 days',  how: 'Spray foliage thoroughly, covering both leaf surfaces. Apply in the morning. Repeat every 7 days during high-humidity periods.' },
  'late blight':            { pesticide: 'Metalaxyl-M 8% + Mancozeb 64% WP', dosage: '2.5 g/L', interval: '7 days', how: 'Apply at first sign of symptoms. Spray entire plant including stem. Do not apply in rain. Rotate with copper-based fungicide.' },
  'southern blight':        { pesticide: 'Carbendazim 50% WP',          dosage: '1 g/L',      interval: '10 days', how: 'Drench soil around the plant base. Apply early morning. Repeat after 10 days.' },
  'bacterial blight':       { pesticide: 'Copper Oxychloride 50% WP',   dosage: '3 g/L',      interval: '7 days',  how: 'Spray all plant surfaces thoroughly. Apply during cool, dry weather. Avoid wetting fruit.' },
  'cercospora leaf blight':  { pesticide: 'Chlorothalonil 75% WP',      dosage: '2 g/L',      interval: '10 days', how: 'Spray foliage thoroughly. Apply in the early morning or evening. Repeat every 10 days.' },

  // FUNGAL - MILDEW
  'powdery mildew':         { pesticide: 'Sulphur 80% WP',              dosage: '3 g/L',      interval: '7 days',  how: 'Spray upper and lower leaf surfaces at first sign of white patches. Do not apply when temperature >35°C. Repeat weekly.' },
  'downy mildew':           { pesticide: 'Metalaxyl-M 4% + Mancozeb 40% WP', dosage: '2.5 g/L', interval: '10 days', how: 'Focus on underside of leaves where spores develop. Apply early morning. Spray preventively during wet weather.' },

  // FUNGAL - RUST
  'rust':                   { pesticide: 'Propiconazole 25% EC',         dosage: '1 ml/L',     interval: '14 days', how: 'Spray at first orange pustules. Cover all leaf surfaces. Apply in early morning. Alternate with Mancozeb to prevent resistance.' },
  'common rust':            { pesticide: 'Propiconazole 25% EC',         dosage: '1 ml/L',     interval: '14 days', how: 'Spray at first orange pustules. Cover all leaf surfaces. Apply in early morning.' },
  'southern rust':          { pesticide: 'Azoxystrobin 23% SC',          dosage: '1 ml/L',     interval: '14 days', how: 'Apply at V6-V8 stage before tasselling. Spray entire canopy. Repeat after 14 days if disease pressure is high.' },
  'leaf rust':              { pesticide: 'Tebuconazole 25.9% EC',        dosage: '1 ml/L',     interval: '14 days', how: 'Apply at flag leaf stage. Cover both leaf surfaces. Apply in morning when wind is calm.' },

  // FUNGAL - SPOT / CERCOSPORA
  'leaf spot':              { pesticide: 'Chlorothalonil 75% WP',        dosage: '2 g/L',      interval: '10 days', how: 'Spray all leaf surfaces. Apply in the morning. Begin at first sign of small brown spots. Repeat every 10 days.' },
  'target spot':            { pesticide: 'Chlorothalonil 75% WP',        dosage: '2 g/L',      interval: '10 days', how: 'Spray both leaf surfaces. Apply early morning. Repeat every 10 days during wet conditions.' },
  'cercospora leaf spot':   { pesticide: 'Mancozeb 75% WP',             dosage: '2.5 g/L',    interval: '10 days', how: 'Spray foliage thoroughly. Apply in the morning. Repeat every 10 days.' },
  'gray leaf spot':         { pesticide: 'Azoxystrobin 23% SC',          dosage: '1 ml/L',     interval: '14 days', how: 'Apply at first sign of lesions. Ensure full canopy coverage. Apply in calm, dry weather. Repeat every 14 days.' },
  'frogeye leaf spot':      { pesticide: 'Azoxystrobin 23% SC',          dosage: '1 ml/L',     interval: '14 days', how: 'Apply at R1-R3 growth stage. Spray all leaf surfaces. Do not apply during rain.' },
  'brown spot':             { pesticide: 'Tricyclazole 75% WP',          dosage: '0.6 g/L',    interval: '14 days', how: 'Spray foliage at tillering and panicle initiation stages. Cover all leaf surfaces evenly.' },
  'black spot':             { pesticide: 'Captan 50% WP',                dosage: '2.5 g/L',    interval: '7 days',  how: 'Apply at bud break and continue until harvest. Spray all plant surfaces thoroughly every 7 days.' },

  // FUNGAL - ANTHRACNOSE
  'anthracnose':            { pesticide: 'Carbendazim 50% WP',           dosage: '1 g/L',      interval: '10 days', how: 'Spray foliage, stems, and fruit. Apply at flowering stage. Repeat every 10 days. Avoid overhead irrigation after application.' },

  // FUNGAL - ALTERNARIA
  'alternaria':             { pesticide: 'Mancozeb 75% WP',              dosage: '2.5 g/L',    interval: '10 days', how: 'Apply at first sign of small dark spots. Cover all leaf surfaces. Spray in early morning. Repeat every 10 days.' },
  'alternaria leaf spot':   { pesticide: 'Iprodione 50% WP',             dosage: '1.5 g/L',    interval: '10 days', how: 'Spray foliage thoroughly. Apply in the morning. Repeat every 10 days in wet conditions.' },
  'black rot':              { pesticide: 'Copper Oxychloride 50% WP',    dosage: '3 g/L',      interval: '7 days',  how: 'Apply from bud break onwards. Spray all plant parts. Repeat every 7 days during rainy periods.' },
  'sooty mold':             { pesticide: 'Copper Hydroxide 53.8% WDG',   dosage: '2 g/L',      interval: '14 days', how: 'Spray all plant surfaces. Control the insect pests (aphids/whiteflies) causing honeydew first.' },

  // FUNGAL - WILT & ROT
  'fusarium wilt':          { pesticide: 'Carbendazim 50% WP',           dosage: '1 g/L',      interval: '14 days', how: 'Apply as a soil drench around the root zone. Use 200-300 ml per plant. Repeat after 14 days.' },
  'verticillium wilt':      { pesticide: 'Thiophanate-methyl 70% WP',    dosage: '2 g/L',      interval: '14 days', how: 'Drench soil at base of plant. Apply 200ml per plant. Repeat every 14 days. Practice crop rotation.' },
  'wilt':                   { pesticide: 'Thiophanate-methyl 70% WP',    dosage: '2 g/L',      interval: '14 days', how: 'Soil drench at base of plant. Apply when first wilting symptoms are observed.' },
  'root rot':               { pesticide: 'Metalaxyl 35% WS',             dosage: '2 g/kg seed', interval: 'Seed treatment', how: 'Treat seeds before sowing. For established plants, apply as soil drench 200ml per plant every 14 days.' },
  'stem rot':               { pesticide: 'Carbendazim 50% WP',           dosage: '1 g/L',      interval: '10 days', how: 'Apply as a drench at the base of plant. Spray the stem thoroughly. Repeat every 10 days.' },
  'collar rot':             { pesticide: 'Thiram 75% WP',                dosage: '3 g/L',      interval: '10 days', how: 'Drench soil at plant base 200ml per plant. Apply at transplanting and repeat every 10 days.' },
  'damping off':            { pesticide: 'Metalaxyl 35% WS',             dosage: '2 g/kg seed', interval: 'Seed treatment', how: 'Treat seeds before sowing. Drench seedbed with 2g/L solution. Ensure good drainage.' },

  // FUNGAL - SCAB & SMUT
  'scab':                   { pesticide: 'Captan 50% WP',                dosage: '2.5 g/L',    interval: '7 days',  how: 'Apply from bud break. Spray all surfaces including fruit. Reapply every 7 days during wet weather.' },
  'common smut':            { pesticide: 'Carboxin 37.5% + Thiram 37.5% DS', dosage: '2 g/kg seed', interval: 'Seed treatment', how: 'Treat seeds before sowing. Ensure uniform coating. Do not plant treated seeds >2 weeks after treatment.' },
  'loose smut':             { pesticide: 'Carboxin 37.5% + Thiram 37.5% DS', dosage: '2 g/kg seed', interval: 'Seed treatment', how: 'Treat seeds before sowing. Provides systemic protection within seed.' },

  // BACTERIAL
  'bacterial leaf scorch':  { pesticide: 'Oxytetracycline 3.4% SL',     dosage: '2 ml/L',     interval: '14 days', how: 'Apply as a foliar spray. Spray all leaf surfaces. Apply in the morning. Repeat every 14 days.' },
  'bacterial canker':       { pesticide: 'Copper Oxychloride 50% WP',    dosage: '3 g/L',      interval: '7 days',  how: 'Prune infected branches and spray wounds with copper solution. Spray entire tree. Repeat weekly.' },
  'fire blight':            { pesticide: 'Streptomycin Sulphate 90% SP', dosage: '0.5 g/L',    interval: '5 days',  how: 'Apply at bloom. Spray flowers and young shoots. Repeat every 5 days during bloom period in wet weather.' },
  'bacterial spot':         { pesticide: 'Copper Hydroxide 53.8% WDG',   dosage: '2 g/L',      interval: '7 days',  how: 'Apply at petal fall. Spray all plant surfaces including fruit. Repeat every 7 days in rainy weather.' },
  'bacterial pustule':      { pesticide: 'Copper Oxychloride 50% WP',    dosage: '3 g/L',      interval: '10 days', how: 'Spray all leaf surfaces thoroughly. Apply early morning. Repeat every 10 days.' },
  'citrus canker':          { pesticide: 'Copper Oxychloride 50% WP',    dosage: '3 g/L',      interval: '7 days',  how: 'Spray all parts including young shoots and fruit. Apply preventively before rains. Remove and burn severely infected parts.' },

  // VIRAL
  'mosaic virus':           { pesticide: 'Imidacloprid 17.8% SL',        dosage: '0.5 ml/L',   interval: '14 days', how: 'Target aphids and whiteflies (virus vectors). Spray underside of leaves where insects congregate. Repeat every 14 days.' },
  'yellow leaf curl':       { pesticide: 'Thiamethoxam 25% WDG',         dosage: '0.5 g/L',    interval: '14 days', how: 'Spray to control whitefly vectors. Apply under leaves where whiteflies feed. Use yellow sticky traps alongside.' },
  'tomato yellow leaf curl virus': { pesticide: 'Thiamethoxam 25% WDG', dosage: '0.5 g/L',    interval: '14 days', how: 'Control whitefly vectors. Spray underside of leaves. Remove infected plants to prevent spread.' },
  'bean common mosaic':     { pesticide: 'Imidacloprid 17.8% SL',        dosage: '0.5 ml/L',   interval: '14 days', how: 'Control aphid vectors. Spray all plant surfaces. Use reflective mulch to repel aphids.' },

  // NUTRIENT / ABIOTIC
  'nitrogen deficiency':    { pesticide: 'Urea 46% N (foliar)',          dosage: '5 g/L',      interval: '7 days',  how: 'Spray foliage in the early morning or evening. Apply 2-3 times at weekly intervals. Also apply nitrogen-rich fertilizer to soil.' },
  'iron deficiency':        { pesticide: 'Ferrous Sulphate (FeSO4)',      dosage: '5 g/L',      interval: '7 days',  how: 'Apply as foliar spray in the morning. Avoid application in midday heat. Correct soil pH to 6.0-6.5 for better iron availability.' },
  'magnesium deficiency':   { pesticide: 'Magnesium Sulphate (MgSO4)',   dosage: '10 g/L',     interval: '10 days', how: 'Apply as foliar spray early morning. Can also apply to soil as base dressing.' },
  'calcium deficiency':     { pesticide: 'Calcium Nitrate Ca(NO3)2',      dosage: '3 g/L',      interval: '7 days',  how: 'Apply as foliar spray during active growth. Avoid high temperatures during application.' },
  'potassium deficiency':   { pesticide: 'Potassium Nitrate (KNO3)',      dosage: '5 g/L',      interval: '7 days',  how: 'Apply as foliar spray in early morning. Also top-dress with muriate of potash (60% K2O) at 25 kg/acre.' },

  // INSECT / PEST
  'aphids':                 { pesticide: 'Imidacloprid 17.8% SL',        dosage: '0.5 ml/L',   interval: '10 days', how: 'Spray undersides of leaves where aphids cluster. Apply in early morning. Repeat every 10 days. Avoid spraying during flowering.' },
  'whitefly':               { pesticide: 'Thiamethoxam 25% WDG',         dosage: '0.5 g/L',    interval: '10 days', how: 'Spray underside of leaves thoroughly. Use yellow sticky traps alongside. Apply at cooler times of day. Repeat every 10 days.' },
  'spider mite':            { pesticide: 'Abamectin 1.8% EC',            dosage: '1 ml/L',     interval: '7 days',  how: 'Spray undersides of leaves under pressure. Apply in early morning. Repeat after 7 days. Alternate with Spiromesifen to prevent resistance.' },
  'thrips':                 { pesticide: 'Spinosad 45% SC',               dosage: '0.5 ml/L',   interval: '7 days',  how: 'Spray all plant surfaces including flowers. Apply in morning. Repeat weekly. Use blue sticky traps to monitor population.' },
  'leafhoppers':            { pesticide: 'Lambda-cyhalothrin 5% EC',      dosage: '1 ml/L',     interval: '10 days', how: 'Spray all plant surfaces in early morning. Repeat every 10 days. Avoid spraying during peak flowering.' },
  'colorado potato beetle': { pesticide: 'Spinosad 45% SC',               dosage: '0.5 ml/L',   interval: '7 days',  how: 'Spray foliage when larvae first appear. Cover both leaf surfaces. Repeat weekly until population is controlled.' },
  'cutworms':               { pesticide: 'Chlorpyrifos 20% EC',           dosage: '2.5 ml/L',   interval: '10 days', how: 'Apply as soil drench around plant base at dusk when cutworms are active. Repeat every 10 days.' },
  'bollworm':               { pesticide: 'Emamectin Benzoate 5% SG',     dosage: '0.4 g/L',    interval: '10 days', how: 'Spray all plant surfaces, focusing on fruiting bodies. Apply at first egg hatch. Repeat every 10 days.' },
  'army worm':              { pesticide: 'Emamectin Benzoate 5% SG',     dosage: '0.4 g/L',    interval: '7 days',  how: 'Apply as soon as small larvae are seen. Spray in early morning or evening. Repeat every 7 days.' },

  // GENERIC FALLBACK by keyword
  'mildew':                 { pesticide: 'Sulphur 80% WP',               dosage: '3 g/L',      interval: '7 days',  how: 'Spray all leaf surfaces. Apply in the morning. Do not apply in temperatures above 35°C.' },
  'blight':                 { pesticide: 'Mancozeb 75% WP',              dosage: '2.5 g/L',    interval: '7 days',  how: 'Spray all plant surfaces thoroughly. Apply at first sign of disease. Repeat every 7 days.' },
  'rot':                    { pesticide: 'Carbendazim 50% WP',           dosage: '1 g/L',      interval: '10 days', how: 'Apply as soil drench and foliar spray. Repeat every 10 days until symptoms stop spreading.' },
  'spot':                   { pesticide: 'Chlorothalonil 75% WP',        dosage: '2 g/L',      interval: '10 days', how: 'Spray all leaf surfaces. Apply in early morning. Repeat every 10 days.' },
  'virus':                  { pesticide: 'Imidacloprid 17.8% SL',        dosage: '0.5 ml/L',   interval: '14 days', how: 'Control insect vectors (aphids, whiteflies). Spray undersides of leaves. Remove and destroy heavily infected plants.' },
  'bacterial':              { pesticide: 'Copper Oxychloride 50% WP',    dosage: '3 g/L',      interval: '7 days',  how: 'Apply as preventive spray. Cover all plant surfaces. Repeat every 7 days in wet weather.' },
  'fungal':                 { pesticide: 'Mancozeb 75% WP',              dosage: '2.5 g/L',    interval: '10 days', how: 'Spray all plant surfaces evenly. Apply in early morning. Repeat every 10 days.' },
  'deficiency':             { pesticide: 'Multinutrient Foliar Spray',   dosage: '3 ml/L',     interval: '7 days',  how: 'Spray foliage in the early morning or evening. Repeat every 7 days for 3 applications. Also correct soil nutrition.' },
};

/**
 * Look up pesticide details from our curated database.
 * Tries longest-match first so "bacterial leaf scorch" beats "bacterial".
 */
function lookupDisease(name) {
  if (!name) return null;
  const lower = name.toLowerCase();

  // Try exact match first
  if (DISEASE_DB[lower]) return DISEASE_DB[lower];

  // Try longest partial match (so "early blight" beats "blight")
  let best = null;
  let bestLen = 0;
  for (const [key, val] of Object.entries(DISEASE_DB)) {
    if (lower.includes(key) && key.length > bestLen) {
      best = val;
      bestLen = key.length;
    }
  }
  return best;
}

/**
 * Parse the Kindwise treatment arrays (which are prose sentences) to extract
 * the first chemical product name mentioned. Used as a secondary source.
 * Example: "If necessary, apply Mancozeb 75% WP at 2.5g/L..." → "Mancozeb 75% WP"
 */
function parseChemicalFromText(textArray) {
  if (!Array.isArray(textArray) || textArray.length === 0) return null;
  for (const line of textArray) {
    if (!line) continue;
    // Match "apply X" or "use X" followed by a product name (caps + % or EC/WP/SC etc.)
    const match = line.match(/(?:apply|use|spray|treat with)\s+([A-Z][A-Za-z\s\-]+?(?:\d+%?\s*(?:WP|EC|SC|SL|WDG|WS|SP|SG|DS)?))/i);
    if (match) return match[1].trim();
    // Match product code patterns directly
    const codeMatch = line.match(/\b([A-Z][a-z]+(?:[-\s][a-z]+)*\s+\d+(?:\.\d+)?%?\s*(?:WP|EC|SC|SL|WDG|WS|SP|SG|DS))\b/i);
    if (codeMatch) return codeMatch[1].trim();
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
const analyzeWithKindwise = async (imageBuffer) => {
  const base64Image = imageBuffer.toString('base64');

  // CORRECT API CALL:
  // - Body: only "images" array (base64 without data: URI prefix per official Python example)
  // - Query params: details (comma-separated string)
  // - NO similar_images in body (false is invalid; only true is accepted — we omit it)
  const response = await axios.post(
    'https://crop.kindwise.com/api/v1/identification',
    {
      images: [base64Image]   // plain base64, no data:image/jpeg;base64, prefix
    },
    {
      params: {
        details: 'common_names,description,treatment,classification,url'
      },
      headers: {
        'Api-Key':      KINDWISE_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  // ── Log full raw response for debugging ────────────────────────────────────
  const rawData = response.data;
  console.log('\n=== KINDWISE RAW RESPONSE ===');
  console.log(JSON.stringify(rawData, null, 2).substring(0, 4000));
  console.log('=== END RAW RESPONSE ===\n');

  const result = rawData?.result;
  if (!result) throw new Error('Empty result from Kindwise API');

  // ── 1. CROP NAME ──────────────────────────────────────────────────────────
  const cropSuggestions = result?.crop?.suggestions || [];
  const topCrop         = cropSuggestions[0];
  const cropProbability = topCrop?.probability ?? 0;

  // Prefer common name (e.g. "Tomato") over scientific name ("Solanum lycopersicum")
  const cropCommonNames = topCrop?.details?.common_names || [];
  let cropName = cropCommonNames[0]
    || (topCrop?.name ? topCrop.name.split('(')[0].trim() : null)
    || 'Unknown Crop';

  // Capitalise first letter of each word for readability
  cropName = cropName.replace(/\b\w/g, c => c.toUpperCase());

  // Reject if API has low confidence the image is even a crop
  if (cropProbability < 0.10 || cropName === 'Unknown Crop') {
    throw Object.assign(new Error('NOT_A_PLANT'), { cropName: 'Unknown', confidence: 0 });
  }

  // ── 2. IS_HEALTHY DETERMINATION ───────────────────────────────────────────
  // The Kindwise API returns result.is_healthy.binary (boolean) — this is the
  // authoritative health flag. We MUST use it. Do not override with a custom threshold.
  const isHealthyObj    = result?.is_healthy || {};
  const isHealthyBinary = isHealthyObj.binary;           // true = healthy, false = diseased
  const isHealthyProb   = isHealthyObj.probability ?? 0; // probability that plant IS healthy

  // Disease suggestions
  const diseaseSuggestions = result?.disease?.suggestions || [];
  const topDisease         = diseaseSuggestions[0];
  const diseaseProbability = topDisease?.probability ?? 0;
  const rawDiseaseName     = topDisease?.name || null;
  const diseaseDetails     = topDisease?.details || {};

  // Determine health status:
  // Priority 1: Use API's is_healthy.binary if present
  // Priority 2: If disease probability > 30% and disease name doesn't contain "healthy" → diseased
  let isHealthy;
  if (isHealthyBinary !== undefined && isHealthyBinary !== null) {
    isHealthy = isHealthyBinary;
  } else {
    // Fallback: if disease name contains "healthy" or probability very low → healthy
    const isHealthyDiseaseName = rawDiseaseName
      ? rawDiseaseName.toLowerCase().includes('healthy') || rawDiseaseName.toLowerCase().includes('no disease')
      : true;
    isHealthy = isHealthyDiseaseName || diseaseProbability < 0.30;
  }

  // ── 3. DISEASE NAME ───────────────────────────────────────────────────────
  let diseaseName = null;
  if (!isHealthy && rawDiseaseName) {
    diseaseName = rawDiseaseName;
    // Remove leading crop name prefix if present (e.g. "Tomato Early Blight" → "Early Blight")
    const cropFirst = cropName.split(' ')[0];
    const cleaned   = diseaseName.replace(new RegExp(`^${cropFirst}\\s+`, 'i'), '').trim();
    if (cleaned.length > 3) diseaseName = cleaned;
    // Capitalise
    diseaseName = diseaseName.replace(/\b\w/g, c => c.toUpperCase());
  }

  // ── 4. CONFIDENCE ─────────────────────────────────────────────────────────
  // For diseased plants: confidence = disease probability
  // For healthy plants: confidence = is_healthy probability (or 1 - disease probability)
  let rawConfidence;
  if (isHealthy) {
    rawConfidence = isHealthyProb > 0 ? isHealthyProb : (1 - diseaseProbability);
  } else {
    rawConfidence = diseaseProbability;
  }
  const confidence = Math.min(99, Math.max(1, Math.round(rawConfidence * 100)));

  // ── 5. TREATMENT ──────────────────────────────────────────────────────────
  let pesticide           = null;
  let dosage              = null;
  let sprayInterval       = null;
  let howToUse            = null;
  let biologicalTreatment = null;
  let prevention          = null;
  let recommendation      = null;

  if (isHealthy) {
    recommendation = `${cropName} is healthy. Continue regular monitoring, watering, and balanced fertilisation.`;
  } else if (diseaseName) {
    // 5a. Try our curated disease database first (most accurate dosage + how-to-use)
    const dbMatch = lookupDisease(diseaseName);
    if (dbMatch) {
      pesticide     = dbMatch.pesticide;
      dosage        = dbMatch.dosage;
      sprayInterval = dbMatch.interval;
      howToUse      = dbMatch.how;
    }

    // 5b. Pull treatment text from API response
    const apiTreatment = diseaseDetails?.treatment || {};
    const chemList      = Array.isArray(apiTreatment.chemical)   ? apiTreatment.chemical   : [];
    const bioList       = Array.isArray(apiTreatment.biological) ? apiTreatment.biological : [];
    const prevList      = Array.isArray(apiTreatment.prevention) ? apiTreatment.prevention : [];

    // If our DB had no match, try extracting product name from API prose
    if (!pesticide && chemList.length > 0) {
      const parsed = parseChemicalFromText(chemList);
      if (parsed) pesticide = parsed;
      else pesticide = 'Contact local agronomist for chemical recommendation';
    }

    // Biological treatment: use API's text (it's good prose)
    if (bioList.length > 0) {
      biologicalTreatment = bioList.slice(0, 2).join(' ');
    }
    // Prevention: use API's text (it's good prose)
    if (prevList.length > 0) {
      prevention = prevList.slice(0, 3).join(' ');
    }

    // 5c. Build recommendation string
    if (pesticide && dosage) {
      recommendation = `Apply ${pesticide} @ ${dosage} every ${sprayInterval}.`;
    } else if (pesticide) {
      recommendation = `Apply ${pesticide} as directed on the label.`;
    } else {
      recommendation = 'Consult a local agricultural expert for precise chemical recommendation.';
    }
  }

  // ── 6. DISEASE DESCRIPTION ────────────────────────────────────────────────
  const diseaseDescription = diseaseDetails?.description?.value
    || diseaseDetails?.description
    || null;

  // ── 7. FINAL RESULT ───────────────────────────────────────────────────────
  const finalResult = {
    cropName,
    diseaseDetected:     isHealthy ? 'Healthy' : (diseaseName || 'Unknown Disease'),
    confidence,
    isHealthy,
    pesticide,
    dosage,
    sprayInterval,
    howToUse,
    biologicalTreatment,
    prevention,
    recommendation,
    diseaseDescription,
  };

  console.log('\n=== PARSED RESULT ===');
  console.log(JSON.stringify(finalResult, null, 2));
  console.log('=== END PARSED RESULT ===\n');

  return finalResult;
};

module.exports = { analyzeWithKindwise };