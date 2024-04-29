const getSatoriSentence = async ({ episode, id, sessionToken }) => {
  try {
    const response = await fetch(
      `https://www.satorireader.com/api/audio-clips/sentences/inline/${episode}/${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: `SessionToken=${sessionToken}`,
        },
      },
    );

    if (!response.ok && !response?.url) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.url;
  } catch (error) {
    console.error('## Error fetching data:', error);
  }
};

export default getSatoriSentence;
