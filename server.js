const express = require('express');
const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Middleware для парсинга JSON в теле запроса
app.use(express.json());

// Временная база данных в памяти сервера
let episodes = [
  {
    id: 1,
    title: "Выпуск 1: Введение в Web-разработку",
    podcastName: "IT Шум",
    durationMinutes: 45,
    audioUrl: "https://example.com/audio/ep1.mp3",
    playsCount: 150
  },
  {
    id: 2,
    title: "Выпуск 2: Пока не поздно",
    podcastName: "IT Шум",
    durationMinutes: 60,
    audioUrl: "https://example.com/audio/ep2.mp3",
    playsCount: 89
  }
];

let subscriptions = [
  { id: 1, podcastName: "IT Шум", subscribedAt: "2026-03-01T10:00:00Z" }
];

let nextEpisodeId = 3;
let nextSubscriptionId = 2;

// ==========================================
// МАРШРУТЫ ДЛЯ ЭПИЗОДОВ (EPISODES)
// ==========================================

// GET /episodes — Получение списка всех эпизодов 
app.get('/episodes', (req, res) => {
  res.json(episodes);
});

// GET /episodes/:id — Получение одного эпизода по ID
app.get('/episodes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const episode = episodes.find(ep => ep.id === id);

  if (!episode) {
    return res.status(404).json({ error: "Эпизод с указанным ID не найден" });
  }

  res.json(episode);
});

// POST /episodes — Добавление нового эпизода (Загрузка эпизода)
app.post('/episodes', (req, res) => {
  const { title, podcastName, durationMinutes, audioUrl } = req.body;

  // Валидация входных данных
  if (!title || !podcastName || !durationMinutes || !audioUrl) {
    return res.status(400).json({ 
      error: "Обязательные поля: title, podcastName, durationMinutes, audioUrl" 
    });
  }

  const newEpisode = {
    id: nextEpisodeId++,
    title,
    podcastName,
    durationMinutes: Number(durationMinutes),
    audioUrl,
    playsCount: 0
  };

  episodes.push(newEpisode);
  res.status(201).json(newEpisode);
});

// PUT /episodes/:id — Полное обновление эпизода
app.put('/episodes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const episodeIndex = episodes.findIndex(ep => ep.id === id);

  if (episodeIndex === -1) {
    return res.status(404).json({ error: "Эпизод для обновления не найден" });
  }

  const { title, podcastName, durationMinutes, audioUrl } = req.body;

  if (!title || !podcastName || !durationMinutes || !audioUrl) {
    return res.status(400).json({ 
      error: "Все поля (title, podcastName, durationMinutes, audioUrl) обязательны для обновления" 
    });
  }

  episodes[episodeIndex] = {
    id,
    title,
    podcastName,
    durationMinutes: Number(durationMinutes),
    audioUrl,
    playsCount: episodes[episodeIndex].playsCount
  };

  res.json(episodes[episodeIndex]);
});

// DELETE /episodes/:id — Удаление эпизода
app.delete('/episodes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const episodeIndex = episodes.findIndex(ep => ep.id === id);

  if (episodeIndex === -1) {
    return res.status(404).json({ error: "Эпизод для удаления не найден" });
  }

  const deletedEpisode = episodes.splice(episodeIndex, 1);
  res.json({ message: "Эпизод успешно удален", episode: deletedEpisode[0] });
});

// POST /episodes/:id/listen — Имитация прослушивания эпизода (увеличение счетчика)
app.post('/episodes/:id/listen', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const episode = episodes.find(ep => ep.id === id);

  if (!episode) {
    return res.status(404).json({ error: "Эпизод не найден" });
  }

  episode.playsCount += 1;
  res.json({ message: "Воспроизведение начато", playsCount: episode.playsCount });
});

// ==========================================
// МАРШРУТЫ ДЛЯ ПОДПИСОК (SUBSCRIPTIONS)
// ==========================================

// GET /subscriptions — Список подписок пользователя
app.get('/subscriptions', (req, res) => {
  res.json(subscriptions);
});

// POST /subscriptions — Оформить подписку на подкаст
app.post('/subscriptions', (req, res) => {
  const { podcastName } = req.body;

  if (!podcastName) {
    return res.status(400).json({ error: "Укажите название подкаста (podcastName)" });
  }

  const newSub = {
    id: nextSubscriptionId++,
    podcastName,
    subscribedAt: new Date().toISOString()
  };

  subscriptions.push(newSub);
  res.status(201).json(newSub);
});

// ==========================================
// ОБРАБОТКА ОШИБОК
// ==========================================

// 404 для неизвестных маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Запрашиваемый эндпоинт не существует" });
});

// Глобальный обработчик ошибок (Error-handling middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

