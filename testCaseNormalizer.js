const data = require('./test (5).json');
const fs = require("fs");

data.testCases = data.testCases.map(test => {
    test.dotPatterns = test.dotPatterns.map(pattern => {
        pattern.xCoord = pattern.xCoord/440;
        pattern.yCoord = pattern.yCoord/400;
        return pattern
    })
    return test
})

console.log(data.testCases);

fs.writeFile("denormalizedTest.json", JSON.stringify(data), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});