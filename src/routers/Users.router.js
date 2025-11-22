const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  findUserByEmail,
  sanitizeUser,
} = require('../models/User.model');

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

const generateToken = (user) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );

router.post('/', async (req, res, next) => {
  try {
    const { username, password, email, age, height, weight, BMI } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await createUser({
      username,
      password: hashedPassword,
      email,
      age,
      height,
      weight,
      BMI,
    });

    const token = generateToken(user);

    return res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Email already in use.' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = sanitizeUser(existingUser);
    const token = generateToken(user);

    return res.status(200).json({ user, token });
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const user = await updateUser(Number.parseInt(id, 10), data);
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await deleteUser(Number.parseInt(id, 10));
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

