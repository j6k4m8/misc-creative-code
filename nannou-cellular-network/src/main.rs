/*
This simulates a particle system with a Perlin noise field in the background.
*/

use nannou::noise::*;
use nannou::prelude::*;

fn main() {
    nannou::app(model).update(update).run();
}

// A struct that represents a particle.
struct Particle {
    position: Vector2,
    velocity: Vector2,
    acceleration: Vector2,
    color: Rgb,
}

// Implementation of the Particle struct.
impl Particle {
    // Constructor.
    fn new(x: f32, y: f32) -> Self {
        Particle {
            position: pt2(x, y),
            velocity: vec2(0.0, 0.0),
            acceleration: vec2(0.0, 0.0),
            color: rgb(1.0, 1.0, 1.0),
        }
    }

    // Update the particle's position.
    fn update(&mut self) {
        self.velocity += self.acceleration;
        self.position += self.velocity;
    }

    // Draw the particle.
    fn draw(&self, draw: &Draw) {
        draw.ellipse()
            .xy(self.position)
            .w_h(3.0, 3.0)
            .color(self.color);
    }

    // Apply a force to the particle, considering the mass of the particle.
    fn apply_force(&mut self, force: Vector2) {
        self.acceleration += force / 100.0;
        // Cap the acceleration.
        self.acceleration.x = self.acceleration.x.min(0.1).max(-0.1);
        self.acceleration.y = self.acceleration.y.min(0.1).max(-0.1);

        // self.velocity += force;
    }
}

struct Model {
    _window: window::Id,
    particles: Vec<Particle>,
    perlin: nannou::noise::Perlin,
}

fn model(app: &App) -> Model {
    let _window = app.new_window().view(view).build().unwrap();

    // A grid of particles.
    let mut particles = Vec::new();
    for x in -20..20 {
        for y in -20..20 {
            particles.push(Particle::new(x as f32 * 10.0, y as f32 * 10.0));
        }
    }

    Model {
        _window,
        particles,
        perlin: nannou::noise::Perlin::new(),
    }
}
fn update(_app: &App, _model: &mut Model, _update: Update) {
    // Update all the particles.
    for particle in &mut _model.particles {
        particle.update();

        // Apply a force to the particle based on the Perlin noise field.

        particle.apply_force(vec2(
            (_model.perlin.get([
                (particle.position.x / 100.0) as f64,
                (particle.position.y / 100.0) as f64,
                0.0 as f64,
            ]) * 10.0) as f32,
            (_model.perlin.get([
                // mouse X position:
                (_app.mouse.x / 100.0) as f64,
                // mouse Y position:
                (_app.mouse.y / 100.0) as f64,
                // (particle.position.y / 100.0) as f64,
                // (particle.position.x / 100.0) as f64,
                0.0 as f64,
            ]) * 10.0) as f32,
        ));
    }
}

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw();

    // Clear the background to black with a 20% opacity.
    // draw.background().rgba(0.0, 0.0, 0.0, 0.0002);
    draw.rect()
        .color(srgba(0.0, 0.0, 0.0, 0.08))
        .w_h(1024.0, 1024.0);

    // Draw all the particles.
    for particle in &model.particles {
        particle.draw(&draw);
    }

    // Write to the window frame.
    draw.to_frame(app, &frame).unwrap();
}
