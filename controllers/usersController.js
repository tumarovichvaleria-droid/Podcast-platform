const { User } = require("../models");
const bcrypt = require("bcrypt"); // Или использовать ваш модуль хэширования

// Вспомогательная функция валидации ID
const parseAndValidateId = (idParam) => {
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0) return null;
  return id;
};

// GET /users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "role", "createdAt"],
      order: [["id", "ASC"]],
    });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

// GET /users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID пользователя" });
    }

    const user = await User.findByPk(id, {
      attributes: ["id", "email", "role", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// POST /users (Административное создание пользователя)
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const cleanEmail = email ? String(email).trim().toLowerCase() : "";

    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length > 50) {
      return res.status(400).json({ error: "Укажите корректный email (до 50 символов)" });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: "Пароль должен содержать минимум 6 символов" });
    }

    // 1. Проверяем, существует ли пользователь с таким email
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(409).json({ error: "Пользователь с таким email уже существует" });
    }

    // 2. Хэшируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await User.create({
      email: cleanEmail,
      passwordHash: hashedPassword,
      role: role ? String(role).trim() : "user",
    });

    res.status(201).json({ id: newUser.id, email: newUser.email, role: newUser.role });
  } catch (err) {
    next(err);
  }
};

// PUT /users/:id (Полное обновление)
exports.updateUser = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID пользователя" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const { email, password, role } = req.body;
    const cleanEmail = email ? String(email).trim() : "";

    if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length > 50) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const updateData = {
      email: cleanEmail,
      role: role ? String(role).trim() : user.role,
    };

    // Если передан новый пароль — хэшируем его
    if (password && String(password).length >= 6) {
      updateData.passwordHash = await bcrypt.hash(String(password), 10);
    }

    await user.update(updateData);
    res.status(200).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/:id (Частичное обновление)
exports.patchUser = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID пользователя" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const { email, password, role } = req.body;

    if (email !== undefined) {
      const cleanEmail = String(email).trim();
      if (!cleanEmail || !cleanEmail.includes("@") || cleanEmail.length > 50) {
        return res.status(400).json({ error: "Некорректный email" });
      }
      user.email = cleanEmail;
    }

    if (role !== undefined) {
      user.role = String(role).trim();
    }

    if (password !== undefined) {
      if (String(password).length < 6) {
        return res.status(400).json({ error: "Пароль должен быть не менее 6 символов" });
      }
      user.passwordHash = await bcrypt.hash(String(password), 10);
    }

    await user.save();
    res.status(200).json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID пользователя" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    await user.destroy();
    res.status(200).json({ message: "Пользователь удален", id });
  } catch (err) {
    next(err);
  }
};