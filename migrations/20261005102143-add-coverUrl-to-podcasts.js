module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Podcasts', 'coverUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Podcasts', 'coverUrl');
  }
};