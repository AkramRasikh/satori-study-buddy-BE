import getSatoriSentence from './audio';

const getPathToWord = (inArrIndex, satoriData) => {
  const thisWordsData = satoriData[inArrIndex];
  const expression = JSON.parse(thisWordsData.expression);

  const textParts =
    expression.paragraphs[0].sentences[0].runs[0].parts[0].parts;

  const textWithKanji = textParts.map((part) => part.text).join('');
  const textZeroKanji = textParts
    .map((part) => part?.reading || part.text)
    .join('');
  return [textWithKanji, textZeroKanji];
};

const structureSatoriFlashcards = async (satoriData, sessionToken) => {
  return satoriData.map(async (grandItem, index) => {
    const contexts = grandItem.contexts;

    const firstContext = contexts[0];
    const sentenceId = firstContext.sentenceId;
    const articleCode = firstContext.articleCode;

    const expression = JSON.parse(firstContext.expression);
    const paragraphs = expression.paragraphs;
    const firstNestedParagraph = paragraphs[0];
    const nestedSentences = firstNestedParagraph.sentences;
    const allParts = nestedSentences[0].runs[0].parts;
    const definition = JSON.parse(grandItem.definition).senses[0].glosses;
    const engTranslation = expression.notes[0].discussion;

    const [textWithKanji, textZeroKanji] = getPathToWord(index, satoriData);

    const audioUrl = await getSatoriSentence({
      id: sentenceId,
      episode: articleCode,
      sessionToken,
    });

    return {
      fullSentence: allParts
        .map((item) => {
          if (item.text) {
            return item.text;
          }
          return item?.parts[0].text;
        })
        .join(''),
      textWithKanji: textWithKanji,
      textZeroKanji: textZeroKanji,
      audioUrl,
      definition: definition,
      engTranslation: engTranslation,
      cardId: firstContext.cardId,
    };
  });
};

export { structureSatoriFlashcards };
