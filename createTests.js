const fs = require("fs/promises");
const FILES_PATH = "./patternFiles";

const distractorLinePatterns = [
	{
		numberOfDistractorLines: 100,
		durationInMilliseconds: 150,
		colorPalette: ["red", "orange", "yellow", "green", "blue", "purple", "black", "pink","brown"],
		minWidth: 1,
		maxWidth: 1
	},
	{
		numberOfDistractorLines: 100,
		durationInMilliseconds: 150,
		colorPalette: ["red", "orange", "yellow", "green", "blue", "purple", "black", "pink","brown"],
		minWidth: 1,
		maxWidth: 1
	}
];

const randoms = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2];

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
		this.contents = await fs.readFile(FILES_PATH + "/" + this.fileName).then((buf) => JSON.parse(buf.toString()));
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

class TestCaseFromRandom extends TestCase {
	constructor(numberOfDots) {
		super();
		this.numberOfDots = numberOfDots;
		this.contents = this.placeDots(this.numberOfDots, 0.15);
	}
	placeDots(numberOfDots, minDistance) {
		let dotsPlaced =  {"dotPatterns": []};
		for (let i = 0; i < numberOfDots; i++) {
			let dotsDistanced = false;
			let newDot = null;
			while (!dotsDistanced) {
				newDot = {"type": "dot",
					"color": "#000000",
					"dotRadius": 8,
					"xCoord": 0.1 + Math.random()*0.8,
					"yCoord": 0.1 + Math.random()*0.8};
				console.log(newDot);
				let foundCloseDot = false;
				for (const dot of dotsPlaced.dotPatterns) {
					const dx = newDot.xCoord - dot.xCoord;
					const dy = newDot.yCoord - dot.yCoord;
					if (dx * dx + dy * dy < minDistance * minDistance) {
						foundCloseDot = true;
						break;
					}
				}
				if (!foundCloseDot) {
					dotsDistanced = true;
				}
				console.log(newDot);
			}
			dotsPlaced.dotPatterns.push(newDot);
		}
		return dotsPlaced;
	}
}

// Fisher-Yates shuffling algorithm
function shuffleArray(arr) {
	const newArr = arr.slice();
	for (let i = newArr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = newArr[i];
		newArr[i] = newArr[j];
		newArr[j] = temp;
	}
	return newArr;
}

async function createTests() {
	const fileNames = await fs.readdir(FILES_PATH);
	// Create array of TestCase objects.
	const testCases = [];
	for (let i = 0; i < fileNames.length; i++) {
		testCases.push(await TestCaseFromFile.create(fileNames[i]));
	}
	const inAllTests = []; // All test cases that go into all tests.
	// Create a dictionary where each pattern class (key) maps to an array of version TestCases (value)
	const patternClasses = {}; // All test cases that only go into one test.
	for (let i = 0; i < testCases.length; i++) {
		const testCase = testCases[i];
		if (testCase.inAllTests) {
			inAllTests.push(testCase);
		} else {
			if (typeof patternClasses[testCase.patternClass] == "undefined") {
				patternClasses[testCase.patternClass] = [];
			}
			patternClasses[testCase.patternClass].push(testCase);
		}
	}
	const tests = [[], [], []];
	// Add all test cases that belong in all tests to all tests.
	for (let i = 0; i < inAllTests.length; i++) {
		for (let j = 0; j < tests.length; j++) {
			tests[j].push(inAllTests[i]);
		}
	}
	// Shuffle each class and then assign a dot pattern version to each test version.
	for (const patternClass in patternClasses) {
		const versions = shuffleArray(patternClasses[patternClass]);
		for (let i = 0; i < tests.length; i++) {
			tests[i].push(versions[i]);
		}
	}

	// Add random cases
	for (let i = 0; i < tests.length; i++) {
		for (let j = 0; j < 10; j++) {
			for (let k = 0; k < randoms[j]; k++) {
				tests[i].push(new TestCaseFromRandom(j + 1));
			}
		}
	}

	// Ass three more to bring the count up to 60.
	for (let i = 0; i < tests.length; i++) {
		for (let j = 0; j < 3; j++) {
			const numberOfDots = 5 + Math.floor(Math.random() * 6);
			tests[i].push(new TestCaseFromRandom(numberOfDots));
		}
	}

	const testsJson = [];
	for (let i = 0; i < tests.length; i++) {
		const testJson = {version: i + 1, testCases: []};
		const shuffledCases = shuffleArray(tests[i]);
		for (let j = 0; j < shuffledCases.length; j++) {
			const testCaseJson = {countdown: 4,
						durationOfDotPatternInMilliseconds: 500,
						distractorLinePatterns: distractorLinePatterns,
						dotPatterns: shuffledCases[j].contents.dotPatterns
						};
			testJson.testCases.push(testCaseJson);
		}
		await fs.writeFile("NewVersion" + (i + 1) + ".json", JSON.stringify(testJson));
	}
}

createTests();
