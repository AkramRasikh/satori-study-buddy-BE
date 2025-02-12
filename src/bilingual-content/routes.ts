import path from 'path';
import { youtubeVideoToBilingualText } from './youtube-video-to-bilingual-text';

const youtube = 'youtube';

export const outputFile = (title) => {
  return path.resolve(__dirname, 'output', `${title}.mp3`);
};

const bilingualContentRoutes = (app) => {
  app.post('/get-subtitles', youtubeVideoToBilingualText);
};

export { bilingualContentRoutes };
