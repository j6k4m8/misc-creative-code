function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    for (let j = 0; j < 250; j++) {
        UMBRELLA_POSITIONS.push([random(0, width * 200), random(height * 2 / 3, height)])
    }
}

const SAND = [233, 212, 177];
const OCEAN = [10, 195 - 100, 215 - 100];
const SURF = [10 - 50, 195 - 50, 215 - 50];

let CURVE_POINTS = [-30, -40, 10, 5, -15, 0];

let UMBRELLA_POSITIONS = [];

function polygon(x, y, radius, npoints, startRotation, stopRotation) {
    stopRotation = stopRotation || TWO_PI;
    let angle = TWO_PI / npoints;
    beginShape();
    for (let a = 0 + startRotation; a < stopRotation + startRotation; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}


function draw() {
    background([...SAND, 250]);

    // Draw the water line
    // noFill();

    // WET SAND
    fill([233 - 80, 212 - 80, 177 - 80, 50]);
    strokeWeight(0);
    beginShape();
    curveVertex(-300, 0);
    curveVertex(-300, 0);
    // Pick a bunch of random points
    let pointNumber = 0;
    for (let curX = 0; curX <= width * 100; curX += width / 4) {
        curveVertex(
            curX - 20,
            ((height / 2) + 10) + CURVE_POINTS[pointNumber % CURVE_POINTS.length] + (sin((frameCount - 40) / 70) * 50) + (cos(curX + (frameCount - 40) / 40) * 10) + (sin(curX + (frameCount - 40) / 150) * 50),
        );
        pointNumber++;
    }
    curveVertex(width * 200, 0);
    curveVertex(width * 200, 0);
    endShape();


    // Original wave! OG!
    fill(OCEAN);
    strokeWeight(25);
    stroke([...SURF, 50 + 70 * (1 + sin(frameCount / 70))]);
    beginShape();
    curveVertex(-300, 0);
    curveVertex(-300, 0);
    // Pick a bunch of random points
    pointNumber = 0;
    for (let curX = 0; curX <= width * 100; curX += width / 4) {
        curveVertex(
            curX,
            (height / 2) + CURVE_POINTS[pointNumber % CURVE_POINTS.length] + (sin(frameCount / 70) * 50) + (cos(curX + frameCount / 40) * 10) + (sin(curX + frameCount / 150) * 50),
        );
        pointNumber++;
    }
    curveVertex(width * 200, 0);
    curveVertex(width * 200, 0);
    endShape();

    // Secondary wave, it is also blue!
    fill([10, 195 - 120, 215 - 120, 70 * (1 + sin(frameCount / 72))]);
    strokeWeight(100);
    stroke([...SURF, 70 * (1 + sin(frameCount / 72))]);
    beginShape();
    curveVertex(-300, 0);
    curveVertex(-300, 0);
    // Pick a bunch of random points
    pointNumber = 0;
    for (let curX = 0; curX <= width * 100; curX += width / 4) {
        curveVertex(
            curX,
            ((height / 2) - 60) + CURVE_POINTS[pointNumber % CURVE_POINTS.length] + (sin(frameCount / 72) * 52) + (cos(curX + frameCount / 42) * 11) + (sin(curX + frameCount / 148) * 44),
        );
        pointNumber++;
    }
    curveVertex(width * 200, 0);
    curveVertex(width * 200, 0);
    endShape();

    translate(-frameCount * 0.6, 0);
    // Draw the sand

    // Shadow
    for (let j = 0; j < 250; j++) {
        fill(100, 100, 100, 100);
        noStroke();
        polygon(
            UMBRELLA_POSITIONS[j][0] - 10,
            UMBRELLA_POSITIONS[j][1] + 10,
            35, 6,
            (j) / 500
        );
    }
    for (let j = 0; j < 250; j++) {
        // if (j % 1 == 0) {
        // TOWEL
        push();
        translate(
            UMBRELLA_POSITIONS[j][0] - 30,
            UMBRELLA_POSITIONS[j][1] + 20
        );
        rotate(
            j,
            createVector(
                UMBRELLA_POSITIONS[j][0] - 40,
                UMBRELLA_POSITIONS[j][1] + 20
            )
        );
        noStroke();
        strokeWeight(0);
        fill(100, 100, 255);
        // Towel base
        rect(
            30,
            10,
            30, 60
        );
        translate(
            10,
            0
        );
        // STRIPE!
        fill(200, 200, 255);
        rect(
            30,
            10,
            10, 60
        );
        pop();
    }
    for (let j = 0; j < 250; j++) {

        // RED BRELLY
        fill(200 + (j), 0, 0);
        noStroke();
        polygon(
            ...UMBRELLA_POSITIONS[j],
            35, 6,
            (j) / 500
        );

        // Shading 1
        fill(0, 0, 0, 20);
        polygon(
            ...UMBRELLA_POSITIONS[j],
            35, 6,
            (j) / 500,
            .11 + (TWO_PI / 2),
        );
        // Shading 2
        fill(0, 0, 0, 50);
        polygon(
            ...UMBRELLA_POSITIONS[j],
            35, 6,
            ((j) / 500) + TWO_PI / 6,
            .11 + (TWO_PI / 2),
        );

        fill(0);
        ellipse(
            ...UMBRELLA_POSITIONS[j],
            3, 3
        )

    }

    translate(-frameCount, 0);
}
