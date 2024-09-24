'use strict';
//const {
  //Model
//} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING  // farmer or buyer
  }, {});
  
  User.associate = function(models) {
    // A user (farmer) can have many products
    User.hasMany(models.Product, { foreignKey: 'farmerId' });
  };
  
  return User;
};
    //sequelize,
    //modelName: 'User',
  //});
  //return User;
//};