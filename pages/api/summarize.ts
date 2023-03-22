import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import axios from 'axios';
import { Buffer } from 'buffer';
// import type { IncomingMessage } from 'http';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface CustomNextApiRequest extends NextApiRequest {
    file: MulterFile;
  }

const upload = multer({ storage: multer.memoryStorage() });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function handleFile(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const data = await mammoth.extractRawText({ buffer });
    return data.value;
  } else {
    throw new Error('Unsupported file format');
  }
}

async function summarizeText(text: string): Promise<string> {
  const response = await axios.post(
    'https://api.openai.com/v1/engines/davinci-codex/completions',
    {
      prompt: `Please summarize the following text:\n\n${text}`,
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.7,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    },
  );

  const summary = response.data.choices[0].text.trim();
  return summary;
}

const apiRoute = nextConnect<CustomNextApiRequest, NextApiResponse>();

apiRoute.use(upload.single('file'));

apiRoute.post(async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  try {
    const buffer = file.buffer;
    const text = await handleFile(buffer, file.mimetype);
    const summary = await summarizeText(text);
    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process file' });
  }
});

export default apiRoute;
