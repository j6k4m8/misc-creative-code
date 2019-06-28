import com.thomasdiewald.pixelflow.java.DwPixelFlow;
import com.thomasdiewald.pixelflow.java.fluid.DwFluid2D;

DwFluid2D fluid;

PGraphics2D pg_fluid;

final short NUM = 20;
final float VMAX = 3.5;
class Particle {
  
  float x, y, vx, vy, r, g, b;
  
  Particle(float x, float y, float vx, float vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = random(0, 1);
    this.g = random(0, 1);
    this.b = random(0, 1);
  }
  
  void update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -4) { this.x += width; }
    if (this.y < -4) { this.x += height; }
    if (this.x > width) { this.x -= width; }
    if (this.y > height) { this.x -= height; }
      
  }
  
  void explore() {
    this.vx += random(-1, 1);
    this.vx = constrain(this.vx, -1 * VMAX, VMAX);
    this.vy += random(-1, 1);
    this.vy = constrain(this.vy, -1 * VMAX, VMAX);
  }
  
  void updateVelocity(float vx, float vy) {
    this.vx = vx;
    this.vy = vy;
  }
}


Particle[] particles = new Particle[NUM];
public void setup() {

  size(800, 800, P2D);
  
  for (int i = 0; i < NUM; i++) {
    particles[i] = new Particle(random(0, width), random(0, height), 0.0f, 0.0f);
  }

  // library context
  DwPixelFlow context = new DwPixelFlow(this);

  // fluid simulation
  fluid = new DwFluid2D(context, width, height, 1);

  // some fluid parameters
  fluid.param.dissipation_velocity = 0.99f;
  fluid.param.dissipation_density  = 0.98f;
  fluid.param.vorticity            = 0.10f;


  // adding data to the fluid simulation
  fluid.addCallback_FluiData(new  DwFluid2D.FluidData() {
    public void update(DwFluid2D fluid) {
      
      if (mousePressed) {
        float px     = mouseX;
        float py     = height-mouseY;
        float vx     = (mouseX - pmouseX) * +10;
        //float vx = random(400) - 200;
        //float vy = random(400) - 200;
        float vy     = (mouseY - pmouseY) * -10;

        fluid.addVelocity(px, py, 10-1, vx, vy);
        //fluid.addDensity (px, py, 20, 0.0f, 0.4f, 1.0f, 1.0f);
        //fluid.addDensity (px, py, 8, 1.0f, 1.0f, 1.0f, 1.0f);
      }
      
      for (int i = 0; i < NUM; i++) {
        particles[i].explore();
        particles[i].update();
        
        //float[] f4 = {particles[i].x, particles[i].y};
        //float[] v = fluid.getVelocity(f4);
        //particles[i].updateVelocity(v[0], v[1]);
        fluid.addDensity(particles[i].x, particles[i].y,3, particles[i].r, particles[i].g, particles[i].b, 1.0f);
        fluid.addVelocity(particles[i].x, particles[i].y, 10, particles[i].vx * 3, particles[i].vy * 3);
      }
    }
  }
  );

  pg_fluid = (PGraphics2D) createGraphics(width, height, P2D);
}


int f = 0;
public void draw() {  
  f++;
  // update simulation
  fluid.update();

  // clear render target
  pg_fluid.beginDraw();
  pg_fluid.background(0);
  pg_fluid.endDraw();

  // render fluid stuff
  fluid.renderFluidTextures(pg_fluid, 0);

  // display
  image(pg_fluid, 0, 0);
}
