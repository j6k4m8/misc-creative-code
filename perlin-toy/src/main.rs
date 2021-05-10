use nannou::noise::*;
use nannou::prelude::*;

struct Model {
    // _window: window::Id,
    things: Vec<Thing>,
    noise: Perlin,
}

const N_THINGS: usize = 10000;

fn model(_app: &App) -> Model {
    // let _window = app.new_window().view(view).build().unwrap();
    let mut things = Vec::new();
    for _i in 0..N_THINGS {
        things.push(Thing::new(vec2(
            (random::<f32>() - 0.5) * 1024.0,
            (random::<f32>() - 0.5) * 1024.0,
        )));
    }
    let noise = Perlin::new();
    Model {
        // _window,
        things,
        noise,
    }
}

#[derive(Clone)]
struct Thing {
    positions: Vec<Vector2>,
    color: Rgb<u8>,
    alive: bool,
}

impl Thing {
    pub fn new(p: Vector2) -> Self {
        let mut positions = Vec::new();
        positions.push(p);
        Thing {
            positions,
            color: WHITE,
            alive: true,
        }
    }
}

fn update(app: &App, model: &mut Model, _update: Update) {
    let noise_scale = 0.01 + 0.01 * (app.elapsed_frames() as f64 / 128.).sin();

    for thing in model.things.iter_mut() {
        let last = thing.positions[0] + app.mouse.position() / 100.;
        let new = last
            + vec2(
                model.noise.get([
                    noise_scale * last.x as f64,
                    noise_scale * last.y as f64,
                    0.0 as f64,
                ]) as f32,
                model.noise.get([
                    noise_scale * last.x as f64,
                    noise_scale * last.y as f64,
                    1.0 as f64,
                ]) as f32,
            );

        if new.x > app.window_rect().right()
            || new.x < app.window_rect().left()
            || new.y > app.window_rect().top()
            || new.y < app.window_rect().bottom()
        {
            thing.alive = false;
        }

        let distance = last - new;
        thing.color = rgb(
            (distance.x.cos() * 255.0) as u8,
            1.0 as u8,
            (distance.y.sin() * 255.0) as u8,
        );

        thing.positions.insert(0, new);
        if thing.positions.len() > 8 {
            thing.positions = thing.positions[0..8].to_vec();
        }
    }

    model.things = model
        .things
        .iter()
        .filter(|&thing| thing.alive)
        .take(N_THINGS)
        .cloned()
        .collect();

    let count = 6;
    let radius = 50.0;

    for angle in 0..count {
        model.things.push(Thing::new(vec2(
            app.mouse.position().x
                + radius
                    * ((angle as f32 + app.elapsed_frames() as f32 / 128.)
                        * (1.0 as f32 / count as f32)
                        * TAU)
                        .cos(),
            app.mouse.position().y
                + radius
                    * ((angle as f32 + app.elapsed_frames() as f32 / 128.)
                        * (1.0 as f32 / count as f32)
                        * TAU)
                        .sin(),
        )));
    }

    model.things.push(Thing::new(vec2(
        (random::<f32>() - 0.5) * 1024.0,
        (random::<f32>() - 0.5) * 1024.0,
    )));
}

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw();

    if app.elapsed_frames() == 1 {
        draw.background().rgba(0.0, 0.0, 0.0, 0.05);
    } else {
        draw.rect()
            .color(srgba(0.0, 0.0, 0.0, 0.08))
            .w_h(1024.0, 1024.0);
    }

    for thing in model.things.iter() {
        draw.polyline()
            .weight(1.0)
            .points(thing.positions.iter().cloned())
            .color(thing.color);
        draw.ellipse()
            .xy(thing.positions[0])
            .radius(2.0)
            .color(WHITE);
    }
    draw.to_frame(app, &frame).unwrap();
}

fn main() {
    nannou::app(model).update(update).simple_window(view).run();
}
