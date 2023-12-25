let tree = new kdTree([], function (a, b) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
}, ["x", "y"]);

let points = [];

function setup() {
    createCanvas(
        window.innerWidth,
        window.innerHeight
    );
    background(0);

    for (let i = 0; i < 70; i++) {
        let x = random(width);
        let y = random(height);
        points.push({ x, y });
        tree.insert(points[i]);
    }
}

function draw() {
    for (let i = 0; i < 80; i++) {
        let x = random(width);
        let y = random(height);
        let nearest = tree.nearest({ x, y }, 1)[0];
        stroke(
            map(x, 0, width, 0, 255),
            map(y, 0, height, 0, 255),
            map(nearest[0].x, 0, width, 0, 255),
            20
        );

        beginShape();
        vertex(x, y);
        vertex(nearest[0].x, nearest[0].y);
        endShape();


        // let qPointX = mouseX;
        // let qPointY = mouseY;
        // Rotating sin and cos around radius=200, center of screen:
        let qPointX = width / 2 + 200 * cos(frameCount / 2);
        let qPointY = height / 2 + 200 * sin(frameCount / 2);
        let mouseNearest = tree.nearest({ x: qPointX, y: qPointY }, 1)[0];
        stroke(255, 0, 0, 1);
        line(
            qPointX,
            qPointY,
            mouseNearest[0].x,
            mouseNearest[0].y
        )
    }
}

