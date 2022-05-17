use nannou::{
    color::{Alpha, IntoColor},
    prelude::*,
    rand::{self, Rng},
    state::time,
};

fn main() {
    nannou::app(model).update(update).run();
}

// A struct that represents a particle.
struct Particle {
    position: Vec2,
    color: Rgb,
}

// Implementation of the Particle struct.
impl Particle {
    // Constructor.
    fn new(x: f32, y: f32) -> Self {
        Particle {
            position: pt2(x, y),
            color: rgb(1.0, 1.0, 1.0),
        }
    }

    // Update the particle's position.
    fn update_position(&mut self, delta: Vec2) {
        self.position = self.position + delta;
    }

    // Draw the particle.
    fn draw(&self, draw: &Draw, color: Alpha<Hsl, f32>, radius: f32) {
        draw.ellipse().xy(self.position).radius(radius).color(color);
    }
}

struct ChainLoop {
    particles: Vec<Particle>,
}

impl ChainLoop {
    fn new(count: usize, radius: usize) -> Self {
        let mut particles = Vec::with_capacity(count);
        // Rotate around the unit circle in increments of (2PI / count).
        let increment = TAU / count as f32;
        for i in 0..count {
            let random_noise = rand::random::<f32>() * 0.001;
            let x = (i as f32 * increment).cos() + random_noise;
            let y = (i as f32 * increment).sin() + random_noise;
            // particles.push(Particle::new(x, y));
            particles.push(Particle::new(x * radius as f32, y * radius as f32));
        }
        ChainLoop { particles }
    }

    fn update(&mut self) {
        // Give each particle access to the left and right particles.
        // Because this is a chain loop, the right partner of the last
        // particle is the first particle, and the left partner of the
        // first particle is the last particle.

        // With some small probability, add a new particle at a random point
        // in the chain, and its position is the average of its neighbors.
        let rand = rand::random_f32();
        // if rand < 0.5 {
        for i in 0..(((self.particles.len() as f32).pow(1.01) / 300.) as usize) {
            let index = rand::random_range(0, self.particles.len());
            let left_partner = if index <= 1 {
                self.particles.len() - 1
            } else {
                index - 2
            };
            let right_partner = if index >= self.particles.len() - 2 {
                0
            } else {
                index + 2
            };
            let position = Vec2::new(
                (self.particles[left_partner].position.x
                    + self.particles[right_partner].position.x)
                    / 2.0,
                (self.particles[left_partner].position.y
                    + self.particles[right_partner].position.y)
                    / 2.0,
            );
            self.particles
                .insert(index, Particle::new(position.x, position.y));
            // }
        }

        // Repulsion
        // Each particle is repulsed from all other particles.
        // Compute pairwise distances:
        let mut distances = vec![];
        for i in 0..self.particles.len() {
            for j in 0..self.particles.len() {
                if i != j {
                    let distance = self.particles[i]
                        .position
                        .distance(self.particles[j].position);
                    distances.push((i, j, distance));
                }
            }
        }
        // Perform repulsion:
        for (i, j, distance) in distances {
            // let rand = rand::random_f32();
            // if (rand < 0.1) {
            //     break;
            // }
            let repulsion = -0.05 / distance.pow(2.0);
            if (repulsion > -0.0000005) {
                break;
            }
            let delta = self.particles[i].position - self.particles[j].position;
            let delta = delta.normalize() * repulsion * 8.0;
            // Cap the total size of the delta vector.
            let max_vel = 0.1;
            let delta = Vec2::new(
                delta.x.min(max_vel).max(-max_vel),
                delta.y.min(max_vel).max(-max_vel),
            );
            // self.particles[i].update_position(-delta);
            self.particles[j].update_position(delta);
        }

        // Perform attraction:
        // Each particle is attracted to its left and right partners.
        for i in 0..self.particles.len() {
            let left_partner = if i == 0 {
                self.particles.len() - 1
            } else {
                i - 1
            };
            let right_partner = if i == self.particles.len() - 1 {
                0
            } else {
                i + 1
            };
            let delta = self.particles[i].position - self.particles[left_partner].position;
            let delta = delta.normalize() * 0.1;
            self.particles[i].update_position(-delta);
            let delta = self.particles[i].position - self.particles[right_partner].position;
            let delta = delta.normalize() * 0.1;
            self.particles[i].update_position(-delta);
        }
    }

    fn draw(&self, draw: &Draw) {
        let hue = (10 as f32 + 1293454345 as f32 / 1_000_000_000.0) % 1.0;
        let color = hsla(4.0, 0.5, 0.5, 1.0);
        for particle in &self.particles {
            // Radius is a sine wave of current time:
            let radius = (10 as f32 + 10 as f32 / 1_000_000_000.0) % 1.0 * 0.5;
            particle.draw(draw, color, radius);
        }
        // Draw one continuous curve from the first particle to the last:
        // let pts = self.particles.iter().map(|p| p.position);
        // Add first point to the end of the list:
        let pts = self.particles.iter().map(|p| p.position);
        let pts = pts.chain(std::iter::once(self.particles[0].position));

        draw.polyline().color(WHITE).points(pts);
        // Draw curve:
        // draw.polyline().color(rgb(0.0, 0.0, 0.0));
    }
}

struct Model {
    _window: window::Id,
    chain: ChainLoop,
}

fn model(app: &App) -> Model {
    let _window = app.new_window().view(view).build().unwrap();

    Model {
        _window,
        chain: ChainLoop::new(300, 100),
    }
}
fn update(_app: &App, _model: &mut Model, _update: Update) {
    _model.chain.update();
}

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw();

    // Clear the background to black with a 20% opacity.
    // draw.background().rgba(0.0, 0.0, 0.0, 0.0002);
    draw.rect()
        .color(srgba(0.0, 0.0, 0.0, 0.08))
        .w_h(1024.0, 1024.0);

    // Draw the particles.
    model.chain.draw(&draw);

    // Write to the window frame.
    draw.to_frame(app, &frame).unwrap();
}
