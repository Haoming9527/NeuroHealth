const express = require('express');
const authMiddleware = require('./Auth.router');

const router = express.Router();

const {
  createCalorie,
  getAllCalories,
  updateCalorie,
  deleteCalorie,
  findCalorieByUserId,
  findCaloriesByUserIdAndDate,
  generateCalorie,
} = require('../models/Calorie.model');

// Public endpoint - no auth required
router.post('/generate', async (req, res, next) => {
  try {
    const { mealType, description, portion, notes } = req.body;
    
    if (!description) {
      return res.status(400).json({ message: 'Meal description is required.' });
    }

    const result = await generateCalorie({
      mealType,
      description,
      portion,
      notes,
    });
    
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
});

// All routes below require authentication
router.use(authMiddleware);

router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { userFoodIntake, aiEstimateCalories } = req.body;

    if (!userFoodIntake) {
      return res.status(400).json({ message: 'userFoodIntake is required.' });
    }

    const calorie = await createCalorie({
      userId,
      userFoodIntake,
      aiEstimateCalories,
    });

    return res.status(201).json(calorie);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const calories = await getAllCalories();
    return res.status(200).json(calories);
  } catch (error) {
    return next(error);
  }
});

router.get('/user', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const calories = await findCalorieByUserId(userId);
    return res.status(200).json(calories);
  } catch (error) {
    return next(error);
  }
});

router.get('/date', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'date query parameter is required.' });
    }

    const calories = await findCaloriesByUserIdAndDate(userId, date);
    return res.status(200).json(calories);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const calorie = await updateCalorie(Number.parseInt(id, 10), req.body);
    return res.status(200).json(calorie);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCalorie(Number.parseInt(id, 10));
    return res.status(200).json(deleted);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;