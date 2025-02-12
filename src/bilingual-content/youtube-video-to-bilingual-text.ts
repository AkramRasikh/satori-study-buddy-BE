import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { squashContent } from './format-transcript-based-on-time';
import { Request, Response } from 'express';
import { extractYoutubeAudioFromVideo } from './extract-youtube-audio-from-video';
import { cutAudioFromAudio } from '../mp3-utils/cut-audio-from-audio';
import {
  getUpdateToAndFromValues,
  splitByInterval,
} from './output/youtube-txt-file';
import {
  getAudioFolderViaLang,
  getvideoFolderViaLang,
} from '../utils/get-audio-folder-via-language';
import { timeToSeconds } from '../utils/time-string-to-seconds';
import { uploadBufferToFirebase } from '../firebase/init';
import { addContentLogic } from '../firebase/add-content/add-content-logic';
import { v4 as uuidv4 } from 'uuid';
import { downloadYoutubeVideo } from './download-youtube-video';
import { extractAudioFromBaseAudio } from './extract-audio-from-base-audio';

const outputFile = (title) => {
  return path.resolve(__dirname, 'output', `${title}.mp3`);
};

const youtube = 'youtube';
// Function to download YouTube video with a dynamic name

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
      time: Math.floor(base.tStartMs / 1000),
      baseLang,
      targetLang,
    };
  });
  const squashedTiming = squashContent(squashedArr);

  return squashedTiming;
};

const cutAudioIntoIntervals = async ({
  updateToAndFromValues,
  outputFilePathGrandCut,
  url,
  splits,
  start,
  language,
  hasVideo,
}) => {
  for (const item of updateToAndFromValues) {
    const audioPath = outputFile(item.title);
    await extractAudioFromBaseAudio(
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
        origin: youtube,
        content: item.content,
        url,
        interval: splits,
        realStartTime: realStartTime,
        hasVideo,
      },
    });
  }
};

const youtubeVideoToBilingualText = async (req: Request, res: Response) => {
  const {
    language,
    timeRange,
    subtitleUrl,
    hasEngSubs,
    url,
    title,
    interval,
    hasVideo,
  } = req.body;

  const start = timeRange.start;
  const finish = timeRange.finish;

  try {
    const squashTranscript = await getSquashedScript({
      targetLangUrl: subtitleUrl,
      baseLangUrl: hasEngSubs
        ? subtitleUrl.replace(/lang=ja/, 'lang=en')
        : subtitleUrl + `&tlang=en`,
    });

    const baseTitle = timeRange ? title + '-base' : title;
    const resFromChunking = splitByInterval(squashTranscript, interval, title);
    const updateToAndFromValues = getUpdateToAndFromValues(resFromChunking);

    const { extractedBaseFilePath } = await extractYoutubeAudioFromVideo({
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

    if (hasVideo) {
      await downloadYoutubeVideo({ title, videoUrl: url });
      const outputFolder = path.resolve(__dirname, 'output');
      const videoPath = path.join(outputFolder, `${title}.mp4`);

      const videoFileBuffer = fs.readFileSync(videoPath);
      const formattedFirebaseName =
        getvideoFolderViaLang(language) + '/' + title + '.mp4';

      await uploadBufferToFirebase({
        buffer: videoFileBuffer,
        filePath: formattedFirebaseName,
        isVideo: true,
      });
    }

    await cutAudioIntoIntervals({
      updateToAndFromValues,
      outputFilePathGrandCut,
      url,
      splits: interval,
      start,
      language,
      hasVideo,
    });
    res.send(squashTranscript);
  } catch (error) {
    console.log('## ERROR youtubeVideoToBilingualText', error);
    res.send().status(400);
  } finally {
    const outputDirectory = path.resolve(__dirname, 'output');

    // Get all files in the output directory
    const files = fs.readdirSync(outputDirectory);

    // Filter and unlink `.mp3` files
    files.forEach((file) => {
      const filePath = path.join(outputDirectory, file);
      if (file.startsWith(title)) {
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

export { youtubeVideoToBilingualText };
