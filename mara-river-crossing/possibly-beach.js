let boids = [];

let river;
// let herd;

function setup() {
    createCanvas(600, 600);
    // createCanvas(window.innerWidth, window.innerHeight);
    background(250, 240, 240);

    // Create the river:
    river = new River();
    // herd = new Herd({});
    for (let i = 0; i < 50; i++) {
        boids[i] = new Boid(random(width) / 3, random(height));
    }
}

function draw() {
    background(250, 240, 240);
    river.draw();
    for (let i = 0; i < boids.length; i++) {
        boids[i].run(boids);
    }
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// https://p5js.org/examples/hello-p5-flocking.html
// Boid class
// Methods for Separation, Cohesion, Alignment added
class Boid {
    constructor(x, y) {
        this.acceleration = createVector(0, 0);
        this.velocity = p5.Vector.random2D();
        this.position = createVector(x, y);
        this.r = 3.0;
        this.maxspeed = 3;    // Maximum speed
        this.maxforce = 0.05; // Maximum steering force
    }

    run(boids) {
        this.flock(boids);
        this.update();
        this.borders();
        this.render();
    }

    // Forces go into acceleration
    applyForce(force) {
        this.acceleration.add(force);
    }

    // We accumulate a new acceleration each time based on three rules
    flock(boids) {
        let sep = this.separate(boids); // Separation
        let ali = this.align(boids);    // Alignment
        let coh = this.cohesion(boids); // Cohesion
        // Arbitrarily weight these forces
        sep.mult(2.5);
        ali.mult(1.0);
        coh.mult(1.0);
        // Add the force vectors to acceleration
        this.applyForce(sep);
        this.applyForce(ali);
        this.applyForce(coh);
    }

    // Method to update location
    update() {
        // Update velocity
        this.velocity.add(this.acceleration);
        // Limit speed
        this.velocity.limit(this.maxspeed);
        this.position.add(this.velocity);
        // Reset acceleration to 0 each cycle
        this.acceleration.mult(0);
    }

    // A method that calculates and applies a steering force towards a target
    // STEER = DESIRED MINUS VELOCITY
    seek(target) {
        let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
        // Normalize desired and scale to maximum speed
        desired.normalize();
        desired.mult(this.maxspeed);
        // Steering = Desired minus Velocity
        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce); // Limit to maximum steering force
        return steer;
    }

    // Draw boid as a circle
    render() {
        fill(127, 127);
        stroke(100);
        strokeWeight(2);
        rect(this.position.x, this.position.y, 10, 10)
        // ellipse(this.position.x, this.position.y, 5, 5);
    }

    // Wraparound
    borders() {
        this.position.x = max(this.position.x, 1);
        this.position.x = min(this.position.x, width) - 1;
        this.position.y = max(this.position.y, 1);
        this.position.y = min(this.position.y, height - 1);
        // if (this.position.x < -this.r) this.position.x = width + this.r;
        // if (this.position.y < -this.r) this.position.y = height + this.r;
        // if (this.position.x > width + this.r) this.position.x = -this.r;
        // if (this.position.y > height + this.r) this.position.y = -this.r;
    }

    // Separation
    // Method checks for nearby boids and steers away
    separate(boids) {
        let desiredseparation = 45.0;
        let steer = createVector(0, 0);
        let count = 0;
        // For every boid in the system, check if it's too close
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.position, boids[i].position);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredseparation)) {
                // Calculate vector pointing away from neighbor
                let diff = p5.Vector.sub(this.position, boids[i].position);
                diff.normalize();
                diff.div(d); // Weight by distance
                steer.add(diff);
                count++; // Keep track of how many
            }
        }
        // Average -- divide by how many
        if (count > 0) {
            steer.div(count);
        }

        // As long as the vector is greater than 0
        if (steer.mag() > 0) {
            // Implement Reynolds: Steering = Desired - Velocity
            steer.normalize();
            steer.mult(this.maxspeed);
            steer.sub(this.velocity);
            steer.limit(this.maxforce);
        }
        return steer;
    }

    // Alignment
    // For every nearby boid in the system, calculate the average velocity
    align(boids) {
        let neighbordist = 50;
        let sum = createVector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxspeed);
            let steer = p5.Vector.sub(sum, this.velocity);
            steer.limit(this.maxforce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    // Cohesion
    // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
    cohesion(boids) {
        let neighbordist = 30;
        let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = p5.Vector.dist(this.position, boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].position); // Add location
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);
            return this.seek(sum); // Steer towards the location
        } else {
            return createVector(0, 0);
        }
    }
}


class River {
    constructor() {
        this.resolution = 10;
        this.points = [];
        for (let i = 0; i < this.resolution + 1; i++) {
            this.points.push({
                x: width / 2 + ((random() * width / 4) - width / 8),
                y: (height / this.resolution) * i
            });
        }
    }

    draw() {
        strokeWeight(width / 6);
        stroke(20, 100, 250);
        noFill();
        for (let i = 1; i < this.points.length; i++) {
            line(
                this.points[i - 1].x,
                this.points[i - 1].y,
                this.points[i - 0].x,
                this.points[i - 0].y,
            )
        }
    }
}

class Animal {
    constructor(opts) {
        this.pos = createVector(opts.x, opts.y);
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.herd = opts.herd;
        this.maxSpeed = 0.5;
        this.fill = opts.fill;
        this.stroke = opts.stroke;
        this.radius = opts.radius || 10;

        this.boids = {
            clusterViewDistance: 20,
        }
    }

    draw() {
        strokeWeight(5);
        stroke(...this.stroke);
        fill(...this.fill);
        ellipse(this.pos.x, this.pos.y, this.radius, this.radius);

        // strokeWeight(1);
        // line(this.x, this.y, this.lookX, this.lookY);
    }

    frame() {
        this.pos.add(this.vel);

        // // Brownian:
        this.vel.add(createVector(random() - 0.5, random() - 0.5).mult(0.5));

        // Cluster:
        // this.vel.add(this.herd.members.reduce((acc, other) => {
        //     return other.pos.sub(this.pos) * (other.pos.dist(this.pos) < this.boids.clusterViewDistance)
        // }));

        this.vel.limit(this.maxSpeed);

    }
}

class Herd {
    constructor() {
        this._fill = [255, 255, 255];
        this._stroke = [0, 0, 0];

        this.members = [];
        let i = 0;
        while (i < 20) {
            this.members.push(new Animal({
                x: random(width / 2),
                y: random(height),
                stroke: this._stroke,
                fill: this._fill,
                herd: this
            }));
            i++;
        }
    }

    draw() {
        for (let i = 0; i < this.members.length; i++) {
            this.members[i].frame();
            this.members[i].draw();
        }
    }
}


