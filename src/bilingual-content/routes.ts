import { youtubeVideoToBilingualText } from './youtube-video-to-bilingual-text';
import { languageValidation } from '../route-validation/check-mandatory-language';
import { body } from 'express-validator';
import { baseRoute } from '../shared-express-utils/base-route';

const youtubeVideoToBilingualTextValidation = [
  ...languageValidation,
  body('subtitleUrl').notEmpty().isString(),
  body('title').notEmpty().isString(),
  body('hasVideo').notEmpty().isBoolean(),
  body('timeRange.start').notEmpty().isString(),
  body('timeRange.finish').notEmpty().isString(),
  body('interval').notEmpty().isNumeric(),
];

const bilingualContentRoutes = (app) => {
  app.post(
    '/get-subtitles',
    youtubeVideoToBilingualTextValidation,
    baseRoute,
    youtubeVideoToBilingualText,
  );
};

export { bilingualContentRoutes };
