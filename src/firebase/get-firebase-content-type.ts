import { content } from './refs';

import { getRefPath } from '../utils/get-ref-path';
import { filterOutNestedNulls } from '../utils/filter-out-nested-nulls';
import { FirebaseCoreQueryParams } from './types';
import { db } from './init';

const getFirebaseContentType = async ({
  language,
  ref,
}: FirebaseCoreQueryParams) => {
  try {
    const refPath = getRefPath({
      language,
      ref,
    });
    const postsRef = db.ref(refPath);
    const refResults = await postsRef.once('value');
    const realValues = filterOutNestedNulls(refResults.val());
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
    // specfificy what ref
    console.error('Error getFirebaseContentType:', { error });
    return error;
  }
};

export { getFirebaseContentType };
