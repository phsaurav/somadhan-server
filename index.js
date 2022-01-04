const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
	res.send("Running Genius Server");
});

app.listen(port, () => {
	console.log("Running Genius Server on port", port);
});
