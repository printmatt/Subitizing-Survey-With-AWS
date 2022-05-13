const fs = require("fs");

fs.readFile("./public/testCases.json", "utf8", (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	jsonData = JSON.parse(data);
	for (let i = 0; i < jsonData.testCases.length; i++) {
		for (let j = 0; j < jsonData.testCases[i].dotPatterns.length; j++) {
			jsonData.testCases[i].dotPatterns[j].xCoord /= 442;
			jsonData.testCases[i].dotPatterns[j].yCoord /= 392;
		}
	}

	fs.writeFile("testCases.json", JSON.stringify(jsonData), (err) => {
		if (err) {
			console.error(err);
			return;
		}
	});
});
