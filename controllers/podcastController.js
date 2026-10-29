const { Podcast, Episode } = require('../models');

// Получить список всех подкастов
exports.getAllPodcasts = async (req, res, next) => {
  try {
    const podcasts = await Podcast.findAll();
    res.json(podcasts);
  } catch (err) {
    next(err);
  }
};

// Получить подкаст по ID со всеми его эпизодами
exports.getPodcastById = async (req, res, next) => {
  try {
    const podcast = await Podcast.findByPk(req.params.id, {
      include: Episode
    });
    if (!podcast) {
      return res.status(404).json({ error: "Подкаст не найден" });
    }
    res.json(podcast);
  } catch (err) {
    next(err);
  }
};

// Создать новый подкаст
exports.createPodcast = async (req, res, next) => {
  try {
    const { title, description, author, coverUrl } = req.body;
    const podcast = await Podcast.create({ title, description, author, coverUrl });
    res.status(201).json(podcast);
  } catch (err) {
    next(err);
  }
};

// Полное обновление подкаста (PUT)
exports.updatePodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.findByPk(req.params.id);
    if (!podcast) return res.status(404).json({ error: "Подкаст не найден" });

    const { title, description, author, coverUrl } = req.body;
    await podcast.update({ title, description, author, coverUrl });
    res.json(podcast);
  } catch (err) {
    next(err);
  }
};

// Частичное обновление подкаста (PATCH)
exports.patchPodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.findByPk(req.params.id);
    if (!podcast) return res.status(404).json({ error: "Подкаст не найден" });

    await podcast.update(req.body);
    res.json(podcast);
  } catch (err) {
    next(err);
  }
};

// Удаление подкаста
exports.deletePodcast = async (req, res, next) => {
  try {
    const podcast = await Podcast.findByPk(req.params.id);
    if (!podcast) return res.status(404).json({ error: "Подкаст не найден" });

    const podcastId = podcast.id;
    await podcast.destroy();
    res.json({ message: "Подкаст успешно удален", podcast: { id: podcastId } });
  } catch (err) {
    next(err);
  }
};