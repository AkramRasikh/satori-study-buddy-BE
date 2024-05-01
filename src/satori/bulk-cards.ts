import fetch from 'node-fetch';

const getSatoriCardsInBulk = async ({ sessionToken, isDueAndAuto }) => {
  const studyModeParam = isDueAndAuto
    ? 'due-and-pending-auto-importable'
    : 'due';
  try {
    const response = await fetch(
      `https://www.satorireader.com/api/studylist/${studyModeParam}?skip=0&take=20`,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: `SessionToken=${sessionToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('## Error fetching data:', error);
    return error;
  }
};

export default getSatoriCardsInBulk;
