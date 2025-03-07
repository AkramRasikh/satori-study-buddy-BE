const googleTextToSpeechAPI = async ({ text, language, id }) => {
  const url = process.env.GOOGLE_TEXT_TO_SPEECH_URL;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        text,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TTS: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error occurred:', error);
    return error;
  }
};

export default googleTextToSpeechAPI;
