require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken"); // <-- Переверьте наличие этой строки вверху server.js
// Импортируем модели Sequelize
const { Episode, Subscription, User, sequelize } = require("./models");

// Импортируем маршруты аутентификации и middleware защиты
const authRoutes = require("./routes/auth");
const { authenticateToken, isAdmin } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const logFilePath = path.join(__dirname, "server.log");

// Настройка шаблонизатора EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Раздача статических файлов
app.use(express.static(path.join(__dirname, "public")));

// Встроенные middleware для парсинга JSON и URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

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

// ==========================================
// КАСТОМНЫЕ MIDDLEWARE
// ==========================================

// 1. Логирующее middleware
app.use((req, res, next) => {
  const now = new Date().toISOString();
  const eventType = "REQUEST";
  const logMessage = `[${now}] [${eventType}] ${req.method} ${req.url}\n`;

  fs.appendFile(logFilePath, logMessage, "utf8", (err) => {
    if (err) console.error("Ошибка при записи лога:", err);
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

// Protected Profile Endpoint
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
app.get("/add", (req, res) => {
  // 1. Если пользователь гость (не вошел)
  if (!req.user || req.user.role === "guest") {
    return res.status(401).send("Для доступа к этой странице необходимо авторизоваться.");
  }

  // 2. Если вошел обычный пользователь, но не админ
  if (req.user.role !== "admin") {
    return res.status(403).send("Отказ в доступе: требуются права администратора.");
  }

  // 3. Если это администратор — рендерим форму
  res.render("add", {
    title: "Добавить новый эпизод",
    user: req.user,
  });
});

// POST /add -> Обработка формы
app.post("/add", async (req, res, next) => {
  try {
    const { title, podcastName, durationMinutes, audioUrl, description, isExplicit } = req.body;

    await Episode.create({
      title: title || "Без названия",
      podcastName: podcastName || "Неизвестный подкаст",
      durationMinutes: Number(durationMinutes) || 0,
      audioUrl: audioUrl || "",
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
      return next(); // Переход к 404
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
// REST API МАРШРУТЫ (Эпизоды)
// ==========================================

// READ ALL
app.get("/episodes", async (req, res, next) => {
  try {
    const episodes = await Episode.findAll({ order: [["id", "ASC"]] });
    res.json(episodes);
  } catch (err) {
    next(err);
  }
});

// READ ONE
app.get("/episodes/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const episode = await Episode.findByPk(id);

    if (!episode) {
      return res.status(404).json({ error: "Эпизод с указанным ID не найден" });
    }

    res.json(episode);
  } catch (err) {
    next(err);
  }
});

// CREATE (Защищено: Admin)
app.post("/episodes", authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const { title, podcastName, durationMinutes, audioUrl, description, isExplicit } = req.body;

    if (!title || !podcastName || !durationMinutes || !audioUrl) {
      return res.status(400).json({
        error: "Обязательные поля: title, podcastName, durationMinutes, audioUrl",
      });
    }

    const newEpisode = await Episode.create({
      title,
      podcastName,
      durationMinutes: Number(durationMinutes),
      audioUrl,
      playsCount: 0,
      description: description || "Добавлено через REST API",
      isExplicit: Boolean(isExplicit),
    });

    res.status(201).json(newEpisode);
  } catch (err) {
    next(err);
  }
});

// UPDATE (Защищено: Admin)
app.put("/episodes/:id", authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, podcastName, durationMinutes, audioUrl, description, isExplicit } = req.body;

    const episode = await Episode.findByPk(id);
    if (!episode) {
      return res.status(404).json({ error: "Эпизод для обновления не найден" });
    }

    if (!title || !podcastName || !durationMinutes || !audioUrl) {
      return res.status(400).json({
        error: "Все поля (title, podcastName, durationMinutes, audioUrl) обязательны для обновления",
      });
    }

    await episode.update({
      title,
      podcastName,
      durationMinutes: Number(durationMinutes),
      audioUrl,
      description: description !== undefined ? description : episode.description,
      isExplicit: isExplicit !== undefined ? Boolean(isExplicit) : episode.isExplicit,
    });

    res.json(episode);
  } catch (err) {
    next(err);
  }
});

// DELETE (Защищено: Admin)
app.delete("/episodes/:id", authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const episode = await Episode.findByPk(id);

    if (!episode) {
      return res.status(404).json({ error: "Эпизод для удаления не найден" });
    }

    await episode.destroy();
    res.json({ message: "Эпизод успешно удален", episode });
  } catch (err) {
    next(err);
  }
});

// Увеличение счетчика прослушиваний
app.post("/episodes/:id/listen", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const episode = await Episode.findByPk(id);

    if (!episode) {
      return res.status(404).json({ error: "Эпизод не найден" });
    }

    await episode.increment("playsCount", { by: 1 });
    await episode.reload();

    res.json({ message: "Воспроизведение начато", playsCount: episode.playsCount });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// REST API МАРШРУТЫ (Подписки)
// ==========================================

// READ ALL SUBSCRIPTIONS
app.get("/subscriptions", async (req, res, next) => {
  try {
    const subscriptions = await Subscription.findAll({ order: [["id", "ASC"]] });
    res.json(subscriptions);
  } catch (err) {
    next(err);
  }
});

// CREATE SUBSCRIPTION (Защищено: Авторизованные пользователи)
app.post("/subscriptions", authenticateToken, async (req, res, next) => {
  try {
    const { podcastName } = req.body;

    if (!podcastName) {
      return res.status(400).json({ error: "Укажите название подкаста (podcastName)" });
    }

    const newSub = await Subscription.create({
      podcastName,
      subscribedAt: new Date(),
    });

    res.status(201).json(newSub);
  } catch (err) {
    next(err);
  }
});

// DELETE SUBSCRIPTION (Защищено: Авторизованные пользователи)
app.delete("/subscriptions/:id", authenticateToken, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const sub = await Subscription.findByPk(id);

    if (!sub) {
      return res.status(404).json({ error: "Подписка не найдена" });
    }

    await sub.destroy();
    res.json({ message: "Подписка успешно удалена", subscription: sub });
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