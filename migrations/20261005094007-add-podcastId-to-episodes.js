'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Episodes', 'podcastId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Podcasts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Episodes', 'podcastId');
  }
};