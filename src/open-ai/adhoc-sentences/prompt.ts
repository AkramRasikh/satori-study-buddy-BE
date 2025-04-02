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

### Strict Requirements:
1. ${
  includeVariations
    ? 'Provide 2-3 culturally-distinct versions'
    : 'Provide the single best translation'
}
2. Always use these exact JSON field names: "sentences", "targetLang", "notes"
3. Never include additional fields like "type" or "confidence"

### Response Format (ONLY JSON):
{
  "sentences": [
    {
      "targetLang": "Best translation",
      "notes": "Cultural/literal rationale"
    }${
      includeVariations
        ? `,
    {
      "targetLang": "Alternative version",
      "notes": "When this variant would be used"
    },
    {
      "targetLang": "Third variant (if exists)",
      "notes": "Specific context for this version"
    }`
        : ''
    }
  ]
}

### Prohibitions:
- No additional text outside JSON
- No markdown formatting
- No field name variations (e.g., use "targetLang" exactly)
`;

/**
 * Generates a prompt for cultural expression inquiries
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

### Strict Requirements:
1. Provide ${
  includeVariations
    ? '2-3 distinct cultural expressions'
    : 'the most common expression'
}
2. For each expression include:
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

### Prohibitions:
- No additional commentary
- No markdown formatting
- No deviation from specified field names
`;
