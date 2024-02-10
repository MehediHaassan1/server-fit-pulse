const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;


// middleware 
app.use(cors())
app.use(express.json())
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    const token = authorization.split(' ')[1]
    console.log(token);
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                res.status(403).send({ error: true, message: 'unauthorized access' })
            }
            req.decoded = decoded;
            next();
        });
    }
}

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
        const usersCollection = client.db('fitPulseDB').collection('users');
        const membershipCollection = client.db('fitPulseDB').collection('membership');

        app.post('/user', async (req, res) => {
            const userInfo = req.body;
            const result = await usersCollection.insertOne(userInfo);
            res.send(result);
        })

        app.get('/user', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            if (result) {
                res.send({ insertedId: true, message: "User already exists" })
            } else {
                res.send({ insertedId: false, message: "New user" })
            }
        })

        app.get('/user/:uid', verifyJWT, async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid }
            const result = await usersCollection.findOne(query)
            res.send(result);
        })

        app.patch('/user/:uid', verifyJWT, async (req, res) => {
            const uid = req.params.uid;
            const info = req.body;
            console.log(info);
            const filter = { uid: uid }
            const updateDoc = {
                $set: info,
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/user/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        // JSONWEBTOKEN
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' });
            res.send({ token });
        });

        // reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

        // membership 
        app.get('/membership', async (req, res) => {
            const result = await membershipCollection.find().toArray();
            res.send(result);
        })


    } finally {
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Fit Pulse listening on port ${port}`)
})