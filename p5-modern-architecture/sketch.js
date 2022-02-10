const DEFAULT_WIDTH = 100;
const DEFAULT_STROKE_WEIGHT = 4;


WRIGHT_COLORS = [
    [224, 161, 51],
    [234, 223, 212],
    [181, 195, 177],
    [204, 216, 230],
    [191, 209, 179],
]
const BACKGROUND = [227, 217, 205,]

function chooseRandomColor() {
    // Get a random Wright color:
    let color = random(WRIGHT_COLORS);
    return color;
}


class Building {
    constructor(opts = {}) {
        this.startX = opts.startX;
        this.startY = opts.startY;
        this.height = opts.height || random() * 1000;

        this.width = opts.width || DEFAULT_WIDTH;
        this.patternCount = opts.patternCount || 3;
        this.legCount = opts.legCount || 2;

        this.strokeWeight = opts.strokeWeight || DEFAULT_STROKE_WEIGHT;
        this.patternWidth = this.width / (2 * (this.legCount + this.patternCount));

        // Create the short patterns:
        this.shortPatterns = [];
        for (let i = 0; i < this.patternCount; i++) {
            this.shortPatterns.push({
                // Random int between 1 and 3:
                heights: [],
                colors: []
            });
            for (let j = 0; j < 3; j++) {
                this.shortPatterns[i].heights.push(Math.floor(Math.random() * 3) + 1);
                this.shortPatterns[i].colors.push(chooseRandomColor());
            }
        }

        // Round height to the nearest multiple of the pattern width:
        this.height = Math.round(this.height / this.patternWidth) * this.patternWidth;

        this.age = 0;


        this.squareCount = this.patternCount * random(0.9, 2);
        this.legColors = [
            chooseRandomColor(),
            chooseRandomColor(),
            chooseRandomColor(),
        ]
        this.circleColor = chooseRandomColor();
    }

    draw() {
        this.age += 1;
        this.startY -= 0.5;

        this.growth = Math.min(this.age / 100, 1);

        // Draw the big square at the top:
        stroke(0);
        strokeWeight(this.strokeWeight);
        for (let i = 0; i < this.squareCount; i++) {
            fill(this.shortPatterns[i % this.shortPatterns.length].colors[0]);
            rect(
                this.startX + (i * this.patternWidth),
                this.startY + (i * this.patternWidth),
                this.width - (i * this.patternWidth * 2),
                this.width - (i * this.patternWidth * 2)
            );
        }

        // Draw the short patterns:
        for (let i = 0; i < this.patternCount; i++) {
            let totalHeight = 0;
            // Repeat the pattern until it's reached the height of the building:
            while (totalHeight < this.height * this.growth - (this.patternWidth)) {
                // Draw the pattern:
                for (let j = 0; j < this.shortPatterns[i].heights.length; j++) {
                    if (!(totalHeight + this.shortPatterns[i].heights[j] < this.height * this.growth)) {
                        break;
                    }
                    fill(this.shortPatterns[i].colors[j]);
                    rect(this.startX + i * this.patternWidth + (this.patternWidth * this.legCount), this.startY + totalHeight + this.width, this.patternWidth, this.patternWidth * this.shortPatterns[i].heights[j]);
                    // Also draw the mirrored version from the right side:
                    rect(this.startX + this.width - i * this.patternWidth - (this.patternWidth * (this.legCount + 1)), this.startY + totalHeight + this.width, this.patternWidth, this.patternWidth * this.shortPatterns[i].heights[j]);
                    totalHeight += this.patternWidth * this.shortPatterns[i].heights[j];

                }
            }
        }

        // Draw the legs:
        for (let i = 0; i < this.legCount; i++) {
            fill(this.legColors[i]);
            rect(
                this.startX + (i) * this.patternWidth,
                this.startY + this.width, this.patternWidth,
                this.height * this.growth
            );
            rect(
                this.startX + this.width - (i + 1) * this.patternWidth,
                this.startY + this.width, this.patternWidth,
                this.height * this.growth
            );
        }

        // Draw the circle at the bottom:
        stroke(0);
        strokeWeight(this.strokeWeight);
        fill(this.circleColor);
        for (let i = 0; i < this.patternCount * Math.min((this.age - 100) / 100, 1); i++) {
            // ellipse(this.startX + this.width / 2, this.startY + this.width + this.height, this.width - (i * this.patternWidth * 2), this.width - (i * this.patternWidth * 2));
            // Just draw the bottom half of the arc:
            arc(this.startX + this.width / 2, this.startY + this.width + this.height, this.width - (i * this.patternWidth * 2), this.width - (i * this.patternWidth * 2), 0, PI);
        }
        // Draw a line at the stop point:
        if (this.growth == 1) {
            line(this.startX, this.startY + this.height + this.width, this.startX + this.width, this.startY + this.height + this.width);
        }

    }
}

const SKYLINE = {
    buildings: undefined
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(40);

    SKYLINE.buildings = [];
    let bwidth = DEFAULT_WIDTH;
    // let bwidth = windowWidth / 10;
    for (let i = 0; i < 0; i++) {
        // Random with 10% margins:
        let startX = random(width * 0.04, width * 0.9);
        // Round to the nearest (width/10);
        startX = Math.round(startX / (bwidth / 2)) * (bwidth / 2);
        let startY = random(height * 0.01, height * 0.9);
        startY = Math.round(startY / (bwidth / 2)) * (bwidth / 2);


        // Is there another building within 50px?
        let isValid = true;
        // for (let j = 0; j < i; j++) {
        //     if (dist(startX, startY, SKYLINE.buildings[j].startX, SKYLINE.buildings[j].startY) < 10) {
        //         isValid = false;
        //         break;
        //     }
        // }

        if (isValid) {
            let legs = Math.floor(random(1, 3));
            let patterns = 5 - legs;

            SKYLINE.buildings.push(new Building({
                startX: startX,
                startY: startY,
                width: bwidth,
                height: random(200, 500),
                legCount: legs,
                patternCount: patterns,
            }));
        }
    }
}


function draw() {

    background(BACKGROUND)
    SKYLINE.buildings.forEach(building => building.draw());

    // Check if offscreen (negative number), and remove:
    SKYLINE.buildings = SKYLINE.buildings.filter(building => {
        return building.startY + building.height + (2 * building.width) > 0;
    });

    // With some small chance, add a new building:
    if (random() < 0.01) {
        let legs = Math.floor(random(1, 3));
        let patterns = 5 - legs;
        SKYLINE.buildings.push(new Building({
            startX: Math.round((random(width) - (DEFAULT_WIDTH / 2)) / (DEFAULT_WIDTH / 2)) * (DEFAULT_WIDTH / 2),
            startY: Math.round(((frameCount / 0.05 + random(height)) - (DEFAULT_WIDTH / 2)) / (DEFAULT_WIDTH / 2)) * (DEFAULT_WIDTH / 2) - (frameCount / 0.05),
            width: DEFAULT_WIDTH,
            height: random(200, 500),
            legCount: legs,
            patternCount: patterns,
        }));
    }

}

// Add a new building when click:
function mousePressed() {
    let legs = Math.floor(random(1, 3));
    let patterns = 5 - legs;
    SKYLINE.buildings.push(new Building({
        startX: Math.round((mouseX - (DEFAULT_WIDTH / 2)) / (DEFAULT_WIDTH / 2)) * (DEFAULT_WIDTH / 2),
        startY: Math.round(((frameCount / 0.05 + mouseY) - (DEFAULT_WIDTH / 2)) / (DEFAULT_WIDTH / 2)) * (DEFAULT_WIDTH / 2) - (frameCount / 0.05),
        width: DEFAULT_WIDTH,
        height: random(200, 500),
        legCount: legs,
        patternCount: patterns,
    }));
}