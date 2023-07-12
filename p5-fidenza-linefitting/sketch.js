/*

Mainly, the thing that I care about here is the line-fitting: Two lines should
never cross or overlap. You could perhaps generate a bunch of random lines and
see if they overlap. But that takes O(n^2) time, where n is the number of the
points in the lines, and that sucks. Instead, I'm going to create a rectangular
grid of spaces at low resolution (say, 10x10), and then I'll pick contiguous
stretches of boxes. I'll either subdivide those boxes, or I'll "claim" them for
a line. Once a box has been claimed, it cannot be claimed by any other line.

Finally, I'll draw the grid — but with one important caveat: I will distort all
the points according to global Perlin noise. This will add some ZEST

*/

// Grid size:
const GRID_SIZE = 50;

// To draw during creation, or not:
const DRAW_DEBUG = true;

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

class Grid {
    // Extremely TRON voice: *the grid.*
    constructor(opts) {
        /**
         * @param {object} opts
         * @param {number} opts.x
         * @param {number} opts.y
         * @param {number} opts.gridx
         * @param {number} opts.gridy
         *
         */
        this.width = opts.width;
        this.height = opts.height;
        this.x = opts.x;
        this.y = opts.y;
        this.gridx = opts.gridx;
        this.gridy = opts.gridy;
        this.cells = [];
        for (let i = 0; i < this.gridx; i++) {
            this.cells[i] = [];
            for (let j = 0; j < this.gridy; j++) {
                this.cells[i][j] = undefined;
            }
        }

        this.lines = [];
    }

    drawDebug() {
        /**
         * Draw the grid. Pale amber for the lines, and dark amber for the
         * filled cells.
         */
        stroke(255, 20, 0, 200);
        strokeWeight(1);
        // Draw the lines of the grid:
        for (let i = 0; i < this.gridx; i++) {
            for (let j = 0; j < this.gridy; j++) {
                let x = this.x + i * this.width / this.gridx;
                let y = this.y + j * this.height / this.gridy;
                line(x, y, x + this.width / this.gridx, y + this.height / this.gridy);
            }
        }

        for (let i = 0; i < this.gridx; i++) {
            for (let j = 0; j < this.gridy; j++) {
                if (this.cells[i][j] !== undefined) {
                    fill(130, 20, 0, 200);
                    rect(this.x + i * this.width / this.gridx, this.y + j * this.height / this.gridy, this.width / this.gridx, this.height / this.gridy);
                }
            }
        }
    }




}

let grid;

function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    background(0);
    grid = new Grid({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        x: 0,
        y: 0,
        gridx: GRID_SIZE,
        gridy: GRID_SIZE
    });
    if (DRAW_DEBUG) {
        grid.drawDebug();
    }
}

function draw() {
    background(0);
    grid.drawDebug();
}