import { Response, NextFunction, Request } from 'express';
import { eligibleLanguages } from '../eligible-languages';
import { body } from 'express-validator';

export const defaultLanguageErrorMsg = `Language is required in the request body. Eligible languages: ${eligibleLanguages.join(
  ',',
)}`;

const languageValidation = [
  body('language')
    .notEmpty()
    .withMessage('Language is required')
    .isIn(eligibleLanguages)
    .withMessage(defaultLanguageErrorMsg),
];

const checkMandatoryLanguage = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => {
  const { language } = req.body;
  if (!language || !eligibleLanguages.includes(language)) {
    const errorMsg = `Language is required in the request body. '${language}' is not valid. Eligible languages: ${eligibleLanguages.join(
      ',',
    )}`;
    return res.status(400).json({
      error: errorMsg,
    });
  }
  next?.();
};

export { languageValidation, checkMandatoryLanguage };
