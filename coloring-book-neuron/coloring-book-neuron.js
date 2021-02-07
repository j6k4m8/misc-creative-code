nodes = [];

MAX_SPEED = 5;
KILL_OFFSCREEN = false;

function setup() {
  createCanvas(800, 800);
  for (let i = 0; i < 3; i++) {
    nodes.push(new Node(width/2, height/2, random(-1, 1), random(-1, 1)));
  }
  nodes.push(new Node(0, 0, 10, 10, 100));
} 

function mouseClicked() {
  KILL_OFFSCREEN = true;
}

class Node {
  constructor(x, y, vx, vy, r) {
    this.x = x;
    this.y = y;
    this.vx = vx || 0;
    this.vy = vy || 0;
    this.r = r ||  20;
    this.vr = 0;
    this.lastX = x;
    this.lastY = y;
    this.last2X = x;
    this.last2Y = y;
    this.alive = true;
  }
  
  terminate() {
    this.alive = false;
  }
  
  step() {
    this.x += this.vx;
    this.y += this.vy;
    this.r += this.vr;
    
    if (KILL_OFFSCREEN && (this.x > width+10 || this.x < -10)) {
      this.terminate();
    }
    if (KILL_OFFSCREEN && (this.y > height+10 || this.y < -10)) {
      this.terminate();
    }
    
    
    if (this.r < 40) {
      this.r = constrain(this.r, 5, 30);
      this.x = constrain(this.x, -50, width+50);
      this.y = constrain(this.y, -50, height+50);
      
      this.vx = constrain(this.vx, -MAX_SPEED, MAX_SPEED);
      this.vy = constrain(this.vy, -MAX_SPEED, MAX_SPEED);
      
    }
    this.vr = constrain(this.vr, -0.5, 0.5);
    
    this.vx += random(-1.5, 1.5);
    this.vy += random(-1.5, 1.5);
    this.vr += random(-.5, .5);    

    if (random(0, 100) > 99.8) {
      nodes.push(new Node(this.x, this.y, this.vx, this.vy));
    }
    if (random(0, 100) > 99.9) {
      this.terminate();
    }
  }
  
  draw() {
    strokeWeight(this.r);
    stroke(0);
    strokeCap(ROUND);
    line(this.x, this.y, this.lastX, this.lastY);
    strokeWeight(this.r - 5);
    stroke(255);
    strokeCap(ROUND);
    line(this.lastX, this.lastY, this.last2X, this.last2Y);
    this.last2X = this.lastX;
    this.last2Y = this.lastY;
    this.lastX = this.x;
    this.lastY = this.y;
  }
}

frame = 0;
function draw() {
  frame++;
  //background(255);
  for (let _node of nodes) {
    if (_node.alive) {
      _node.step();
      if (frame % 2 == 0) {
        _node.draw();
      }
    }
  }
}
