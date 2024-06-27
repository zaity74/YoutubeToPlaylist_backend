import Song from "../models/Song.js";
import asyncHandler from 'express-async-handler';
import Playlist from '../models/Playlist.js';
import UserSongStatus from "../models/UserSongStatus.js";


// ADD TO PLAYLIST
export const addToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, songId } = req.body;
    const userId = req.userAuthId;

    const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
    if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found or not authorized' });
    }

    const song = await Song.findOne({ _id: songId });
    if (!song) {
        return res.status(404).json({ error: 'Song not found' });
    }

    // Check if the song is already in the playlist
    if (playlist.songs.includes(songId)) {
        console.log('affiche :',playlist);
        return res.status(400).json({ error: 'Song already added to playlist' });
    }else{
        playlist.songs.push(songId);
        await playlist.save();

    }
    // UPDATE USER PRODUCT STATUS
    let userSongStatus = await UserSongStatus.findOne({ song: songId, user: userId });
    if (!userSongStatus) {
        userSongStatus = new UserSongStatus({ 
        song: songId, 
        user: userId, 
        isAdded: true 
      });
    } else {
        userSongStatus.isAdded = true;
    }

    await userSongStatus.save();

    return res.status(200).json({ message: 'Song added to playlist', playlist });
});


// CREATE PLAYLIST
export const createPlaylist = asyncHandler(async (req, res) => {
    // FIND USER AND VERIFICATION 
    const userId = req.userAuthId;
    if (!userId) {
        return res.status(401).json({
            status: 'fail',
            message: 'You need to be logged in to create a playlist. Please log in or create an account.'
        });
    }

    const { name, description, cover } = req.body;

    const newPlaylist = new Playlist({
        name,
        description,
        cover,
        user: userId,
        songs: []
    });

    const createdPlaylist = await newPlaylist.save();
    res.status(201).json({ message: 'Playlist created successfully', playlist: createdPlaylist });
});

// FETCH ALL 
export const fetchAllPlaylists = asyncHandler(async (req, res) => {
    const userId = req.userAuthId;

    const playlists = await Playlist.find({ user: userId }).populate('songs').populate('user');
    res.status(200).json({ playlists });
});


// DELETE ONE
export const deletePlaylist = asyncHandler(async (req, res) => {
    const playlistId = req.params.id;
    const userId = req.userAuthId;

    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, user: userId });
    if (!playlist) {
        return res.status(404).json({ error: 'Playlist not found or not authorized' });
    }

    res.status(200).json({ message: 'Playlist deleted successfully' });
});

// RELATED PLAYLIST BY GENRE 

// FETCH ONE 
export const getPlaylistDetail = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const userId = req.userAuthId;
  
    const playlist = await Playlist.findOne({_id: id, user: userId})
    .populate('user')
    .populate('songs')
    .exec();
  
    if (!playlist) {
        return res.status(404).json({
            status: 'fail',
            message: 'Playlist not exist',
        });
    }
  
    const playlistObj = playlist.toObject({ virtuals: true });
  
  
    res.status(200).json({
        status: 'success',
        detailPlaylist: playlistObj,
    });
  });
