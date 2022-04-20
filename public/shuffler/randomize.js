

function shuffle(groups, randomSeed) {
    var ans = [] // answer array with the shuffled elements
    var set = [] // the temporary array to hold elements so we can take out randomly without repeating elements
    Math.seedrandom(randomSeed);

    //seedrandom(randomSeed,{global:true});
    for (var i = 0; i < groups[0][0]; i++) {
        ans.push(i);
    }
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i]; //group 1,2,3,4,...;

        //put cases into set
        for (var j = group[0]; j < group[1]; j++) {
            set.push(j);
        }

        //take cases out from set according to number of test cases to draw
        for (var k = 0; k < group[2]; k++) {
            var takeIndex = Math.floor(Math.random() * set.length);
            var testCase = set.splice(takeIndex, 1)[0];
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

// complete random shuffle
function completeShuffle(randomSeed, arr) {
    Math.seedrandom(randomSeed);
    let currentIndex = arr.length, randomIndex;
    while (currentIndex != 0) {
        //pick remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [arr[currentIndex], arr[randomIndex]] = [
            arr[randomIndex], arr[currentIndex]];
    }
    return arr;
}