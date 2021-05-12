use nannou::noise::*;
use nannou::prelude::*;

struct Model {
    cars: Vec<Car>,
    car_position_noise: Perlin,
}

const CAR_POSITION_NOISE_SIZE: f64 = 0.0005;
const REFLECTION_NOISE_SIZE: f64 = 0.4;
const CAR_POSITION_NOISE_RATIO: f64 = 10.0;
const CAR_WIDTH: f32 = 12.0;
const SPAWN_NEW_CAR_PROBABILITY: f32 = 0.994;
const HEADLIGHT_HEIGHT: f32 = 15.0;
const LANE_COUNT: f32 = 3.0;
const LANE_WIDTH: f32 = 1.5;
const CAR_VERTICAL_SPEED: f32 = 0.23;
const REFLECTION_SIZE: usize = 40;

fn model(_app: &App) -> Model {
    // let _window = app.new_window().view(view).build().unwrap();
    let mut cars = Vec::new();

    let car_position_noise = Perlin::new();

    Model {
        cars,
        car_position_noise,
    }
}

#[derive(Clone)]
struct Car {
    position: Vector2,
    color: Rgba<f32>,
    alive: bool,
    lane: i8,
    speed: f32,
    going_south: bool,
}

impl Car {
    pub fn new(p: Vector2) -> Self {
        Car {
            position: p,
            color: rgba(1.0, 1.0, (random::<f32>() * 0.3) + 0.7, 0.95),
            alive: true,
            speed: CAR_VERTICAL_SPEED,
            lane: ((random::<f32>() - 0.5) * 5.0) as i8,
            going_south: true,
        }
    }
}

fn update(app: &App, model: &mut Model, _update: Update) {
    // Every so often, make a new car:
    if random::<f32>() > SPAWN_NEW_CAR_PROBABILITY {
        model
            .cars
            .push(Car::new(vec2(-32., app.window_rect().top())));
    }

    // Move the cars:
    for car in model.cars.iter_mut() {
        car.position.x += model.car_position_noise.get([
            CAR_POSITION_NOISE_SIZE * car.position.x as f64,
            CAR_POSITION_NOISE_SIZE * CAR_POSITION_NOISE_RATIO * car.position.y as f64,
            0.0 as f64,
        ]) as f32
            * if car.going_south { -1.2 } else { 1.2 };
        car.position.y += if car.going_south {
            -1.0 * car.speed
        } else {
            car.speed
        };

        if car.position.y < app.window_rect().bottom() {
            car.color = rgba(1.0, 0.1, 0.1, 0.7);
            car.going_south = false;
            car.position.y = app.window_rect().bottom() + 1.0;
        }

        if car.position.y > app.window_rect().top() {
            car.alive = false;
        }
    }

    model.cars = model
        .cars
        .iter()
        .filter(|&car| car.alive)
        .cloned()
        .collect();
}

fn view(app: &App, model: &Model, frame: Frame) {
    let draw = app.draw();

    if app.elapsed_frames() == 1 {
        draw.background().rgba(0.0, 0.0, 0.0, 0.2);
    }
    draw.rect()
        .wh(app.window_rect().wh())
        .rgba(0.0, 0.0, 0.05, 0.2);

    for car in model.cars.iter() {
        let right_headlight_x = car.position.x
            + (car.lane as f32 * CAR_WIDTH * -LANE_WIDTH)
            + (if !car.going_south {
                LANE_COUNT * CAR_WIDTH * LANE_WIDTH
            } else {
                0.0
            })
            - 512.0;
        // Draw right headlight:
        draw.ellipse()
            .x_y(right_headlight_x, car.position.y)
            .w_h(4.0, 6.0)
            .color(car.color);

        // Draw reflection of right headlight.
        draw.polyline()
            .points((0..REFLECTION_SIZE).map(|i| {
                pt2(
                    right_headlight_x
                        + (5.0
                            * (model.car_position_noise.get([
                                REFLECTION_NOISE_SIZE * right_headlight_x as f64,
                                REFLECTION_NOISE_SIZE * (i as f32 + car.position.y) as f64,
                                0.0 as f64,
                            ]))) as f32,
                    (car.position.y - HEADLIGHT_HEIGHT) - i as f32,
                )
            }))
            // .stroke_weight(1.0)
            .rgba(
                car.color.red as f32,
                car.color.green as f32,
                car.color.blue as f32,
                0.01,
            );

        // Draw left headlight:
        let left_headlight_x = (right_headlight_x - CAR_WIDTH);
        draw.ellipse()
            .x_y(left_headlight_x, car.position.y)
            .w_h(4.0, 6.0)
            .color(car.color);

        // Draw reflection of right headlight.
        draw.polyline()
            .points((0..REFLECTION_SIZE).map(|i| {
                pt2(
                    left_headlight_x
                        + (5.0
                            * (model.car_position_noise.get([
                                REFLECTION_NOISE_SIZE * left_headlight_x as f64,
                                REFLECTION_NOISE_SIZE * (i as f32 + car.position.y) as f64,
                                0.0 as f64,
                            ]))) as f32,
                    (car.position.y - HEADLIGHT_HEIGHT) - i as f32,
                )
            }))
            // .stroke_weight(1.0)
            .rgba(
                car.color.red as f32,
                car.color.green as f32,
                car.color.blue as f32,
                0.01,
            );
    }

    draw.to_frame(app, &frame).unwrap();
}

fn main() {
    nannou::app(model).update(update).simple_window(view).run();
}
