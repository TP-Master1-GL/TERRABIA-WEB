
// src/models/Notification.js
import { DataTypes } from "sequelize";
import { sequelize } from "../database/index.js";

const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    userEmail: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, allowNull: true },
    message: { type: DataTypes.TEXT, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    tableName: 'notifications',
    timestamps: false,
});

export default Notification;