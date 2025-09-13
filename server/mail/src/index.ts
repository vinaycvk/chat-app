import express from 'express';
import dotenv from 'dotenv';
import { startOTPConsumer } from './consumer.js';


const app = express();

dotenv.config();

startOTPConsumer()

const PORT = process.env.PORT || 5001;

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Mail service is running on http://localhost:${PORT}`);
});
