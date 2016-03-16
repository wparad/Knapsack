'use strict;'

function KnapsackSolver(){

}

/*
	[
		{
			index: 0,
			elements: {
				"0": true
			}
		},
		{
			index: 1,
			elements: {
				"1": true
			}
		},
		{
			index: 2,
			elements: {
			}
		},
		{
			index: 3,
			elements: {
				"1": true
			}
		},
		{
			index: 4,
			elements: {
			}
		}
	]
*/
/* This is not the optimal solution
 *  First find all the remaining buckets which contain one element that is still needed.
 *  * for each of these buckets
 *  * * Recursive call to find elements and buckets which contain the remainder, along with allowed number.
 *  * If the return is null return null
 *  * Otherwise return bucket plus list
 */
KnapsackSolver.prototype.Solve = function(elements, buckets, maxBuckets) {
	console.log('************************************');
	console.log('Elements: ' + JSON.stringify(elements));
	console.log('Buckets: ' + JSON.stringify(buckets));
	console.log('Max Buckets: ' + maxBuckets);

	//If we need to find more buckets but aren't allowed any more room, this combination can't 
	if(maxBuckets == 0) { return null; }
	//Find all remaining buckets that can still be used
	//Project existing buckets 
	var elementMap = {};
	elements.map((e) => { elementMap[e] = true; });

	var sortedBuckets = this.SortBuckets(buckets, elementMap);
	
	//If there can be on bucket found, i.e. we fell through the previous three conditions (no perfect bucket, no good bucket, no bucket that matches any elements)
	if(sortedBuckets.length == 0) { return null; }

	for(var nextBucket of sortedBuckets) {
		//Reduce the scope of the elements by the new choosen bucket.
		var remainingElements = elements.filter((e) => nextBucket.elements[e] == null);

		console.log('Bucket Picked: ' + nextBucket.index);
		//If there are no elements left which need a bucket, then we are done, we can just use all the buckets we have found up until this point.
		if(remainingElements == 0) { return [nextBucket.index]; }

		//Otherwise remove eliminated buckets and bucket just picked and continue
		var remainingBuckets = buckets.filter((bucket) => {
			var keep = Object.keys(bucket.elements).some((e) => (nextBucket.elements[e] == null) && (elementMap[e] != null));
			return (nextBucket.index != bucket.index) && keep;
		});

		var remainingBucketMates = this.Solve(remainingElements, remainingBuckets, maxBuckets - 1);
		if (remainingBucketMates != null) { return [nextBucket.index].concat(remainingBucketMates); }

		//Else continue with the loop and get the next posible bucket.
	}
	//If the code enters here it means that all the orders that could have been picked are bad, and the previous pick should be eliminated from the possible buckets
	return null;
}

/* Returns the list of bucketIds with the highest score.
 * There is no optimal solution: https://en.wikipedia.org/wiki/Knapsack_problem
 */
// buckets is a list [{index: bucketId, elements: { 1: true, 2, true}}]
KnapsackSolver.prototype.SortBuckets = function(buckets, elementMap) {	
	var elements = Object.keys(elementMap);
	/* Sorting by bucket elimination */
	//First: For each bucket look at each other bucket and determine if the second bucket has elements not found in the first bucket but are contained in the elements set.
	var eliminatedBucketsCountMap = {};
	buckets.map((bucket) => {
		var eliminatedBuckets = buckets.filter((secondBucket) => bucket.index != secondBucket.index && 
			Object.keys(secondBucket.elements).every((e) => (bucket.elements[e] != null) || (elementMap[e] == null))
		).length;
		eliminatedBucketsCountMap[bucket.index] = eliminatedBuckets;
	});

	/* Sorting by unique elements, buckets with uncommon elements which are needed are more likely to be picked. */
	//Second: sort by the number of elements found in the bucket based on the uncommoness of that element.
	//	i.e. pick the bucket which contains the element that is found in the least number of other buckets
	var elementsCounts = {};
	elements.map((e) => { elementsCounts[e] = 0; });

	//Count the elements
	buckets.map((b) => {
		Object.keys(b.elements).filter((e) => elementsCounts[e] != null).map((e) => elementsCounts[e]++);
	});

	//Find the elements with the least count across buckets and sort those buckets
	var minCount = 1000;
	var minElement = [];
	elements.map((e) => {
		count = elementsCounts[e];
		if(minCount > count) { minCount = count; minElement = [e]; }
		else if(minCount == count) { minElement.push(e); }
	});

	var uniqueElementBucketCountMap = {};
	buckets.map((b) => { uniqueElementBucketCountMap[b.index] =  minElement.filter((e) => b.elements[e] != null).length; });

	/* Sort by element count, bucket with more elements are more likely to be picked. */
	//Third: sort by the bucket which contains the most needed connectors
	var bucketElementCountMap = {};
	var scores = buckets.map((bucket) => {
		bucketElementCountMap[bucket.index] = elements.filter((e) => bucket.elements[e]).length;
	});

	var sortedBuckets = buckets.sort((a,b) => 
		eliminatedBucketsCountMap[b.index] - eliminatedBucketsCountMap[a.index] ||
		uniqueElementBucketCountMap[b.index] - uniqueElementBucketCountMap[a.index] ||
		bucketElementCountMap[b.index] - bucketElementCountMap[a.index]);

	return sortedBuckets;
}

/* This is not the optimal solution
 *  First find all the remaining buckets which contain one element that is still needed.
 *  * for each of these buckets
 *  * * Recursive call to find elements and buckets which contain the remainder, along with allowed number.
 *  * If the return is null return null
 *  * Otherwise return bucket plus list
 */
KnapsackSolver.prototype.SolveByCount = function(elements, buckets, maxBuckets) {
	var remainingElementsMap = GetRemainingElementsMap(elements);
	var chosenBucketIdList = [];
	var bucketMap = {};
	buckets.map((b) => { bucketMap[b.index] = b; });

	for(var allowedBuckets = maxBuckets; allowedBuckets > 0 && Object.keys(remainingElementsMap).length > 0; allowedBuckets--) {
		var bucketScore = {};
		buckets.map((b) => {
			Object.keys(remainingElementsMap).map((e) => {
				bucketScore[b.index] = (bucketScore[b.index] || 0) + Math.min((remainingElementsMap[e] || 0), (b.elements[e] || 0));
			});
		});

		var maxBucketIndex = null;
		var maxScore = 0;
		Object.keys(bucketScore).map((index) => {
			if(bucketScore[index] > maxScore) { maxScore = bucketScore[index]; maxBucketIndex = index; }
		});
		
		// If there is no bucket that will add any value
		if(maxScore == 0) { break; }

		chosenBucketIdList.push(maxBucketIndex);
		var newRemainingElementsMap = {};
		Object.keys(remainingElementsMap).map((e) => {
			var bucketElements = bucketMap[maxBucketIndex].elements;
			Object.keys(bucketElements).map((bucketElement) => {
				var numberOfElementRemaining = Math.max(0, remainingElementsMap[e] - bucketElements[e]);
				if(numberOfElementRemaining > 0) { newRemainingElementsMap[e] = numberOfElementRemaining; }
			});
		});
		remainingElementsMap = newRemainingElementsMap;
	}

	if(Object.keys(remainingElementsMap).length > 0) { return null; }
	return chosenBucketIdList;
}

function GetRemainingElementsMap(elements) {
	var remainingElementsMap = {};
	elements.map((e) => {
		if(elements[e]) { remainingElementsMap[e] = remainingElementsMap[e] + 1; }
		else { remainingElementsMap[e] = 1; }
	});
	return remainingElementsMap;
}
module.exports = KnapsackSolver;