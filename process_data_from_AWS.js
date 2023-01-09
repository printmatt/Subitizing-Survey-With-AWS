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
    console.log(userAns.length)
    for (let i = 0; i < userAns.length; i++) {
        correct[i] = jsonData.testCases[i].dotPatterns.length == userAns[i]["S"] ? 1 : 0;
    }

    for (let i = userAns.length; i < jsonData.testCases.length; i++) {
        correct[i] = -1;
    }


    return correct;


}
