const express = require('express');
const router = express.Router();
const PodcastMongo = require('../models/PodcastMongo');


router.get('/', async (req, res, next) => {
  try {
    const podcasts = await PodcastMongo.find();
    res.json(podcasts);
  } catch (err) {
    next(err);
  }
});


router.get('/:id', async (req, res, next) => {
  try {
    const podcast = await PodcastMongo.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Подкаст не найден' });
    res.json(podcast);
  } catch (err) {
    next(err);
  }
});


router.post('/', async (req, res, next) => {
  try {
    const podcast = await PodcastMongo.create(req.body);
    res.status(201).json(podcast);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Подкаст с таким названием уже существует' });
    }
    next(err);
  }
});


router.put('/:id', async (req, res, next) => {
  try {
    const podcast = await PodcastMongo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!podcast) return res.status(404).json({ error: 'Подкаст не найден' });
    res.json(podcast);
  } catch (err) {
    next(err);
  }
});


router.delete('/:id', async (req, res, next) => {
  try {
    const podcast = await PodcastMongo.findByIdAndDelete(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Подкаст не найден' });
    res.json({ message: 'Подкаст успешно удален', podcast });
  } catch (err) {
    next(err);
  }
});


router.post('/:id/episodes', async (req, res, next) => {
  try {
    const podcast = await PodcastMongo.findById(req.params.id);
    if (!podcast) return res.status(404).json({ error: 'Подкаст не найден' });

    podcast.episodes.push(req.body);
    await podcast.save();

    res.status(201).json(podcast);
  } catch (err) {
    next(err);
  }
});


router.put('/:id/episodes/:episodeId/inc-plays', async (req, res, next) => {
  try {
    const podcast = await PodcastMongo.findOneAndUpdate(
      { _id: req.params.id, "episodes._id": req.params.episodeId },
      { $inc: { "episodes.$.playsCount": 1 } }, 
    );
    if (!podcast) return res.status(404).json({ error: 'Подкаст или выпуск не найден' });
    res.json(podcast);
  } catch (err) {
    next(err);
  }
});
module.exports = router;