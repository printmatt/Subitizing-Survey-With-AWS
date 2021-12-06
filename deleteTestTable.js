var AWS = require("aws-sdk");

AWS.config.update({
	region: "us-east-1",
    endpoint: "http://localhost:8000",
	accessKeyId: "fakeMyKeyId", 
	secretAccessKey: "fakeSecretAccessKey",
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "subitization_results"
};

dynamodb.deleteTable(params, function(err, data) {
    if (err) {
        console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
