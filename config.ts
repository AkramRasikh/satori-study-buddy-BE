import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  apiKey: process.env.API_KEY,
  port: process.env.PORT || 3001,
};

export default config;
