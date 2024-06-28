import fetch from 'node-fetch'; // Optional if you want to run this code on Node.js < v18
import { load } from 'cheerio';
import { v4 as uuidv4 } from 'uuid';

const url =
  'https://www.musixmatch.com/lyrics/satomoka/melt-bitter/translation/english';

async function fetchMixMatchJsonData() {
  const cookie = process.env.MIX_MATCH_COOKIE;
  const title = 'melt bitter';
  try {
    const response = await fetch(url, {
      headers: {
        Cookie: cookie,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);
    const scriptContent = $('#__NEXT_DATA__').html();

    if (scriptContent) {
      const jsonData = JSON.parse(scriptContent);
      const trackStructureList =
        jsonData?.props?.pageProps?.data?.trackInfo?.data?.trackStructureList;
      const crowdTranslationGetData =
        jsonData?.props?.pageProps?.data?.crowdTranslationGet?.data;

      const mappedLyrics = trackStructureList
        ?.map((item) => {
          const linesArr = item.lines;
          const lyricAndTranslation = linesArr.map((line) => {
            const text = line.text;
            const time = line.time.total;
            return {
              targetLang: text,
              baseLang: crowdTranslationGetData[text],
              time: time,
            };
          });
          return lyricAndTranslation;
        })
        .flat()
        .map((item, index) => ({ position: index + 1, id: uuidv4(), ...item }));

      return {
        id: uuidv4(),
        title,
        snippets: [],
        lyrics: mappedLyrics,
      };
    } else {
      console.error('Unable to find JSON data in the <script> tag.');
    }
  } catch (error) {
    console.error('Error fetching the page:', error);
  }
}

export { fetchMixMatchJsonData };
