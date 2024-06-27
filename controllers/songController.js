import asyncHandler from "express-async-handler";
import Song from "../models/Song.js";
import ytdl from "ytdl-core";
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from "util";
import fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';

// Solution pour obtenir __dirname dans un module ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createSong = asyncHandler(async (req, res) => {
  //  GET user ID & CHECK IF HE IS LOGIN
  const userId = req.userAuthId;

  if (!userId) {
    return res.status(401).json({
      status: 'fail',
      message: 'You need to be logged in to remove product from the song. Please log in or create an account.'
    });
  }

  // Récupérer l'URL de la requête body
  const { url, description, genre } = req.body;

  // Vérification de l'URL
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({
      error: 'Invalid URL'
    });
  }

  try {
    // Récupérer les infos de la vidéo comme le titre
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const thumbnail = info.videoDetails.thumbnails[0].url;
    const artist = info.videoDetails.author.name;
    const duration = info.videoDetails.lengthSeconds;
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

    // Définir le chemin du fichier mp3
    const outputDir = path.resolve(__dirname, '..', 'downloads');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const output = path.resolve(outputDir, `${title}.mp3`);

    // Télécharger et convertir la vidéo en MP3
    const stream = ytdl(url, { filter: 'audioonly' });
    ffmpeg.setFfmpegPath('C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe'); // Chemin vers ffmpeg
    ffmpeg(stream)
      .audioBitrate(128)
      .save(output)
      .on('end', async () => {
        // Créer un document Song
        const newSong = new Song({
          name: title,
          description,
          genre,
          artiste: artist,
          file: `http://localhost:3100/downloads/${title}.mp3`, // Utiliser l'URL publique
          thumbnail,
          url,
          duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
          user: userId,
        });

        // Sauvegarder le document Song dans la base de données
        const songCreated = await newSong.save();

        // Envoyer une réponse
        res.status(201).json({
          status: 'success',
          msg: 'Song created successfully',
          data: songCreated
        });

        // Optionnel: Supprimer le fichier MP3 du serveur après la réponse
        // await unlinkAsync(outputPath);
      })
      .on('error', (err) => {
        console.error('Conversion error:', err);
        res.status(500).json({ error: 'Download or conversion failed', details: err });
      });
  } catch (error) {
    console.error('Processing error:', error);
    if (error.statusCode === 410) {
      res.status(410).json({ error: 'The video is no longer available (410 Gone).' });
    } else {
      res.status(500).json({ error: 'Processing failed', details: error });
    }
  }
});

// FETCH ALL
export const getAllSongs = asyncHandler(async (req, res) => {
  // Récupérer l'ID de l'utilisateur authentifié
  const userId = req.userAuthId;

  if (!userId) {
    return res.status(401).json({
      status: 'fail',
      message: 'You need to be logged in to view your songs. Please log in or create an account.'
    });
  }

  // Initialiser la requête pour filtrer par utilisateur
  let query = { user: userId };

  // Filtrage par titre
  if (req.query.title) {
    query.name = { $regex: req.query.title, $options: 'i' };
  }

  // Filtrage par artiste
  if (req.query.artiste) {
    query.artiste = { $regex: req.query.artiste, $options: 'i' };
  }

  // Filtrage par genre
  if (req.query.genre) {
    const genres = req.query.genre.split(",");
    query.genre = { $in: genres };
  }

  // Tri
  const sortField = req.query.sortField || 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
  const sortCriteria = { [sortField]: sortOrder };

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit);
  const skip = (page - 1) * limit;

  // Compter le nombre total de chansons correspondant aux critères
  const total = await Song.countDocuments(query);

  // Récupérer les chansons avec pagination et tri
  const songs = await Song.find(query)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit);

  // Récupérer tous les genres distincts
  const allGenre = await Song.distinct("genre", { user: userId });

  // Déterminer les informations de pagination
  const pagination = {};
  if (page < Math.ceil(total / limit)) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (page > 1) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  return res.status(200).json({
    status: 'success',
    total,
    pagination,
    results: songs.length,
    allGenre,
    songs,
  });
});

// FETCH ONE 
export const getSongDetail = asyncHandler(async (req, res) => {
    const id = req.params.id;
  
    const song = await Song.findOne({_id: id})
    .populate('user')
    .exec();
  
  
    if (!song) {
        return res.status(404).json({
            status: 'fail',
            message: 'Product does not exist',
        });
    }
  
    const songObj = song.toObject({ virtuals: true });
  
  
    res.status(200).json({
        status: 'success',
        product: songObj,
    });
  });

// DELETE ONE 
// export const removeSong = asyncHandler(async (req, res) => {

//     /* OBJECTIF : 
//        --------
//       Quand un nouvel item est ajouté au panier, cette fonction doit permettre de 
//       supprimer ce nouvel item du panier. 
//       A la suppression, nous devons récuperer l'id de produit dans userProductStatus 
//       et mettre a jour le status isAdded a false.
//     */
  
//     // RECUPERATION DES PARAMS
//     const id = req.params.id;
  
//     // GET user ID & CHECK IF HE IS LOGIN
//     const userId = req.userAuthId; 
  
//     if (!userId) {
//       return res.status(401).json({
//         status: 'fail',
//         message: 'You need to be logged in to remove product from the song. Please log in or create an account.'
//       });
//     }
  
//     // Verification de la présence de l'item sélectionné dans la collection CartItem à partir de l'id et userId
//     const songItem = await Song.findOne({ _id: id, user: userId });
  
//     if (!songItem) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Cart item not found or not associated with the user',
//         });
//     }
  
//     // Si la verification a réussi, suppressions de l'item dans CartItem
//     await Song.deleteOne({ _id: id });
  
//     // Mis a jour de CartItem : TotalPrice, TotalItem
//     const remainingItems = await Song.find({ user: userId });

//     let totalItem = 0;
  
//     if (remainingItems.length > 0) {
//         totalItem = remainingItems.length;
//     }
  
//     return res.status(200).json({
//         status: 'success',
//         message: 'Product successfully deleted from the cart',
//         song: remainingItems,
//         totalItem,
//     });
//   });

export const removeSong = asyncHandler(async (req, res) => {

  /* OBJECTIF : 
     --------
    Quand un nouvel item est ajouté au panier, cette fonction doit permettre de 
    supprimer ce nouvel item du panier. 
    A la suppression, nous devons récuperer l'id de produit dans userProductStatus 
    et mettre a jour le status isAdded a false.
  */

  // RECUPERATION DES PARAMS
  const id = req.params.id;

  // GET user ID & CHECK IF HE IS LOGIN
  const userId = req.userAuthId; 

  if (!userId) {
    return res.status(401).json({
      status: 'fail',
      message: 'You need to be logged in to remove product from the song. Please log in or create an account.'
    });
  }

  // Verification de la présence de l'item sélectionné dans la collection CartItem à partir de l'id et userId
  const songItem = await Song.findOne({ _id: id, user: userId });

  if (!songItem) {
      return res.status(404).json({
          status: 'fail',
          message: 'Cart item not found or not associated with the user',
      });
  }

  // Si la verification a réussi, suppressions de l'item dans CartItem
  await Song.deleteOne({ _id: id });

  // Mis a jour de CartItem : TotalPrice, TotalItem
  const remainingItems = await Song.find({user: userId});

  let totalItem = 0;

  if (remainingItems.length > 0) {
      totalItem = remainingItems.length;
  }

  return res.status(200).json({
      status: 'success',
      message: 'Product successfully deleted from the cart',
      song: remainingItems,
      totalItem,
  });
});

// DELETE ALL
// export const clearAllSong= asyncHandler(async (req, res) => {
//     try {
  
//       // GET user ID & CHECK IF HE IS LOGIN
//       const userId = req.userAuthId;
  
//       if (!userId) {
//         return res.status(401).json({
//           status: 'fail',
//           message: 'You need to be logged in to clear the playlist. Please log in or create an account.'
//         });
//       }
  
//       // Supprimer tous les articles du panier de l'utilisateur
//       await Song.deleteMany({ user: userId });

  
//       return res.status(200).json({
//         status: 'success',
//         message: 'Le panier a été vidé avec succès',
//         song: [],
//         totalItem: 0,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: 'fail',
//         message: 'Une erreur est survenue lors du vidage du panier',
//         error: error.message,
//       });
//     }
//   });

export const clearAllSong= asyncHandler(async (req, res) => {
  try {

    // GET user ID & CHECK IF HE IS LOGIN
    const userId = req.userAuthId;

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'You need to be logged in to clear the playlist. Please log in or create an account.'
      });
    }

    // Supprimer tous les articles du panier de l'utilisateur
    await Song.deleteMany({user: userId});


    return res.status(200).json({
      status: 'success',
      message: 'Le panier a été vidé avec succès',
      song: [],
      totalItem: 0,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'fail',
      message: 'Une erreur est survenue lors du vidage du panier',
      error: error.message,
    });
  }
});
  
// ADD TO PLAYLIST

// HISTORY OF LISTENNING 

