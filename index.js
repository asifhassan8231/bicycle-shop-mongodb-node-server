const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yb4zx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("volcanoBicycle");
        const productCollection = database.collection("products");
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');

        // insert a new order POST API
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.json(result);
        })

        //get all products from db
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        //get product by id
        app.get('/products/:id', async (req, res) => {
            const productId = req.params;
            const query = { _id: ObjectId(productId) }
            const result = await productCollection.findOne(query);
            res.json(result);
        })

        //insert an user data
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.json(result);
        });

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello 5000!')
})

app.listen(port, () => {
    console.log('listening to', port);
})
