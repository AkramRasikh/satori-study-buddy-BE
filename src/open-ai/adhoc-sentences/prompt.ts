/**
 * Generates a culturally-adapted translation prompt for DeepSeek API
 * @param {Object} params - Translation parameters
 * @param {string} params.sentence - Source sentence to translate
 * @param {string} params.targetLanguage - Target language code (e.g. 'fr')
 * @param {string} [params.context] - Additional context for accurate translation
 * @param {boolean} [params.includeVariations=false] - When true, returns 2-3 translation variants
 * @returns {string} Formatted API prompt
 */
export const howToSayPrompt = ({
  sentence,
  targetLanguage,
  context,
  includeVariations = false,
}) => `
Translate "${sentence}" into natural ${targetLanguage}${
  context ? ` (context: ${context})` : ''
}.

### Critical Directive:
${
  includeVariations
    ? 'Provide exactly 2-3 culturally-distinct versions'
    : 'Provide ONLY ONE best translation - never multiple versions'
}

### Strict Requirements:
1. ${
  includeVariations
    ? 'Include 2-3 variations MAXIMUM'
    : 'STRICTLY PROHIBITED to provide multiple versions - ONLY ONE translation'
}
2. Always use these exact JSON field names: "sentences", "targetLang", "notes"
3. Never include additional fields like "type" or "confidence"

### Response Format (ONLY JSON):
{
  "sentences": [
    {
      "targetLang": "${
        includeVariations ? 'Primary translation' : 'Best translation'
      }",
      "notes": "Cultural/literal rationale"
    }${
      includeVariations
        ? `,
    {
      "targetLang": "Alternative version",
      "notes": "When this variant would be used"
    },
    {
      "targetLang": "Third variant (if culturally distinct)",
      "notes": "Specific context for this version"
    }`
        : ''
    }
  ]
}

### Absolute Prohibitions:
- ${includeVariations ? '' : 'NEVER provide multiple translations - ONLY ONE'}
- No additional text outside JSON
- No markdown formatting
- No field name variations (e.g., use "targetLang" exactly)
`;

/**
 * Generates a prompt for cultural expression inquiries with strict variation control
 * @param {Object} params - Inquiry parameters
 * @param {string} params.inquiry - The "how do you..." question (e.g. "express doubt")
 * @param {string} params.targetLanguage - Target language code (e.g. 'ja')
 * @param {string} [params.context] - Situational context
 * @param {boolean} [params.includeVariations=false] - Whether to include multiple expressions
 * @returns {string} Formatted API prompt
 */
export const howToExpressPrompt = ({
  inquiry,
  targetLanguage,
  context,
  includeVariations = false,
}) => `
Explain how to "${inquiry}" in natural ${targetLanguage}${
  context ? ` (context: ${context})` : ''
}.

### Critical Directive:
${
  includeVariations
    ? 'Provide exactly 2-3 distinct cultural expressions'
    : 'Provide ONLY THE SINGLE MOST COMMON expression - never multiple versions'
}

### Strict Requirements:
1. ${
  includeVariations
    ? 'Include 2-3 variations MAXIMUM'
    : 'STRICTLY PROHIBITED to provide multiple expressions - ONLY ONE'
}
2. For ${includeVariations ? 'each' : 'the'} expression include:
   - baseLang: The English equivalent
   - targetLang: The ${targetLanguage} expression
   - notes: When/how to use it

### Response Format (ONLY JSON):
{
  "sentences": [
    {
      "baseLang": "English phrase",
      "targetLang": "${targetLanguage} translation",
      "notes": "Usage context"
    }${
      includeVariations
        ? `,
    {
      "baseLang": "Alternative English",
      "targetLang": "${targetLanguage} variant",
      "notes": "Specific use-case"
    }`
        : ''
    }
  ]
}

### Absolute Prohibitions:
- ${includeVariations ? '' : 'NEVER provide multiple expressions - ONLY ONE'}
- No additional commentary
- No markdown formatting
- No deviation from specified field names
`;

export const grammarContrastPrompt = ({
  targetLanguage,
  baseSentence,
  grammarSection,
  context,
  includeVariations = false,
  isSubtleDiff = false, // ← New flag added here
}) => `
Generate ${
  includeVariations ? '2-3' : 'ONE'
} ${targetLanguage} sentence(s) that:
${
  grammarSection
    ? `1. Illustrate "${grammarSection}"`
    : '1. Demonstrate target grammar'
}
2. ${
  isSubtleDiff
    ? 'Highlight MINIMAL differences in meaning/usage. One way of this can be pairing similar grammatical patterns together. i.e. if studying "only if" we can pair it in a setence with "as long as"'
    : 'Show natural usage'
}
3. Are standalone examples

${baseSentence ? `Base Sentence: "${baseSentence}"\n` : ''}
${context ? `Context: ${context}\n` : ''}

### Strict Requirements:
1. ${
  isSubtleDiff
    ? 'Focus on NUANCE (e.g., tone, formality, implication)'
    : 'Prioritize clarity'
}
2. ${includeVariations ? '2-3 examples MAX' : 'ONLY ONE example'}
3. Use EXACT JSON fields:
   - "sentences"
   - "targetLang"
   - "baseLang"
   - "notes" (${
     isSubtleDiff ? 'Must explain subtle differences' : 'Explain grammar'
   })
   - "isGrammar": true

### Response Format (ONLY JSON):
{
  "sentences": [
    {
      "targetLang": "${targetLanguage} example",
      "baseLang": "English translation",
      "notes": "${isSubtleDiff ? 'Nuance comparison' : 'Grammar explanation'}",
      "isGrammar": true
    }${includeVariations ? ',' : ''}
    ${
      includeVariations
        ? `
    {
      "targetLang": "Additional ${targetLanguage} example",
      "baseLang": "English translation",
      "notes": "${
        isSubtleDiff ? 'Subtle contrast with Example 1' : 'Alternative usage'
      }",
      "isGrammar": true
    }`
        : ''
    }
  ]
}`;
