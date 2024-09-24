'use strict';
//const {
  //Model
//} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    userId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    totalPrice: DataTypes.DECIMAL
  }, {});
  
  Order.associate = function(models) {
    // An order belongs to a user (buyer)
    Order.belongsTo(models.User, { foreignKey: 'userId' });
    // An order belongs to a product
    Order.belongsTo(models.Product, { foreignKey: 'productId' });
  };
  
  return Order;
};
    //sequelize,
    //modelName: 'Order',
  //});
  //return Order;
//};