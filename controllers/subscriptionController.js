const { Subscription, Podcast } = require('../models');

// Получить подписки (пользователь — свои, админ — все)
exports.getSubscriptions = async (req, res, next) => {
  try {
    const whereClause = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const subscriptions = await Subscription.findAll({
      where: whereClause,
      include: Podcast
    });
    res.json(subscriptions);
  } catch (err) {
    next(err);
  }
};

// Получить подписку по ID
exports.getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id, { include: Podcast });
    if (!subscription) return res.status(404).json({ error: "Подписка не найдена" });
    
    // Проверка прав (если не админ и не своя подписка)
    if (req.user.role !== 'admin' && subscription.userId !== req.user.id) {
      return res.status(403.403).json({ error: "Доступ запрещен" });
    }

    res.json(subscription);
  } catch (err) {
    next(err);
  }
};

// Оформить подписку
exports.createSubscription = async (req, res, next) => {
  try {
    const { podcastId } = req.body;
    const [subscription, created] = await Subscription.findOrCreate({
      where: { userId: req.user.id, podcastId },
      include: Podcast
    });
    
    // Перезагружаем для подгрузки ассоциации Podcast
    await subscription.reload({ include: Podcast });
    res.status(201).json(subscription);
  } catch (err) {
    next(err);
  }
};

// Удалить подписку
exports.deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) return res.status(404).json({ error: "Подписка не найдена" });

    const subData = { id: subscription.id, userId: subscription.userId, podcastId: subscription.podcastId };
    await subscription.destroy();
    
    res.json({ message: "Подписка успешно удалена", subscription: subData });
  } catch (err) {
    next(err);
  }
};

// Полное обновление подписки (PUT /subscriptions/:id)
exports.updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) return res.status(404).json({ error: "Подписка не найдена" });

    const { podcastId } = req.body;
    await subscription.update({ podcastId });
    await subscription.reload({ include: Podcast });

    res.json(subscription);
  } catch (err) {
    next(err);
  }
};

// Частичное обновление подписки (PATCH /subscriptions/:id)
exports.patchSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) return res.status(404).json({ error: "Подписка не найдена" });

    await subscription.update(req.body);
    await subscription.reload({ include: Podcast });

    res.json(subscription);
  } catch (err) {
    next(err);
  }
};