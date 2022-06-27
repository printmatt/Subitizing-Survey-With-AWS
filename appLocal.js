
const express = require("express");
const bodyParser = require("body-parser");
const uuid = require('uuid');
const fs = require("fs");
const crypto = require("crypto");

var isEligible = null;
var emailHashSet = {}
const AWS = require("aws-sdk")
AWS.config.update({
	region: "us-east-1",
    endpoint: "http://localhost:8000",
	accessKeyId: "fakeMyKeyId", 
	secretAccessKey: "fakeSecretAccessKey",
});

function hashString(text) {
	const hash = crypto.createHash("sha256");
	return hash.update(text).digest("base64");
}

const dataFile = fs.createWriteStream("data.csv", {"flags": "a"});

const app = express();

const PORT = process.env.PORT || 3000;
// create application/json parser
var jsonParser = bodyParser.json()

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(express.static("public"));

let currentVersion = -1;
app.get("/getNextTest", function (req, res) {
	currentVersion = Math.round(Math.random()*2);
	if (currentVersion == 0) {
		res.sendFile(__dirname + "/public/Version1.json");
	} else if (currentVersion == 1) {
		res.sendFile(__dirname + "/public/Version2.json");
	} else {
		res.sendFile(__dirname + "/public/Version3.json");
	}
	console.log("Serving version " + (currentVersion + 1) + ". . .");
});

app.post("/uploadGenderAge",jsonParser,function(req,res){
	let sex = req.body.sex;
	let age = req.body.age;
	let email = req.body.email;
	const isEdu = (email.substring(email.length - 4, email.length) == ".edu");
	const emailHash = hashString(email);
	isEligible = isEdu && !(emailHash in emailHashSet);
	emailHashSet[emailHash] = true;
	console.log(isEligible);
	console.log(sex);
	console.log(age);
	console.log(emailHashSet);
})

app.post("/experimentEnded",jsonParser, function(req,res){
	var params = req.body;
	params.Item.UID = uuid.v4();
	console.log(params);
	dataFile.write(`${currentVersion + 1},Dropout,${params.CompletedPercentage}\n`);
})

app.post("/uploadData", jsonParser, function(req, res) {
	const docClient = new AWS.DynamoDB.DocumentClient();
	var params = req.body;
    params.Item.UID = uuid.v4();
	console.log(params.Item);
	console.log("Adding a new item...");
	docClient.put(params, function(err, data) {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Added item:", JSON.stringify(data, null, 2));
		}
	});
	console.log("If eligible, saving data for version " + (currentVersion + 1) + " . . .")
	if (isEligible) {
		console.log("Is eligible.  Saving data.");
		const answers = req.body.Item.answers.join(",");
		const screenWidth = req.body.screenWidth;
		const screenHeight = req.body.screenHeight;
		const sex = params.Item.sex;
		const age = params.Item.age;
		const userFeedback = params.Item.userFeedback;
		escapedUserFeedback = userFeedback.replace("\"", "\"\"");
		dataFile.write(`${currentVersion + 1},${sex},${age},${screenWidth},${screenHeight},${answers},\"${escapedUserFeedback}\"\n`);
	}
});

app.listen(PORT, function() {
	console.log("Listening on port " + PORT + " . . .");
});

