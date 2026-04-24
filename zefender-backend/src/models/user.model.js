const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("superadmin", "admin"),
    allowNull: false,
    defaultValue: "admin",
  },
  allowed_devices: {
    // JSON array of device IDs assigned by superadmin e.g. ["vm-delhi-001","sm-1"]
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
});

module.exports = User;
