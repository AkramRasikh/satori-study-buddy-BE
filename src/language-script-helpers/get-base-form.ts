import { initializeTokenizer } from './init';

// Function to get the base form of a conjugated word
const getBaseForm = async (word: string) => {
  try {
    // Initialize the tokenizer
    const tokenizer = await initializeTokenizer();

    // Tokenize the word
    const tokens = tokenizer.tokenize(word);

    if (tokens?.length > 1) {
      return word;
    }
    // If the word is not conjugated or unknown, return the original word
    if (tokens.length === 0 || tokens[0].basic_form === undefined) {
      return word;
    }

    const firstToken = tokens[0];

    if (firstToken.basic_form === '*') {
      return firstToken.surface_form;
    }
    // Return the basic form of the word
    return firstToken.basic_form;
  } catch (error) {
    throw error;
  }
};

export default getBaseForm;
