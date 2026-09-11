'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Episodes', [
      {
        title: 'Выпуск 1: Введение в Web-разработку',
        podcastName: 'IT Шум',
        durationMinutes: 45,
        audioUrl: 'https://example.com/audio/ep1.mp3',
        playsCount: 150,
        description: 'Обсуждаем основы HTML, CSS, JavaScript и серверной разработки.',
        isExplicit: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Выпуск 2: Пока не поздно',
        podcastName: 'IT Шум',
        durationMinutes: 60,
        audioUrl: 'https://example.com/audio/ep2.mp3',
        playsCount: 89,
        description: 'Разбираем архитектуру Express, middleware и шаблонизаторы.',
        isExplicit: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Episodes', null, {});
  }
};