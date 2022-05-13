const data = require('./finalTestCase.json');
const fs = require("fs");
const arr = [
    'A1A',  'A2A',  'A3A',  'A3B',  'A3C',  'A4A',
    'A4B',  'A4C',  'A4D',  'A4E',  'A5A',  'A5B',
    'A5C',  'A5D',  'A5E',  'A5F',  'A5G',  'A5H',
    'A5I',  'A5J',  'R2A1', 'R2A2', 'R2A3', 'R3A1',
    'R3A2', 'R3A3', 'R3B1', 'R3B2', 'R3B3', 'R3C1',
    'R3C2', 'R3C3', 'R4A1', 'R4A2', 'R4A3', 'R4D1',
    'R4D2', 'R4D3', 'R4E1', 'R4E2', 'R4E3', 'R5A1',
    'R5A2', 'R5A3', 'R5D1', 'R5D2', 'R5D3', 'R5E1',
    'R5E2', 'R5E3', 'R5F1', 'R5F2', 'R5F3', 'R5G1',
    'R5G2', 'R5G3', 'R5H1', 'R5H2', 'R5H3'
  ]

let i = 0;
data.testCases = data.testCases.map(test => {
    test.durationOfDotPatternInMilliseconds = 500
    test.distractorLinePatterns[0].durationInMilliseconds = 500
    test.distractorLinePatterns[1].durationInMilliseconds = 500

    test.name = arr[i]
    i++


    return test
})

fs.writeFile("./createRandomTestVersions/taggedFinalTest.json", JSON.stringify(data), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});