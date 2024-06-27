import express from 'express';
import { addToPlaylist, createPlaylist, fetchAllPlaylists, deletePlaylist, getPlaylistDetail } from '../controllers/playlistController.js';
import isLoggedIn from '../middlewares/isLoggedIn.js';

const playlistRouter = express.Router();

playlistRouter.post('/add-to-playlist', isLoggedIn, addToPlaylist);
playlistRouter.post('/create-playlist', isLoggedIn, createPlaylist);
playlistRouter.get('/fetch-all-playlists', isLoggedIn, fetchAllPlaylists);
playlistRouter.delete('/delete-playlist/:id', isLoggedIn, deletePlaylist);
playlistRouter.get('/:id', isLoggedIn, getPlaylistDetail);

export default playlistRouter;