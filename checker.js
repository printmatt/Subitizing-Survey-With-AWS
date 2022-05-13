const fs = require("fs");

async function countDots(fileName) {
    const fileContents = await fs.promises.readFile(fileName, "utf-8")
    const jsonData = JSON.parse(fileContents);
    let dotCounts = [];
    for (let i = 0; i < jsonData.testCases.length; i++) {
        dotCounts.push(jsonData.testCases[i].dotPatterns.length);
    }
    return dotCounts;
}

async function countCorrect() {
    const v1_counts = await countDots("public/Version1.json");
    const v2_counts = await countDots("public/Version2.json");
    const v3_counts = await countDots("public/Version3.json");

    let csvData = await fs.promises.readFile("data.csv", "utf-8");
    csvData = csvData.split("\n");
    csvData = csvData.map((line) => line.split(","));
    
    let v1_matrix = [];
    let v2_matrix = [];
    let v3_matrix = [];

    const v1_stream = fs.createWriteStream("v1_correct.csv");
    const v2_stream = fs.createWriteStream("v2_correct.csv");
    const v3_stream = fs.createWriteStream("v3_correct.csv");

    for (let y = 0; y < csvData.length; y++) {
        const version = csvData[y][0];

        let counts;
        if (version == 1) {
            counts = v1_counts;
        } else if (version == 2) {
            counts = v2_counts;
        } else {
            counts = v3_counts;
        }

        let matrixRow = [csvData[y][0], csvData[y][1], csvData[y][2]];

        for (let x = 3; x < csvData[y].length; x++) {
            matrixRow[x] = csvData[y][x] == counts[x - 3] ? 1 : 0;
        }

        if (version == 1) {
            v1_matrix.push(matrixRow);
            v1_stream.write(matrixRow.join(",") + "\n");
        } else if (version == 2) {
            v2_matrix.push(matrixRow);
            v2_stream.write(matrixRow.join(",") + "\n");
        } else {
            v3_matrix.push(matrixRow);
            v3_stream.write(matrixRow.join(",") + "\n");
        }
    }

    v1_stream.close();
    v2_stream.close();
    v3_stream.close();
}

countCorrect();