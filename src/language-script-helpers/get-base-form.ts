import { initializeTokenizer } from './init';

// Function to get the base form of a conjugated word
const getBaseForm = async (word: string) => {
  try {
    // Initialize the tokenizer
    const tokenizer = await initializeTokenizer();

    // Tokenize the word
    const tokens = tokenizer.tokenize(word);

    // If the word is not conjugated or unknown, return the original word
    if (tokens.length === 0 || tokens[0].basic_form === undefined) {
      return word;
    }

    // Return the basic form of the word
    return tokens[0].basic_form;
  } catch (error) {
    throw error;
  }
};

export default getBaseForm;
