require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// orchid
// password
// a25fTeWuvNnIwIkg
//  console.log(process.env.DB_USER)
//  console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ezyq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const movieCollection = client.db('movieDB').collection('movie');
    const favouriteCollection = client.db('movieDB').collection('favourites');



    // Get All Movies
    app.get('/movies', async (req, res) => {
      const cursor = movieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // Get Movie by ID
    app.get('/movie/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const movie = await movieCollection.findOne(query)
      res.send(movie);
    })

    // Delete Movie
    app.delete('/movie/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const movie = await movieCollection.deleteOne(query)
      res.send(movie);
    })

    // Featured Movies
    app.get('/featured', async (req, res) => {
      const featuredMovies = await movieCollection
        .find()
        .sort({ rating: -1 })
        .limit(6)
        .toArray();
      res.send(featuredMovies);
    })

    // Add Movie
    app.post('/movies', async (req, res) => {
      const newMovie = req.body;
      // console.log(newMovie);
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    })

    // Get favorite movies by user email
    app.get('/favourites', async (req, res) => {
      const userEmail = req.query.email;
      let favourites;

      if (userEmail) {
        favourites = await favouriteCollection.find({ userEmail }).toArray();
      } else {
        favourites = await favouriteCollection.find().toArray(); // return all
      }

      res.send(favourites);
    });


    // Add to favorites
    app.post('/favourites', async (req, res) => {
      const favMovie = req.body;
      const result = await favouriteCollection.insertOne(favMovie);
      res.send(result);
    });


    // Delete favorite movie by ID
    app.delete('/favourites/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favouriteCollection.deleteOne(query);
      res.send(result);
    });


    // Movie Update
    app.put('/movie/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedMovie = req.body;
      const movie = {
        $set: {
          title: updatedMovie.title,
          poster: updatedMovie.poster,
          genre: updatedMovie.genre,
          duration: updatedMovie.duration,
          year: updatedMovie.year,
          summary: updatedMovie.summary,
          rating: updatedMovie.rating
        }
      }

      const result = await movieCollection.updateOne(filter, movie, options);
      res.send(result);

    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send(`Nabila's server is running`)
})

app.listen(port, () => {
  console.log(`Nabila's server is running on port:${port}`)
})