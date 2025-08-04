export const combinedSentenceCoreInstructionsPrompt = `
    ### Core Instructions:
    - **Please write a short **natural-sounding** example dialogue using the core words below. 
        The dialogue should be between two people and include **at least two exchanges** (i.e., a minimum of 2/3 sentence total, alternating speakers). 
        Use questions, imperatives, natural filler words, and varied sentence types to make it conversational and engaging.
    - Keep the dialogue concise but meaningful and ideally theatrical, ensuring that the context clearly demonstrates how the words are used naturally.
    - **Word Forms**: Include modified words (e.g., "running" for "run") in \`matchedWordsSurface\` and \`matchedWordsId\`.  
    - **Override Bad Definitions**: If a word’s definition seems unnatural, use it in a more logical way.  
  `;

const combineWordsPrompt = ({
  words,
  targetLanguage,
  bonusWords = [],
  myCombinedSentence,
}) => {
  const baseJSONReturnObj = `
    Return the response as a JSON object with (and only with) a \`sentence\` object. 
    Each sentence should contain:
    1. \`baseLang\`: The English sentence.
    2. \`targetLang\`: The translated sentence in ${targetLanguage}.
    3. \`matchedWordsSurface\`: An array of the words (in their original script ${targetLanguage}) that appear in the sentence, even if their form is slightly altered (e.g., conjugated, pluralized, etc.).
    4. \`matchedWordsId\`: An array of the corresponding word IDs that were used in the sentence.
    4. \`notes\`: Explain any nuances that may be relevant to me as a learner
`;

  const coreWordsToUse = words
    .map(
      (w) =>
        `- { "id": ${w.id}, "word": "${w.word}", "definition": "${w.definition}" }`,
    )
    .join('\n');

  const bonusWordsToUse =
    bonusWords.length > 0
      ? `
### Bonus Words (strong preference to be used, only if natural):
${bonusWords
  .map(
    (w) =>
      `- { "id": ${w.id}, "word": "${w.word}", "definition": "${w.definition}" }`,
  )
  .join('\n')}
`
      : '';

  return `
    ${JSON.stringify(baseJSONReturnObj)}
    ${JSON.stringify(combinedSentenceCoreInstructionsPrompt)}
    ${
      myCombinedSentence
        ? `
      ### Strict Instructions:
      1. **If \`myCombinedSentence\` is provided and uses at least some of the given words:**
        - Return **ONLY** that sentence (translated into ${targetLanguage}) in the \`sentence\`.
        - **Do NOT generate any additional sentence.**
      2. **If \`myCombinedSentence\` is missing or invalid (uses none of the words):**
        - Proceed with normal generation (core words first, bonus words if natural).
      4. Strict instruction: For words that don't fit in this - and only those - create a sentence/sentence given the above core instructions

      ### User-Provided Sentence (Override if Valid):
      - **"${myCombinedSentence}"** will replace AI-generated sentence if it matches the words.`
        : ''
    }

    ### Core Words (Priority):
    ${JSON.stringify(coreWordsToUse)}

    ${JSON.stringify(bonusWordsToUse)}
`;
};

export { combineWordsPrompt };
