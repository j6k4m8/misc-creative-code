/**
 * KDTree implementation.
 *
 * This is a simple custom KDTree because I wanted to write a performant one
 * for this differential-growth project. It should still be a general purpose
 * implementation, and it's pretty fast.
 *
 * Types are annotated with JSDoc comments.
 * No-framework tests are at the bottom of the file and can be run with
 * `node kdtree.js`.
 *
 */
class KDTree {

    /**
     * @param {number} dimensions - The number of dimensions in the tree.
     */
    constructor(dimensions) {
        this.dimensions = dimensions;
        this.root = null;
    }

    /**
     * @param {number[]} point - The point to insert.
     */
    insert(point) {
        if (this.root === null) {
            this.root = new KDNode(point);
        } else {
            this.root.insert(point);
        }
    }

    /**
     * @param {number[]} point - The point to search for.
     * @return {number[]} The nearest point in the tree.
     */
    nearest(point) {
        return this.root.nearest(point);
    }

    /**
     * @param {number[]} pointA - The first point.
     * @param {number[]} pointB - The second point.
     * @return {number} The distance between the two points.
     */
    static distance(pointA, pointB) {
        let sum = 0;
        for (let i = 0; i < pointA.length; i++) {
            sum += Math.pow(pointA[i] - pointB[i], 2);
        }
        return Math.sqrt(sum);
    }

}

/// Tests



// Run tests if this file is run directly.
if (this.require && require.main === module) {
    var assert = require('assert');

    function testCreation() {
        const tree = new KDTree('f');
        assert(tree);
    }
    testCreation();
}
