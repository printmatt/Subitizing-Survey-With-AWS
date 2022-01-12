function enforceScreenSize() {
	const frameTable = document.getElementById("frameTable");
	const blocker = document.getElementById("blocker");
	if ((window.innerWidth < frameTable.offsetWidth) || (window.innerHeight < frameTable.offsetHeight)) {
		blocker.style.display = "block";
	} else {
		blocker.style.display = "none";
	}
}

window.addEventListener("resize", enforceScreenSize);
enforceScreenSize();

// Randomly samples a normal distribution using the Box-Muller Transform
// (Not sure if I'm implementing the formula exactly correctly.)
function normal(mean, sd) {
	const u1 = Math.random();
	const u2 = Math.random();
	const z1 = Math.sqrt(-1 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	return (z1 * sd) + mean;
}

// Returns a randomly chosen item from the provided array
// (used to sample colors to draw the dots)
function chooseRandomly(arr) {
	if (arr.length == 0) throw "Can't pick randomly from an empty array.";
	return arr[Math.floor(Math.random() * arr.length)];
}

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// Number buttons

/*
const option3 = document.getElementById("option3");
const option4 = document.getElementById("option4");
const option5 = document.getElementById("option5");
const option6 = document.getElementById("option6");
const option7 = document.getElementById("option7");
const option8 = document.getElementById("option8");
const option9 = document.getElementById("option9");

const options = [option3,
		option4,
		option5,
		option6,
		option7,
		option8,
		option9];
*/

const numberButtons = document.querySelectorAll(".numberButton");

// Make sure the number choices are disabled once the page loads.
for (let i = 0; i < numberButtons.length; i++) {
	numberButtons[i].disabled = true;
	numberButtons[i].style.visibility = "hidden";
}

/*
function drawDots(canvas, context, rows, cols, numberOfDots, dotRadius) {
	const flattenedLength = rows * cols;
	const mean = flattenedLength / numberOfDots;
	let flattenedPos = 0;
}
*/

// Set the dimensions of the canvas to fit the frame.
function fitCanvasToFrame() {
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
}
fitCanvasToFrame();

const continueButton = document.getElementById("continue");
const startButton = document.getElementById("start");
const submitButton = document.getElementById("submit");
const nextButton = document.getElementById("next");
const progress = document.getElementById("progress");
var percentAnswer = "0%";

// Array of all timeouts that could be cleared when the user teminates the experiment.
let timeouts = [];

const endExperimentButton = document.getElementById("endExperiment");
endExperimentButton.disabled = false;
endExperimentButton.addEventListener("click", function() {
	const shouldEndExperiment = confirm("Are you sure you would like to end the experiment early?");
	if (shouldEndExperiment) endExperiment();
});

function endExperiment() {
	// Clear the timeouts
	for (let i = 0; i < timeouts.length; i++) {
		clearTimeout(timeouts[i]);
	}

	// Disable and hide the number buttons.
	for (let i = 0; i < numberButtons.length; i++) {
		numberButtons[i].disabled = true;
		numberButtons[i].style.visibility = "hidden";
	}

	// Disable and hide the "End the Experiment" button.
	endExperimentButton.disabled = true;
	endExperimentButton.style.visibility = "hidden";

	continueButton.disabled = true;
	continueButton.style.visibility = "hidden";

	startButton.disabled = true;
	startButton.style.visibility = "hidden";

	submitButton.disabled = true;
	submitButton.style.visibility = "hidden";

	nextButton.disabled = true;
	nextButton.style.visibility = "hidden";

	console.log(percentAnswer);
	var params = {
		CompletedPercentage : percentAnswer
	}
	//console.log(JSON.stringify({"userAnswers": userAnswers}));
	let dataUploader = new XMLHttpRequest();
	dataUploader.open("POST", "experimentEnded");
	dataUploader.setRequestHeader("Content-Type", "application/json");
	dataUploader.send(JSON.stringify(params));
	// Trigger an event that the Test object will be listening for.
	// One the event is triggered, the test object will destroy all saved data.
	const destroyData = new Event("destroyData");
	document.dispatchEvent(destroyData);

	// Display a message on the canvas explaining that the experiment
	// has been terminated.
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "black";
	context.textAlign = "center";
	context.font = "25px Arial";
	context.fillText("The experiment has been terminated.", canvas.width / 2, canvas.height / 3);
	context.font = "18px Arial";
	context.fillText("You may now close the window.", canvas.width / 2, canvas.height * (2 / 3));
}

const dialogueContainer = document.getElementById("dialogue");

const identityMatrix = [[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]];

function cloneMatrix(mat) {
	let clone = [];
	for (let y = 0; y < mat.length; y++) {
		let currentRow = [];
		for (let x = 0; x < mat[0].length; x++) {
			currentRow.push(mat[y][x]);
		}
		clone.push(currentRow);
	}
	return clone;
}

/*
console.log(cloneMatrix([[1, 2, 3],
			[4, 5, 6],
			[7, 8, 9]]));
*/

// Assuming both vectors have the same number of components.
function dotProduct(vec1, vec2) {
	let accumulator = 0;
	for (let i = 0; i < vec1.length; i++) {
		accumulator += vec1[i] * vec2[i];
	}
	return accumulator;
}

// Assuming the number of columns in the matrix is equal to the numer of components in the vector.
function multiplyMatrixByVector(mat, vec) {
	let matrixVectorProduct = [];
	for (let i = 0; i < mat.length; i++) {
		matrixVectorProduct.push(dotProduct(mat[i], vec));
	}
	return matrixVectorProduct;
}

function transposeMatrix(mat) {
	let transpose = [];
	for (let i = 0; i < mat[0].length; i++) {
		transpose.push([]);
		for (let j = 0; j < mat.length; j++) {
			transpose[i][j] = mat[j][i];
		}
	}
	return transpose;
}

//console.log(transposeMatrix([[1, 2, 3], [4, 5, 6]]));

// Assuming the number of columns in the first matrix is equal to the number of rows in the second matrix.
function multiplyMatrixByMatrix(mat1, mat2) {
	mat2Transpose = transposeMatrix(mat2);
	let matrixMatrixProduct = [];
	for (let y = 0; y < mat1.length; y++) {
		let currentRow = [];
		for (let x = 0; x < mat2[0].length; x++) {
			currentRow.push(dotProduct(mat1[y], mat2Transpose[x]));
		}
		matrixMatrixProduct.push(currentRow);
	}
	return matrixMatrixProduct;
}

function generateTranslationMatrix(changeInX, changeInY) {
	return [[1, 0, changeInX],
		[0, 1, changeInY],
		[0, 0, 1]];
}

function generateRotationMatrix(angleInRadians) {
	return [[Math.cos(angleInRadians), -Math.sin(angleInRadians), 0],
		[Math.sin(angleInRadians), Math.cos(angleInRadians), 0],
		[0, 0, 1]];
}

/*
console.log(multiplyMatrixByMatrix([[1, 2, 3],
					[4, 5, 6]], 
					[[7, 8],
					[9, 10],
					[11, 12]]));
*/

class Dot {
	constructor(xCoord, yCoord, color, radius) {
		this.xCoord = xCoord;
		this.yCoord = yCoord;
		this.color = color;
		this.radius = radius;
		this.transformation = cloneMatrix(identityMatrix);
	}

	get numberOfDots() {
		return 1;
	}

	draw(outsideTransformation = identityMatrix) {
		const newTransformation = multiplyMatrixByMatrix(outsideTransformation, this.transformation);
		const coordVector = [this.xCoord, this.yCoord, 1];
		const transformedCoordVector = multiplyMatrixByVector(newTransformation, coordVector);
		const canvasDimensions = [canvas.width, canvas.height];
		const scaledCoordVector = [transformedCoordVector[0] * canvas.width,
					transformedCoordVector[1] * canvas.height];
		context.fillStyle = this.color;
		context.beginPath();
		context.arc(scaledCoordVector[0], scaledCoordVector[1], this.radius, 0, 2 * Math.PI);
		context.fill();
	}

	mutate(xCoordStdDev, yCoordStdDev, radiusStdDev) {
		this.xCoord = normal(this.xCoord, xCoordStdDev);
		this.yCoord = normal(this.yCoord, yCoordStdDev);
		this.radius = normal(this.radius, radiusStdDev);
	}

	/*
	translate(changeInX, changeInY) {
		this.xCoord += changeInX;
		this.yCoord += changeInY;
	}
	*/
}

class DotPattern {
	constructor(dots, durationInMilliseconds) { // dots is an array of instances of the Dot class
		this.dots = dots;
		this.durationInMilliseconds = durationInMilliseconds;
		this.transformation = cloneMatrix(identityMatrix);
	}

	get numberOfDots() {
		let accumulator = 0;
		for (let i = 0; i < this.dots.length; i++) {
			accumulator += this.dots[i].numberOfDots;
		}
		return accumulator;
	}

	draw(outsideTransformation = identityMatrix) {
		const newTransformation = multiplyMatrixByMatrix(outsideTransformation, this.transformation);
		console.log(newTransformation);
		for (let i = 0; i < this.dots.length; i++) {
			this.dots[i].draw(newTransformation);
		}
	}
	
	// Draw the dot pattern for the specified number of milliseconds,
	// then clear the canvas and call the specified callback function.
	drawForSomeTime(callback, transformation = identityMatrix) {
		this.draw(transformation);
		timeouts.push(setTimeout(function() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			timeouts.push(setTimeout(callback, 0)); // setTimeout is used to call the callback asynchronously.
		}, this.durationInMilliseconds));
	}

	add(that) {
		this.dots.push(that);
	}

	mutate(xCoordStdDev, yCoordStdDev, radiusStdDev) {
		for (let i = 0; i < this.dots.length; i++) {
			this.dots[i].mutate(xCoordStdDev, yCoordStdDev, radiusStdDev);
		}
	}

	/*
	translate(changeInX, changeInY) {
		for (let i = 0; i < this.numberOfDots; i++) {
			this.dots[i].translate(changeInX, changeInY);
		}
	}
	*/
}

class DistractorLine {
	constructor(xCoord1, yCoord1, xCoord2, yCoord2, color, width) {
		this.xCoord1 = xCoord1;
		this.yCoord1 = yCoord1;
		this.xCoord2 = xCoord2;
		this.yCoord2 = yCoord2;
		this.color = color;
		this.width = width;
	}

	draw() {
		context.strokeStyle = this.color;
		context.lineWidth = this.width;
		context.beginPath();
		context.moveTo(this.xCoord1, this.yCoord1);
		context.lineTo(this.xCoord2, this.yCoord2);
		context.stroke();
	}
}

class DistractorLinePattern {
	constructor(distractorLines, durationInMilliseconds) { // distractorLines is an array of instances of the DistractorLine class
		this.distractorLines = distractorLines;
		this.durationInMilliseconds = durationInMilliseconds;
	}

	get numberOfDistractorLines() {
		return this.distractorLines.length;
	}

	draw() {
		for (let i = 0; i < this.numberOfDistractorLines; i++) {
			this.distractorLines[i].draw();
		}
	}

	// Draw the distractor lines for the specified number of milliseconds,
	// then clear the canvas and call the specified callback function.
	drawForSomeTime(callback) {
		this.draw();
		timeouts.push(setTimeout(function() {
			context.clearRect(0, 0, canvas.width, canvas.height);
			timeouts.push(setTimeout(callback, 0)); // setTimeout is used to call the callback asynchronously.
		}, this.durationInMilliseconds));
	}
}

// Randomly create a dot pattern with the specified number of dots, duration (in milliseconds), color palette, and radius range.
function createUniformDotPattern(numberOfDots, durationInMilliseconds, colorPalette, minRadius, maxRadius) {
	let dots = [];
	for (let i = 0; i < numberOfDots; i++) {
		dots.push(new Dot(Math.random() * canvas.width,
				Math.random() * canvas.height,
				chooseRandomly(colorPalette),
				Math.random() * (maxRadius - minRadius) + minRadius));
	}
	return new DotPattern(dots, durationInMilliseconds);
}

function createLinearDotPattern(numberOfDots, spacing, durationInMilliseconds, color, dotRadius) {
	let dots = [];
	let currentX = 0;
	for (let i = 0; i < numberOfDots; i++) {
		dots.push(new Dot(currentX, 0, color, dotRadius));
		currentX += spacing;
	}
	return new DotPattern(dots, durationInMilliseconds);
}

function createCircularDotPattern(numberOfDots, circleRadius, durationInMilliseconds, color, dotRadius) {
	let dots = [];
	let angleDelta = (2 * Math.PI) / numberOfDots;
	for (let i = 0; i < numberOfDots; i++) {
		dots.push(new Dot(Math.cos(angleDelta * i) * circleRadius,
				Math.sin(angleDelta * i) * circleRadius,
				color,
				dotRadius));
	}
	return new DotPattern(dots, durationInMilliseconds);
}

function createGridDotPattern(numberOfRows, numberOfColumns, spacingBetweenRows, spacingBetweenColumns, durationInMilliseconds, color, dotRadius) {
	console.log({
		numberOfRows,
		numberOfColumns,
		spacingBetweenRows,
		spacingBetweenColumns,
		durationInMilliseconds,
		color,
		dotRadius
	});
	let dotPattern = new DotPattern([], durationInMilliseconds);
	for (let i = 0; i < numberOfRows; i++) {
		const currentRow = createLinearDotPattern(numberOfColumns, spacingBetweenColumns, durationInMilliseconds, color, dotRadius);
		currentRow.transformation = generateTranslationMatrix(0, spacingBetweenRows * i);
		dotPattern.add(currentRow);
	}
	return dotPattern;
}

function createAngleDotPattern(numberOfDotsOnFirstLine, numberOfDotsOnSecondLine, firstLineSpacing, secondLineSpacing, angleInRadians, durationInMilliseconds, color, dotRadius) {
	let firstLine = createLinearDotPattern(numberOfDotsOnFirstLine, firstLineSpacing, durationInMilliseconds, color, dotRadius);
	// When creating the second line, exclude the dot at which the two lines intersect.
	// (This will make it easier to count the dots programatically if necessary.)
	let secondLine = createLinearDotPattern(numberOfDotsOnSecondLine - 1, secondLineSpacing, durationInMilliseconds, color, dotRadius);
	secondLine.transformation = generateTranslationMatrix(secondLineSpacing, 0);
	secondLine.transformation = multiplyMatrixByMatrix(generateRotationMatrix(angleInRadians),
					secondLine.transformation);

	let dotPattern = new DotPattern([], durationInMilliseconds);
	dotPattern.add(firstLine);
	dotPattern.add(secondLine);
	return dotPattern;
}

function createHCPDotPattern(numberOfRows, numberOfDotsPerRow, spacingBetweenRows, spacingBetweenDots, durationInMilliseconds, color, dotRadius) {
	console.log({
		numberOfRows,
		numberOfDotsPerRow,
		spacingBetweenRows,
		spacingBetweenDots,
		durationInMilliseconds,
		color,
		dotRadius
	});
	let dotPattern = new DotPattern([], durationInMilliseconds);
	for (let i = 0; i < numberOfRows; i++) {
		const currentRow = createLinearDotPattern(numberOfDotsPerRow, spacingBetweenDots, durationInMilliseconds, color, dotRadius);
		currentRow.transformation = generateTranslationMatrix((i % 2 == 0) ? 0 : (spacingBetweenDots / 2),
								spacingBetweenRows * i);
		dotPattern.add(currentRow);
	}
	return dotPattern;
}

// Randomly create a distractor line pattern with the specified number of distractor lines, duration (in milliseconds), color palette, and width range.
function createUniformDistractorLinePattern(numberOfDistractorLines, durationInMilliseconds, colorPalette, minWidth, maxWidth) {
	let distractorLines = [];
	for (let i = 0; i < numberOfDistractorLines; i++) {
		distractorLines.push(new DistractorLine(Math.random() * canvas.width,
						Math.random() * canvas.height,
						Math.random() * canvas.width,
						Math.random() * canvas.height,
						chooseRandomly(colorPalette),
						Math.random() * (maxWidth - minWidth) + minWidth));
	}
	return new DistractorLinePattern(distractorLines, durationInMilliseconds);
}

// Displays a countdown timer on the canvas that calls a callback function once the time runs out.
class Countdown {
	constructor(numberOfSeconds) {
		this.numberOfSeconds = numberOfSeconds; // The number of seconds the timer starts with.
		this.counter = numberOfSeconds; // The number of seconds currently left.
	}

	// This tick function will display the timer on the screen and then call itself
	// using setTimeout with a one-second delay until time runs out; at that point,
	// the callback function is called.
	tick(callback) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		if (this.counter > 0) { // If there is time left . . .
			context.textAlign = "center";
			context.fillStyle = "black";
			context.font = "75px Arial";
			context.fillText(this.counter, canvas.width / 2, canvas.height / 2);
			timeouts.push(setTimeout(this.tick.bind(this, callback), 1000));
								// The bind function keeps the Countdown object
								// properties attached to the tick function even
								// after it's called from the outside scope using
								// setTimeout
		} else { // When time runs out . . .
			timeouts.push(setTimeout(callback, 0)); // setTimeout is used here to call the callback asynchronously
			this.counter = this.numberOfSeconds; // Reset the countdown so it could be reused
								// (This functionality is not used anywhere yet.)
		}
		this.counter--;
	}
}

// A prompt that asks the user how many dots they saw and takes input from the buttons.
class Prompt {
	constructor() {
	}

	askUser(demo, callback) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.textAlign = "center";
		context.fillStyle = "black";
		context.font = "30px Arial"
		context.fillText("How many dots did you see?", canvas.width / 2, canvas.height / 3);
		context.font = "16px Arial";
		context.fillText("(Click the corresponding number to the left.)", canvas.width / 2, canvas.height * (2 / 3));
		console.log("Demo: " + demo);
		for (let i = 0; i < numberButtons.length; i++) {
			numberButtons[i].style.visibility = "visible";
			if (demo) {
				if (numberButtons[i].innerText == demo) {
					numberButtons[i].disabled = false;
				}
			} else {
				numberButtons[i].disabled = false;
			}
			let eventListener = this.processAnswer.bind(this, numberButtons[i].innerText, callback);
				// This line creates an event listener for each number button, which will, once the button is
				// clicked, call this class's processAnswer function with the number on the button and the
				// specified callback passed as parameters.
			numberButtons[i].eventListener = eventListener;
				// The newly created event listener is added as a property to each number button in order to
				// facilitate removing the event listener of all number buttons once just one of them is clicked.
			numberButtons[i].addEventListener("click", numberButtons[i].eventListener);
		}
	}

	processAnswer(answer, callback) {
		console.log("The user just chose " + answer + ".");
		//userChoices.push(answer);
		//this.answer = answer;
		// Disable the buttons and remove the event listeners.
		for (let i = 0; i < numberButtons.length; i++) {
			numberButtons[i].removeEventListener("click", numberButtons[i].eventListener);
			numberButtons[i].disabled = true;
			numberButtons[i].style.visibility = "hidden";
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		timeouts.push(setTimeout(callback.bind(null, answer), 0)); // Call the provided callback function asynchronously.
	}
}

class NextScreen {
	constructor() {
	}

	show(callback) {
		this.eventListener = this.buttonClicked.bind(this, callback);
		nextButton.addEventListener("click", this.eventListener);
		nextButton.style.visibility = "visible";
		nextButton.disabled = false;
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.textAlign = "center";
		context.fillStyle = "black";
		context.font = "25px Arial"
		context.fillText("Click the NEXT button to continue.", canvas.width / 2, canvas.height / 3);
	}

	buttonClicked(callback) {
		nextButton.removeEventListener("click", this.eventListener);
		nextButton.style.visibility = "hidden";
		nextButton.disabled = true;
		context.clearRect(0, 0, canvas.width, canvas.height);
		timeouts.push(setTimeout(callback, 0));
	}
}

class TestCase {
	constructor(countdown, dotPattern, distractorLinePattern, demo) {
		this.countdown = countdown;
		this.dotPattern = dotPattern;
		this.distractorLinePattern = distractorLinePattern;
		this.demo = demo;
		this.prompt = new Prompt();
	}

	runTestCase(callback, isFirstTestCase, isLastTestCase) {
		const nextStep = this.hideEndExperimentButton.bind(this, callback, isLastTestCase);
		if (isFirstTestCase) {
			this.countdown.tick(nextStep);
		} else {
			const nextScreen = new NextScreen();
			nextScreen.show(nextStep)
		}
	}

	hideEndExperimentButton(callback, isLastTestCase) {
		endExperimentButton.disabled = true;
		endExperimentButton.style.visibility = "hidden";
		timeouts.push(setTimeout(this.drawDotPatternForSomeTime.bind(this, callback, isLastTestCase), 0));
	}

	drawDotPatternForSomeTime(callback, isLastTestCase) {
		this.dotPattern.drawForSomeTime(this.showEndExperimentButton.bind(this, callback, isLastTestCase));
	}

	showEndExperimentButton(callback, isLastTestCase) {
		endExperimentButton.disabled = false;
		endExperimentButton.style.visibility = "visible";
		timeouts.push(setTimeout(this.showPrompt.bind(this, callback, isLastTestCase)));
	}

	showPrompt(callback, isLastTestCase) {
		let demo = this.demo ? this.dotPattern.numberOfDots : false;
		if (!isLastTestCase) {
			this.prompt.askUser(demo, this.drawDistractorLinePatternForSomeTime.bind(this, callback));
		} else {
			this.prompt.askUser(demo, callback);
		}
	}

	drawDistractorLinePatternForSomeTime(callback, answer) {
		this.distractorLinePattern.drawForSomeTime(callback.bind(this, answer));
	}
}

class Test {
	constructor(testCases) {
		this.testCases = testCases;
		this.currentTestCaseIndex = 0;
		this.userAnswers = [];
		document.addEventListener("destroyData", this.destroyData.bind(this));
	}

	runTest(callback) {
		let dialogueRequest = new XMLHttpRequest();
		dialogueRequest.onreadystatechange = function() {
			if ((dialogueRequest.readyState == 4) && (dialogueRequest.status == 200)) {
				//console.log(dialogueRequest.response);
				dialogueContainer.style.visibility = "visible";
				dialogueContainer.innerHTML = dialogueRequest.response;
				endExperimentButton.disabled = true;
				endExperimentButton.style.visibility = "hidden";
				startButton.disabled = false;
				startButton.style.visibility = "visible";
				startButton.eventListener = this.getGenderAge.bind(this, callback);
				startButton.addEventListener("click", startButton.eventListener);

			}
		}.bind(this);
		dialogueRequest.open("GET", "dialogue/beforeStarting.html");
		dialogueRequest.send();
	}

	getGenderAge(callback){
		startButton.disabled = true;
		startButton.style.visibility = "hidden";
		startButton.removeEventListener("click", startButton.eventListener);
		let dialogueRequest = new XMLHttpRequest();
		dialogueRequest.onreadystatechange = function() {
			if ((dialogueRequest.readyState == 4) && (dialogueRequest.status == 200)) {
				//console.log(dialogueRequest.response);
				dialogueContainer.style.visibility = "visible";
				dialogueContainer.innerHTML = dialogueRequest.response;
				const form = document.getElementById("backgroundInfo");
				continueButton.disabled = false;
				continueButton.style.visibility = "visible";
				form.eventListener = this.getStarted.bind(this,callback);
				form.addEventListener("submit",form.eventListener);
				}
		}.bind(this);
		dialogueRequest.open("GET", "dialogue/genderAge.html");
		dialogueRequest.send();
	}

	getStarted(callback) {
		dialogueContainer.style.display = "none";
		continueButton.disabled = true;
		continueButton.style.visibility = "hidden";
		endExperimentButton.disabled = false;
		endExperimentButton.style.visibility = "visible";
		timeouts.push(setTimeout(this.nextTestCase.bind(this, callback), 0));
	}

	nextTestCase(callback) {
		if (this.currentTestCaseIndex >= this.testCases.length) {
			timeouts.push(setTimeout(this.askToSubmit.bind(this, callback), 0));
		} else {
			let isFirstTestCase;
			let isLastTestCase;
			if (this.currentTestCaseIndex == 0) {
				isFirstTestCase = true;
			} else {
				isFirstTestCase = false;
			}
			if (this.currentTestCaseIndex == this.testCases.length - 1) {
				isLastTestCase = true;
			} else {
				isLastTestCase = false;
			}
			this.testCases[this.currentTestCaseIndex].runTestCase(this.saveAnswer.bind(this, callback), isFirstTestCase, isLastTestCase);
				// Run the test case and have it call the saveAnswer function once it's finished,
				// passing the callback that will be called after the entire test is finished.  In
				// this way, the callback could be passed through the entire process rather than having
				// to be stored as a property of the Test class, which might make things a bit more clunky.
				// You might have noteiced that saveAnswer takes two parameters rather than simply the
				// callback included here.  The test case will call saveAnswer with the provided callback
				// as the first parameter and the number the user clicked as the second parameter.
			this.currentTestCaseIndex++;
			percentAnswer = (this.currentTestCaseIndex-1)/this.testCases.length*100 + "%";
			progress.style.width = percentAnswer;
			progress.innerHTML = percentAnswer;
		}
	}

	saveAnswer(callback, answer) {
		//console.log(answer);
		this.userAnswers.push(answer);
		console.log({"userAnswers": this.userAnswers});
		timeouts.push(setTimeout(this.nextTestCase.bind(this, callback)));
	}

	destroyData() {
		this.userAnswers = [];
		console.log({"userAnswers": this.userAnswers});
	}

	askToSubmit(callback) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		/*
		context.textAlign = "center";
		context.fillStyle = "black";
		context.font = "30px Arial";
		context.fillText('Please click the "Submit" button', canvas.width / 2, canvas.height * (1 / 10));
		context.font = "16px Arial";
		context.fillText("to submit your data and conclude the experiment.", canvas.width / 2, canvas.height * (2 / 10));
		*/
		let dialogueRequest = new XMLHttpRequest();
		dialogueRequest.onreadystatechange = function() {
			if ((dialogueRequest.readyState == 4) && (dialogueRequest.status == 200)) {
				dialogueContainer.style.display = "block";
				dialogueContainer.innerHTML = dialogueRequest.response;
				submitButton.style.visibility = "visible";
				submitButton.disabled = false;
				submitButton.eventListener = this.finishTest.bind(this, callback);
				submitButton.addEventListener("click", submitButton.eventListener);
			}
		}.bind(this);
		dialogueRequest.open("GET", "dialogue/beforeSubmitting.html");
		dialogueRequest.send();
	}

	finishTest(callback) {
		submitButton.removeEventListener("click", submitButton.eventListener);
		submitButton.disabled = true;
		submitButton.style.visibility = "hidden";
		/*
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.textAlign = "center";
		context.fillStyle = "black";
		context.font = "30px Arial";
		context.fillText("Thank you for your time.", canvas.width / 2, canvas.height / 3);
		context.font = "16px Arial";
		context.fillText("Your response has been recorded.", canvas.width / 2, canvas.height * (2 / 3));
		*/
		let dialogueRequest = new XMLHttpRequest();
		dialogueRequest.onreadystatechange = function() {
			if ((dialogueRequest.readyState == 4) && (dialogueRequest.status == 200)) {
				dialogueContainer.innerHTML = dialogueRequest.response;
			}
		}
		dialogueRequest.open("GET", "dialogue/afterSubmitting.html");
		dialogueRequest.send();

		endExperimentButton.disabled = true;
		endExperimentButton.style.visibility = "hidden";
		timeouts.push(setTimeout(callback.bind(null, this.userAnswers), 0));
	}
}

// Convert each entry in the array in the JSON string into a TestCase object using the constructors,
// then return a Test made with those test cases.
const randomSeed = "test_1";
function jsonToTest(jsonString) {
	let jsonObject = JSON.parse(jsonString);
	const groups = [[3,17,5],[17,30,7],[30,40,7],[40,50,28]];
	jsonObject.testCases = shuffleArray(jsonObject.testCases,groups,randomSeed);
	let testCases = [];
	for (let i = 0; i < jsonObject.testCases.length; i++) {
		let testCaseJson = jsonObject.testCases[i];

		let countdown = new Countdown(testCaseJson.countdown);

		let dotPattern = new DotPattern([], testCaseJson.durationOfDotPatternInMilliseconds);

		const dotPatternsJson = testCaseJson.dotPatterns;

		for (const subPatternJson of dotPatternsJson) {
			let subPattern;
			if (subPatternJson.type == "random") {
				subPattern = createUniformDotPattern(subPatternJson.numberOfDots,
						subPatternJson.durationInMilliseconds,
						subPatternJson.colorPalette,
						subPatternJson.minRadius,
						subPatternJson.maxRadius);
			} else if (subPatternJson.type == "line") {
				subPattern = createLinearDotPattern(subPatternJson.numberOfDots,
						subPatternJson.spacing,
						subPatternJson.durationInMilliseconds,
						subPatternJson.color,
						subPatternJson.dotRadius);
			} else if (subPatternJson.type == "circle") {
				subPattern = createCircularDotPattern(subPatternJson.numberOfDots,
						subPatternJson.circleRadius,
						subPatternJson.durationInMilliseconds,
						subPatternJson.color,
						subPatternJson.dotRadius);
			} else if (subPatternJson.type == "grid") {
				subPattern = createGridDotPattern(subPatternJson.numberOfRows,
						subPatternJson.numberOfColumns,
						subPatternJson.spacingBetweenRows,
						subPatternJson.spacingBetweenColumns,
						subPatternJson.durationInMilliseconds,
						subPatternJson.color,
						subPatternJson.dotRadius);
			} else if (subPatternJson.type == "angle") {
				subPattern = createAngleDotPattern(subPatternJson.numberOfDotsOnFirstLine,
						subPatternJson.numberOfDotsOnSecondLine,
						subPatternJson.firstLineSpacing,
						subPatternJson.secondLineSpacing,
						subPatternJson.angleInDegrees * (Math.PI / 180),
						subPatternJson.durationInMilliseconds,
						subPatternJson.color,
						subPatternJson.dotRadius);
			} else if (subPatternJson.type == "HCP") {
				subPattern = createHCPDotPattern(subPatternJson.numberOfRows,
						subPatternJson.numberOfDotsPerRow,
						subPatternJson.spacingBetweenRows,
						subPatternJson.spacingBetweenDots,
						subPatternJson.durationInMilliseconds,
						subPatternJson.color,
						subPatternJson.dotRadius);
			} else if (subPatternJson.type == "dot") {
				subPattern = new Dot(subPatternJson.xCoord,
							subPatternJson.yCoord,
							subPatternJson.color,
							subPatternJson.dotRadius);
			}
			let xCoordStdDev = (subPatternJson.xCoordStdDev == undefined) ? 0 : subPatternJson.xCoordStdDev;
			let yCoordStdDev = (subPatternJson.yCoordStdDev == undefined) ? 0 : subPatternJson.yCoordStdDev;
			let dotRadiusStdDev = (subPatternJson.dotRadiusStdDev == undefined) ? 0 : subPatternJson.dotRadiusStdDev;
			subPattern.mutate(xCoordStdDev, yCoordStdDev, dotRadiusStdDev);

			let translationX = (subPatternJson.translationX == undefined) ? 0 : subPatternJson.translationX;
			let translationY = (subPatternJson.translationY == undefined) ? 0 : subPatternJson.translationY;
			let rotationInDegrees = (subPatternJson.rotationInDegrees == undefined) ? 0 : subPatternJson.rotationInDegrees;
			let rotationInRadians = rotationInDegrees * (Math.PI / 180);

			let rotation = generateRotationMatrix(rotationInRadians);
			let translation = generateTranslationMatrix(translationX, translationY);

			let transformation = multiplyMatrixByMatrix(translation, rotation);
			//console.log(transformation);
			subPattern.transformation = transformation;
			dotPattern.add(subPattern);
		}
		//console.log(dotPattern);

		let distractorLinePattern;
		distractorLinePattern = createUniformDistractorLinePattern(testCaseJson.distractorLinePattern.numberOfDistractorLines,
						testCaseJson.distractorLinePattern.durationInMilliseconds,
						testCaseJson.distractorLinePattern.colorPalette,
						testCaseJson.distractorLinePattern.minWidth,
						testCaseJson.distractorLinePattern.maxWidth);
		let demo = !!testCaseJson.demo;

		let testCase = new TestCase(countdown, dotPattern, distractorLinePattern, demo);
		testCases.push(testCase);
	}
	
	return new Test(testCases);
}
/*
let dotPattern = createUniformDotPattern(8, 2000, ["black", "blue", "green", "red", "orange"], 3, 5);
dotPattern.drawForSomeTime(function() {
	console.log("The dots are gone.");
});
*/

/*
let distractorLines = createUniformDistractorLinePattern(4, 2000, ["black", "red", "blue"], 1, 8);
distractorLines.drawForSomeTime(function() {
	console.log("The lines are gone.");
});
*/

/*
let countdown = new Countdown(5);
countdown.tick(function() {
	let prompter = new Prompt();
	prompter.askUser(function() {
		console.log("Called back.");
	});
});
*/

/*
let testCases = [new TestCase(new Countdown(4),
			createUniformDotPattern(6, 2000, ["black", "red", "green", "blue"], 3, 5),
			createUniformDistractorLinePattern(5, 2000, ["black", "red", "blue"], 1, 8)),
		new TestCase(new Countdown(3),
			createUniformDotPattern(5, 1000, ["red", "green", "blue"], 3, 5),
			createUniformDistractorLinePattern(6, 3000, ["red", "blue"], 1, 8))];

let test = new Test(testCases);

test.runTest(function() {
	console.log("Test completed.");
});
*/

// Get ready to send the request to get the test cases.
let jsonRequest = new XMLHttpRequest();

// Event handler for when the JSON file arrives.
jsonRequest.onreadystatechange = function() {
	if ((jsonRequest.readyState == 4) && (jsonRequest.status == 200)) {
		let test = jsonToTest(jsonRequest.response);
		test.runTest(function(userAnswers) {
			console.log(userAnswers);
			console.log("Test completed; sending user answers to the server.");
			var params = {
				TableName: 'subitization_results',
  				Item: {
					answers : userAnswers
				}
			}
			//console.log(JSON.stringify({"userAnswers": userAnswers}));
			let dataUploader = new XMLHttpRequest();
			dataUploader.open("POST", "uploadData");
			dataUploader.setRequestHeader("Content-Type", "application/json");
			dataUploader.send(JSON.stringify(params));
			//import AWS from 'aws-sdk'

			//AWS.config.region = process.env.REGION


		});
	}
};
jsonRequest.open("GET", "testCases.json");
jsonRequest.send();
