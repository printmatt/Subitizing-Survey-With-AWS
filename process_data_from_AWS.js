var fs = require('fs');
const fs_promises = require("fs/promises");
const deepEqual = require('deep-equal');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const objectsToCsv = require('objects-to-csv');

var data = null
const FILES_PATH = "./patternFiles";

class TestCase {
}

class TestCaseFromFile extends TestCase {
	constructor(fileName) {
		super();
		this.fileName = fileName;
		this.name = this.fileName.slice(0, this.fileName.length - 5);
	}
	// Using a builder function to bundle async code with construction
	static async create(fileName) {
		const testCase = new TestCaseFromFile(fileName);
		await testCase.loadFile();
		testCase.parseName();
		return testCase;
	}
	async loadFile() {
		this.contents = await fs_promises.readFile(FILES_PATH + "/" + this.fileName).then((buf) => JSON.parse(buf.toString()));
	}
	parseName() {
		const re = /([AR])(\d+)([a-z])(\d?)/;
		const parsedName = re.exec(this.name);
		this.inAllTests = (parsedName[1] == "A") ? true : false;
		this.numDots = parseInt(parsedName[2]);	
		this.shape = parsedName[3];
		this.version = parseInt(parsedName[4]);
		// Group all versions of the same pattern into the same class.
		this.patternClass = parsedName[1] + parsedName[2] + parsedName[3];
	}
}

// parse in data and start processing
var parser = parse({ columns: true }, async function (err, records) {
    data = records;

    for (let i = 0; i < data.length; i++) {
        var userAns = JSON.parse(data[i].answers)
        console.log(data[i].version)
        data[i].correctAns = []
        data[i].correctAns = compareAns(userAns, data[i].version)
        data[i].answersDifference = await ansDifference(userAns, data[i].version).then((diff) => {return diff})
        data[i].answers = userAns.map((ans) =>{
            return parseInt(ans["S"]);
        })
        var score = 0
        var dropped = false
        data[i].correctAns.forEach((correct) => {
            if (correct == 1){
                score += 1;
            }
            if (correct == -1){
                dropped = true
            }
        })
        data[i].score = score
        data[i].dropped = dropped ? "yes" : ""
    }

    fs.writeFileSync('./AWSResults/AWSResults.json',JSON.stringify(data));
    new objectsToCsv(data).toDisk('./AWSResults/AWSResults.csv');


});


// Pipe the data from CSV file to be parsed
fs.createReadStream('subitizingResult.csv').pipe(parser);




const compareAns = (userAns, version) => {
    var correct = []
    jsonData = JSON.parse(fs.readFileSync("./public/Version" + version + ".json", "utf8"))
    for (let i = 0; i < userAns.length; i++) {
        correct[i] = jsonData.testCases[i].dotPatterns.length == userAns[i]["S"] ? 1 : 0;
    }

    for (let i = userAns.length; i < jsonData.testCases.length; i++) {
        correct[i] = -1;
    }


    return correct;


}


async function ansDifference(userAns, version) {
    const fileNames = await fs_promises.readdir(FILES_PATH);
	// Create array of TestCase objects.
	const patternCases = [];
	for (let i = 0; i < fileNames.length; i++) {
		patternCases.push(await TestCaseFromFile.create(fileNames[i]));
	}

    var diff = []
    jsonData = JSON.parse(fs.readFileSync("./public/Version" + version + ".json", "utf8"))
    
    for (let i = 0; i < jsonData.testCases.length; i++){
        for (let j = 0; j < patternCases.length; j++){
            if (deepEqual(patternCases[j].contents.dotPatterns,jsonData.testCases[i].dotPatterns)){
                jsonData.testCases[i].name = patternCases[j].name
                break
            }
        }
        if(jsonData.testCases[i].name == null){
            jsonData.testCases[i].name = "real_random_" + jsonData.testCases[i].dotPatterns.length
        }
    }

    for (let i = 0; i < userAns.length; i++) {
        diff[i] = userAns[i]["S"] + "_" + jsonData.testCases[i].dotPatterns.length + "_" + jsonData.testCases[i].name;
        
    }

    for (let i = userAns.length; i < jsonData.testCases.length; i++) {
        diff[i] = "empty";
    }

    return diff;


}