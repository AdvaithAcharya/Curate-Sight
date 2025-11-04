const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Artwork = require('../models/Artwork');
const path = require('path');
const fetch = require('node-fetch');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const sample = [
  {
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    description: 'A depiction of the view from the east-facing window of his asylum room at Saint-Rémy-de-Provence.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Vincent_van_Gogh_-_De_sterrennacht_-_Google_Art_Project.jpg',
    videoUrl: 'https://www.youtube.com/embed/oxHnRfhDmrk',
    audioUrl: '',
    tags: ['night', 'stars', 'sky', 'village', 'cypress', 'post-impressionism']
  },
  {
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: '1503',
    description: 'A portrait of Lisa Gherardini, famed for her enigmatic smile.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Mona_Lisa.jpg',
    videoUrl: 'https://www.youtube.com/embed/Ar8naO5hH7E',
    audioUrl: '',
    tags: ['portrait', 'renaissance', 'woman', 'smile']
  },
  {
    title: 'The Persistence of Memory',
    artist: 'Salvador Dalí',
    year: '1931',
    description: 'Iconic surrealist painting featuring melting clocks.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
    videoUrl: 'https://www.youtube.com/embed/9i3plKXU1lw',
    audioUrl: '',
    tags: ['surrealism', 'clocks', 'desert', 'time']
  },
  {
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: '1665',
    description: 'A tronie of a girl wearing an exotic dress and a large pearl earring.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Meisje_met_de_parel.jpg',
    videoUrl: 'https://www.youtube.com/embed/zj8c2AUZ2uY',
    audioUrl: '',
    tags: ['portrait', 'baroque', 'earring', 'girl']
  },
  {
    title: 'The Scream',
    artist: 'Edvard Munch',
    year: '1893',
    description: 'Expressionist masterpiece depicting a figure with an agonized expression against a blood-red sky.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/The_Scream.jpg',
    videoUrl: 'https://www.youtube.com/embed/2S8VfM2YZyI',
    audioUrl: '',
    tags: ['expressionism', 'sky', 'bridge', 'scream']
  },
  {
    title: 'The Birth of Venus',
    artist: 'Sandro Botticelli',
    year: '1486',
    description: 'Depicts the goddess Venus arriving at the shore after her birth.',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Birth_of_Venus_Botticelli.jpg',
    videoUrl: 'https://www.youtube.com/embed/teYxJ71g-NE',
    audioUrl: '',
    tags: ['renaissance', 'mythology', 'venus', 'sea']
  }
];

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
    console.log('Connected. Computing fingerprints & seeding artworks...');

    // No embeddings needed; seed plain documents
    for (const item of sample) {
      // pass
    }

    await Artwork.deleteMany({});
    await Artwork.insertMany(sample);
    console.log('Seed complete:', await Artwork.countDocuments(), 'artworks.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
