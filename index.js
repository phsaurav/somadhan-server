const express = require("express");
const app = express();
const path = require("path");

const cors = require("cors");
require("dotenv").config();
const server = require("http").createServer(app);

const { MongoClient } = require("mongodb");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname + "/public")));

const port = process.env.PORT || 5000;
const uri =
	"mongodb+srv://somadhan:M7yMs33QSHUHx3hq@cluster0.2ffsd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		const database = client.db("somadhan");
		const issueCollection = database.collection("issues");
		const userCollection = database.collection("users");

		// insert an issue
		app.post("/issue", async (req, res) => {
			const issue = req.body;
			const result = await issueCollection.insertOne(issue);
			res.json(result);
		});

		// insert an user from registration
		app.post("/user", async (req, res) => {
			const user = req.body;
			const result = await userCollection.insertOne(user);
			console.log(result);
			res.json(result);
		});

		//insert google login user
		app.put("/user", async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await userCollection.updateOne(filter, updateDoc, options);
			res.json(result);
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

client.connect((err) => {
	const collection = client.db("test").collection("devices");
	// perform actions on the collection object
	//   client.close();
});

app.get("/", (req, res) => {
	res.send("Hola");
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
