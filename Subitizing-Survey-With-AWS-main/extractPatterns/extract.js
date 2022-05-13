const data = require('./finalTestCase.json');
const fs = require("fs");

data.testCases.sort((test1,test2) => test1.dotPatterns.length - test2.dotPatterns.length);

var count = 0;
var currentN = 0;
data.testCases = data.testCases.map(test => {

    // Tagging Each Dot Pattern
    var numOfDots = test.dotPatterns.length;
    if(numOfDots == currentN){
        count++;
        test.name = "N"+currentN+"P#"+count

    }
    else{
        currentN = numOfDots;
        count = 1;
        test.name = "N"+currentN+"P#"+count
    }

    // Naming each Dot Pattern File
    const jsonOutput = JSON.stringify({"dotPatterns": test.dotPatterns});
    fs.writeFile("./public/orderedPatternFiles/"+test.name+".json",jsonOutput, err => {
     
        // Checking for errors
        if (err) throw err; 
       
        console.log("Done Exporting"); // Success
    })

    return test
})

fs.writeFile("./extractPatterns/orderedFinalTest.json", JSON.stringify(data), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});

console.log("hello")
