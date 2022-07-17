const fileTable = document.getElementById("fileTable");
const addFileButton = document.getElementById("addFileButton");
const submitButton = document.getElementById("submitButton");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const outputTable = document.getElementById("outputTable");

const ROWS_PER_GRID = 15;
const COLUMNS_PER_GRID = 15;

let rowIds = []
let nextRowId = 0;
let fileRows = [];

let canvasBackground = context.createImageData(canvas.width, canvas.height);

const distractorLinePattern = {
	"numberOfDistractorLines": 100,
	"durationInMilliseconds": 500,
	"colorPalette": ["red", "orange", "yellow", "green", "blue", "purple", "black", "pink", "brown"],
	"minWidth": 1,
	"maxWidth": 1
}

class FileRow {
	constructor() {
		this.rowId = nextRowId;
		nextRowId++;
		this.tableRow = document.createElement("tr");
		this.tableCell = document.createElement("td");
		this.tableCell.setAttribute("class", "fileCell");
		this.fileSelect = document.createElement("input");
		this.fileSelect.setAttribute("type", "file");
		this.fileSelect.setAttribute("class", "file");
		this.deleteButton = document.createElement("button");
		this.deleteButton.innerText = "X";
		this.deleteButton.addEventListener("click", this.remove.bind(this));
		this.tableCell.appendChild(this.fileSelect);
		this.tableCell.appendChild(this.deleteButton);
		this.tableRow.appendChild(this.tableCell);
		let numberOfRows = fileTable.childNodes.length;
		fileTable.insertBefore(this.tableRow, fileTable.childNodes[numberOfRows - 1]);
	}

	remove() {
		const rowIndex = getFileRowIndexById(this.rowId);
		console.log(rowIndex);
		fileTable.deleteRow(rowIndex);
		fileRows.splice(rowIndex, 1);
	}

	reAdd() {
		let numberOfRows = fileTable.childNodes.length;
		fileTable.insertBefore(this.tableRow, fileTable.childNodes[numberOfRows - 1]);
	}
}

function getFileRowIndexById(rowId) {
	for (let i = 0; i < fileRows.length; i++) {
		if (fileRows[i].rowId == rowId) return i;
	}
	return -1;
}

function removeFile(rowId) {
	const rowIndex = rowIds.indexOf(rowId);
	fileTable.deleteRow(rowIndex);
	rowIds.splice(rowIndex, 1);
}

function addFile() {
	/*
	let numberOfRows = fileTable.childNodes.length;
	let rowId = nextRowId;

	const row = document.createElement("tr");
	row.setAttribute("rowId", nextRowId);
	const cell = document.createElement("td");
	cell.setAttribute("class", "fileCell");
	const fileSelect = document.createElement("input");
	fileSelect.setAttribute("type", "file");
	fileSelect.setAttribute("class", "file");
	const deleteButton = document.createElement("button");
	deleteButton.innerText = "X";
	deleteButton.addEventListener("click", removeFile.bind(null, rowId));

	cell.appendChild(fileSelect);
	cell.appendChild(deleteButton);
	row.appendChild(cell);
	fileTable.insertBefore(row,
				fileTable.childNodes[numberOfRows - 1]);

	rowIds.push(rowId);
	nextRowId++;
	*/
	fileRows.push(new FileRow());
}

addFile();

addFileButton.addEventListener("click", addFile);

function getImageData(image) {
	canvas.width = image.width;
	canvas.height = image.height;
	context.drawImage(image, 0, 0);
	return context.getImageData(0, 0, image.width, image.height);
}

function rotateImageData(imageData) {
	const newImageData = context.createImageData(imageData.height, imageData.width);
	for (let y = 0; y < newImageData.height; y++) {
		for (let x = 0; x < newImageData.width; x++) {
			const oldPixelIndex = ((x * imageData.width) + (imageData.width - y - 1)) * 4;
			const newPixelIndex = ((y * newImageData.width) + x) * 4;
			newImageData.data[newPixelIndex] = imageData.data[oldPixelIndex];
			newImageData.data[newPixelIndex + 1] = imageData.data[oldPixelIndex + 1];
			newImageData.data[newPixelIndex + 2] = imageData.data[oldPixelIndex + 2];
			newImageData.data[newPixelIndex + 3] = imageData.data[oldPixelIndex + 3];
		}
	}
	return newImageData;
}

function calculateRowAndColumnMeans(imageData) {
	const rowMeans = [];
	for (let y = 0; y < imageData.height; y++) {
		let rowSum = 0;
		for (let x = 0; x < imageData.width; x++) {
			const index = ((y * imageData.width) + x) * 4;
			// Get reds (so the red marker blends in)
			rowSum += 255 - imageData.data[index];
		}
		rowMeans.push(rowSum / imageData.height);
	}
	const columnMeans = [];
	for (let x = 0; x < imageData.width; x++) {
		let columnSum = 0;
		for (let y = 0; y < imageData.height; y++) {
			const index = ((y * imageData.width) + x) * 4;
			columnSum += 255 - imageData.data[index];
		}
		columnMeans.push(columnSum / imageData.width);
	}
	return {rowMeans, columnMeans};
}

function lowPass(array, halfKernelSize) {
	let output = [];
	for (let i = 0; i < array.length; i++) {
		let n = 0;
		let sum = 0;
		for (let j = i - halfKernelSize; j <= i + halfKernelSize; j++) {
			if (j >= 0 && j < array.length) {
				n++;
				sum += array[j];
			}
		}
		output.push(sum / n);
	}
	return output;
}

function binaryThreshold(array, threshold) {
	const output = [];
	for (let i = 0; i < array.length; i++) {
		output.push((array[i] > threshold) ? 1 : 0);
	}
	return output;
}

function getZeroRuns(array) {
	let zeroRuns = [];
	let lastOneIndex = -1;
	for (let i = 0; i < array.length; i++) {
		if (array[i] == 1) {
			if (i - lastOneIndex > 1) {
				zeroRuns.push({first: lastOneIndex + 1, last: i - 1});
			}
			lastOneIndex = i;
		}
	}
	if (array.length - lastOneIndex > 1) {
		zeroRuns.push({first: lastOneIndex + 1, last: array.length - 1});
	}
	return zeroRuns;
}

function getCutPoints(zeroRuns, numCuts) {
	let sortedZeroRuns = zeroRuns.slice();
	sortedZeroRuns.sort((a, b) => (b.last - b.first) - (a.last - a.first));
	const chosenZeroRuns = sortedZeroRuns.slice(0, numCuts);
	const cutPoints = chosenZeroRuns.map(zeroRun => Math.floor((zeroRun.first + zeroRun.last) / 2));
	cutPoints.sort((a, b) => a - b);
	return cutPoints;
}

function getBoundingBox(rowBits, columnBits) {
	let x;
	let i = 0;
	while ((columnBits[i] == 0) && (i < columnBits.length)) i++;
	x = i;
	let y;
	i = 0;
	while ((rowBits[i] == 0) && (i < rowBits.length)) i++;
	y = i;
	let w;
	i = columnBits.length - 1;
	while ((columnBits[i] == 0) && i >= 0) i--;
	w = i - x;
	let h;
	i = rowBits.length - 1;
	while ((rowBits[i] == 0) && i >= 0) i--;
	h = i - y;
	return {x, y, w, h};
}

function getDiagonalMeanInSquare(imageData, x, y, s) {
	let sum = 0;
	for (let i = 0; i < s; i++) {
		const diagY = Math.floor(y + i);
		const diag1X = Math.floor(x + i);
		const diag2X = Math.floor(x + (s - i));
		const diag1Index = ((diagY * imageData.width) + diag1X) * 4;
		const diag2Index = ((diagY * imageData.width) + diag2X) * 4;
		sum += 255 - imageData.data[diag1Index];
		sum += 255 - imageData.data[diag2Index];
	}
	return sum / (2 * s);
}

function getDotMatrix(imageData, boundingBox, threshold) {
	const cellWidth = boundingBox.w / COLUMNS_PER_GRID;
	const cellHeight = boundingBox.h / ROWS_PER_GRID;
	const matrix = [];
	for (let i = 0; i < ROWS_PER_GRID; i++) {
		const matrixRow = [];
		for (let j = 0; j < COLUMNS_PER_GRID; j++) {
			const diagonalMean = getDiagonalMeanInSquare(imageData, boundingBox.x + (j * cellWidth), boundingBox.y + (i * cellHeight), cellWidth);
			matrixRow.push((diagonalMean > threshold) ? 1 : 0);
			//context.fillStyle = "rgba(0, 255, 0, " + (matrixRow[j] * 0.3) + ")";
			//context.fillRect(boundingBox.x + (j * cellWidth), boundingBox.y + (i * cellHeight), cellWidth, cellHeight);
		}
		matrix.push(matrixRow);
	}
	return matrix;
}

/*
function binaryThresholdMatrix(matrix, threshold) {
	const newMatrix = [];
	for (let i = 0; i < matrix.length; i++) {
		const newRow = [];
		for (let j = 0; j < matrix[i].length; j++) {
			newRow.push((matrix[i][j] > threshold) ? 1 : 0);
		}
		newMatrix.push(newRow);
	}
	return newMatrix;
}
*/

function drawPeakLines(rowBits, columnBits) {
	context.strokeWidth = 1;
	for (let y = 0; y < rowBits.length; y++) {
		if (rowBits[y] == 1) {
			context.strokeStyle = "blue";
			context.beginPath();
			context.moveTo(0, y);
			context.lineTo(canvas.width, y);
			context.stroke();
		}
	}
	for (let x = 0; x < columnBits.length; x++) {
		if (columnBits[x]  == 1) {
			context.strokeStyle = "blue";
			context.beginPath();
			context.moveTo(x, 0);
			context.lineTo(x, canvas.height);
			context.stroke();
		}
	}
}

function drawCutPoints(rowCutPoints, columnCutPoints) {
	context.strokeWidth = 3;
	for (let i = 0; i < rowCutPoints.length; i++) {
		context.strokeStyle = "red";
		context.beginPath();
		context.moveTo(0, rowCutPoints[i]);
		context.lineTo(canvas.width, rowCutPoints[i]);
		context.stroke();
	}
	for (let i = 0; i < columnCutPoints.length; i++) {
		context.strokeStyle = "red";
		context.beginPath();
		context.moveTo(columnCutPoints[i], 0);
		context.lineTo(columnCutPoints[i], canvas.height);
		context.stroke();
	}
}

function drawDotMatrix(dotMatrix, boundingBox) {
	const cellWidth = boundingBox.w / COLUMNS_PER_GRID;
	const cellHeight = boundingBox.h / ROWS_PER_GRID;
	for (let i = 0; i < dotMatrix.length; i++) {
		for (let j = 0; j < dotMatrix[0].length; j++) {
			if (dotMatrix[i][j] == 1) {
				context.fillStyle = "rgba(0, 255, 0, 0.3)";
				context.fillRect(boundingBox.x + (j * cellWidth), boundingBox.y + (i * cellHeight), cellWidth, cellHeight);
			}
		}
	}
}

function drawImageData(imageData) {
	canvas.width = imageData.width;
	canvas.height = imageData.height;
	context.putImageData(imageData, 0, 0);
	canvasBackground = imageData;
}

class OutputRow {
	constructor(image, dotMatrix) {
		this.image = new Image();
		this.image.src = image.src;
		this.image.width = 200;
		this.image.height = 200;
		this.dotMatrix = dotMatrix;
		this.textBox = document.createElement("input");
		this.textBox.type = "text";
		this.downloadButton = document.createElement("button");
		this.downloadButton.innerText = "Download";
		this.downloadButton.addEventListener("click", this.download.bind(this));
		const tableRow = document.createElement("tr");
		const imageCell = document.createElement("td");
		imageCell.appendChild(this.image);
		const textBoxCell = document.createElement("td");
		const textBoxLabel = document.createElement("label");
		textBoxLabel.innerText = "Name: ";
		textBoxCell.appendChild(textBoxLabel);
		textBoxCell.appendChild(this.textBox);
		const downloadButtonCell = document.createElement("td");
		downloadButtonCell.appendChild(this.downloadButton);
		tableRow.appendChild(imageCell);
		tableRow.appendChild(textBoxCell);
		tableRow.appendChild(downloadButtonCell);
		outputTable.appendChild(tableRow);
	}
	download() {
		let dotArray = [];
		for (let i = 0; i < this.dotMatrix.length; i++) {
			for (let j = 0; j < this.dotMatrix[0].length; j++) {
				if (this.dotMatrix[i][j] == 1) {
					dotArray.push({"type": "dot",
						"xCoord": (j + 0.5) / COLUMNS_PER_GRID,
						"yCoord": (i + 0.5) / ROWS_PER_GRID,
						"color": "#000000",
						"dotRadius": 8});
				}
			}
		}
			
		const jsonOutput = JSON.stringify({"dotPatterns": dotArray});
		console.log(jsonOutput);

		let downloadLink = document.createElement("a");
		downloadLink.href = "data:application/json;charset=utf-8," + encodeURIComponent(jsonOutput);
		const dotPatternName = (this.textBox.value == "") ? "dotPattern" : this.textBox.value;
		downloadLink.download = dotPatternName + ".json";
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}
}

function createTest() {
	let files = [];
	let fileContents = [];
	function readFile(fileContent) {
		fileContents.push(fileContent.target.result);
		if (fileContents.length >= files.length) onFilesRead();
	}
	function onFilesRead() {
		//console.log(fileContents);
		const croppedPatterns = [];
		for (let i = 0; i < fileContents.length; i++) {
			const image = new Image();
			image.onload = function() {
				let imageData = rotateImageData(getImageData(image));
				const rowAndColumnMeans = calculateRowAndColumnMeans(imageData);
				const rowMeansLowPass = lowPass(rowAndColumnMeans.rowMeans, 2);
				const columnMeansLowPass = lowPass(rowAndColumnMeans.columnMeans, 2);
				const rowBits = binaryThreshold(rowMeansLowPass, 25);
				const columnBits = binaryThreshold(columnMeansLowPass, 5);
				const rowZeroRuns = getZeroRuns(rowBits);
				const columnZeroRuns = getZeroRuns(columnBits);
				const rowCutPoints = getCutPoints(rowZeroRuns, 4);
				const columnCutPoints = getCutPoints(columnZeroRuns, 5);
				drawImageData(imageData);
				for (let j = 0; j < columnCutPoints.length - 1; j++) {
					for (let k = 0; k < rowCutPoints.length - 1; k++) {
						/*
						context.fillStyle = "green";
						context.beginPath();
						context.arc(columnCutPoints[j], rowCutPoints[k], 12, 0, Math.PI + 2);
						context.fill();
						context.strokeStyle = "blue";
						*/
						/*
						context.strokeRect(columnCutPoints[j],
									rowCutPoints[k],
									columnCutPoints[j + 1] - columnCutPoints[j],
									rowCutPoints[k + 1] - rowCutPoints[k]);
						*/
						console.log("columnCutPoints[" + j + "]: " + columnCutPoints[j]);
						console.log("rowCutPoints[" + k + "]: " + rowCutPoints[k]);
						console.log("columnCutPoints[" + (j + 1) + "] - columnCutPoints[" + j + "]: " + (columnCutPoints[j + 1] - columnCutPoints[j]));
						console.log("rowCutPoints[" + (k + 1) + "] - rowCutPoints[" + k + "]: " + (rowCutPoints[k + 1] - rowCutPoints[k]));
						const croppedImageData = context.getImageData(columnCutPoints[j],
												rowCutPoints[k],
												columnCutPoints[j + 1] - columnCutPoints[j],
												rowCutPoints[k + 1] - rowCutPoints[k]);
						croppedPatterns.push(croppedImageData);
					}
				}
				for (let j = 0; j < croppedPatterns.length; j++) {
					canvas.width = croppedPatterns[j].width;
					canvas.height = croppedPatterns[j].height;
					context.putImageData(croppedPatterns[j], 0, 0);
					const patternRowAndColumnMeans = calculateRowAndColumnMeans(croppedPatterns[j]);
					const patternRowMeansLowPass = lowPass(patternRowAndColumnMeans.rowMeans, 2);
					const patternColumnMeansLowPass = lowPass(patternRowAndColumnMeans.columnMeans, 2);
					const patternRowBits = binaryThreshold(patternRowMeansLowPass, 30);
					const patternColumnBits = binaryThreshold(patternColumnMeansLowPass, 30);
					//drawPeakLines(patternRowBits, patternColiumnBits);
					const boundingBox = getBoundingBox(patternRowBits, patternColumnBits);
					const dotMatrix = getDotMatrix(croppedPatterns[j], boundingBox, 60);
					console.log(dotMatrix);
					drawDotMatrix(dotMatrix, boundingBox);
					context.strokeWidth = 5;
					context.strokeStyle = "purple";
					context.strokeRect(boundingBox.x, boundingBox.y, boundingBox.w, boundingBox.h);
					const croppedImage = new Image();
					croppedImage.src = canvas.toDataURL();
					const outputRow = new OutputRow(croppedImage, dotMatrix);
					//document.body.appendChild(document.createElement("br"));
					//document.body.appendChild(croppedImage);
				}
				//drawPeakLines(rowBits, columnBits);
				//drawCutPoints(rowCutPoints, columnCutPoints);
				//drawPeakLines(rowAndColumnBits);
			};
			image.src = fileContents[i];
		}
	}
	const fileSelects = document.getElementsByClassName("file");
	for (let i = 0; i < fileSelects.length; i++) {
		files.push(fileSelects[i].files[0]);
		const reader = new FileReader();
		reader.onload = readFile;
		reader.readAsDataURL(files[i]);
	}
	console.log(files);
}

submitButton.addEventListener("click", createTest);

/*
canvas.addEventListener("mousemove", function(e) {
	const boundingBox = canvas.getBoundingClientRect();
	const mouseX = e.clientX - boundingBox.left;
	const mouseY = e.clientY - boundingBox.top;
	context.putImageData(canvasBackground, 0, 0);
	context.strokeStyle = "red";
	context.beginPath();
	context.moveTo(0, mouseY);
	context.lineTo(canvas.width, mouseY);
	context.stroke();
	context.strokeStyle = "red";
	context.beginPath();
	context.moveTo(mouseX, 0);
	context.lineTo(mouseX, canvas.height);
	context.stroke();
	context.textBaseline = "bottom";
	context.fillText(mouseX + ", " + mouseY, mouseX + 3, mouseY - 3);
});
*/
