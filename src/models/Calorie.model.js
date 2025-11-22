const prisma = require('./prismaClient');
const { generateGeminiCalorieInsights } = require('../services/calories.gemini.service');

module.exports.createCalorie = function createCalorie(data) {
  return prisma.calorie.create({ data });
};

module.exports.getAllCalories = function getAllCalories() {
  return prisma.calorie.findMany({
    orderBy: { createdDate: 'desc' },
  });
};

module.exports.updateCalorie = function updateCalorie(id, data) {
  return prisma.calorie.update({
    where: { id },
    data,
  });
};

module.exports.deleteCalorie = function deleteCalorie(id) {
  return prisma.calorie.delete({
    where: { id },
  });
};

module.exports.findCalorieByUserId = function findCalorieByUserId(userId) {
  return prisma.calorie.findMany({
    where: { userId },
    orderBy: { createdDate: 'desc' },
  });
};

module.exports.findCaloriesByUserIdAndDate = function findCaloriesByUserIdAndDate(userId, date) {
  const dateParts = date.split('-');
  if (dateParts.length !== 3) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }
  
  const year = Number.parseInt(dateParts[0], 10);
  const month = Number.parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
  const day = Number.parseInt(dateParts[2], 10);
  
  const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

  return prisma.calorie.findMany({
    where: {
      userId,
      createdDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { createdDate: 'desc' },
  });
};

module.exports.generateCalorie = async function generateCalorie(mealData) {
  // mealData should contain: mealType, description (userFoodIntake), portion, notes
  if (!mealData || !mealData.description) {
    throw new Error('Meal description is required for calorie generation.');
  }

  // Format entry for Gemini service (expects array of entries)
  const entry = {
    mealType: mealData.mealType || 'Meal',
    userFoodIntake: mealData.description,
    description: mealData.description,
    portion: mealData.portion || '',
    notes: mealData.notes || '',
  };

  let aiInsights = null;
  let estimatedCalories = null;

  try {
    // Generate AI insights from Gemini
    aiInsights = await generateGeminiCalorieInsights([entry], mealData.userBodyData);
    const exactFormatMatch = aiInsights.match(/ESTIMATED_CALORIES:\s*(\d+(?:\.\d+)?)/i);
    if (exactFormatMatch) {
      estimatedCalories = parseFloat(exactFormatMatch[1]);
    } else {
      const calorieMatch = aiInsights.match(/(\d+(?:\.\d+)?)\s*(?:calories|kcal|cal)/i);
      if (calorieMatch) {
        estimatedCalories = parseFloat(calorieMatch[1]);
      }
    }
  } catch (aiError) {
    console.error('Gemini generation failed:', aiError);
    throw new Error('Failed to generate calorie estimate. Please try again.');
  }

  return {
    mealType: entry.mealType,
    description: entry.description,
    portion: entry.portion,
    notes: entry.notes,
    aiEstimateCalories: estimatedCalories,
    aiInsights,
  };
};
