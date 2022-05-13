const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 400;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const NUMBER_OF_ROWS = 15;
const NUMBER_OF_COLUMNS = 15;

const CELL_WIDTH = CANVAS_WIDTH / NUMBER_OF_COLUMNS;
const CELL_HEIGHT = CANVAS_HEIGHT / NUMBER_OF_ROWS;

/*
const grid = document.getElementById("grid");
grid.width = CANVAS_WIDTH;
grid.height = CANVAS_HEIGHT;
for (let x = 0; x < NUMBER_OF_COLUMNS; x++) {
	const line = document.createElementNS('http://www.w3.org/2000/svg','line');
	line.setAttribute("x1", CELL_WIDTH * x);
	line.setAttribute("x2", CELL_WIDTH * x);
	line.setAttribute("y1", 0);
	line.setAttribute("y2", CANVAS_HEIGHT);
	grid.appendChild(line);
}
*/

/*
const grid = document.getElementById("grid");
grid.width = CANVAS_WIDTH;
grid.height = CANVAS_HEIGHT;
const gridContext = grid.getContext("2d");
gridContext.fillRect(40, 40, 40, 40);
*/

const rightFrame = document.getElementById("rightFrame");
const form = document.getElementById("form");
const colorInput = document.getElementById("colorInput");
const radiusInput = document.getElementById("radiusInput");
const deleteButton = document.getElementById("deleteButton");
const nameInput = document.getElementById("nameInput");
nameInput.value = "";
const exportButton = document.getElementById("exportButton");
const clearButton = document.getElementById("clearButton");

class Dot {
	constructor(xCoord, yCoord, color, radius) {
		this.xCoord = xCoord;
		this.yCoord = yCoord;
		this.color = color;
		this.radius = radius;
		this.isEmpty = false;
		//this.transformation = cloneMatrix(identityMatrix);
	}

	get numberOfDots() {
		return 1;
	}

	draw() {
		//const newTransformation = multiplyMatrixByMatrix(outsideTransformation, this.transformation);
		//const coordVector = [this.xCoord, this.yCoord, 1];
		//const transformedCoordVector = multiplyMatrixByVector(newTransformation, coordVector);
		context.fillStyle = this.color;
		context.beginPath();
		//context.arc(transformedCoordVector[0], transformedCoordVector[1], this.radius, 0, 2 * Math.PI);
		context.arc(this.xCoord, this.yCoord, this.radius, 0, 2 * Math.PI);
		context.fill();
	}
	/*
	mutate(xCoordStdDev, yCoordStdDev, radiusStdDev) {
		this.xCoord = normal(this.xCoord, xCoordStdDev);
		this.yCoord = normal(this.yCoord, yCoordStdDev);
		this.radius = normal(this.radius, radiusStdDev);
	}
	*/

	/*
	translate(changeInX, changeInY) {
		this.xCoord += changeInX;
		this.yCoord += changeInY;
	}
	*/
}

class CellCoords {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.topLeftX = this.x * CELL_WIDTH;
		this.topLeftY = this.y * CELL_HEIGHT;
		this.centerX = this.topLeftX + (CELL_WIDTH / 2);
		this.centerY = this.topLeftY + (CELL_HEIGHT / 2);
	}

	equals(that) {
		return ((this.x == that.x) && (this.y == that.y));
	}

	drawOutline(strokeWidth) {
		context.lineWidth = 2;
		context.strokeStyle = "black";
		context.strokeRect(this.topLeftX + (strokeWidth / 2),	// Coordinated are modified to line the cell.
					this.topLeftY + (strokeWidth / 2),
					CELL_WIDTH - strokeWidth,
					CELL_HEIGHT - strokeWidth);
	}
}

class EmptyCell {
	constructor() {
		this.isEmpty = true;
	}

	draw() {
	}
}

let dotMatrix = [];
for (let x = 0; x < NUMBER_OF_COLUMNS; x++) {
	let currentRow = [];
	for (let y = 0; y < NUMBER_OF_ROWS; y++) {
		currentRow.push(new EmptyCell());
	}
	dotMatrix.push(currentRow);
}

function getCellCoordsOfPoint(x, y) {
	/*
	return {x: Math.floor(x / CELL_WIDTH),
		y: Math.floor(y / CELL_HEIGHT)};
	*/
	return new CellCoords(Math.floor(x / CELL_WIDTH),
				Math.floor(y / CELL_HEIGHT));
}

/*
function getTopLeftCoordsOfCell(x, y) {
	return {x: x * CELL_WIDTH,
		y: y * CELL_HEIGHT};
}

function getCenterCoordsOfCell(x, y) {
	return {x: x * CELL_WIDTH + (CELL_WIDTH / 2),
		y: y * CELL_HEIGHT + (CELL_HEIGHT / 2)};
}
*/

function drawGridLines() {
	context.strokeStyle = "lightgrey";
	for (let x = 0; x < NUMBER_OF_COLUMNS; x++) {
		context.beginPath();
		context.moveTo(CELL_WIDTH * x, 0);
		context.lineTo(CELL_WIDTH * x, CANVAS_HEIGHT);
		context.stroke();
	}
	for (let y = 0; y < NUMBER_OF_ROWS; y++) {
		context.beginPath();
		context.moveTo(0, CELL_HEIGHT * y);
		context.lineTo(CANVAS_WIDTH, CELL_HEIGHT * y);
		context.stroke();
	}
}
drawGridLines();

let highlightedCellCoords = new CellCoords(0, 0);
let activeCellCoords = new CellCoords(0, 0);

function changeHighlightedCell(newHighlightedCellCoords) {
	//console.log(newHighlightedCellCoords);
	context.clearRect(highlightedCellCoords.topLeftX, highlightedCellCoords.topLeftY, CELL_WIDTH, CELL_HEIGHT);
	dotMatrix[highlightedCellCoords.x][highlightedCellCoords.y].draw();
	highlightedCellCoords = newHighlightedCellCoords;
	context.fillStyle = "lightgrey";
	context.fillRect(highlightedCellCoords.topLeftX, highlightedCellCoords.topLeftY, CELL_WIDTH, CELL_HEIGHT);
	dotMatrix[highlightedCellCoords.x][highlightedCellCoords.y].draw();
	activeCellCoords.drawOutline(2);
	drawGridLines();
}

function changeActiveCell(newActiveCellCoords) {
	context.clearRect(activeCellCoords.topLeftX, activeCellCoords.topLeftY, CELL_WIDTH, CELL_HEIGHT);
	dotMatrix[activeCellCoords.x][activeCellCoords.y].draw();
	activeCellCoords = newActiveCellCoords;
	activeCellCoords.drawOutline(2);
	//rightFrame.style.display = "block";
	activeCell = dotMatrix[activeCellCoords.x][activeCellCoords.y];
	colorInput.value = activeCell.color;
	radiusInput.value = activeCell.radius;
	drawGridLines();
}

function onCellContentChange(changedCellCoords) {
	context.clearRect(changedCellCoords.topLeftX, changedCellCoords.topLeftY, CELL_WIDTH, CELL_HEIGHT);
	dotMatrix[changedCellCoords.x][changedCellCoords.y].draw();
	activeCellCoords.drawOutline(2);
}

canvas.addEventListener("mousemove", function(e) {	
	let cellCoordsOfMouse = getCellCoordsOfPoint(e.offsetX, e.offsetY);
	if (!cellCoordsOfMouse.equals(highlightedCellCoords)) {
		changeHighlightedCell(cellCoordsOfMouse);
	}
});

canvas.addEventListener("click", function() {
	if (dotMatrix[highlightedCellCoords.x][highlightedCellCoords.y].isEmpty) {
		dotMatrix[highlightedCellCoords.x][highlightedCellCoords.y] = new Dot(highlightedCellCoords.centerX, highlightedCellCoords.centerY, "#000000", 5);
		onCellContentChange(highlightedCellCoords);
	}
	if (!activeCellCoords.equals(highlightedCellCoords)) {
		changeActiveCell(highlightedCellCoords);
	}
	rightFrame.style.display = "block";
	//dotMatrix[activeCellCoords.x][activeCellCoords.y].draw();
});

deleteButton.addEventListener("click", function() {
	dotMatrix[activeCellCoords.x][activeCellCoords.y] = new EmptyCell();
	onCellContentChange(activeCellCoords);
	rightFrame.style.display = "none";
});

colorInput.addEventListener("change", function() {
	dotMatrix[activeCellCoords.x][activeCellCoords.y].color = colorInput.value;
	onCellContentChange(activeCellCoords);
});

radiusInput.addEventListener("change", function() {
	dotMatrix[activeCellCoords.x][activeCellCoords.y].radius = radiusInput.value;
	onCellContentChange(activeCellCoords);
});

exportButton.addEventListener("click", function() {
	let dotArray = [];
	for (let x = 0; x < NUMBER_OF_COLUMNS; x++) {
		for (let y = 0; y < NUMBER_OF_ROWS; y++) {
			const currentCell = dotMatrix[x][y];
			if (!currentCell.isEmpty) {
				dotArray.push({"type": "dot",
						"xCoord": currentCell.xCoord / canvas.width,
						"yCoord": currentCell.yCoord / canvas.height,
						"color": currentCell.color,
						"dotRadius": currentCell.radius});
			}
		}
	}
	const jsonOutput = JSON.stringify({"dotPatterns": dotArray});
	console.log(jsonOutput);

	let downloadLink = document.createElement("a");
	downloadLink.href = "data:application/json;charset=utf-8," + encodeURIComponent(jsonOutput);
	const dotPatternName = (nameInput.value == "") ? "dotPattern" : nameInput.value;
	downloadLink.download = dotPatternName + ".json";
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
});

clearButton.addEventListener("click", function() {
	for (let x = 0; x < NUMBER_OF_COLUMNS; x++) {
		for (let y = 0; y < NUMBER_OF_ROWS; y++) {
			const currentCellCoords = new CellCoords(x, y);
			dotMatrix[currentCellCoords.x][currentCellCoords.y] = new EmptyCell();
			onCellContentChange(currentCellCoords);
		}
	}
	rightFrame.style.display = "none";
	drawGridLines();
});
