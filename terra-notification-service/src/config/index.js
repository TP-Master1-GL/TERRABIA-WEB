import dotenv from 'dotenv';
dotenv.config();

const PORT = Number(process.env.port || process.env.PORT || 4002);
const RABBITMQ_URL = process.env.RABBITMQ_URL || null;
const RABBITMQ_HOST = process.env.RABBITMQ_HOST || null;
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || null;

const rabbiturl = RABBITMQ_URL
  || (RABBITMQ_HOST && RABBITMQ_PORT ? `amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}` : null)
  || 'amqp://localhost:5672';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'notification';
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

const config = {
  port: PORT,
  rabbiturl,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  emailUser: EMAIL_USER,
  emailPass: EMAIL_PASS,
};

export default config;
export const port = config.port;
export {rabbiturl};
export const emailUser = config.emailUser;
export const emailPass = config.emailPass;