import { Sequelize } from 'sequelize';
import config from '../config/index.js';

const sequelize = new Sequelize(
  config.database.name,           // Utilise la nouvelle structure
  config.database.user,           // Utilise la nouvelle structure
  config.database.password,       // Utilise la nouvelle structure
  {
    host: config.database.host,   // Utilise la nouvelle structure
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