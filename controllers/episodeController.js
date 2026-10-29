const { Episode, Podcast } = require('../models');

// Получить все эпизоды (доступно всем)
exports.getAllEpisodes = async (req, res, next) => {
  try {
    const episodes = await Episode.findAll({ include: Podcast });
    res.json(episodes);
  } catch (err) {
    next(err);
  }
};

// Получить один эпизод по ID
exports.getEpisodeById = async (req, res, next) => {
  try {
    const episode = await Episode.findByPk(req.params.id, { include: Podcast });
    if (!episode) {
      return res.status(404).json({ error: "Эпизод не найден" });
    }
    res.json(episode);
  } catch (err) {
    next(err);
  }
};

// Создать эпизод (только для админа)
exports.createEpisode = async (req, res, next) => {
  try {
    const { title, podcastId, durationMinutes, audioUrl, description, isExplicit } = req.body;
    
    const newEpisode = await Episode.create({
      title,
      podcastId,
      durationMinutes,
      audioUrl,
      description,
      isExplicit: isExplicit || false,
    });

    res.status(201).json({ message: "Эпизод успешно создан", episode: newEpisode });
  } catch (err) {
    next(err);
  }
};

// Удалить эпизод (только для админа)
exports.deleteEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findByPk(req.params.id);
    if (!episode) {
      return res.status(404).json({ error: "Эпизод не найден" });
    }

    await episode.destroy();
    res.json({ message: "Эпизод успешно удален" });
  } catch (err) {
    next(err);
  }
};

// В controller/episodeController.js
exports.incrementListen = async (req, res, next) => {
  try {
    const episode = await Episode.findByPk(req.params.id);
    if (!episode) return res.status(404).json({ error: "Эпизод не найден" });

    episode.playsCount = (episode.playsCount || 0) + 1;
    await episode.save();

    res.json({
      message: "Воспроизведение начато",
      playsCount: episode.playsCount
    });
  } catch (err) {
    next(err);
  }
};

// Полное обновление данных эпизода (PUT /episodes/:id)
exports.updateEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findByPk(req.params.id);
    if (!episode) return res.status(404).json({ error: "Эпизод не найден" });

    const { title, podcastName, audioUrl, durationMinutes, playsCount, description, isExplicit } = req.body;
    await episode.update({ title, podcastName, audioUrl, durationMinutes, playsCount, description, isExplicit });

    res.json(episode);
  } catch (err) {
    next(err);
  }
};

// Частичное обновление данных эпизода (PATCH /episodes/:id)
exports.patchEpisode = async (req, res, next) => {
  try {
    const episode = await Episode.findByPk(req.params.id);
    if (!episode) return res.status(404).json({ error: "Эпизод не найден" });

    await episode.update(req.body);

    res.json(episode);
  } catch (err) {
    next(err);
  }
};