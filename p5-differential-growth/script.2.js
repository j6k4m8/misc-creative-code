
class DifferentialLoop {
    constructor(points, color = "#00babed9") {
        this.points = points;
        this.brownianMagnitude = 0.5;
        this.springForceMagnitude = 0.5;
        this.repelForceMagnitude = 0.4;
        this.color = color;
        this.debug = false;
    }

    insertPoint(ind) {
        let p1 = this.points[ind];
        let p2 = this.points[(ind + 1) % this.points.length];
        let newX = (p1.x + p2.x) / 2;
        let newY = (p1.y + p2.y) / 2;
        let newPoint = createVector(newX, newY);
        // this.points.splice(ind + 1, 0, newPoint);
        this.points = this.points.slice(0, ind + 1).concat([newPoint]).concat(this.points.slice(ind + 1));
        if (this.debug) {
            fill(0, 255, 0);
            ellipse(newX, newY, 10, 10);
            noFill();
        }
    }

    removePoint(ind) {
        // if (this.debug) {
        //     fill(255, 0, 0);
        //     ellipse(this.points[ind].x, this.points[ind].y, 10, 10);
        //     noFill();
        // }
        this.points.splice(ind, 1);
    }

    frame() {
        let toRemove = [];
        for (let i = 0; i < this.points.length; i++) {
            // Brownian-motion:
            this.points[i].x += random(-this.brownianMagnitude, this.brownianMagnitude);
            this.points[i].y += random(-this.brownianMagnitude, this.brownianMagnitude);

            // Spring force with neighbors:
            let leftNeighbor = this.points[(i - 1 + this.points.length) % this.points.length];
            let rightNeighbor = this.points[(i + 1) % this.points.length];

            let leftDist = p5.Vector.dist(this.points[i], leftNeighbor);
            let rightDist = p5.Vector.dist(this.points[i], rightNeighbor);
            let springForce = p5.Vector.sub(leftNeighbor, rightNeighbor);
            springForce.normalize();
            springForce.mult(this.springForceMagnitude);
            if (leftDist > rightDist) {
                this.points[i].add(springForce);
            } else {
                this.points[i].sub(springForce);
            }

            // All points repel each other. Because this is symmetrical, we can
            // just do one half of the triangle:
            for (let j = 0; j < i; j++) {
                let dist = p5.Vector.dist(this.points[i], this.points[j]);
                if (dist > 100) {
                    continue;
                }
                let repelForce = p5.Vector.sub(this.points[i], this.points[j]);
                repelForce.normalize();
                repelForce.mult(this.repelForceMagnitude / dist);
                if (this.debug) {
                    stroke(255, 0, 0);
                    line(this.points[i].x, this.points[i].y, this.points[i].x + repelForce.x, this.points[i].y + repelForce.y);
                    stroke(255);
                }
                this.points[i].add(repelForce);
            }

            // Remove points that are too close:
            let distToRight = p5.Vector.dist(this.points[i], rightNeighbor);
            let distToLeft = p5.Vector.dist(this.points[i], leftNeighbor);
            if (distToRight < 6) {
                toRemove.push((i + 1) % this.points.length);
            }
            if (distToLeft < 6) {
                toRemove.push((i - 1 + this.points.length) % this.points.length);
            }

            // Insert points that are too far:
            let distBetween = p5.Vector.dist(leftNeighbor, rightNeighbor);
            if (distBetween > 40) {
                this.insertPoint(i);
            }
        }

        // Remove points that are too close. Do it backwards so that the indices don't change:
        for (let i = toRemove.length - 1; i >= 0; i--) {
            this.removePoint(toRemove[i]);
        }
    }

    draw() {
        // Draw a smooth curve through all points:
        strokeWeight(4);
        stroke(255, 100);
        // fill(100, 255, 255, 20)
        fill(this.color);
        beginShape();
        for (let i = 0; i < this.points.length; i++) {
            curveVertex(this.points[i].x, this.points[i].y);
        }
        curveVertex(this.points[0].x, this.points[0].y);
        curveVertex(this.points[1].x, this.points[1].y);
        curveVertex(this.points[2].x, this.points[2].y);
        endShape();
    }

}

let loop1;
let loop2;
let loop3;


function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    stroke(255);
    strokeWeight(1);
    noFill();

    let points = [];
    for (let i = 0; i < 10; i++) {
        // Circle:
        let angle = map(i, 0, 10, 0, TWO_PI);
        let r = 100;
        let x = r * cos(angle);
        let y = r * sin(angle);
        let point = createVector(x, y);
        points.push(point);

    }

    loop1 = new DifferentialLoop(points);

    points = [];
    for (let i = 0; i < 10; i++) {
        // Circle:
        let angle = map(i, 0, 10, 0, TWO_PI);
        let r = 20;
        let x = r * cos(angle);
        let y = r * sin(angle);
        let point = createVector(x, y);
        points.push(point);

    }

    loop2 = new DifferentialLoop(points, "#babed989");
}

function draw() {
    background(0, 30);
    translate(width / 2, height / 2);
    loop1.frame();
    loop1.draw();
    loop2.frame();
    loop2.draw();


}