import path from 'path';
import { youtubeVideoToBilingualText } from './youtube-video-to-bilingual-text';

export const outputFile = (title) => {
  return path.resolve(__dirname, 'output', `${title}.mp3`);
};

const bilingualContentRoutes = (app) => {
  app.post('/get-subtitles', youtubeVideoToBilingualText);
};

export { bilingualContentRoutes };
