const fs = require('fs');
const path = require('path');

let nutritionDataset = null;
let caloriesDataset = null;

/**
 * Parse CSV line handling quoted values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Load nutrition dataset (daily_food_nutrition_dataset.csv)
 */
function loadNutritionDataset() {
  if (nutritionDataset) return nutritionDataset;

  try {
    const filePath = path.join(__dirname, 'datasets', 'daily_food_nutrition_dataset.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    nutritionDataset = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const item = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      return item;
    });

    console.log(`Loaded ${nutritionDataset.length} items from nutrition dataset`);
    return nutritionDataset;
  } catch (error) {
    console.error('Error loading nutrition dataset:', error);
    return [];
  }
}

/**
 * Load calories dataset (calories.csv)
 */
function loadCaloriesDataset() {
  if (caloriesDataset) return caloriesDataset;

  try {
    const filePath = path.join(__dirname, 'datasets', 'calories.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);

    caloriesDataset = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const item = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      return item;
    });

    console.log(`Loaded ${caloriesDataset.length} items from calories dataset`);
    return caloriesDataset;
  } catch (error) {
    console.error('Error loading calories dataset:', error);
    return [];
  }
}

/**
 * Extract keywords from user input
 */
function extractKeywords(text) {
  if (!text) return [];
  
  // Convert to lowercase and split by common delimiters
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out very short words

  return words;
}

/**
 * Check if food item matches keywords
 */
function matchesKeywords(foodItem, keywords) {
  const searchText = foodItem.toLowerCase();
  return keywords.some(keyword => searchText.includes(keyword));
}

/**
 * Find matching foods from nutrition dataset
 */
function findInNutritionDataset(keywords, limit = 5) {
  const dataset = loadNutritionDataset();
  if (!dataset.length) return [];

  const matches = dataset.filter(item => {
    const foodItem = item['Food_Item'] || '';
    return matchesKeywords(foodItem, keywords);
  });

  return matches.slice(0, limit);
}

/**
 * Find matching foods from calories dataset
 */
function findInCaloriesDataset(keywords, limit = 5) {
  const dataset = loadCaloriesDataset();
  if (!dataset.length) return [];

  const matches = dataset.filter(item => {
    const foodItem = item['FoodItem'] || '';
    return matchesKeywords(foodItem, keywords);
  });

  return matches.slice(0, limit);
}

/**
 * Search both datasets for relevant food items based on user input
 */
function searchDatasets(userInput) {
  const keywords = extractKeywords(userInput);
  if (!keywords.length) return { nutrition: [], calories: [] };

  const nutritionMatches = findInNutritionDataset(keywords, 5);
  const caloriesMatches = findInCaloriesDataset(keywords, 5);

  return {
    nutrition: nutritionMatches,
    calories: caloriesMatches,
  };
}

/**
 * Format nutrition dataset item for prompt
 */
function formatNutritionItem(item) {
  return `- ${item['Food_Item'] || 'N/A'}: ${item['Calories (kcal)'] || 'N/A'} kcal | Protein: ${item['Protein (g)'] || 'N/A'}g | Carbs: ${item['Carbohydrates (g)'] || 'N/A'}g | Fat: ${item['Fat (g)'] || 'N/A'}g | Category: ${item['Category'] || 'N/A'}`;
}

/**
 * Format calories dataset item for prompt
 */
function formatCaloriesItem(item) {
  return `- ${item['FoodItem'] || 'N/A'}: ${item['Cals_per100grams'] || 'N/A'} | Category: ${item['FoodCategory'] || 'N/A'}`;
}

/**
 * Get dataset context for meals to include in Gemini prompt
 */
function getDatasetContextForMeals(entries) {
  if (!entries || !entries.length) return '';

  const allMatches = {
    nutrition: [],
    calories: [],
  };

  // Search for each meal entry
  entries.forEach(entry => {
    const foodDescription = entry.userFoodIntake || entry.description || '';
    if (!foodDescription) return;

    const matches = searchDatasets(foodDescription);
    allMatches.nutrition.push(...matches.nutrition);
    allMatches.calories.push(...matches.calories);
  });

  // Remove duplicates based on food item name
  const uniqueNutrition = Array.from(
    new Map(allMatches.nutrition.map(item => [item['Food_Item'], item])).values()
  );
  const uniqueCalories = Array.from(
    new Map(allMatches.calories.map(item => [item['FoodItem'], item])).values()
  );

  if (!uniqueNutrition.length && !uniqueCalories.length) {
    return '';
  }

  let context = '\n\nReference Dataset Information (for accurate calorie estimation):\n';
  
  if (uniqueNutrition.length) {
    context += '\nDetailed Nutrition Data:\n';
    uniqueNutrition.forEach(item => {
      context += formatNutritionItem(item) + '\n';
    });
  }

  if (uniqueCalories.length) {
    context += '\nCalorie Reference Data (per 100g):\n';
    uniqueCalories.forEach(item => {
      context += formatCaloriesItem(item) + '\n';
    });
  }

  return context;
}

// Preload datasets on module load
loadNutritionDataset();
loadCaloriesDataset();

module.exports = {
  loadNutritionDataset,
  loadCaloriesDataset,
  searchDatasets,
  getDatasetContextForMeals,
};

