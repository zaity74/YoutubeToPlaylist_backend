import express from 'express';
import dotenv from 'dotenv';
import dbConnect from '../config/dbConfig.js';
import { globalErrHandler, notFound } from '../middlewares/globalErrHandler.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import youtubeRouter from '../routes/youtube.js';
import userRouter from '../routes/user.js';
import historyRouter from '../routes/historyListenned.js';
import playlistRouter from '../routes/playlist.js';


dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Database connexion 
dbConnect();


const allowedOrigins = [
    'http://localhost:3001'
  ];
  
  const corsOptions = {
    origin: function (origin, callback) {
      // Check if the origin is allowed
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  };


app.use(cors(corsOptions));

app.use('/api/v1/songs/', youtubeRouter);
app.use('/api/v1/users/', userRouter);
app.use('/api/v1/history/', historyRouter);
app.use('/api/v1/playlist/', playlistRouter);

// Solution pour obtenir __dirname dans un module ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/downloads', express.static(path.join(__dirname, '..', 'downloads')));

// MIDDLEWARE
app.use(notFound);
app.use(globalErrHandler);
export default app;


