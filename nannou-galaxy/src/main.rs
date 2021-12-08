/*
This simulates particles in a gravitational system. When the particles are
close enough, they will collide, and their masses will be combined to form a
new particle.

We implement a Particle, which has:
* position
* velocity
* mass
* radius
* color
* and a method to update its position based on its velocity and gravity

We implement a ParticleSystem, which has:
* a list of particles
* methods to add and remove particles, and to step through time, modifying the
  particles' positions, and adding/removing particles as appropriate.

Particles interact with each other via gravity, which is a force that pulls
them together subject to:

    F = G * (m1 * m2) / r^2

where F is the force, G is the gravitational constant, m1 and m2 are the masses
of the particles, and r is the distance between the particles.

We also update each particle's position in parallel, using the common rust
library rayon. This is a library that provides a thread pool, which is used to
parallelize the work of updating the positions of the particles. This means that
the particle positions are updated in parallel, and then we perform a final O(N)
sweep to check for collisions.
*/

use rayon::iter::IntoParallelRefIterator;
use rayon::iter::IntoParallelRefMutIterator;
use rayon::iter::ParallelIterator;
// use nannou::noise::*;
use nannou::prelude::*;

fn main() {
    nannou::app(model).update(update).run();
}

/// A struct that represents a particle.
///
/// It has a position, velocity, mass, radius, and color.
/// It also has a method to update its position based on its velocity and
/// gravity.
///

// Grav const:
const G: f32 = 6.67408e-11;

struct Particle {
    position: Vector2,
    velocity: Vector2,
    color: Rgb,
    radius: f32,
    mass: f32,
}

/// Implement PartialEq for Particle, so that we can use it in a HashSet:
/// https://doc.rust-lang.org/std/collections/struct.HashSet.html
///
/// Two particles are the same if they have the same position and mass.
impl PartialEq for Particle {
    fn eq(&self, other: &Particle) -> bool {
        self.position == other.position && self.mass == other.mass
    }
}

/// implement clone for Particle
impl Clone for Particle {
    fn clone(&self) -> Self {
        Particle {
            position: self.position,
            velocity: self.velocity,
            color: self.color,
            radius: self.radius,
            mass: self.mass,
        }
    }
}

/// Implementation of the Particle struct.
///
/// We implement the update method, which updates the position of the particle
/// based on its velocity and gravity.
impl Particle {
    /// Create a new particle.
    ///
    /// Arguments:
    ///
    /// * `position` - the position of the particle
    /// * `velocity` - the velocity of the particle
    fn new(x: f32, y: f32) -> Self {
        Particle {
            position: pt2(x, y),
            velocity: vec2(0.0, 0.0),
            color: rgb(1.0, 1.0, 1.0),
            radius: 8.0,
            // mass of sun in kg:
            mass: 1.98892e30,
        }
    }

    /// Update the particle's position.
    ///
    /// This method updates the position of the particle based on its velocity
    /// and gravity, subject to F = G * (m1 * m2) / r^2.
    ///
    /// Arguments:
    ///
    fn update_in_system(&mut self, particles: &Vec<Particle>) {
        // Update the particle's position based on its velocity and gravity.
        self.position += self.velocity;

        // Get the gravitational force on the particle.
        let mut force = vec2(0.0, 0.0);

        // For each particle in the system, calculate the gravitational force
        // on the particle.
        particles.iter().for_each(|p| {
            // Calculate the distance between the particle and the current
            // particle.
            let distance = self.position - p.position;

            // Calculate the magnitude of the distance.
            let distance_magnitude = distance.magnitude();

            // Calculate the gravitational force.
            let force_magnitude = (G * self.mass * p.mass) / distance_magnitude.powi(2);

            // Calculate the direction of the gravitational force.
            let force_direction = distance.normalize();

            // Calculate the gravitational force.
            force += force_direction * force_magnitude;
        });

        // Update the particle's velocity based on its gravity.
        self.velocity += force;
    }

    // Draw the particle.
    fn draw(&self, draw: &Draw) {
        println!("{:?}", self.position);
        draw.ellipse()
            .xy(self.position)
            .radius(self.radius)
            .color(self.color);
    }
}

/// A struct that represents a particle system.
///
/// It has a list of particles, and methods to add and remove particles, and to
/// step through time, modifying the particles' positions, and adding/removing
/// particles as appropriate.
///
/// We implement the update method, which updates the positions of the particles
/// in parallel, using the common rust library rayon. This is a library that
/// provides a thread pool, which is used to parallelize the work of updating
/// the positions of the particles. This means that the particle positions are
/// updated in parallel, and then we perform a final O(N) sweep to check for
/// collisions.
///
/// We also implement the draw method, which draws each particle.
struct ParticleSystem {
    particles: Vec<Particle>,
}

// Implement cloning for ParticleSystem, so that we can use it in a HashSet:
// https://doc.rust-lang.org/std/collections/struct.HashSet.html
// impl Clone for ParticleSystem {
//     fn clone(&self) -> Self {
//         ParticleSystem {
//             particles: self.particles.clone(),
//         }
//     }
// }

fn lerp(a: f32, b: f32, t: f32) -> f32 {
    a + (b - a) * t
}

/// Implementation of the ParticleSystem struct.
impl ParticleSystem {
    /// Create a new particle system.
    fn new() -> Self {
        ParticleSystem {
            particles: Vec::new(),
        }
    }

    /// Add a particle to the system.
    fn add_particle(&mut self, particle: Particle) {
        self.particles.push(particle);
    }

    /// Remove a particle from the system.
    fn remove_particle(&mut self, particle: Particle) {
        self.particles.retain(|p| p.position != particle.position);
    }

    /// Update the particle system.
    ///
    /// This method updates the positions of the particles in parallel, using the
    /// common rust library rayon. This means that the particle positions are
    /// updated in parallel, and then we perform a final O(N) sweep to check for
    /// collisions.
    fn update(&mut self) {
        // Update the particle positions in parallel.

        let parts = self.particles.clone();
        self.particles.iter_mut().for_each(|p| {
            // print location:
            p.update_in_system(&parts);
        });

        // We hold on to a list of particles that we want to remove:
        let mut to_remove = Vec::new();

        // We also hold on to a list of particles that we want to add:
        let mut to_add = Vec::new();

        // Check for collisions.
        for i in 0..self.particles.len() {
            for j in i + 1..self.particles.len() {
                let p1 = &self.particles[i];
                let p2 = &self.particles[j];
                let r = p1.position - p2.position;
                let r_mag = r.magnitude();
                if r_mag < p1.radius + p2.radius {
                    // Combine the masses of the particles.
                    let new_mass = p1.mass + p2.mass;
                    let new_radius = (p1.radius * p1.mass + p2.radius * p2.mass) / new_mass;

                    // Color is lerped in RGB space:
                    let new_color_r = lerp(p1.color.red, p2.color.red, p1.mass / new_mass);
                    let new_color_g = lerp(p1.color.green, p2.color.green, p1.mass / new_mass);
                    let new_color_b = lerp(p1.color.blue, p2.color.blue, p1.mass / new_mass);
                    let new_color = rgb(new_color_r, new_color_g, new_color_b);

                    // Create a new particle with the combined mass, radius, and
                    // color.
                    let new_particle = Particle {
                        position: (p1.position * p1.mass + p2.position * p2.mass) / new_mass,
                        velocity: (p1.velocity * p1.mass + p2.velocity * p2.mass) / new_mass,
                        color: new_color,
                        radius: new_radius,
                        mass: new_mass,
                    };

                    // Add the new particle to the list of particles to add.
                    to_add.push(new_particle);

                    // Add the particles to the list of particles to remove.
                    to_remove.push(p1);
                    to_remove.push(p2);

                    // Break out of the inner loop.
                    break;
                }
            }
        }

        // Remove the particles that we want to remove.
        // for p in to_remove {
        //     // Mutably retain the particles that we want to keep.
        //     self.particles
        //         .retain(|particle| particle.position != p.position);
        // }

        // Add the particles that we want to add.
        for p in to_add {
            self.add_particle(p);
        }
    }

    /// Draw the particle system.
    ///
    /// This method draws each particle in the system.
    ///
    /// Arguments:
    ///
    /// * `draw` - the draw context
    ///
    /// Returns:
    ///
    /// * `()` - this method does not return a value
    fn draw(&self, draw: &Draw) {
        for p in self.particles.iter() {
            p.draw(draw);
        }
    }
}

struct Model {
    _window: window::Id,
    particle_system: ParticleSystem,
}

fn model(app: &App) -> Model {
    let _window = app.new_window().view(view).build().unwrap();

    // A grid of particles.
    let mut particles = Vec::new();
    // Randomly scatter 20 particles:
    for _ in 0..5 {
        let x = random_range(-100.0, 100.0);
        let y = random_range(-100.0, 100.0);
        let particle = Particle::new(x, y);
        particles.push(particle);
    }

    Model {
        _window: _window,
        particle_system: ParticleSystem {
            particles: particles,
        },
    }
}

fn update(_app: &App, model: &mut Model, _update: Update) {
    // Update all the particles.
    model.particle_system.update();
}

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw();
    draw.background().color(BLACK);

    // model.particle_system.draw(&draw);
    model.particle_system.particles.iter().for_each(|p| {
        draw.ellipse()
            .xy(p.position)
            .radius(p.radius)
            .color(p.color);
    });

    draw.to_frame(app, &frame).unwrap();
}
