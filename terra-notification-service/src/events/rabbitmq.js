// filepath: [rabbitmq.js](http://_vscodecontentref_/1)
import amqp from 'amqplib';
import { rabbiturl } from '../config/index.js';

let channel;
let connection;

export async function connectRabbitMQ() {
  connection = await amqp.connect(rabbiturl);
  channel = await connection.createChannel();
  console.log('rabbitmq: connected to', rabbiturl);
  return channel;
}

export function getChannel() {
  if (!channel) throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ() first.');
  return channel;
}

export async function closeRabbitMQ() {
  try { await channel?.close(); } catch {}
  try { await connection?.close(); } catch {}
}