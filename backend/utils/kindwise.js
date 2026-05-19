// utils/kindwise.js
const axios = require('axios');
const FormData = require('form-data');

const KINDWISE_API_KEY = process.env.KINDWISE_API_KEY; // Put in .env

const analyzeWithKindwise = async (imageBuffer) => {
  const form = new FormData();
  form.append('images', imageBuffer, 'image.jpg');

  try {
    const response = await axios.post('https://crop.kindwise.com/api/v1/identification', form, {
      headers: {
        'Api-Key': KINDWISE_API_KEY,
        ...form.getHeaders(),
      },
      params: {
        details: 'disease,treatment,description',
      }
    });

    const result = response.data.result[0]; // First best match

    return {
      cropName: result.crop?.name || result.plant?.name || "Unknown Crop",
      disease: result.disease?.name || null,
      confidence: result.disease?.probability || result.probability || 0,
      recommendation: result.treatment?.description || 
                     "Consult local agricultural expert for treatment.",
      details: result
    };

  } catch (error) {
    console.error("Kindwise API Error:", error.response?.data || error.message);
    throw new Error("AI Analysis failed");
  }
};

module.exports = { analyzeWithKindwise };