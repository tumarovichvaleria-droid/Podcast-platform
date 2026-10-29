
require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cors = require('cors'); 
const cookieParser = require("cookie-parser"); 
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_ERROR_CODES = require('./logErrors');
const logFilePath = path.join(__dirname, "server.log");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




const { Episode, Subscription, User, sequelize } = require("./models");
const authRoutes = require("./routes/auth");
const { authenticateToken, isAdmin, requireAdminEJS } = require("./middleware/auth");
const { errorHandler } = require("./middleware/errors");




// 1. Импортируем роутер эпизодов
const episodesRoutes = require("./routes/episodesRoutes");
const subscriptionsRoutes = require("./routes/subscriptionsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const podcastsRoutes = require("./routes/podcastsRoutes");


// 2. Подключаем его с префиксом "/episodes"
app.use("/episodes", episodesRoutes);
app.use("/subscriptions", subscriptionsRoutes);
app.use("/users", usersRoutes);
app.use("/podcasts", podcastsRoutes);

app.use('/api/mongo/podcasts', require('./routes/podcastMongoRoutes'));





// Настройка шаблонизатора EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Раздача статических файлов
app.use(express.static(path.join(__dirname, "public")));


// Мидлвар для автоматического извлечения пользователя из куки для EJS
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_podcast_platform_2026', (err, decoded) => {
      if (!err) {
        req.user = decoded;
      } else {
        req.user = { name: "Гость", role: "guest" };
      }
      next();
    });
  } else {
    req.user = { name: "Гость", role: "guest" };
    next();
  }
});

app.use(errorHandler);
app.get("/cause-error", (req, res, next) => {
  next(new Error("Тестовая системная ошибка приложения"));
});

// ==========================================
// КАСТОМНЫЕ MIDDLEWARE
// ==========================================
let logFileUnavailable = false; // Флаг аварийного режима


// Middleware проверки аварийного режима (ставим самым первым)
app.use((req, res, next) => {
  if (logFileUnavailable) {
    const message = 'Сервис временно недоступен: критическая ошибка системного журнала.';
    
    // Если запрос идет к API (например, /api/... или ожидает JSON)
    if (req.path.startsWith('/api') || req.headers['content-type'] === 'application/json') {
      return res.status(503).json({ error: message });
    }
    
    // Иначе рендерим страницу ошибки для браузера
    return res.status(503).render('500', { 
      title: 'Ошибка сервера',
      error: message,
      user: req.user || null 
    });
  }
  next();
});

// Основное middleware логирования
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const eventType = "REQUEST";
  const logMessage = `[${now}] [${eventType}] ${req.method} ${req.url}\n`;

  fs.appendFile(logFilePath, logMessage, "utf8", (err) => {
    if (err) {
      logFileUnavailable = true; // Активируем аварийный режим!
      
      let customError;
      const genericMessage = "Ошибка записи системного журнала";

      switch (err.code) {
        case 'EISDIR':
          customError = { code: LOG_ERROR_CODES.DIR_IS_FILE.code, message: genericMessage };
          break;
        case 'EACCES':
          customError = { code: LOG_ERROR_CODES.NO_PERMISSION.code, message: genericMessage };
          break;
        default:
          customError = { code: LOG_ERROR_CODES.UNKNOWN.code, message: genericMessage };
          break;
      }

      console.error(`[SECURITY LOG] Код: ${customError.code} | Статус: ${customError.message}`);
    }
  });

  console.log(logMessage.trim());
  next();
});


// 2. Инициализация пользователя для EJS-шаблонов по умолчанию
app.use((req, res, next) => {
  req.user = req.user || { name: "Гость", role: "guest" };
  next();
});

// ==========================================
// МАРШРУТЫ АУТЕНТИФИКАЦИИ
// ==========================================

app.use("/auth", authRoutes);


app.get("/profile", authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "email", "role", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json({
      message: "Данные профиля успешно получены",
      user,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// МАРШРУТЫ EJS (Веб-интерфейс)
// ==========================================

// GET / -> Главная страница
app.get("/", async (req, res, next) => {
  try {
    const episodes = await Episode.findAll({ order: [["id", "ASC"]] });
    res.render("index", {
      title: "Платформа подкастов — Главная",
      episodes,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

// GET /login -> Страница входа
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Авторизация",
    user: req.user,
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

// GET /add -> Форма добавления (только для авторизованных администраторов)
app.get("/add", requireAdminEJS, (req, res) => {
  res.render("add", {
    title: "Добавить новый эпизод",
    user: req.user,
    error: null, 
  });
});

app.post("/add", requireAdminEJS, async (req, res, next) => {
  try {
    let { title, podcastName, durationMinutes, audioUrl, description, isExplicit } = req.body;

    // 1. Очищаем от пробелов по краям (.trim)
    title = title ? title.trim() : "";
    podcastName = podcastName ? podcastName.trim() : "";
    audioUrl = audioUrl ? audioUrl.trim() : "";
    description = description ? description.trim() : "";

    const duration = Number(durationMinutes);

    // 2. Проверка Названия (от 1 до 50 символов)
    if (!title || title.length > 50) {
      return res.status(400).render("add", {
        title: "Добавить новый эпизод",
        user: req.user,
        error: "Название эпизода обязательно и должно содержать не более 50 символов.",
      });
    }

    // 3. Проверка Подкаста (от 1 до 50 символов)
    if (!podcastName || podcastName.length > 50) {
      return res.status(400).render("add", {
        title: "Добавить новый эпизод",
        user: req.user,
        error: "Название подкаста обязательно и должно содержать не более 50 символов.",
      });
    }

    // 4. Проверка Ссылки на аудио (audioUrl, от 1 до 50 символов)
if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.trim() || audioUrl.trim().length > 70) {
  return res.status(400).render("add", {
    title: "Добавить новый эпизод",
    user: req.user,
    error: "Ссылка на аудиофайл обязательна и не должна превышать 50 символов.",
  });
}
    // 4. Проверка Описания (до 50 символов)
    if (description && description.length > 50) {
      return res.status(400).render("add", {
        title: "Добавить новый эпизод",
        user: req.user,
        error: "Описание не должно превышать 50 символов.",
      });
    }

    // 5. Проверка Отрицательных чисел и нуля
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).render("add", {
        title: "Добавить новый эпизод",
        user: req.user,
        error: "Длительность должна быть целым положительным числом больше 0.",
      });
    }

    // 6. Сохраняем проверенные данные
    await Episode.create({
      title,
      podcastName,
      durationMinutes: duration,
      audioUrl,
      playsCount: 0,
      description: description || "Описание отсутствует.",
      isExplicit: isExplicit === "on" || isExplicit === true,
    });

    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

// GET /item/:id -> Просмотр отдельного эпизода
app.get("/item/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const episode = await Episode.findByPk(id);

    if (!episode) {
      return next(); 
    }

    res.render("item", {
      title: `Эпизод: ${episode.title}`,
      episode,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});





// ==========================================
// УМНАЯ ОБРАБОТКА 404 И 500 (API vs HTML)
// ==========================================

// 404 Handler
app.use((req, res) => {
  // Если запрос отправлен к API или ожидает JSON — возвращаем JSON 404
  if (
    req.originalUrl.startsWith("/auth") ||
    req.originalUrl.startsWith("/episodes") ||
    req.originalUrl.startsWith("/subscriptions") ||
    req.originalUrl.startsWith("/profile") ||
    req.headers["content-type"] === "application/json"
  ) {
    return res.status(404).json({ error: "Запрашиваемый API-эндпоинт не найден (404)" });
  }

  // Для обычных браузерных страниц рендерим EJS-шаблон
  res.status(404).render("404", {
    title: "Страница не найдена",
    user: req.user,
    url: req.originalUrl,
  });
});



// 500 Handler (Критическая ошибка)
app.use((err, req, res, next) => {
  console.error("Критическая ошибка:", err.stack);

  if (
    req.originalUrl.startsWith("/auth") ||
    req.originalUrl.startsWith("/episodes") ||
    req.originalUrl.startsWith("/subscriptions") ||
    req.originalUrl.startsWith("/profile") ||
    req.headers["content-type"] === "application/json"
  ) {
    return res.status(500).json({ error: "Внутренняя ошибка сервера", details: err.message });
  }

  res.status(500).render("500", {
    title: "Ошибка сервера",
    user: req.user,
    error: err.message,
  });
});





// ==========================================
// ЗАПУСК СЕРВЕРА
// ==========================================

async function startServer() {
  try {
    // 1. Запускаем локальный сервер MongoDB в памяти
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
// ВЫВОДИМ ССЫЛКУ ДЛЯ COMPASS В КОНСОЛЬ
    console.log("🔗 Ссылка для подключения в Compass:", mongoUri);
    // 2. Подключаем Mongoose к локальной базе
    await mongoose.connect(mongoUri);
    console.log("🍃 Локальная MongoDB успешно подключена (In-Memory).");

    await sequelize.authenticate();
    console.log("Соединение с БД PostgreSQL успешно установлено.");

    app.listen(PORT, () => {
      console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Не удалось подключиться к базе данных:", error);
  }
}

startServer();
