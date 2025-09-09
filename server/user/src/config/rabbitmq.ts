import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_HOST = process.env.RabbitMQ_Host || 'localhost';
const RABBITMQ_PORT = process.env.RabbitMQ_Port || '5672';
const RABBITMQ_USERNAME = process.env.RabbitMQ_username || 'admin';
const RABBITMQ_PASSWORD = process.env.RabbitMQ_password || 'admin123';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: RABBITMQ_HOST,
            port: parseInt(RABBITMQ_PORT),
            username: RABBITMQ_USERNAME,
            password: RABBITMQ_PASSWORD,
        });
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
        process.exit(1);
    }       
};


export const publishToQueue = async (queueName: string, message: object) => {
    if (!channel) {
        throw new Error('RabbitMQ channel is not established');
    }
    await channel.assertQueue(queueName, {durable: true});
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {persistent: true});
    
}   
