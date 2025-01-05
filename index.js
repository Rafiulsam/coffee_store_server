const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

require('dotenv').config()


//middleware
app.use(cors())
app.use(express.json())

const uri = process.env.URI

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
      const result = await coffeeCollections.updateOne(filter, updatedCoffee,option)
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
  res.send("coffee server is running")
})

app.listen(port, () => {
  console.log(`coffee server is running on port:${port}`)
})