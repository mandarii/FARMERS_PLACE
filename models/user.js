'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
role: {
    type: DataTypes.ENUM('buyer', 'farmer'),
    allowNull: false
}
}, {}); 
  User.associate = function(models) {
    // A user (farmer) can have many products
    User.hasMany(models.Product, { foreignKey: 'farmerId' });
  };
  
  return User;
};
   