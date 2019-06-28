FRENDCOUNT = 2;

MODE1 = true;
MODE2 = false;
MODE = MODE2;

COLORS = {
  background: {
    true: [120, 30, 80],
    false: [30, 120, 80],
  }
};

frends = [];

class Frend {
  constructor(x, y, rad=5, col=[255, 255, 255]) {
    this.x = x;
    this.y = y;
    this.velX = 0;
    this.velY = 0;
    this.rad = rad;
    this.col = col;
  }
  
  frame() {
    this.x += this.velX;
    this.y += this.velY;
    this.velX = max(min(
      this.velX + (random() - 0.5)/2, 
    0.5), -0.5);
    this.velY = max(min(
      this.velY + (random() - 0.5)/2, 
    0.5), -0.5);
   
    if (dist(mouseX, mouseY, this.x, this.y) < 30) {
      this.frozen = true;
      if (MODE == MODE1) {
        this.velX = 0;
        this.velY = 0;
      } else if (MODE == MODE2) {
          //this.velX += 2;
          this.velY += 2;
        }
      this.col[2] += 100;
    } else {
      this.frozen = false;
    }
    
    for (let f = 0; f < frends.length; f++) {
      let dd = dist(frends[f].x, frends[f].y, this.x, this.y);
      if (dd < 10 && dd != 0) {
        if (MODE == MODE1) {
          this.velX *= 5;
          this.velY *= 5;
        } else if (MODE == MODE2) {
          if (!this.frozen) {
            this.velX *= 0.5;
            this.velY *= 0.5;
          } else {
            this.velX *= 0.05;
            this.velY *= 0.05;
          }
        }
        fill(255, 10);
        ellipse(this.x, this.y, 15, 15);
        this.col[1] += 100;
      }
      
    }
    
    this.x += width;
    this.y += height;
    this.x %= width;
    this.y %= height;
    
    
    noStroke();
    fill(this.col);
    ellipse(this.x, this.y, this.rad, this.rad);
    
    this.col[2] *= 0.995;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(COLORS.background[MODE]);
  
  FRENDCOUNT *= ceil(windowWidth * windowHeight / 5e3);
  for (let i = 0; i < FRENDCOUNT; i++) {
    frends.push(new Frend(
      random(width), 
      random(height), 
      random(5,8),
      [random(200, 255), random(200, 255), random(150, 155)]
     ));
  }
}

function draw() {
  background(COLORS.background[MODE].concat([random(10, 50)]));
  for (let i = 0; i < frends.length; i ++) {
    frends[i].frame();
  }
}

function mouseClicked() {
  MODE = !MODE;
}
