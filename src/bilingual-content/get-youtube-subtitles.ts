import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { squashContent } from './squash-content';
import { Request, Response } from 'express';
import { extractYoutubeAudio } from './extract-youtube-audio';
import { cutAudioFromAudio } from '../mp3-utils/cut-audio-from-audio';
import {
  extractMP3Section,
  getUpdateToAndFromValues,
  splitByInterval,
} from './output/youtube-txt-file';
import { outputFile } from './routes';
import { getAudioFolderViaLang } from '../utils/get-audio-folder-via-language';
import { timeToSeconds } from '../utils/time-string-to-seconds';
import { uploadBufferToFirebase } from '../firebase/init';
import { addContentLogic } from '../firebase/add-content/add-content-logic';
import { v4 as uuidv4 } from 'uuid';

const getSquashedScript = async ({ baseLangUrl, targetLangUrl }) => {
  const baseLangResponse = await fetch(baseLangUrl);
  const targetLangResponse = await fetch(targetLangUrl);
  if (!baseLangResponse.ok) {
    throw new Error(`Failed to subtitles: ${baseLangResponse.statusText}`);
  }
  const baseLangContent = await baseLangResponse.json();
  const targetLangContent = await targetLangResponse.json();

  const squashedArr = baseLangContent.events.map((base) => {
    const target = targetLangContent.events.find(
      (t) => t.tStartMs === base.tStartMs,
    );

    const targetLang = target
      ? target.segs
          .map((seg) => seg.utf8)
          .join('')
          .replace(/\n/g, ' ')
          .replaceAll(/\s/g, '')
      : '';

    const baseLang = base.segs
      .map((seg) => seg.utf8)
      .join(' ')
      .replace(/\n/g, ' ')
      .trim();

    return {
      id: uuidv4(),
      time: base.tStartMs / 1000,
      baseLang,
      targetLang,
    };
  });
  const squashedTiming = squashContent(squashedArr);

  return squashedTiming;
};

const getYoutubeSubtitles = async (req: Request, res: Response) => {
  const targetLangSubtitlesUrl = req.body.targetLangSubtitlesUrl;
  const hasEngSubs = req.body.hasEngSubs;
  const url = req.body.url;
  const title = req.body.title;
  const splits = req.body.interval;
  const language = req.body.language;
  const timeRange = req.body?.timeRange;
  const start = timeRange?.start;
  const finish = timeRange?.finish;

  console.log('## hasEngSubs', hasEngSubs);
  console.log(
    '## replaced',
    targetLangSubtitlesUrl.replace(/lang=ja/, 'lang=en'),
  );

  try {
    const squashTranscript = await getSquashedScript({
      targetLangUrl: targetLangSubtitlesUrl,
      baseLangUrl: hasEngSubs
        ? targetLangSubtitlesUrl.replace(/lang=ja/, 'lang=en')
        : targetLangSubtitlesUrl + `&tlang=en`,
    });

    const baseTitle = timeRange ? title + '-base' : title;

    const { extractedBaseFilePath } = await extractYoutubeAudio({
      url,
      title: baseTitle,
    });

    const outputFilePathGrandCut = path.resolve(
      __dirname,
      'output',
      `${title}.mp3`,
    );

    await cutAudioFromAudio({
      inputFilePath: extractedBaseFilePath,
      outputFilePath: outputFilePathGrandCut,
      trimStart: start,
      trimEnd: finish,
    });

    const resFromChunking = splitByInterval(squashTranscript, splits, title);

    const updateToAndFromValues = getUpdateToAndFromValues(resFromChunking);

    for (const item of updateToAndFromValues) {
      const audioPath = outputFile(item.title);
      await extractMP3Section(
        outputFilePathGrandCut,
        outputFile(item.title),
        item.from,
        item.to,
      );

      const fileBuffer = fs.readFileSync(audioPath);
      const formattedFirebaseName =
        getAudioFolderViaLang(language) + '/' + item.title + '.mp3';

      const realStartTime = item.from + timeToSeconds(start);

      // Upload audio snippet to Firebase
      await uploadBufferToFirebase({
        buffer: fileBuffer,
        filePath: formattedFirebaseName,
      });

      // Add content metadata to Firebase
      await addContentLogic({
        language,
        content: {
          title: item.title,
          hasAudio: item.hasAudio,
          origin: 'youtube',
          content: item.content,
          url,
          interval: splits,
          realStartTime: realStartTime,
        },
      });
    }
    res.send(squashTranscript);
  } catch (error) {
    console.log('## ERROR getYoutubeSubtitles', error);
  } finally {
    const outputDirectory = path.resolve(__dirname, 'output');

    // Get all files in the output directory
    const files = fs.readdirSync(outputDirectory);

    // Filter and unlink `.mp3` files
    files.forEach((file) => {
      const filePath = path.join(outputDirectory, file);
      if (file.endsWith('.mp3') || file.endsWith('.txt')) {
        try {
          fs.unlinkSync(filePath); // Delete the file
          console.log(`Deleted: ${filePath}`);
        } catch (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }
    });
  }
};

export { getYoutubeSubtitles };
