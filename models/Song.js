import mongoose from "mongoose";

const Schema = mongoose.Schema;

const songSchema = new Schema({

    name: {
        type: String, 
        unique: true, 
        required: true
    }, 
    description: {
        type: String, 
        required : true,
    },
    genre : {
        type: String, 
        required: true,
    },
    artiste: {
        type: String, 
        required: true,
    }, 
    file: {
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return /\.mp3$/i.test(v);
            },
            message: props => `${props.value} is not a valid mp3 file!`
        }
    },
    url: {
        type: String, 
    },
    thumbnail : {
        type: String, 
        required: true, 
    }, 
    duration: {
        type: String, 
        required: true,
        default : "00:00",
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});

// Méthode statique pour récupérer toutes les genres distinctes
songSchema.statics.getAllGenres = async function() {
    const genres = await this.aggregate([
        {
            $group: {
                _id: null,
                genre: { $addToSet: "$genre" }
                // otherColors: { $addToSet: "$colors.otherColors.name" }
            }
        },
        {
            $project: {
                _id: 0,
                allGenre: { $setUnion: ["$genre"] }
            }
        }
    ]);
    return genres.length ? genres[0].allGenre : [];
};


const Song = mongoose.model('Song', songSchema);
export default Song;