const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5001;
var admin = require("firebase-admin");
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

async function verifyToken(req, res, next) {
	if (req.headers.authorization?.startsWith("Bearer ")) {
		const idToken = req.headers.authorization.split(" ")[1];
		try {
			const decodedUser = await admin.auth().verifyIdToken(idToken);
			req.decodedEmail = decodedUser.email;
		} catch {}
	}
	next();
}

//middleware
app.use(cors());
app.use(express.json());
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

		app.get("/users", async (req, res) => {
			const cursor = userCollection.find({});
			const users = await cursor.toArray();
			res.send(users);
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

// mongodb end

app.get("/", (req, res) => {
	res.send("Hola");
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
