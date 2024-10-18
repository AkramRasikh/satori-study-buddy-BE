import { removeFromSnapshot } from '../../utils/remove-item-from-snapshot';
import { db } from '../init';
import { words } from '../refs';

const deleteWordLogic = async ({ language, id }) => {
  try {
    const deletedWord = await removeFromSnapshot({
      id,
      ref: words,
      language,
      db,
    });

    const deletedWordBaseForm = deletedWord.baseForm;
    return deletedWordBaseForm;
  } catch (error) {
    throw new Error(`Error deleting word for ${language}`);
  }
};

export { deleteWordLogic };
