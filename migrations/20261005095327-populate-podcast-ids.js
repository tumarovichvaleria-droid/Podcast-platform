'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const episodes = await queryInterface.sequelize.query(
      `SELECT id, "podcastName" FROM "Episodes" WHERE "podcastId" IS NULL AND "podcastName" IS NOT NULL;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const episode of episodes) {
      const name = episode.podcastName.trim();

      // Вставляем подкаст, если его еще нет
      await queryInterface.sequelize.query(
        `INSERT INTO "Podcasts" (title, "createdAt", "updatedAt") 
         VALUES (:name, NOW(), NOW()) 
         ON CONFLICT DO NOTHING;`,
        { replacements: { name } }
      );

      // Получаем ID созданного/существующего подкаста
      const [podcast] = await queryInterface.sequelize.query(
        `SELECT id FROM "Podcasts" WHERE title = :name LIMIT 1;`,
        { replacements: { name }, type: Sequelize.QueryTypes.SELECT }
      );

      if (podcast) {
        await queryInterface.sequelize.query(
          `UPDATE "Episodes" SET "podcastId" = :podcastId WHERE id = :id;`,
          { replacements: { podcastId: podcast.id, id: episode.id } }
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Откат при необходимости
  }
};