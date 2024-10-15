import express from 'express';
import cors from 'cors';
import config from '../config';
import { openAIRoutes } from './open-ai/routes';
import { firebaseRoutes } from './firebase/routes';
import { languageScriptHelpers } from './language-script-helpers/routes';
import { narakeetRoutes } from './narakeet/routes';
import { mp3Utils } from './mp3-utils/routes';
import { bilingualContentRoutes } from './bilingual-content/routes';
import { flashcardRoutes } from './flashcards/routes';

const app = express();

app.use(cors());
const port = config.port;

// Middleware to parse JSON bodies
app.use(express.json());

// routes
openAIRoutes(app);
firebaseRoutes(app);
languageScriptHelpers(app);
narakeetRoutes(app);
mp3Utils(app);
bilingualContentRoutes(app);
flashcardRoutes(app);

app.listen(port, () => {
  console.log(`## Server is running at http://localhost:${port}`);
  console.log('## port: ', port);
});
