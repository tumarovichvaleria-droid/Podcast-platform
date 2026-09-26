const express = require('express'); 
const router = express.Router(); 
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const { User } = require('../models');

// ==========================================
// Регистрация (POST /auth/register)
// ==========================================
router.post('/register', async (req, res, next) => { 
  try { 
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Заполните поля email и password' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user'
    });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) { 
    next(err); 
  } 
});

// ==========================================
// Вход в систему (POST /auth/login) 
// ==========================================
router.post('/login', async (req, res, next) => { 
  try { 
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и password' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверка временной блокировки аккаунта
    if (user.lockUntil) {
      if (user.lockUntil > new Date()) {
        const remainingMinutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 1000 / 60);
        return res.status(403).json({
          error: `Аккаунт заблокирован из-за частых неудачных попыток входа. Попробуйте снова через ${remainingMinutes} мин.`
        });
      } else {
        // Если время блокировки истекло, сбрасываем счетчики
        await user.update({
          failedLoginAttempts: 0,
          lockUntil: null
        });
      }
    }
    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockUntil = user.lockUntil;

      // При достижении 5 неудачных попыток блокируем на 5 минут
      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 5 * 60 * 1000);
      }

      await user.update({
        failedLoginAttempts: attempts,
        lockUntil
      });

      if (attempts >= 5) {
        return res.status(403).json({
          error: 'Превышено количество попыток. Учетная запись заблокирована на 5 минут.'
        });
      }

      return res.status(401).json({
        error: `Неверный email или пароль. Осталось попыток до блокировки: ${5 - attempts}`
      });
    }

    // Успешный вход — сбрасываем счетчики ошибок
    await user.update({
      failedLoginAttempts: 0,
      lockUntil: null
    });

    // Генерация JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'super_secret_key_podcast_platform_2026',
      { expiresIn: '1h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000 // 1 час
    });

    res.json({
      message: 'Аутентификация прошла успешно',
      token
    });
  } catch (err) { 
    next(err); 
  } 
});

module.exports = router;