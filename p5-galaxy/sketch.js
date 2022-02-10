/*

A P5.js sketch that draws a bunch of particles in a gravitational field.

Each particle is a circle with a mass, color position, and velocity.

We use the p5.Vector class to represent the position and velocity of each
particle, and we compute gravity acting on a particle as:

    F = G * m1 * m2 / r^2

where F is the force, G is the gravitational constant, m1 is the mass of the
particle, m2 is the mass of the other particle, and r is the distance between
the two particles.

*/

// Grav constant:
const G = 0.1;
const SUN_MASS = 1000;

class Particle {

    constructor(opts) {
        this.x = opts.x || 0;
        this.y = opts.y || 0;
        this.vx = opts.vx || 0;
        this.vy = opts.vy || 0;
        this.mass = opts.mass || 1;
        this.color = opts.color || '#ffffff';
    }

    // Compute the force acting on this particle from the other particles.
    computeForce(system) {
        let F = createVector(0, 0);
        for (let other of system.particles) {
            if (other === this) continue;
            let d = dist(this.x, this.y, other.x, other.y);
            let force = G * this.mass * other.mass / (d * d);
            let dx = other.x - this.x;
            let dy = other.y - this.y;
            F.add(force * dx / d, force * dy / d);
        }
        return F;
    }

    // Update the position and velocity of this particle.
    update(dt, system) {
        if (this.mass >= SUN_MASS) {
            return;
        }
        let F = this.computeForce(system);
        this.vx += F.x * dt;
        this.vy += F.y * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // If it leaves the canvas, divide its velocity by 2.
        if (this.isTouchingEdge()) {
            this.vx *= -1 / 2;
            this.vy *= -1 / 2;
        }
    }

    // Draw this particle.
    draw() {
        noStroke();
        fill(this.color);
        // Radius is proportional to the cubed-root of the mass.
        let r = Math.pow(this.mass, 1 / 3);
        ellipse(this.x, this.y, r, r);
    }

    // Check if this particle is touching the edge of the canvas.
    isTouchingEdge() {
        return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
    }
}


class ParticleSystem {

    constructor(opts) {
        this.particles = opts.particles || {};
    }

    // Add a new particle to the system.
    addParticle(opts) {
        this.particles.push(new Particle(opts));
    }

    // Update the position and velocity of all the particles.
    update(dt) {
        // Check all N^2 particles for collisions:
        let removables = [];
        for (let i = 0; i < this.particles.length; i++) {
            let p1 = this.particles[i];
            for (let j = i + 1; j < this.particles.length; j++) {
                let p2 = this.particles[j];
                let d = dist(p1.x, p1.y, p2.x, p2.y);
                if (d < 10 * (p1.radius + p2.radius)) {
                    // Collision!
                    // Remove p2, and avg p1 to p2's mass and position.
                    let p1Mass = p1.mass;
                    let p2Mass = p2.mass;
                    let newMass = p1Mass + p2Mass;
                    // New position is average of old positions.
                    let newX = (p1.x * p1Mass + p2.x * p2Mass) / newMass;
                    let newY = (p1.y * p1Mass + p2.y * p2Mass) / newMass;
                    // New velocity is average of old velocities.
                    let newVx = (p1.vx * p1Mass + p2.vx * p2Mass) / newMass;
                    let newVy = (p1.vy * p1Mass + p2.vy * p2Mass) / newMass;
                    // bound velocity to be no more than 100
                    // New color is average of old colors.
                    // let newColor = lerpColor(p1.color, p2.color, p1Mass / newMass);

                    // Add p2 to the list of particles to remove.
                    removables.push(p2);
                    // Set values of p1 to the new values.
                    p1.mass = newMass;
                    p1.x = newX;
                    p1.y = newY;
                    p1.vx = newVx;
                    p1.vy = newVy;
                    // p1.color = newColor;
                }
            }
        }
        // Remove all the particles that collided.
        for (let p of removables) {
            this.particles.splice(this.particles.indexOf(p), 1);
        }


        for (let particle of this.particles) {
            particle.update(dt, this);
            let speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            if (speed > 20) {
                particle.vx *= 0.5;
                particle.vy *= 0.5;
            }
        }
    }

    // Draw all the particles.
    draw() {
        for (let particle of this.particles) {
            particle.draw();
        }
    }
}


let system;
function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    let opts = {
        x: width / 2,
        y: height / 2,
        vx: 0,
        vy: 0,
        mass: 100,
        color: [200, 200, 200]
    };

    let particles = Array(800).fill().map(() => {
        // generate a new location:
        opts = {};
        opts.x = (random(300) - 150) + width / 2;
        opts.y = (random(300) - 150) + height / 2;

        // given the position, compute a velocity such that these
        // particles are orbiting a point at the center of the canvas.
        let dx = opts.x - width / 2;
        let dy = opts.y - height / 2;
        let d = Math.sqrt(dx * dx + dy * dy);

        // velocity is at a right angle to the dx/dy vector.
        opts.vx = dy * 5 / d;
        opts.vy = -dx * 5 / d;
        // generate a random mass:
        opts.mass = random(5, 10);

        // generate a random color:
        opts.color = color(random(50), random(30, 90), random(90, 250));

        return new Particle(opts)
    });

    // Add a thicc mass particle to the center of the canvas.
    particles.push(new Particle({
        x: width / 2,
        y: height / 2,
        vx: 0,
        vy: 0,
        mass: SUN_MASS,
        color: [200, 200, 200]
    }));
    system = new ParticleSystem({
        particles
    });
}

function draw() {
    // background(0);
    system.update(0.1);
    system.draw();
}