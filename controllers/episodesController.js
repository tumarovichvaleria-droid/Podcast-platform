const { Episode, Podcast, Sequelize } = require("../models");
const { Op } = Sequelize;

// Вспомогательные функции
const parseBoolean = (val) => val === true || val === "true" || val === 1 || val === "1";

const parseAndValidateId = (idParam) => {
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0) return null;
  return id;
};

// GET /episodes
exports.getAllEpisodes = async (req, res, next) => {
  try {
    const episodes = await Episode.findAll({
      order: [["id", "ASC"]],
    });
    res.json(episodes);
  } catch (err) {
    next(err);
  }
};

// GET /episodes/:id
exports.getEpisodeById = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID эпизода" });
    }

    const episode = await Episode.findByPk(id, {
      include: [{ model: Podcast, as: "podcast" }],
    });

    if (!episode) {
      return res.status(404).json({ error: "Эпизод с указанным ID не найден" });
    }

    res.json(episode);
  } catch (err) {
    next(err);
  }
};

// POST /episodes
exports.createEpisode = async (req, res, next) => {
  try {
    const { title, podcastName, durationMinutes, audioUrl, description, isExplicit } = req.body;

    // 1. Валидация title
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Поле title обязательно и должно быть непустой строкой" });
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 50) {
      return res.status(400).json({ error: "Длина поля title не должна превышать 50 символов" });
    }

    // 2. Валидация podcastName
    if (!podcastName || typeof podcastName !== "string" || !podcastName.trim()) {
      return res.status(400).json({ error: "Поле podcastName обязательно и должно быть непустой строкой" });
    }
    const trimmedPodcastName = podcastName.trim();
    if (trimmedPodcastName.length > 50) {
      return res.status(400).json({ error: "Длина поля podcastName не должна превышать 50 символов" });
    }

    // 3. Валидация audioUrl
    if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.trim()) {
      return res.status(400).json({ error: "Поле audioUrl обязательно и должно быть непустой строкой" });
    }
    const trimmedAudioUrl = audioUrl.trim();
    if (trimmedAudioUrl.length > 50) {
      return res.status(400).json({ error: "Длина поля audioUrl не должна превышать 50 символов" });
    }

    // 4. Валидация durationMinutes
    const duration = Number(durationMinutes);
    if (durationMinutes === undefined || isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: "Поле durationMinutes обязательно и должно быть числом больше 0" });
    }

    // 5. Валидация description
    let cleanDescription = "Добавлено через REST API";
    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ error: "Поле description должно быть строкой" });
      }
      const trimmedDescription = description.trim();
      if (trimmedDescription.length > 100) {
        return res.status(400).json({ error: "Длина поля description не должна превышать 50 символов" });
      }
      cleanDescription = trimmedDescription || cleanDescription;
    }

    // Поиск или создание подкаста
    const [podcast] = await Podcast.findOrCreate({
      where: {
        title: { [Op.iLike]: trimmedPodcastName }
      },
      defaults: {
        title: trimmedPodcastName,
        description: "Автоматически созданный подкаст",
      }
    });

    // Проверка на дубликат эпизода
    const existingEpisode = await Episode.findOne({
      where: {
        podcastId: podcast.id,
        title: { [Op.iLike]: trimmedTitle }
      }
    });

    if (existingEpisode) {
      return res.status(409).json({ error: "Эпизод с таким названием уже существует в этом подкасте" });
    }

    // Создание нового эпизода
    const newEpisode = await Episode.create({
      title: trimmedTitle,
      podcastName: podcast.title,
      podcastId: podcast.id,
      durationMinutes: duration,
      audioUrl: trimmedAudioUrl,
      playsCount: 0,
      description: cleanDescription,
      isExplicit: parseBoolean(isExplicit),
    });

    res.status(201).json(newEpisode);
  } catch (err) {
    next(err);
  }
};

// PUT /episodes/:id
exports.updateEpisode = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID эпизода" });
    }

    const episode = await Episode.findByPk(id);
    if (!episode) {
      return res.status(404).json({ error: "Эпизод для обновления не найден" });
    }

    const { title, podcastName, durationMinutes, audioUrl, description, playsCount, isExplicit } = req.body;

    // Валидация полей
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Поле title обязательно и должно быть непустой строкой" });
    }
    if (!podcastName || typeof podcastName !== "string" || !podcastName.trim()) {
      return res.status(400).json({ error: "Поле podcastName обязательно и должно быть непустой строкой" });
    }
    if (!audioUrl || typeof audioUrl !== "string" || !audioUrl.trim()) {
      return res.status(400).json({ error: "Поле audioUrl обязательно и должно быть непустой строкой" });
    }

    const duration = Number(durationMinutes);
    if (durationMinutes === undefined || isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: "Поле durationMinutes должно быть числом больше 0" });
    }

    let plays = 0;
    if (playsCount !== undefined) {
      plays = Number(playsCount);
      if (isNaN(plays) || plays < 0) {
        return res.status(400).json({ error: "Поле playsCount должно быть неотрицательным числом" });
      }
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ error: "Поле description должно быть строкой" });
    }

    // Поиск без учета регистра через Op.iLike при полном обновлении
    const trimmedPodcastName = podcastName.trim();
    const [podcast] = await Podcast.findOrCreate({
      where: {
        title: { [Op.iLike]: trimmedPodcastName }
      },
      defaults: {
        title: trimmedPodcastName,
        description: "Автоматически созданный подкаст",
      }
    });

    await episode.update({
      title: title.trim(),
      podcastName: podcast.title,
      podcastId: podcast.id,
      durationMinutes: duration,
      audioUrl: audioUrl.trim(),
      description: description !== undefined ? description.trim() : episode.description,
      playsCount: plays,
      isExplicit: isExplicit !== undefined ? parseBoolean(isExplicit) : episode.isExplicit,
    });

    res.json(episode);
  } catch (err) {
    next(err);
  }
};

// PATCH /episodes/:id
exports.patchEpisode = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID эпизода" });
    }

    const episode = await Episode.findByPk(id);
    if (!episode) {
      return res.status(404).json({ error: "Эпизод для обновления не найден" });
    }

    const { title, podcastName, durationMinutes, audioUrl, description, playsCount, isExplicit } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Поле title должно быть непустой строкой" });
      }
      episode.title = title.trim();
    }

    // Поиск без учета регистра через Op.iLike при частичном обновлении имени подкаста
    if (podcastName !== undefined) {
      if (typeof podcastName !== "string" || !podcastName.trim()) {
        return res.status(400).json({ error: "Поле podcastName должно быть непустой строкой" });
      }
      
      const trimmedPodcastName = podcastName.trim();
      const [podcast] = await Podcast.findOrCreate({
        where: {
          title: { [Op.iLike]: trimmedPodcastName }
        },
        defaults: {
          title: trimmedPodcastName,
          description: "Автоматически созданный подкаст",
        }
      });
      
      episode.podcastName = podcast.title;
      episode.podcastId = podcast.id;
    }

    if (audioUrl !== undefined) {
      if (typeof audioUrl !== "string" || !audioUrl.trim()) {
        return res.status(400).json({ error: "Поле audioUrl должно быть непустой строкой" });
      }
      episode.audioUrl = audioUrl.trim();
    }

    if (durationMinutes !== undefined) {
      const duration = Number(durationMinutes);
      if (isNaN(duration) || duration <= 0) {
        return res.status(400).json({ error: "Поле durationMinutes должно быть числом больше 0" });
      }
      episode.durationMinutes = duration;
    }

    if (playsCount !== undefined) {
      const plays = Number(playsCount);
      if (isNaN(plays) || plays < 0) {
        return res.status(400).json({ error: "Поле playsCount должно быть неотрицательным числом" });
      }
      episode.playsCount = plays;
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ error: "Поле description должно быть строкой" });
      }
      episode.description = description.trim();
    }

    if (isExplicit !== undefined) {
      episode.isExplicit = parseBoolean(isExplicit);
    }

    await episode.save();
    res.json(episode);
  } catch (err) {
    next(err);
  }
};

// DELETE /episodes/:id
exports.deleteEpisode = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID эпизода" });
    }

    const episode = await Episode.findByPk(id);
    if (!episode) {
      return res.status(404).json({ error: "Эпизод для удаления не найден" });
    }

    await episode.destroy();
    res.json({ message: "Эпизод успешно удален", episode });
  } catch (err) {
    next(err);
  }
};

// POST /episodes/:id/listen
exports.listenEpisode = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID эпизода" });
    }

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
};