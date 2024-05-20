import express from 'express';
import cors from 'cors';
import config from '../config';
import { satoriRoutes } from './satori/routes';
import { openAIRoutes } from './open-ai/routes';
import { firebaseRoutes } from './firebase/routes';
import { languageScriptHelpers } from './language-script-helpers/routes';
import { narakeetRoutes } from './narakeet/routes';

const app = express();

app.use(cors());
const port = config.port;

// Middleware to parse JSON bodies
app.use(express.json());

// routes
satoriRoutes(app);
openAIRoutes(app);
firebaseRoutes(app);
languageScriptHelpers(app);
narakeetRoutes(app);

app.listen(port, () => {
  console.log(`## Server is running at http://localhost:${port}`);
  console.log('## port: ', port);
});
