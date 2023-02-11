const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri =
	"mongodb+srv://somadhanDB:2NtSyMZYfjBYtjlQ@cluster0.1ndta.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		console.log("Connected to Database!");
		const database = client.db("somadhan");
		const userCollection = database.collection("users");
		const issueCollection = database.collection("issueCollection");

		//*POST Issue
		app.post("/issue", async (req, res) => {
			const issue = req.body;
			const result = await issueCollection.insertOne(issue);
			res.send(result);
		});
		//*GET Admin Issues
		app.post("/admin/byemail", async (req, res) => {
			const data = req.body;
			console.log(data);
			const query = { adminEmail: data.email, status: data.status };
			const issues = await issueCollection.find(query).toArray();
			res.send(issues);
		});
		//*GET User Issues
		app.post("/user/byemail", async (req, res) => {
			const data = req.body;
			console.log(data);
			const query = { userEmail: data.email, status: data.status };
			const issues = await issueCollection.find(query).toArray();
			res.send(issues);
		});

		//*POST A new user in user collection
		app.post("/users", async (req, res) => {
			const user = req.body;
			const result = await userCollection.insertOne(user);
			res.json(result);
		});

		//*Get all Issue
		app.get("/issues", async (req, res) => {
			const cursor = issueCollection.find({});
			const issues = await cursor.toArray();
			res.json(issues);
		});

		//*Get all Issue
		app.get("/issues/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const issue = await issueCollection.findOne(query);
			res.json(issue);
		});

		//*Put Google Login user in user collection
		app.put("/users", async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await userCollection.updateOne(filter, updateDoc, options);
			res.json(result);
		});

		//*UPDATE Status
		app.put("/status/:id", async (req, res) => {
			const id = req.params.id;
			const status = req.body;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					status: status.status,
				},
			};
			const result = await issueCollection.updateOne(filter, updateDoc, options);
			console.log("Updating issue Status");
			res.json(result);
		});

		//* Check Admin
		app.get("/users/:email", async (req, res) => {
			const email = req.params.email;

			const query = { email: email };
			const user = await userCollection.findOne(query);
			let isAdmin = false;
			if (user?.role === "admin") {
				isAdmin = true;
			}
			res.json({ admin: isAdmin });
		});
		//*DELETE Single Data
		app.delete("/issue/:id", async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await issueCollection.deleteOne(query);
			res.json(result);
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Running Somadhan Server");
});

app.listen(port, () => {
	console.log("Running Somadhan Server on port", port);
});
