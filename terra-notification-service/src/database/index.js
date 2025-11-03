import { Sequelize } from 'sequelize';
import config from '../config/index.js';

const sequelize = new Sequelize(
  config.DB_NAME || config.database || config.dbName,
  config.DB_USER || config.user || config.dbUser,
  config.DB_PASSWORD || config.password || config.dbPassword,
  {
    host: config.DB_HOST || config.host,
    dialect: 'mysql',
    logging: false,
  }
);

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('connected to mysql');
  } catch (error) {
    console.error('mysql connection failed:', error.message);
    process.exit(1);
  }
}

export { sequelize };

