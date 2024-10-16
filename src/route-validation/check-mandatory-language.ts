import { Response, NextFunction, Request } from 'express';

const eligibleLanguages = ['japanese'];

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

export { checkMandatoryLanguage };
