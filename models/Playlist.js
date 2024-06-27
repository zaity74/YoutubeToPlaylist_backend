import mongoose from "mongoose";

const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    cover: {
        type: String,
    },
    songs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
        },
    ],
    totalDuration: {
        type: String,
        required: true,
        default: '00:00',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Helper functions to convert duration
const convertDurationToSeconds = (duration) => {
    const [minutes, seconds] = duration.split(':').map(Number);
    return (minutes * 60) + seconds;
};

const convertSecondsToDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// Middleware pre-save pour calculer la durée totale de la playlist
playlistSchema.pre('save', async function(next) {
    try {
        if (this.songs && this.songs.length > 0) {
            const songs = await mongoose.model('Song').find({ _id: { $in: this.songs } });
            const totalSeconds = songs.reduce((acc, song) => acc + convertDurationToSeconds(song.duration), 0);
            this.totalDuration = convertSecondsToDuration(totalSeconds);
        } else {
            this.totalDuration = '00:00';
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;
