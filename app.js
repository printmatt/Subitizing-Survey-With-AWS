const express = require("express");
const bodyParser = require("body-parser");
var sex = null;
var age = null;
const uuid = require('uuid');
const AWS = require("aws-sdk")

AWS.config.update({
	region: "us-east-1",
	accessKeyId: process.env.accessKeyId, 
	secretAccessKey: process.env.secretAccessKey
});

const app = express();

const PORT = process.env.PORT || 3000;
// create application/json parser
var jsonParser = bodyParser.json();
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static("public"));

app.post("/uploadGenderAge",jsonParser,function(req,res){
	sex = req.body.sex;
	age = req.body.age;
	console.log(req.body);
})

app.post("/uploadData", jsonParser, function(req, res) {
	const docClient = new AWS.DynamoDB.DocumentClient();
	var params = req.body;
    params.Item.UID = uuid.v4();
    params.Item.sex = sex;
	params.Item.age = age;
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