'use strict;'
var esprima = require('esprima');
var mocha = require('mocha');
var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');

var KnapsackSolver = require(path.join(__dirname, '..', 'knapsack'));

describe('src/knapsack.js', () => {
	describe('Syntax', () => {
		it('Should be valid Javascript', () => {
			try {
				var userStringToTest = fs.readFileSync(path.join(__dirname, '..', 'src', 'knapsack.js'));
				esprima.parse(userStringToTest);
				assert(true);
			}
			catch(e) {
				assert(false, e.toString());
			}
		});
	});
	describe('Constructor', () => {
		it('Should be able to parse script', () => {
			try {
				var knapsackSolver = new KnapsackSolver();
				assert(true);
			}
			catch(e) {
				assert(false, e.toString());
			}
		});
	});
	describe('SolveByCount', function () {
		[{
			name: 'only one element and one bucket',
			elements: ['1'],
			buckets: [
				{
					index: '1',
					elements: {
						'1': 1
					}
				}
			],
			maxBuckets: 1,
			expectedBucketIds: ['1']
		},
		{
			name: 'one element two buckets',
			elements: ['1'],
			buckets: [
				{
					index: '1',
					elements: {
						'1': 1
					}
				},
				{
					index: '2',
					elements: {
						'2': 1
					}
				}
			],
			maxBuckets: 1,
			expectedBucketIds: ['1']
		},
		{
			name: 'two elements in one bucket',
			elements: ['1', '2'],
			buckets: [
				{
					index: '1',
					elements: {
						'1': 1,
						'2': 1
					}
				},
				{
					index: '2',
					elements: {
						'2': 1,
						'3': 5
					}
				}
			],
			maxBuckets: 1,
			expectedBucketIds: ['1']
		},
		{
			name: 'not enough elements per bucket',
			elements: ['1', '2', '2', '3', '4'],
			buckets: [
				{
					index: '1',
					elements: {
						'1': 1,
						'2': 2
					}
				},
				{
					index: '2',
					elements: {
						'2': 1,
						'3': 5
					}
				}
			],
			maxBuckets: 5,
			expectedBucketIds: null
		}].map((testCase) => {
			it('SolveByCount: ' + JSON.stringify(testCase), () => {
				try {
					var knapsackSolver = new KnapsackSolver();
					var resultBucketIds = knapsackSolver.SolveByCount(testCase.elements, testCase.buckets, testCase.maxBuckets);
					if(resultBucketIds != null) assert.sameMembers(resultBucketIds, testCase.expectedBucketIds, 'Expected Buckets resulted should match');
					else { assert.equal(resultBucketIds, testCase.expectedBucketIds, 'Actual results are null, expected: (' + testCase.expectedBucketIds + ')'); }
				}
				catch(e) {
					assert(false, e.toString());
				}
			});

			it('SolveByElimination: ' + JSON.stringify(testCase), () => {
				try {
					var knapsackSolver = new KnapsackSolver();
					var resultBucketIds = knapsackSolver.Solve(testCase.elements, testCase.buckets, testCase.maxBuckets);
					if(resultBucketIds != null) assert.sameMembers(resultBucketIds, testCase.expectedBucketIds, 'Expected Buckets resulted should match');
					else { assert.equal(resultBucketIds, testCase.expectedBucketIds, 'Actual results are null, expected: (' + testCase.expectedBucketIds + ')'); }
				}
				catch(e) {
					assert(false, e.toString());
				}
			});
		});
	});
});