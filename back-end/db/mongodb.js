import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
const DATABASE_URL = process.env.MONGO_DB_CLUSTER_URL;
console.log(DATABASE_URL);
import { MongoClient, ServerApiVersion } from "mongodb";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(DATABASE_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useUnifiedTopology: true,
  },
});

const CLT_CUSTOMER = "customers";
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const dbUsers = client.db("users");
    // await dbUsers.command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
    // const result = await dbUsers.createCollection(CLT_CUSTOMER);
    // const myobj = { name: "TR7", age: "39" };
    // await dbUsers.collection(CLT_CUSTOMER).insertOne(myobj, (err, res) => {
    //   if (err) throw err;
    //   console.log(res);
    // });
    // var myobj = [
    //   { name: "John", address: "Highway 71" },
    //   { name: "Peter", address: "Lowstreet 4" },
    //   { name: "Amy", address: "Apple st 652" },
    //   { name: "Hannah", address: "Mountain 21" },
    //   { name: "Michael", address: "Valley 345" },
    //   { name: "Sandy", address: "Ocean blvd 2" },
    //   { name: "Betty", address: "Green Grass 1" },
    //   { name: "Richard", address: "Sky st 331" },
    //   { name: "Susan", address: "One way 98" },
    //   { name: "Vicky", address: "Yellow Garden 2" },
    //   { name: "Ben", address: "Park Lane 38" },
    //   { name: "William", address: "Central st 954" },
    //   { name: "Chuck", address: "Main Road 989" },
    //   { name: "Viola", address: "Sideway 1633" },
    // ];
    // const res = await dbUsers.collection(CLT_CUSTOMER).insertMany(myobj);
    // console.log("Number of documents inserted: " + res.insertedCount);
    // const result = await dbUsers
    //   .collection(CLT_CUSTOMER)
    //   .find({ name: "TR7" }, { projection: { _id: 0 } })
    //   .toArray();
    // const result = await dbUsers
    //   .collection(CLT_CUSTOMER)
    //   .find()
    //   .sort({ address: 1, name: 1 })
    //   .toArray();
    const cltCustomers = dbUsers.collection(CLT_CUSTOMER);
    // const result = await cltCustomers.deleteMany({ name: "Chuck" });
    // const result = await cltCustomers.drop();
    const result = await dbUsers.dropCollection(CLT_CUSTOMER);
    console.log(result);
  } catch (err) {
    console.log(err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
// run().catch(console.dir);

export default run;
