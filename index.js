const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


// middleware 
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Fit pulse server is running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xgvlmd8.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const reviewsCollection = client.db("fitPulseDB").collection('reviews');
        



    } finally {
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Fit Pulse listening on port ${port}`)
})