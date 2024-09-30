'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "User ID cannot be null"
        },
        isInt: {
          msg: "User ID must be an integer"
        }
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Product ID cannot be null"
        },
        isInt: {
          msg: "Product ID must be an integer"
        }
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Quantity cannot be null"
        },
        isInt: {
          msg: "Quantity must be an integer"
        },
        min: {
          args: [1],
          msg: "Quantity must be at least 1"
        }
      }
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Total price cannot be null"
        },
        isDecimal: {
          msg: "Total price must be a decimal value"
        },
        min: {
          args: [0.01],
          msg: "Total price must be greater than zero"
        }
      }
    }
  }, {});

  
  Order.associate = function(models) {
    Order.belongsTo(models.User, { foreignKey: 'userId' });
    
    Order.belongsTo(models.Product, { foreignKey: 'productId' });
  };

  return Order;
};
