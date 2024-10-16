import { Request, Response } from 'express';
import { getFirebaseContent } from './init';
import { content } from './refs';
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

const getOnLoadData = async (req: Request, res: Response) => {
  const refs = req.body.refs;
  const language = req.body.language;
  const getFirebaseDataMap = async () => {
    return await Promise.all(
      refs.map(async (ref) => {
        const refData = await getFirebaseContent({ language, ref });
        if (ref === content) {
          const surfaceLevelNullRemoved = refData.filter(
            (item) => item !== null,
          );
          const filteredOutUndefinedNull = surfaceLevelNullRemoved.map(
            (japaneseContentItem) => {
              return {
                ...japaneseContentItem,
                content: japaneseContentItem.content.filter(
                  (japaneseContentScript) =>
                    japaneseContentScript !== null ||
                    japaneseContentScript !== undefined,
                ),
              };
            },
          );
          return {
            [ref]: filteredOutUndefinedNull,
          };
        }
        return {
          [ref]: refData.filter((item) => item !== null),
        };
      }),
    );
  };

  try {
    const data = await getFirebaseDataMap();
    res.status(200).json(data);
  } catch (error) {
    console.error('## getOnLoadData ', { error });
    res.status(500).json({ error: 'Error getting on load data' });
  }
};

export { getOnLoadData };
