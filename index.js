const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()


//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdmdnc2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

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
    await client.connect();

    const coffeeCollections = client.db('coffeesDB').collection("coffees")
    const userCollections = client.db("coffeesDB").collection("users")

    app.get("/coffees", async (req, res) => {
      const result = await coffeeCollections.find().toArray()
      res.send(result)
    })

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollections.findOne(query)
      res.send(result)
    })

    app.put('/coffees/:id', async (req, res) => {
      const id = req.params.id
      const coffee = req.body
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true }
      const updatedCoffee = {
        $set: {
          name: coffee.name,
          price: coffee.price,
          supplier: coffee.supplier,
          test: coffee.test,
          category: coffee.category,
          details: coffee.details,
          photo: coffee.photo
        }
      }
      const result = await coffeeCollections.updateOne(filter, updatedCoffee, option)
      res.send(result)
    })

    app.post("/coffees", async (req, res) => {
      const newCoffee = req.body
      console.log(newCoffee);
      const result = await coffeeCollections.insertOne(newCoffee)
      res.send(result)
    })

    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await coffeeCollections.deleteOne(query)
      res.send(result)

    })

    // user related APIs

    app.get("/users", async (req, res) => {
      const result = await userCollections.find().toArray()
      res.send(result)
    })

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollections.insertOne(user)
      res.send(result)
    })

    app.patch("/users", async (req, res) => {
      const user = req.body
      console.log(user);
      const filter = { email: user.email }
      const updateUser = {
        $set: {
          lastSignIn: user.lastSignIn
        }
      }
      const result = await userCollections.updateOne(filter, updateUser)
      res.send(result)
    })

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollections.deleteOne(query)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Coffee store server is running")
})

app.listen(port, () => {
  console.log(`coffee server is running on port:${port}`)
})