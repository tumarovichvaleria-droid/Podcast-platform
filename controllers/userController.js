const { User } = require('../models');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    await user.destroy();
    res.json({ message: "Пользователь успешно удален" });
  } catch (err) {
    next(err);
  }
};

// Полное обновление данных пользователя (PUT /users/:id)
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const { email, password, role } = req.body;
    const updateData = { email, role };

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
};

// Частичное обновление данных пользователя (PATCH /users/:id)
exports.patchUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });

    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    await user.update(updateData);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    next(err);
  }
};