module.exports = (sequelize, DataTypes) => {
  const Podcast = sequelize.define('Podcast', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    author: {
      type: DataTypes.STRING,
    },
    coverUrl: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'Podcasts',
    timestamps: true,
  });

  Podcast.associate = (models) => {
    Podcast.hasMany(models.Episode, { foreignKey: 'podcastId', onDelete: 'CASCADE' });
    Podcast.hasMany(models.Subscription, { foreignKey: 'podcastId', onDelete: 'CASCADE' });
  };

  return Podcast;
};