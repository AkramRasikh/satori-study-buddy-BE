import fetch from 'node-fetch'; // Optional if you want to run this code on Node.js < v18

const extractSrtData = async ({ youtubeId, lang }) => {
  const subtitleEngUrl = `https://views4you.com/subtitle-download/?id=${youtubeId}&lang=.${lang}&ext=srt`;

  try {
    const response = await fetch(subtitleEngUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch MP3: ${response.statusText}`);
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.log('## FAILED extractSrtData ', lang);
  }
};

export { extractSrtData };
