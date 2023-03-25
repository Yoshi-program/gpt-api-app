import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { Configuration, OpenAIApi } from "openai";
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

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
    const content = `下記に示す文章を300字ないで要約してください。${text}`
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0301",
        messages: [{ role: "user", content: content }],
    });
    
    const answer = response.data.choices[0].message?.content;
    console.log(answer);
    return answer;
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
      const buffer = new Buffer(file.buffer);
      const text = await handleFile(buffer, file.mimetype);
      const summary = await summarizeText(text);
      res.status(200).json({ summary });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: `Failed to process file: ${error.message}` });
    }
  });

export default apiRoute;
