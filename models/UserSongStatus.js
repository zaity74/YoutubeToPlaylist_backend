import mongoose from 'mongoose';

// Créer une table pour attribuer a chaque utilisateur un produit 
// 1 produit peut etre assigné a different utilisateur

const userSongStatusSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true 
    },
  song: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Song', 
    required: true 
    },
  isAdded: { 
    type: Boolean, 
    default: false 
    }
});

const UserSongStatus = mongoose.model('UserSongStatus', userSongStatusSchema);

export default UserSongStatus;