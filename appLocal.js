const express = require("express");
const bodyParser = require("body-parser");
const uuid = require('uuid');
const fs = require("fs");
const crypto = require("crypto");
var sex = null;
var age = null;
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

const dataFile = fs.createWriteStream("data.csv", {"flasg": "a"});

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
	currentVersion = (currentVersion + 1) % 3;
	if (currentVersion == 0) {
		res.sendFile(__dirname + "/public/Version1.json");
	} else if (currentVersion == 1) {
		res.sendFile(__dirname + "/public/Version2.json");
	} else {
		res.sendFile(__dirname + "/public/Version3.json");
	}
});

app.post("/uploadGenderAge",jsonParser,function(req,res){
	sex = req.body.sex;
	age = req.body.age;
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
	console.log(params);
	dataFile.write(`${currentVersion + 1},Dropout,${params.CompletedPercentage}\n`);
})
app.post("/uploadData", jsonParser, function(req, res) {
	const docClient = new AWS.DynamoDB.DocumentClient();
	var params = req.body;
    params.Item.UID = uuid.v4();
	params.Item.sex = sex;
	params.Item.age = age;
	console.log(params.Item);
	console.log("Adding a new item...");
	docClient.put(params, function(err, data) {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Added item:", JSON.stringify(data, null, 2));
		}
	});
	if (isEligible) {
		const answers = req.body.Item.answers.join(",");
		dataFile.write(`${currentVersion + 1},${sex},${age},${answers}\n`);
	}
});

app.listen(PORT, function() {
	console.log("Listening on port " + PORT + " . . .");
});