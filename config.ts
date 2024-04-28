import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 3001,
};

export default config;
