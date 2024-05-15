import kuromoji, { Tokenizer, IpadicFeatures } from 'kuromoji';

const getToken = async () => {
  const tokenizer: Tokenizer<IpadicFeatures> = await new Promise(
    (resolve, reject) => {
      kuromoji
        .builder({ dicPath: 'node_modules/kuromoji/dict' })
        .build((err, tokenizer) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(tokenizer);
        });
    },
  );

  return tokenizer;
};

const getPhrase = (matchingSurfaceForms, wordBank, preUnderlinedSentence) => {
  const overlapsRemoved = wordBank.filter(
    (item) => !matchingSurfaceForms.includes(item),
  );

  if (overlapsRemoved?.length > 0) {
    return overlapsRemoved.filter((item) =>
      preUnderlinedSentence.includes(item),
    );
  }
  return null;
};

const underlineTargetWords = async ({ preUnderlinedSentence, wordBank }) => {
  try {
    const tokenizer = await getToken();

    // Tokenize the Japanese sentence
    const tokens = tokenizer.tokenize(preUnderlinedSentence);

    const matchingTokens = tokens.filter((token) => {
      const tokenSurface = token.basic_form || token.surface_form;
      return wordBank.includes(tokenSurface);
    });

    const matchingSurfaceForms = matchingTokens.map(
      (token) => token.surface_form,
    );
    const phrases = getPhrase(
      matchingSurfaceForms,
      wordBank,
      preUnderlinedSentence,
    );

    if (phrases?.length > 0) {
      return [...matchingSurfaceForms, ...phrases];
    }

    return matchingSurfaceForms;
  } catch (error) {
    console.error('Error in tokenizeJapaneseSentence:', error);
    throw error;
  }
};

export default underlineTargetWords;
