const { getDatasetContextForMeals } = require('./dataset-loader.service');

let aiClientPromise = null;

async function getGeminiClient() {
  if (!process.env.CALORIES_TRACKING_GEMINI_API_KEY) {
    throw new Error('Missing CALORIES_TRACKING_GEMINI_API_KEY environment variable.');
  }

  if (!aiClientPromise) {
    aiClientPromise = import('@google/genai').then(({ GoogleGenAI }) => new GoogleGenAI({
      apiKey: process.env.CALORIES_TRACKING_GEMINI_API_KEY,
    }));
  }

  return aiClientPromise;
}

async function buildPrompt(entries, userBodyData = null) {
  const mealLines = entries
    .map(
      (entry, index) =>
        `${index + 1}. Meal type: ${entry.mealType || 'Meal'} | Description: ${
          entry.userFoodIntake || entry.description || 'Not provided'
        } | Portion: ${entry.portion || 'Not specified'}${entry.notes ? ' | Notes: ' + entry.notes : ''}`,
    )
    .join('\n');

  // Get dataset context based on keyword matching
  const datasetContext = getDatasetContextForMeals(entries);
  
  // Build user body data section if available
  let userDataSection = '';
  if (userBodyData) {
    const userInfo = [];
    if (userBodyData.age) userInfo.push(`Age: ${userBodyData.age} years`);
    if (userBodyData.height) userInfo.push(`Height: ${userBodyData.height} cm`);
    if (userBodyData.weight) userInfo.push(`Weight: ${userBodyData.weight} kg`);
    if (userBodyData.bmi) userInfo.push(`BMI: ${userBodyData.bmi}`);
    
    if (userInfo.length > 0) {
      userDataSection = `\n\nUser Body Data:\n${userInfo.join('\n')}\n\nUse this information to provide personalized calorie estimates and nutrition advice tailored to the user's body composition and metabolic needs.`;
    }
  }
  
  return `You are a certified nutrition coach. Analyze the following meal and provide a detailed response.

IMPORTANT: You MUST include the estimated calorie count in this exact format at the start of your response:
ESTIMATED_CALORIES: [number]

For example: ESTIMATED_CALORIES: 450

Then provide:
1) Detailed calorie breakdown (use the reference dataset when available, state confidence level if calories missing)
2) Macro balance observations (protein, carbs, fats)
3) Specific actionable advice for nutrition goals${userBodyData ? ' tailored to the user\'s body composition' : ''}

Reference Dataset Information:
${datasetContext}${userDataSection}

Meal to analyze:
${mealLines}

Remember to start your response with: ESTIMATED_CALORIES: [number]`;
}

module.exports.generateGeminiCalorieInsights = async function generateGeminiCalorieInsights(entries, userBodyData = null) {
  const ai = await getGeminiClient();
  const contents = await buildPrompt(entries, userBodyData);
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
  });

  return response?.text ?? response?.response?.text ?? 'No AI response generated.';
};

