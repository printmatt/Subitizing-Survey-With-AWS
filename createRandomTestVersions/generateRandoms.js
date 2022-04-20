const seedrandom = require("seedrandom");
const fs = require("fs");
const data = require('./taggedFinalTest.json');




const distractorLinePattern = {
    "numberOfDistractorLines": 100,
    "durationInMilliseconds": 500,
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

    for (var i = 0; i < numOfPatterns; i++) {
        var dots = []
        for (var j = 0; j < numOfDots; j++) {
            let x = Math.random()*(0.9-0.1)+0.1;
            let y = Math.random()*(0.9-0.1)+0.1;
            dots.push(x, y)
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
        testCase.durationOfDotPatternInMilliseconds = 500;
        testCases.push(testCase);
    }
    return testCases;
}

// 20 arranged
// 39 to randomly distribute by 3
function generateTestVersions(randomSeed){
    let allVersions = []
    seedrandom(randomSeed, { global: true });

    // first add in the arranged patterns that are always present
    for(let i = 0; i<3; i++){
        allVersions.push(data.testCases.slice(0,20))
    }

    // shuffle the randomly distributed test cases by groups of 3
    let randomlyDistributedTestCases = data.testCases.slice(20);
    randomlyDistributedTestCases = shuffleByThree(randomlyDistributedTestCases,Math.random())
    
    // assign in order to each version. because it's already shuffled, randomness has been applied
    for(let i = 0; i < randomlyDistributedTestCases.length; i+=3){
        allVersions[0].push(randomlyDistributedTestCases[i]);
        allVersions[1].push(randomlyDistributedTestCases[i+1]);
        allVersions[2].push(randomlyDistributedTestCases[i+2]);
    }

    // add 2 randoms per number of dots except 1
    for(let j = 0; j <= 2; j++){
        for(let i = 1; i <= 5; i++){
            if(i == 1) {
                var patterns = randomizePatterns(Math.random(),i,1)
                var dotPatterns = patternsFromArray(patterns)
                allVersions[j].push(dotPatterns[0])
            }
            else{
                var patterns = randomizePatterns(Math.random(),i,2)
                var dotPatterns = patternsFromArray(patterns)
                allVersions[j].push(dotPatterns[0])
                allVersions[j].push(dotPatterns[1])
            }
        }
    }

    // add 18 completely randomized cases
    for(let j = 0; j <= 2; j++){
        for(let i = 0; i <= 18; i++){
            var numDots = Math.floor(Math.random()*5)+1;
            var patterns = randomizePatterns(Math.random(),numDots,1)
            var dotPatterns = patternsFromArray(patterns)
            allVersions[j].push(dotPatterns[0])
        }
    }

    return allVersions;
}

//shuffle an array by every 3 items
function shuffleByThree(arr, randomSeed){
    if(arr.length % 3 != 0) return arr;
    // seedrandom(randomSeed, { global: true });

    for(let i = 0; i < arr.length; i+=3){
        let currentIndex = i+3, randomIndex;
        while(currentIndex != i){
            //pick remaining element
            randomIndex = Math.floor(Math.random() * (currentIndex-i))+i;
            currentIndex--;
            [arr[currentIndex], arr[randomIndex]] = [
                arr[randomIndex], arr[currentIndex]];
        }
    }
    
    return arr;

}

let allVersions = generateTestVersions(5);

fs.writeFile("./createRandomTestVersions/Version1.json", JSON.stringify({"testCases": allVersions[0]}), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});


fs.writeFile("./createRandomTestVersions/Version2.json", JSON.stringify({"testCases": allVersions[1]}), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});

fs.writeFile("./createRandomTestVersions/Version3.json", JSON.stringify({"testCases": allVersions[2]}), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});

console.log(data.testCases[20])
// let testArr = [1,2,3,4,5,6,7,8,9];
// testArr = shuffleByThree(testArr,22)
// console.log(testArr)





// //examples
// var patterns = randomizePatterns(5, 4, 5)
// var testCases = patternsFromArray(patterns);

// fs.writeFile("./createRandomTestVersions/test.json", JSON.stringify({"testCases": testCases}), err => {
     
//     // Checking for errors
//     if (err) throw err; 
   
//     console.log("Done writing"); // Success
// });

// console.log(testCases[0].distractorLinePatterns)

