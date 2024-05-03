import kuromoji, { Tokenizer, IpadicFeatures } from 'kuromoji';

const underlineTargetWords = async ({ preUnderlinedSentence, wordBank }) => {
  console.log('## underlineTargetWords: ', { preUnderlinedSentence, wordBank });

  try {
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

    // Tokenize the Japanese sentence
    const tokens = tokenizer.tokenize(preUnderlinedSentence);

    const matchingTokens = tokens.filter((token) => {
      const tokenSurface = token.basic_form || token.surface_form;
      return wordBank.includes(tokenSurface);
    });

    const matchingSurfaceForms = matchingTokens.map(
      (token) => token.surface_form,
    );

    return matchingSurfaceForms;
  } catch (error) {
    console.error('Error in tokenizeJapaneseSentence:', error);
    throw error;
  }
};

export default underlineTargetWords;
