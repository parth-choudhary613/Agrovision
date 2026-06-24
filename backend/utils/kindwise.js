const axios = require('axios');
const FormData = require('form-data');

const KINDWISE_API_KEY = process.env.KINDWISE_API_KEY;

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

    // ── Correct response structure ──────────────────────────────────────────
    response.data.result.crop.suggestions[0]
    response.data.result.disease.suggestions[0]
    const result = response.data?.result;

    if (!result) {
      console.error("Unexpected Kindwise response:", JSON.stringify(response.data, null, 2));
      throw new Error("Unexpected API response structure");
    }

    // Best crop match
    const cropSuggestion = result.crop?.suggestions?.[0];
    const cropName = cropSuggestion?.name || "Unknown Crop";

    // Best disease match (may be absent if plant is healthy)
    const diseaseSuggestion = result.disease?.suggestions?.[0];
    const diseaseName = diseaseSuggestion?.name || null;
    const diseaseConfidence = diseaseSuggestion?.probability ?? cropSuggestion?.probability ?? 0;

    // Treatment details are nested inside the disease suggestion
    const treatment =
      diseaseSuggestion?.details?.treatment?.biological?.[0] ||
      diseaseSuggestion?.details?.treatment?.chemical?.[0] ||
      diseaseSuggestion?.details?.treatment?.prevention?.[0] ||
      "Consult a local agricultural expert for treatment.";

    return {
      cropName,
      disease: diseaseName,
      confidence: diseaseConfidence,
      recommendation: treatment,
      details: result,  // full result for debugging
    };

  } catch (error) {
    // Log the real underlying error, not just "AI Analysis failed"
    if (error.response) {
      console.error("Kindwise API Error:", error.response.status, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Kindwise Error:", error.message);
    }
    throw new Error("AI Analysis failed: " + (error.response?.data?.message || error.message));
  }
};

module.exports = { analyzeWithKindwise };
