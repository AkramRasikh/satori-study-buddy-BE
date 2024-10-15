const eligibleLanguages = ['japanese'];

const checkMandatoryLanguage = (req, res, next) => {
  const { language } = req.body;
  if (!language || !eligibleLanguages.includes(language)) {
    return res.status(400).json({
      error: `Language is required in the request body. '${language}' is not valid. Eligible languages: ${eligibleLanguages.join(
        ',',
      )}`,
    });
  }
  req.language = language;
  next();
};

export { checkMandatoryLanguage };
