import { Request, Response } from 'express';
import { getFirebaseContentType } from './init';
import { checkRefsEligibilityRoute } from '../route-validation/check-eligible-is-ref';
import { checkMandatoryLanguage } from '../route-validation/check-mandatory-language';

export const getOnLoadDataValidation = (req, res, next) => {
  if (checkMandatoryLanguage(req, res, null)) {
    return;
  }
  if (checkRefsEligibilityRoute(req, res, null)) {
    return;
  }
  next();
};

const getFirebaseDataMap = async ({ refs, language }) => {
  return await Promise.all(
    refs.map(async (ref) => {
      const refData = await getFirebaseContentType({ language, ref });
      return {
        [ref]: refData,
      };
    }),
  );
};

const getOnLoadData = async (req: Request, res: Response) => {
  const refs = req.body.refs;
  const language = req.body.language;
  try {
    const data = await getFirebaseDataMap({ refs, language });
    res.status(200).json(data);
  } catch (error) {
    console.error('## getOnLoadData ', { error });
    res.status(500).json({ error: 'Error getting on load data' });
  }
};

export { getOnLoadData };
