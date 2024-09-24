'use strict';
//const {
  //Model
//} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    quantity: DataTypes.INTEGER,
    category: DataTypes.STRING,
    farmerId: DataTypes.INTEGER
  }, {});
  
  Product.associate = function(models) {
    // A product belongs to a user (farmer)
    Product.belongsTo(models.User, { foreignKey: 'farmerId' });
  };
  
  return Product;
};
    //sequelize,
    //modelName: 'Product',
  //});
  //return Product;
//};