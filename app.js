const express = require("express");
const bodyParser = require("body-parser");
const uuid = require('uuid');
const AWS = require("aws-sdk")
require('dotenv').config();

AWS.config.update({
	region: "us-east-1",
	accessKeyId: process.env.accessKeyId, 
	secretAccessKey: process.env.secretAccessKey
});

vip_emails = new Set()
vip_emails.add("laszlogoch@mail.adelphi.edu");
vip_emails.add("mattvang@mail.adelphi.edu");
vip_emails.add("chays@adelphi.edu");
vip_emails.add("bertle@adelphi.edu");
vip_emails.add("saliyari@alumni.iu.edu");

reg_emails = new Set()

const app = express();

const PORT = process.env.PORT || 3000;

// create application/json parser
var jsonParser = bodyParser.json();
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
	console.log(sex);
	console.log(age);
	console.log(email);
})


app.post("/experimentEnded",jsonParser, function(req,res){
	let email = req.body.Item.email
	console.log(email);
	if (reg_emails.has(email) && !vip_emails.has(email)) {
		console.log(email);
		console.log("Email already used");
		return;
	}

	reg_emails.add(email);

	const docClient = new AWS.DynamoDB.DocumentClient();
	var params = req.body;
	params.Item.UID = uuid.v4();
	docClient.put(params, function(err, data) {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Added item:", JSON.stringify(data, null, 2));
		}
	});
})

app.post("/uploadData", jsonParser, function(req, res) {
	let email = req.body.Item.email
	console.log(email);
	if (reg_emails.has(email) && !vip_emails.has(email)) {
		console.log(email);
		console.log("Email already used");
		return;
	}

	reg_emails.add(email);
	
	const docClient = new AWS.DynamoDB.DocumentClient();
	var params = req.body;
    params.Item.UID = uuid.v4();
	console.log("Adding a new item...");
	docClient.put(params, function(err, data) {
		if (err) {
			console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
		} else {
			console.log("Added item:", JSON.stringify(data, null, 2));
		}
	});
});

app.listen(PORT, function() {
	console.log("Listening on port " + PORT + " . . .");
});