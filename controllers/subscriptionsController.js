const { Subscription, Podcast, User } = require("../models");

// Вспомогательная функция валидации ID
const parseAndValidateId = (idParam) => {
  const id = parseInt(idParam, 10);
  if (isNaN(id) || id <= 0) return null;
  return id;
};

// GET /subscriptions
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const whereCondition = {};

    // Обычный пользователь видит только свои подписки, админ — все
    if (req.user && req.user.role !== "admin") {
      whereCondition.userId = req.user.id;
    }

    const subscriptions = await Subscription.findAll({
      where: whereCondition,
      include: [
        { model: Podcast, as: "podcast" },
        ...(req.user && req.user.role === "admin"
          ? [{ model: User, as: "user", attributes: ["id", "email"] }]
          : []),
      ],
      order: [["id", "ASC"]],
    });

    res.status(200).json(subscriptions);
  } catch (err) {
    next(err);
  }
};

// GET /subscriptions/:id
exports.getSubscriptionById = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID подписки" });
    }

    const sub = await Subscription.findByPk(id, {
      include: [{ model: Podcast, as: "podcast" }],
    });

    if (!sub) {
      return res.status(404).json({ error: "Подписка не найдена" });
    }

    // Проверка доступа: пользователь может смотреть только свою подписку
    if (req.user.role !== "admin" && sub.userId !== req.user.id) {
      return res.status(403).json({ error: "Доступ запрещен" });
    }

    res.status(200).json(sub);
  } catch (err) {
    next(err);
  }
};

// POST /subscriptions
exports.createSubscription = async (req, res, next) => {
  try {
    const { podcastId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }

    const parsedPodcastId = parseInt(podcastId, 10);
    if (!parsedPodcastId || isNaN(parsedPodcastId)) {
      return res.status(400).json({ error: "Укажите корректный podcastId" });
    }

    // 1. Проверяем, существует ли подкаст
    const podcast = await Podcast.findByPk(parsedPodcastId);
    if (!podcast) {
      return res.status(404).json({ error: "Подкаст с указанным ID не найден" });
    }

    // 2. Ищем, нет ли уже такой подписки
    const existingSub = await Subscription.findOne({
      where: {
        userId,
        podcastId: parsedPodcastId,
      },
    });

    // 🛑 Возвращаем ошибку, если подписка уже существует
    if (existingSub) {
      return res.status(409).json({ error: "Вы уже подписаны на этот подкаст" });
    }

    // 3. Создаем новую подписку
    const sub = await Subscription.create({
      userId,
      podcastId: parsedPodcastId,
      subscribedAt: new Date(),
    });

    // 4. Подгружаем данные подкаста для ответа
    const result = await Subscription.findByPk(sub.id, {
      include: [{ model: Podcast, as: "podcast" }],
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// PUT /subscriptions/:id
exports.updateSubscription = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID подписки" });
    }

    const sub = await Subscription.findByPk(id);
    if (!sub) {
      return res.status(404).json({ error: "Подписка не найдена" });
    }

    if (req.user.role !== "admin" && sub.userId !== req.user.id) {
      return res.status(403).json({ error: "Доступ запрещен" });
    }

    const { podcastId } = req.body;
    const parsedPodcastId = parseInt(podcastId, 10);
    if (!parsedPodcastId || isNaN(parsedPodcastId)) {
      return res.status(400).json({ error: "Некорректный ID подкаста" });
    }

    const podcast = await Podcast.findByPk(parsedPodcastId);
    if (!podcast) {
      return res.status(404).json({ error: "Подкаст не найден" });
    }

    await sub.update({ podcastId: parsedPodcastId });

    const updatedSub = await Subscription.findByPk(sub.id, {
      include: [{ model: Podcast, as: "podcast" }],
    });

    res.status(200).json(updatedSub);
  } catch (err) {
    next(err);
  }
};

// PATCH /subscriptions/:id
exports.patchSubscription = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID подписки" });
    }

    const sub = await Subscription.findByPk(id);
    if (!sub) {
      return res.status(404).json({ error: "Подписка не найдена" });
    }

    if (req.user.role !== "admin" && sub.userId !== req.user.id) {
      return res.status(403).json({ error: "Доступ запрещен" });
    }

    const { podcastId } = req.body;

    if (podcastId !== undefined) {
      const parsedPodcastId = parseInt(podcastId, 10);
      if (!parsedPodcastId || isNaN(parsedPodcastId)) {
        return res.status(400).json({ error: "Некорректный ID подкаста" });
      }

      const podcast = await Podcast.findByPk(parsedPodcastId);
      if (!podcast) {
        return res.status(404).json({ error: "Подкаст не найден" });
      }

      sub.podcastId = parsedPodcastId;
      await sub.save();
    }

    const updatedSub = await Subscription.findByPk(sub.id, {
      include: [{ model: Podcast, as: "podcast" }],
    });

    res.status(200).json(updatedSub);
  } catch (err) {
    next(err);
  }
};

// DELETE /subscriptions/:id
exports.deleteSubscription = async (req, res, next) => {
  try {
    const id = parseAndValidateId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Некорректный ID подписки" });
    }

    const sub = await Subscription.findByPk(id);
    if (!sub) {
      return res.status(404).json({ error: "Подписка не найдена" });
    }

    if (req.user.role !== "admin" && sub.userId !== req.user.id) {
      return res.status(403).json({ error: "Доступ запрещен" });
    }

    await sub.destroy();
    res.status(200).json({ message: "Подписка успешно удалена", subscription: sub });
  } catch (err) {
    next(err);
  }
};