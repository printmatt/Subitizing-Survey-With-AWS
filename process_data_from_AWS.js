var fs = require('fs');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');
const objectsToCsv = require('objects-to-csv');

var data = null

// parse in data and start processing
var parser = parse({ columns: true }, function (err, records) {
    data = records;

    for (let i = 0; i < data.length; i++) {
        var userAns = JSON.parse(data[i].answers)
        console.log(data[i].version)
        data[i].correctAns = []
        data[i].correctAns = compareAns(userAns, data[i].version)
        data[i].answers = userAns.map((ans) =>{
            return parseInt(ans["S"]);
        })

    }

    fs.writeFileSync('results.json',JSON.stringify(data));
    new objectsToCsv(data).toDisk('./results.csv');


});


// Pipe the data from CSV file to be parsed
fs.createReadStream('subitizingResult.csv').pipe(parser);




const compareAns = (userAns, version) => {
    var correct = []
    jsonData = JSON.parse(fs.readFileSync("./public/Version" + version + ".json", "utf8"))

    for (let i = 0; i < jsonData.testCases.length; i++) {
        correct[i] = jsonData.testCases[i].dotPatterns.length == userAns[i].S ? 1 : 0;
    }

    return correct;


}
