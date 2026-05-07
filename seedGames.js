const mongoose = require('mongoose');
require('dotenv').config(); 

const WouldYouRather = require('./models/WouldYouRather');

const gameQuestions = [
    {
        optionOneText: "Speak every language fluently but never be able to travel 🗣️",
        optionTwoText: "Travel to every country but never be able to speak the local languages ✈️",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
    },
    {
        optionOneText: "Have a perfect native accent with terrible grammar 🎭",
        optionTwoText: "Have perfect grammar with a very heavy, hard-to-understand accent 📝",
        imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
    },
    {
        optionOneText: "Only be able to practice speaking with an AI robot 🦾",
        optionTwoText: "Only practice with beginners who make the same mistakes as you 👥",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80"
    },
    {
        optionOneText: "Understand every joke in a foreign language but not be able to reply 🤐",
        optionTwoText: "Be able to reply perfectly but never understand the jokes 🤡",
        imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80"
    },
    {
        optionOneText: "Live in a country where you don't know the language at all 🌏",
        optionTwoText: "Live in your own country but everyone speaks a language you don't know 🏘️",
        imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"
    },
    {
        optionOneText: "Read a 500-page book in your target language 📖",
        optionTwoText: "Give a 30-minute public speech in your target language 🎤",
        imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80"
    },
    {
        optionOneText: "Accidentally insult your boss in a foreign language 👔",
        optionTwoText: "Accidentally insult your partner's parents in a foreign language 👵👴",
        imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80"
    },
    {
        optionOneText: "Instantly master 1 difficult language (like Chinese or Arabic) 🏯",
        optionTwoText: "Instantly master 3 easy languages (like Spanish, Italian, French) 🍷",
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
    },
    {
        optionOneText: "Only listen to music in your target language forever 🎧",
        optionTwoText: "Only watch movies in your target language forever 🎬",
        imageUrl: "https://images.unsplash.com/photo-1514525253361-bee8a4874a73?w=800&q=80"
    },
    {
        optionOneText: "Never use a dictionary again 📚",
        optionTwoText: "Never use a translator app again 📱",
        imageUrl: "https://images.unsplash.com/photo-1544640808-32ca72ac7f37?w=800&q=80"
    }
];

const seedDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
        
        if (!mongoURI) {
            console.error("❌ ERROR: MONGODB_URI not found in .env file!");
            return;
        }

        await mongoose.connect(mongoURI);
        console.log("📦 Connected to MongoDB successfully!");

        
        await WouldYouRather.deleteMany({});
        console.log("🧹 Old game questions cleared!");

        
        await WouldYouRather.insertMany(gameQuestions);
        console.log(`✅ Successfully added ${gameQuestions.length} new English questions to the database!`);

        mongoose.connection.close();
        console.log("👋 Operation complete, connection closed.");
        
    } catch (err) {
        console.error("❌ Database seeding error:", err);
        if (mongoose.connection.readyState !== 0) {
            mongoose.connection.close();
        }
    }
};

seedDB();