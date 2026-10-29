module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    podcastId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subscribedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'Subscriptions',
    timestamps: true,
  });

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.User, { foreignKey: 'userId' });
    Subscription.belongsTo(models.Podcast, { foreignKey: 'podcastId' });
  };

  return Subscription;
};

