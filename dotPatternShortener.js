const fs = require("fs");

fs.readFile("./public/testCases.json", "utf8", (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	jsonData = JSON.parse(data);
	for (let i = 0; i < jsonData.testCases.length; i++) {
		jsonData.testCases[i].durationOfDotPatternInMilliseconds = 500;
	}
	console.log(jsonData);

	fs.writeFile("testCases.json", JSON.stringify(jsonData), (err) => {
		if (err) {
			console.error(err);
			return;
		}
	});
});
