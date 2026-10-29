const { Op } = require("sequelize");
const { Podcast, Episode, sequelize  } = require("../models");

// Вспомогательные функции
const parseAndValidateId = (idParam) => {
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0) return null;
  return id;
};


// GET /podcasts — возвращает подкасты с подсчетом количества эпизодов
exports.getAllPodcasts = async (req, res, next) => {
  try {
    const podcasts = await Podcast.findAll({
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("episodes.id")),
            "episodesCount"
          ]
        ]
      },
      include: [
        {
          model: Episode,
          as: "episodes",
          attributes: [] // Не подтягиваем сами эпизоды, только считаем их
        }
      ],
      group: ["Podcast.id"],
      order: [["id", "ASC"]]
    });

    res.json(podcasts);
  } catch (err) {
    next(err);
  }
};

// GET /podcasts/:id
exports.getPodcastById = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID подкаста" });
    }

    const podcast = await Podcast.findByPk(id, {
      include: [{ model: Episode, as: "episodes" }] // Подтягиваем связанные эпизоды
    });

    if (!podcast) {
      return res.status(404).json({ error: "Подкаст с указанным ID не найден" });
    }

    res.json(podcast);
  } catch (err) {
    next(err);
  }
};

// POST /podcasts
exports.createPodcast = async (req, res, next) => {
  try {
    const { title, description, coverUrl, author } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Поле title обязательно и должно быть непустой строкой" });
    }

    const trimmedTitle = title.trim();

    // 🛑 ПРОВЕРКА: существует ли уже подкаст с таким названием
    const existingPodcast = await Podcast.findOne({
      where: {
        title: { [Op.iLike]: trimmedTitle }
      }
    });

    if (existingPodcast) {
      return res.status(409).json({ error: "Подкаст с таким названием уже существует" });
    }

    let cleanDescription = "Описание отсутствует";
    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ error: "Поле description должно быть строкой" });
      }
      cleanDescription = description.trim() || cleanDescription;
    }

    let cleanCoverUrl = null;
    if (coverUrl !== undefined && coverUrl !== null) {
      if (typeof coverUrl !== "string") {
        return res.status(400).json({ error: "Поле coverUrl должно быть строкой" });
      }
      cleanCoverUrl = coverUrl.trim() || null;
    }

    let cleanAuthor = null;
    if (author !== undefined && author !== null) {
      if (typeof author !== "string") {
        return res.status(400).json({ error: "Поле author должно быть строкой" });
      }
      cleanAuthor = author.trim() || null;
    }

    const newPodcast = await Podcast.create({
      title: trimmedTitle,
      description: cleanDescription,
      coverUrl: cleanCoverUrl,
      author: cleanAuthor,
    });

    res.status(201).json(newPodcast);
  } catch (err) {
    next(err);
  }
};

// PUT /podcasts/:id
exports.updatePodcast = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID подкаста" });
    }

    const podcast = await Podcast.findByPk(id);
    if (!podcast) {
      return res.status(404).json({ error: "Подкаст для обновления не найден" });
    }

    const { title, description, coverUrl, author } = req.body;

    // Валидация всех полей при PUT
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Поле title обязательно и должно быть непустой строкой" });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ error: "Поле description должно быть строкой" });
    }

    if (coverUrl !== undefined && coverUrl !== null && typeof coverUrl !== "string") {
      return res.status(400).json({ error: "Поле coverUrl должно быть строкой" });
    }

    if (author !== undefined && author !== null && typeof author !== "string") {
      return res.status(400).json({ error: "Поле author должно быть строкой" });
    }

    await podcast.update({
      title: title.trim(),
      description: description !== undefined ? description.trim() : podcast.description,
      coverUrl: coverUrl !== undefined ? (coverUrl ? coverUrl.trim() : null) : podcast.coverUrl,
      author: author !== undefined ? (author ? author.trim() : null) : podcast.author,
    });

    res.json(podcast);
  } catch (err) {
    next(err);
  }
};

// PATCH /podcasts/:id
exports.patchPodcast = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID подкаста" });
    }

    const podcast = await Podcast.findByPk(id);
    if (!podcast) {
      return res.status(404).json({ error: "Подкаст для обновления не найден" });
    }

    const { title, description, coverUrl, author } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "Поле title должно быть непустой строкой" });
      }
      podcast.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        return res.status(400).json({ error: "Поле description должно быть строкой" });
      }
      podcast.description = description.trim();
    }

    if (coverUrl !== undefined) {
      if (coverUrl !== null && typeof coverUrl !== "string") {
        return res.status(400).json({ error: "Поле coverUrl должно быть строкой или null" });
      }
      podcast.coverUrl = coverUrl ? coverUrl.trim() : null;
    }

    if (author !== undefined) {
      if (author !== null && typeof author !== "string") {
        return res.status(400).json({ error: "Поле author должно быть строкой или null" });
      }
      podcast.author = author ? author.trim() : null;
    }

    await podcast.save();
    res.json(podcast);
  } catch (err) {
    next(err);
  }
};

// DELETE /podcasts/:id
exports.deletePodcast = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID подкаста" });
    }

    const podcast = await Podcast.findByPk(id);
    if (!podcast) {
      return res.status(404).json({ error: "Подкаст для удаления не найден" });
    }

    await podcast.destroy();
    res.json({ message: "Подкаст успешно удален", podcast });
  } catch (err) {
    next(err);
  }
};