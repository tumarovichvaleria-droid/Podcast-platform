module.exports = (sequelize, DataTypes) => {
  const Episode = sequelize.define('Episode', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    podcastName: {
      type: DataTypes.STRING,
    },
    durationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    playsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
    },
    isExplicit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    podcastId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'Episodes',
    timestamps: true,
  });

  Episode.associate = (models) => {
    Episode.belongsTo(models.Podcast, { foreignKey: 'podcastId' });
  };

  return Episode;
};