const uploadPrompt = document.getElementById("uploadPrompt");
const fileSelect = document.getElementById("fileSelect");
const submitButton = document.getElementById("submit");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const table = document.getElementById("dotPatternTable");

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
		//this.xCoord = normal(this.xCoord, xCoordStdDev);
		//this.yCoord = normal(this.yCoord, yCoordStdDev);
		//this.radius = normal(this.radius, radiusStdDev);
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

class TestCase {
	constructor(countdown, dotPattern, distractorLinePattern, demo) {
		this.countdown = countdown;
		this.dotPattern = dotPattern;
		this.distractorLinePattern = distractorLinePattern;
		this.demo = demo;
		this.prompt = new Prompt();
	}

	runTestCase(callback, isLastTestCase) {
		this.countdown.tick(this.hideEndExperimentButton.bind(this, callback, isLastTestCase));
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

// Convert each entry in the array in the JSON string into a TestCase object using the constructors,
// then return a Test made with those test cases.
function jsonToDotPatternArray(jsonString) {
	let jsonObject = JSON.parse(jsonString);
	let dotPatterns = [];
	for (let i = 0; i < jsonObject.testCases.length; i++) {
	let testCaseJson = jsonObject.testCases[i];
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
			console.log(transformation);
			subPattern.transformation = transformation;
			dotPattern.add(subPattern);
		}
		console.log(dotPattern);
		dotPatterns.push(dotPattern);
	}
	return dotPatterns;
}

// Parse the JSON and draw each dot pattern on the canvas one-at-a-time, saving the contents
// of the canvas into the table after drawing the pattern.
function loadDotPatterns(fileContents) {
	let dotPatterns = jsonToDotPatternArray(fileContents.target.result);
	for (let i = 0; i < dotPatterns.length; i++) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		dotPatterns[i].draw();
		let img = new Image();
		img.src = canvas.toDataURL("image/png");
		//document.body.appendChild(img);
		let row = document.createElement("tr");
		let indexCell = document.createElement("td");
		indexCell.innerText = i + 1;
		let imageCell = document.createElement("td");
		imageCell.appendChild(img);
		row.appendChild(indexCell);
		row.appendChild(imageCell);
		table.appendChild(row);
	}
};

submitButton.addEventListener("click", function() {
	uploadPrompt.style.display = "none";
	fileSelect.style.display = "none";
	submitButton.style.display = "none";
	const reader = new FileReader();
	reader.onload = loadDotPatterns;
	reader.readAsText(fileSelect.files[0]);
});
