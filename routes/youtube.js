import express from 'express';
const youtubeRouter = express.Router();

import { createSong, getAllSongs, getSongDetail, removeSong, clearAllSong } from '../controllers/songController.js';
import  isLoggedIn  from '../middlewares/isLoggedIn.js'; // Utilisez les accolades pour les exportations nommées

youtubeRouter.post('/create-song', isLoggedIn, createSong);
youtubeRouter.get('/all-songs', isLoggedIn, getAllSongs);
youtubeRouter.get('/:id', isLoggedIn, getSongDetail);
youtubeRouter.delete('/remove-song/:id', isLoggedIn, removeSong);
youtubeRouter.delete('/clear', isLoggedIn, clearAllSong);

export default youtubeRouter;
