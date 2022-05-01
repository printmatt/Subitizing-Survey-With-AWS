const fs = require("fs");

function seededRand(x, m, a, c) {
    return function() {
        x = ((a * x) + c) % m;
        return x / m;
    }
}

function completeShuffle(randGen, arr) {
    let currentIndex = arr.length, randomIndex;
    while (currentIndex != 0) {
        //pick remaining element
        randomIndex = Math.floor(randGen() * currentIndex);
        currentIndex--;
        [arr[currentIndex], arr[randomIndex]] = [
            arr[randomIndex], arr[currentIndex]];
    }
    return arr;
}

function shuffleFile(filePath, newFilePath, randGen) {
    fs.readFile(filePath, "utf8", (err, data) => {
    	if (err) {
    		console.error(err);
    		return;
    	}
	    jsonData = JSON.parse(data);
        jsonData.testCases = completeShuffle(randGen, jsonData.testCases);

	    fs.writeFile(newFilePath, JSON.stringify(jsonData), (err) => {
		    if (err) {
			    console.error(err);
			    return;
		    }
	    });
    });
}

randGen = seededRand(1234432,123412,1243231,123412412);
shuffleFile("./public/Version1_unshuffled.json", "./public/Version1.json", randGen);
shuffleFile("./public/Version2_unshuffled.json", "./public/Version2.json", randGen);
shuffleFile("./public/Version3_unshuffled.json", "./public/Version3.json", randGen);