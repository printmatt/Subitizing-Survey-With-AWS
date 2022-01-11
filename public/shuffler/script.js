const groups = [[3,17,5],[17,30,7],[30,40,7],[40,50,28]];

const uploadPrompt = document.getElementById("uploadPrompt");
const fileSelect = document.getElementById("fileSelect");
const newFileNameInput = document.getElementById("newFileName");
const submitButton = document.getElementById("submit");
const randomSeed = document.getElementById("randomSeed");

function downloadJSONFile(fileName, fileContents) {
    let downloadLink = document.createElement("a");
	downloadLink.href = "data:application/json;charset=utf-8," + encodeURIComponent(fileContents);
	downloadLink.download = fileName;
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);
	downloadLink.click();
	document.body.removeChild(downloadLink);
}

function onFileRead(fileContents) {
    const oldFileContents = fileContents.target.result;
	const oldCases = JSON.parse(oldFileContents).testCases;
    const newCases = shuffleArray(oldCases, groups, randomSeed.value);
    const newFileContents = JSON.stringify({"testCases": newCases});
    const newFileName = newFileNameInput.value + ".json";
    downloadJSONFile(newFileName, newFileContents);
};

submitButton.addEventListener("click", function() {
	const reader = new FileReader();
	reader.onload = onFileRead;
	reader.readAsText(fileSelect.files[0]);
});