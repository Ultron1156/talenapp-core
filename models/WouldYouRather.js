const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WouldYouRatherSchema = new Schema({
    optionOneText: {
        type: String,
        required: true
    },
    optionTwoText: {
        type: String,
        required: true
    },
    // imageUrl tamamen KALDIRILDI!
    optionOneVotes: {
        type: Number,
        default: 0
    },
    optionTwoVotes: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WouldYouRather', WouldYouRatherSchema);