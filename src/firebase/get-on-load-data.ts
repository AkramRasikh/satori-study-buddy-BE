import { Request, Response, NextFunction } from 'express';
import { checkRefsEligibilityRoute } from '../route-validation/check-eligible-is-ref';
import { checkMandatoryLanguage } from '../route-validation/check-mandatory-language';
import { FirebaseCoreQueryParams } from './types';
import { getFirebaseContentType } from './get-firebase-content-type';

interface GetFirebaseDataMapTypes {
  refs: string[];
  language: FirebaseCoreQueryParams['language'];
}

export const getOnLoadDataValidation = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (checkMandatoryLanguage(req, res)) {
    return;
  }
  if (checkRefsEligibilityRoute(req, res)) {
    return;
  }
  next();
};

const getFirebaseDataMap = async ({
  refs,
  language,
}: GetFirebaseDataMapTypes) => {
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
  const { refs, language } = req.body;
  try {
    const data = await getFirebaseDataMap({ refs, language });
    res.status(200).json(data);
  } catch (error) {
    console.error('## Error (getOnLoadData) ', { error });
    res.status(500).json({ error: 'Error getting on load data' });
  }
};

export { getOnLoadData };
