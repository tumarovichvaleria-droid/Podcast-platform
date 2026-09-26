const jwt = require('jsonwebtoken');

// 1. Middleware проверки JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Доступ запрещен: отсутствует токен авторизации' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_podcast_platform_2026', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный или истекший токен' });
    }
    req.user = decoded;
    next();
  });
};

// 2. Middleware проверки прав Администратора
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Отказ в доступе: требуются права администратора' });
  }
};

// ОБЯЗАТЕЛЬНО: Проверьте эту строку экспорта!
module.exports = { authenticateToken, isAdmin };