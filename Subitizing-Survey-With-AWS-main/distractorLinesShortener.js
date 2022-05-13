const fs = require("fs");

function shortenPatterns(source, destination) {
	fs.readFile(source, "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}

		jsonData = JSON.parse(data);
		for (let i = 0; i < jsonData.testCases.length; i++) {
			for (let j = 0; j < jsonData.testCases[i].distractorLinePatterns.length; j++) {
				jsonData.testCases[i].distractorLinePatterns[j].durationInMilliseconds = 150;
			}
		}
		console.log(jsonData);

		fs.writeFile(destination, JSON.stringify(jsonData), (err) => {
			if (err) {
				console.error(err);
				return;
			}
		});
	});
}

shortenPatterns("./public/Version1_longDLP.json", "./public/Version1.json");
shortenPatterns("./public/Version2_longDLP.json", "./public/Version2.json");
shortenPatterns("./public/Version3_longDLP.json", "./public/Version3.json");