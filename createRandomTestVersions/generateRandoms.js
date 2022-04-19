const seedrandom = require("seedrandom");
const distractorLinePattern = {
    "numberOfDistractorLines": 100,
    "durationInMilliseconds": 100,
    "colorPalette": [
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "black",
        "pink",
        "brown"
    ],
    "minWidth": 1,
    "maxWidth": 1
}

// input: random seed, number of dots in the pattern, number of random patterns to generate
// output: an array containing the x-y coordinates in order i.e [[x0,y0,x1,y1].[x0,y0,x1,y1]]
function randomizePatterns(randomSeed, numOfDots, numOfPatterns) {
    var patterns = []
    // Math.seedrandom(randomSeed)
    seedrandom(randomSeed, { global: true });

    for (var i = 0; i < numOfPatterns; i++) {
        var dots = []
        for (var j = 0; j < numOfDots; j++) {
            dots.push(Math.random(), Math.random())
        }
        patterns.push(dots)
    }
    return patterns;
}



// input: the xy coordinates generated
// output: array of test cases 
function patternsFromArray(patterns) {
    let testCases = [];
    for (var i = 0; i < patterns.length; i++) {
        let testCase = {}
        var dotPatterns = []
        for (var j = 0; j < patterns[i].length; j+=2) {
            dotPatterns.push({
                "type": "dot",
                "xCoord": patterns[i][j],
                "yCoord": patterns[i][j+1],
                "color": "#000000",
                "dotRadius": "8"
            })
        }
        testCase.distractorLinePatterns = [distractorLinePattern, distractorLinePattern];
        testCase.countdown = 4;
        testCase.dotPatterns = dotPatterns;
        testCase.durationOfDotPatternInMilliseconds = 3000;
        testCases.push(testCase);
    }
    return testCases;
}

//examples
var patterns = randomizePatterns(5, 3, 3)
var testCases = patternsFromArray(patterns);

console.log(testCases[0].distractorLinePatterns)