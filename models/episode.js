'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Episode extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Episode.init({
    title: DataTypes.STRING,
    podcastName: DataTypes.STRING,
    durationMinutes: DataTypes.INTEGER,
    audioUrl: DataTypes.STRING,
    playsCount: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Episode',
  });
  return Episode;
};