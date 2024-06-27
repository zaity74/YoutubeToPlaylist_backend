import asyncHandler from 'express-async-handler';
import Song from '../models/Song.js';
import ListeningHistory from '../models/ListenningHistory.js';

// Ajouter une entrée dans l'historique d'écoute
export const addListeningHistory = asyncHandler(async (req, res) => {
    const { songId } = req.body;
    const userId = req.userAuthId;

    if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'You need to be logged in to view your songs. Please log in or create an account.'
        });
    }

    // Vérifier si la chanson existe
    const song = await Song.findById(songId);
    if (!song) {
        return res.status(404).json({ message: 'Song not found' });
    }

    // Créer une nouvelle entrée d'historique
    const history = new ListeningHistory({
        user: userId,
        song: songId
    });

    await history.save();

    res.status(201).json({
        status: 'success',
        message: 'Listening history recorded',
        data: history
    });
});

// Récupérer l'historique d'écoute d'un utilisateur
export const getListeningHistory = asyncHandler(async (req, res) => {
    const userId = req.userAuthId;

    if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'You need to be logged in to view your songs. Please log in or create an account.'
        });
      }

    // Récupérer l'historique d'écoute de l'utilisateur
    const history = await ListeningHistory.find({ user: userId }).populate('song');

    res.status(200).json({
        status: 'success',
        results: history.length,
        data: history
    });
});
