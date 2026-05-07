const mongoose = require('mongoose');
require('dotenv').config(); 
const WouldYouRather = require('./models/WouldYouRather');

// 25 Çekirdek Kategori A - Dil/Sosyalleşme
const languageOptions = [
    "Speak every language fluently", "Have a perfect native accent", "Understand every joke in a foreign language", 
    "Read a 500-page book in your target language", "Accidentally insult your boss in a foreign language",
    "Instantly master 1 difficult language (like Chinese)", "Only listen to music in your target language forever",
    "Never use a dictionary again", "Only be able to practice speaking with an AI robot", "Give a 30-minute public speech in your target language",
    "Forget your native language for a year", "Teach English to a famous celebrity", "Only speak in idioms for a week",
    "Dream entirely in a language you don't know", "Translate a famous novel", "Argue and win in a foreign language",
    "Sing a song perfectly in front of native speakers", "Understand ancient dead languages", "Communicate only with emojis for a month",
    "Learn vocabulary twice as fast", "Never make a grammar mistake again", "Speak like a Shakespearean character",
    "Have subtitles floating in real life when people speak", "Read minds but only in a language you hate", "Have a telepathic translator chip in your brain"
];

// 25 Çekirdek Kategori B - Seyahat/Yaşam
const travelOptions = [
    "Travel to every country but never be able to speak the local languages", "Have perfect grammar with a very heavy, hard-to-understand accent",
    "Be able to reply perfectly but never understand the jokes", "Live in your own country but everyone speaks a language you don't know",
    "Accidentally insult your partner's parents in a foreign language", "Instantly master 3 easy languages (like Spanish, Italian)",
    "Only watch movies in your target language forever", "Never use a translator app again", "Only practice with beginners who make the same mistakes as you",
    "Live in a country where you don't know the language at all", "Get lost in Tokyo with no map or internet", "Eat only local street food for a year",
    "Travel only by train for the rest of your life", "Live out of a small backpack for 5 years", "Never be able to take a photograph while traveling",
    "Stay in a 5-star hotel but never leave the room", "Explore a deserted island alone", "Hitchhike across South America",
    "Live in a van but travel the world", "Always have a delayed flight by 10 hours", "Have unlimited free flights but only in economy class",
    "Work as a tour guide in a city you don't know", "Only travel to places with extreme cold weather", "Never be allowed to return to your home country", "Be a famous travel vlogger but hate traveling"
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

        // 1. ESKİ RESİMLİ SORULARI TEMİZLE
        await WouldYouRather.deleteMany({});
        console.log("🧹 Old game questions cleared!");

        // 2. YENİ 100 SORUYU OLUŞTUR (A ve B listelerinden karıştırarak)
        const newQuestions = [];
        let counter = 0;
        
        for (let i = 0; i < languageOptions.length; i++) {
            for (let j = 0; j < 4; j++) { // 25 * 4 = 100 Soru
                const option2Index = (i + j + 1) % travelOptions.length;
                newQuestions.push({
                    optionOneText: languageOptions[i],
                    optionTwoText: travelOptions[option2Index]
                });
                counter++;
                if (counter === 100) break;
            }
            if (counter === 100) break;
        }

        // 3. VERİTABANINA YÜKLE
        await WouldYouRather.insertMany(newQuestions);
        console.log(`✅ Successfully added ${newQuestions.length} new English questions to the database without images!`);

        mongoose.connection.close();
        console.log("👋 Operation complete, connection closed.");
        
    } catch (err) {
        console.error("❌ Database seeding error:", err);
        if (mongoose.connection.readyState !== 0) mongoose.connection.close();
    }
};

seedDB();