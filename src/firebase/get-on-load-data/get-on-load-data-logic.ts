import { getFirebaseContentType } from '../get-firebase-content-type';
import { FirebaseCoreQueryParams } from '../types';

interface GetFirebaseDataMapTypes {
  refs: string[];
  language: FirebaseCoreQueryParams['language'];
}

const getOnLoadDataLogic = async ({
  refs,
  language,
}: GetFirebaseDataMapTypes) => {
  return await Promise.all(
    refs.map(async (ref) => {
      try {
        const refData = await getFirebaseContentType({ language, ref });
        return {
          [ref]: refData,
        };
      } catch (error) {
        throw new Error(`Error fetching ${ref} for language ${language}`);
      }
    }),
  );
};

export { getOnLoadDataLogic };
