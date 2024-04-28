const satoriFlashcard = async ({
  cardId,
  flashCardDifficulty,
  sessionToken,
}) => {
  const headers = {
    Cookie: `SessionToken=${sessionToken}`,
    Referer: 'https://www.satorireader.com/review/srs?filter=due', // check without
  };

  const url = `https://www.satorireader.com/api/studylist/${cardId}?q=${flashCardDifficulty}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const resText = JSON.parse(await response.text());

    if (resText.success) {
      return true;
    }
  } catch (error) {
    console.error('## Error fetching data:', error);
    throw error;
  }
};

export default satoriFlashcard;
