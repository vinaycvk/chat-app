import ampq from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

//RabbitMQ env variables
const RABBITMQ_HOST = process.env.RabbitMQ_Host || 'localhost';
const RABBITMQ_PORT = process.env.RabbitMQ_Port || '5672';
const RABBITMQ_USERNAME = process.env.RabbitMQ_username || 'admin';
const RABBITMQ_PASSWORD = process.env.RabbitMQ_password || 'admin123';

//SMTP env variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || '465';
const SMTP_USER = process.env.SMTP_USER || 'ch.vinay518@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'qbouweoyhuqegmxz';
//const SMTP_FROM = process.env.SMTP_FROM || 'from@example.com';

export const startOTPConsumer = async () => {
    try {
        const connection = await ampq.connect({
            protocol: 'amqp',
            hostname: RABBITMQ_HOST,
            port: parseInt(RABBITMQ_PORT),
            username: RABBITMQ_USERNAME,
            password: RABBITMQ_PASSWORD,
        });
        const channel = await connection.createChannel();

        const queue = 'send-otp';

        await channel.assertQueue(queue, { durable: true });
        console.log(`Mail service consumer started listening for OTP emails`);

        channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    const messageContent = msg.content.toString();
                    const { to, subject, body } = JSON.parse(messageContent);

                    const transporter = nodemailer.createTransport({
                        host: SMTP_HOST,
                        port: parseInt(SMTP_PORT),
                        secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
                        auth: {
                            user: SMTP_USER,
                            pass: SMTP_PASS,
                        },
                    });

                    const mailOptions = {
                        from: SMTP_USER,
                        to,
                        subject,
                        text: body,
                    };

                    await transporter.sendMail(mailOptions);
                    console.log('Email sent successfully:', mailOptions);
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error sending email:', error);
                }
            }
        });
    }
    catch (error) {
        console.error('Error in OTP consumer:', error);
    }
};
