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
        const reviewsCollection = database.collection('reviews');

        //make a user admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //update an order status
        app.put('/orders/update', async (req, res) => {
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(updatedOrder) };
            const updateDoc = { $set: { status: 'shipped' } };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //check a user is admin or not
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

        // insert a new order POST API
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.json(result);
        })

        // insert a new product POST API
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.json(result);
        })

        // insert a new review POST API
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.json(result);
        })

        //get all products from db
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        //get all orders from db
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        //get all reviews from db
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
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

        //get orders by email
        app.get('/orders/:email', async (req, res) => {
            const userEmail = req.params;
            const query = { email: userEmail }
            const cursor = ordersCollection.find(userEmail);
            const result = await cursor.toArray();
            res.json(result);
        })

        //cancel an order
        app.delete('/orders/:id', async (req, res) => {
            const orderId = req.params;
            const query = { _id: ObjectId(orderId) }
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        //remove a product
        app.delete('/products/:id', async (req, res) => {
            const productId = req.params;
            const query = { _id: ObjectId(productId) }
            const result = await productCollection.deleteOne(query);
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
