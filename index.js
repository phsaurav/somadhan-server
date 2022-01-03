const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const app = express();
const path = require('path');

const cors = require('cors');
require('dotenv').config();
const server = require('http').createServer(app);
const { MongoClient } = require('mongodb');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname + '/public')));

// socket io start
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});

server.listen(3001, () => {
  console.log('SERVER RUNNING');
});

// socket io end

// mongodb start

const port = process.env.PORT || 5000;
const uri =
  'mongodb+srv://somadhan:M7yMs33QSHUHx3hq@cluster0.2ffsd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('somadhan');
    const issueCollection = database.collection('issues');
    const userCollection = database.collection('users');

    // insert an issue
    app.post('/issue', async (req, res) => {
      const issue = req.body;
      const result = await issueCollection.insertOne(issue);
      res.json(result);
    });

    // insert an user from registration
    app.post('/user', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.get('/users', async (req, res) => {
      const cursor = userCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    //insert google login user
    app.put('/user', async (req, res) => {
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
  const collection = client.db('test').collection('devices');
  // perform actions on the collection object
  //   client.close();
});

// mongodb end

app.get('/', (req, res) => {
  res.send('Hola');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
