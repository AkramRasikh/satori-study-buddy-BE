import { content } from '../refs';
import { filterOutNestedNulls } from '../../utils/filter-out-nested-nulls';
import { FirebaseCoreQueryParams } from '../types';
import { db } from '../init';
import { getContentTypeSnapshot } from '../../utils/get-content-type-snapshot';

const getFirebaseContentType = async ({
  language,
  ref,
}: FirebaseCoreQueryParams) => {
  try {
    const thisContentTypeSnapShot = await getContentTypeSnapshot({
      language,
      ref,
      db,
    });
    const realValues = filterOutNestedNulls(thisContentTypeSnapShot);
    if (ref === content) {
      const filteredOutUndefinedNull = realValues.map(
        (thisLangaugeContentItem) => {
          return {
            ...thisLangaugeContentItem,
            content: filterOutNestedNulls(thisLangaugeContentItem.content),
          };
        },
      );
      return filteredOutUndefinedNull;
    } else {
      return realValues;
    }
  } catch (error) {
    throw new Error(
      error || `Failed to get contentType ${ref} for ${language}`,
    );
  }
};

export { getFirebaseContentType };
