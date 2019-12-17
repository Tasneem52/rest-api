const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}
  User.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'FirstName cannot be null.'},
        notEmpty: { msg: 'FirstName cannot be empty.'}
      },
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'LastName cannot be null.'},
        notEmpty: { msg: 'LastName cannot be empty.'}
      },
    },
    emailAddress: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'EmailAddress cannot be null.'},
        notEmpty: { msg: 'EmailAddress cannot be empty.'},
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Password cannot be null.'},
        notEmpty: { msg: 'Password cannot be empty.'},
      },
    },
  }, { sequelize }
  );

  User.associate = (models) => {
    User.hasMany(models.Course, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return User;
};
