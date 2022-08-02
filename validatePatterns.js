const fs = require("fs/promises");

async function validatePatterns() {
	const fileNames = await fs.readdir("./patternFiles");
	const namesFromFiles = fileNames.map((fileName) => fileName.slice(0, fileName.length - 5))
	const namesFromList = await fs.readFile("patternNames.txt").then((buf) => buf.toString().trim().split("\n"));
	const dict = {};
	namesFromFiles.forEach(function(name) { 
		if (typeof dict[name] == "undefined") dict[name] = 0;
		dict[name]--;
	});
	namesFromList.forEach(function(name) {
		if (typeof dict[name] == "undefined") dict[name] = 0;
		dict[name]++;
	});
	let failed = false;
	for (const name in dict) {
		if (dict[name] == -1) {
			console.log(name + " appears as a file but not in the list.");
			failed = true;
		}
		if (dict[name] == 1) {
			console.log(name + " appears in the list but not as a file.");
			failed = true;
		}
	}
	if (!failed) {
		console.log("There is a one-to-one correspondance between the file names and listed pattern names.");
	}
}

validatePatterns();
