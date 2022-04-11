
//const seedrandom = require("seedrandom");


// function randomizePatterns(randomSeed, numOfDots, numOfPatterns){
//     var patterns = []
//     Math.seedrandom(randomSeed)
//     for(var i = 0; i < numOfPatterns; i++){
//         var dots = []
//         for (var j = 0; j < numOfDots; j++) {
//             dots.push(Math.random(),Math.random())
//         }
//         patterns.push(dots)
//     }
//     return patterns;
// }


// function patternsFromArray(patterns, radius, canvasWidth, canvasHeight, durationInMilliseconds){
//     let patternsToView = [];
// 	for(var i = 0; i < patterns.length; i++){
//         var dots = []
//         for (var j = 0; j < patterns[i].length; j++) {
//             dots.push(new Dot(
//                         patterns[i][j] * canvasWidth,
//                         patterns[i][j] * canvasHeight,
//                         "black",
//                         patterns[i][j] * radius))
//         }
//         patternsToView.push(new DotPattern(dots, durationInMilliseconds))
//     }
//     return patternsToView;
// }

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


// -----------------------------------------------------------------------------------------------------------------------------
// class Dot {
// 	constructor(xCoord, yCoord, color, radius) {
// 		this.xCoord = xCoord;
// 		this.yCoord = yCoord;
// 		this.color = color;
// 		this.radius = radius;
// 		this.transformation = cloneMatrix(identityMatrix);
// 	}

// 	get numberOfDots() {
// 		return 1;
// 	}

// 	draw(outsideTransformation = identityMatrix) {
// 		const newTransformation = multiplyMatrixByMatrix(outsideTransformation, this.transformation);
// 		const coordVector = [this.xCoord, this.yCoord, 1];
// 		const transformedCoordVector = multiplyMatrixByVector(newTransformation, coordVector);
// 		const canvasDimensions = [canvas.width, canvas.height];
// 		const scaledCoordVector = [transformedCoordVector[0] * canvas.width,
// 					transformedCoordVector[1] * canvas.height];
// 		context.fillStyle = this.color;
// 		context.beginPath();
// 		context.arc(scaledCoordVector[0], scaledCoordVector[1], this.radius, 0, 2 * Math.PI);
// 		context.fill();
// 	}

// 	mutate(xCoordStdDev, yCoordStdDev, radiusStdDev) {
// 		//this.xCoord = normal(this.xCoord, xCoordStdDev);
// 		//this.yCoord = normal(this.yCoord, yCoordStdDev);
// 		//this.radius = normal(this.radius, radiusStdDev);
// 	}

// }

// class DotPattern {
// 	constructor(dots, durationInMilliseconds) { // dots is an array of instances of the Dot class
// 		this.dots = dots;
// 		this.durationInMilliseconds = durationInMilliseconds;
// 		this.transformation = cloneMatrix(identityMatrix);
// 	}

// 	get numberOfDots() {
// 		let accumulator = 0;
// 		for (let i = 0; i < this.dots.length; i++) {
// 			accumulator += this.dots[i].numberOfDots;
// 		}
// 		return accumulator;
// 	}

// 	draw(outsideTransformation = identityMatrix) {
// 		const newTransformation = multiplyMatrixByMatrix(outsideTransformation, this.transformation);
// 		console.log(newTransformation);
// 		for (let i = 0; i < this.dots.length; i++) {
// 			this.dots[i].draw(newTransformation);
// 		}
// 	}
	
// 	// Draw the dot pattern for the specified number of milliseconds,
// 	// then clear the canvas and call the specified callback function.
// 	drawForSomeTime(callback, transformation = identityMatrix) {
// 		this.draw(transformation);
// 		timeouts.push(setTimeout(function() {
// 			context.clearRect(0, 0, canvas.width, canvas.height);
// 			timeouts.push(setTimeout(callback, 0)); // setTimeout is used to call the callback asynchronously.
// 		}, this.durationInMilliseconds));
// 	}

// 	add(that) {
// 		this.dots.push(that);
// 	}

// 	mutate(xCoordStdDev, yCoordStdDev, radiusStdDev) {
// 		for (let i = 0; i < this.dots.length; i++) {
// 			this.dots[i].mutate(xCoordStdDev, yCoordStdDev, radiusStdDev);
// 		}
// 	}

// }