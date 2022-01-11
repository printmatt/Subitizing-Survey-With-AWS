/**
 * 
 * 
first group 1-4: 17 total --- take 5, 12 remaining = 5 for first group 
second group 5-6: 13 total --- 13 + 12 from prev = 25, take 7 from this. we now have 18 left.
third group 7-8: 10 total --- 10+18 from prev = 28, take 7 again from this pile, we now have 21 left
fourth group 9-10: 10 total --- 10+21=31, complete randomize 31 cards
 *
 **/

// input: array of groups of test cases -- each element has start index, end index, and number to draw after adding the group
// we have a dictionary or a map of {index : test case}
// create a group array --> get the shuffled order as the answer array 
// we loop through the map using the shuffled order

// const seedrandom = require("seedrandom");
function shuffle(groups,randomSeed){
    var ans = [] // answer array with the shuffled elements
    var set = [] // the temporary array to hold elements so we can take out randomly without repeating elements
    Math.seedrandom(randomSeed);
    
    //seedrandom(randomSeed,{global:true});
    for(var i = 0; i < groups[0][0]; i++){
        ans.push(i);
    }
    for(var i = 0; i < groups.length; i++){
        var group = groups[i]; //group 1,2,3,4,...;

        //put cases into set
        for(var j = group[0]; j < group[1]; j++){
            set.push(j);
        }

        //take cases out from set according to number of test cases to draw
        for(var k = 0; k < group[2]; k++){
            var takeIndex = Math.floor(Math.random()*set.length);
            var testCase = set.splice(takeIndex,1)[0];
            ans.push(testCase);
        }
    }

    console.log(ans);

    return ans;
}

// Use the shuffle function defined above to shuffle an array
// input: objects -- the objects (in this case, dot patterns) to be shuffled
// input: groups -- the array of groups (each element has start index, end index, and number to draw after adding the group)
function shuffleArray(objects, groups, randomSeed) {
    const indices = shuffle(groups, randomSeed);
    let ans = new Array(indices.length);
    for (let i = 0; i < ans.length; i++) {
        ans[i] = objects[indices[i]];
    }
    return ans;
}

// const testGroups = [[3,17,5],[17,30,7],[30,40,7],[40,50,28]];
// var arr = shuffle(testGroups,"test");
// console.log(arr);
