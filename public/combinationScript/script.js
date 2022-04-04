const fileTable = document.getElementById("fileTable");
const addFileButton = document.getElementById("addFileButton");
const createTestButton = document.getElementById("createTestButton");
const shuffleButton = document.getElementById("shuffleButton");

let rowIds = []
let nextRowId = 0;
let fileRows = [];

const distractorLinePattern = {
	"numberOfDistractorLines": 100,
	"durationInMilliseconds": 100,
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

function shuffleArray(arr) {
	let oldArray = arr.slice();
	let newArray = [];
	while (oldArray.length > 0) {
		let index = Math.floor(Math.random() * oldArray.length);
		newArray.push(oldArray[index]);
		oldArray.splice(index, 1);
	}
	return newArray;
}

function shuffle() {
	for (let i = 0; i < fileRows.length; i++) {
		fileTable.deleteRow(0);
	}
	fileRows = shuffleArray(fileRows);
	for (let i = 0; i < fileRows.length; i++) {
		fileRows[i].reAdd();
	}
}

shuffleButton.addEventListener("click", shuffle);

function createTest() {
	let files = [];
	let fileContents = [];
	function readFile(fileContent) {
		fileContents.push(fileContent.target.result);
		if (fileContents.length >= files.length) onFilesRead();
	}
	function onFilesRead() {
		//console.log(fileContents);
		let testCases = [];
		for (let i = 0; i < fileContents.length; i++) {
			const dotPatternJson = JSON.parse(fileContents[i]);
			let testCase = {};
			testCase.distractorLinePatterns = [distractorLinePattern, distractorLinePattern];
			testCase.countdown = 4;
			testCase.dotPatterns = dotPatternJson.dotPatterns;
			testCase.durationOfDotPatternInMilliseconds = 3000;
			testCases.push(testCase);
		}
		//console.log(testCases);
		const jsonOutput = JSON.stringify({"testCases": testCases});
		let downloadLink = document.createElement("a");
		downloadLink.href = "data:application/json;charset=utf-8," + encodeURIComponent(jsonOutput);
		downloadLink.download = "test.json";
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}
	const fileSelects = document.getElementsByClassName("file");
	for (let i = 0; i < fileSelects.length; i++) {
		files.push(fileSelects[i].files[0]);
		const reader = new FileReader();
		reader.onload = readFile;
		reader.readAsText(files[i]);
	}
	console.log(files);
}

createTestButton.addEventListener("click", createTest);
