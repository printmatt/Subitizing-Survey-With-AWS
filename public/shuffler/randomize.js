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

function shuffle(groups){
    var ans = [] // answer array with the shuffled elements
    var set = [] // the temporary array to hold elements so we can take out randomly without repeating elements

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

    return ans;
}

// Use the shuffle function defined above to shuffle an array
// input: objects -- the objects (in this case, dot patterns) to be shuffled
// input: groups -- the array of groups (each element has start index, end index, and number to draw after adding the group)
function shuffleArray(objects, groups) {
    const indices = shuffle(groups);
    let ans = new Array(indices.length);
    for (let i = 0; i < ans.length; i++) {
        ans[i] = objects[indices[i]];
    }
    return ans;
}

/**
 * 
 * 
first group 1-4: 17 total --- take 5, 12 remaining = 5 for first group 
second group 5-6: 13 total --- 13 + 12 from prev = 25, take 7 from this. we now have 18 left.
third group 7-8: 10 total --- 10+18 from prev = 28, take 7 again from this pile, we now have 21 left
fourth group 9-10: 10 total --- 10+21=31, complete randomize 31 cards
 *
 **/

/*
const groups = [[0,17,5],[17,30,7],[30,40,7],[40,50,31]];
var arr = shuffle(groups);
console.log(arr);
*/

/*
const groups = [[0,17,5],[17,30,7],[30,40,7],[40,50,31]];
let objects = [];
for (let i = 0; i < 17; i++) {
    objects.push(Math.floor(Math.random() * 4) + 1);
}
for (let i = 0; i < 13; i++) {
    objects.push(Math.floor(Math.random() * 2) + 5);
}
for (let i = 0; i < 10; i++) {
    objects.push(Math.floor(Math.random() * 2) + 7);
}
for (let i = 0; i < 10; i++) {
    objects.push(Math.floor(Math.random() * 2) + 9);
}

console.log("Unshuffled cards:");
console.log(objects);

console.log("Shuffled cards:");
console.log(shuffleArray(objects, groups));
*/