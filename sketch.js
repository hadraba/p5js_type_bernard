let font = "Helvetica";
let initSize = 10;
let txt = "dopici"; //delete soon
let names = ["generative", "visual", "design", "identity", "style"];
//let names = ["generative"];
let paddings = 0.1; //in percents
let dictionary;

const lines = 30;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  dictionary = new Dictionary(names);
}

function draw() {
  clear();
  dictionary.show();

  let fps = frameRate();
  fill(0);
  text("FPS: " + fps.toFixed(2), 10, height - 10);
}

class Dictionary {
  constructor(names) {
    this.names = names;
    this.canvases = [];
    this.words = [];
    this.active = 0;
    this.transFrame = 0;
    this.switching = false;

    for (let i = 0; i < names.length; i++) {
      this.canvases[i] = createGraphics(windowWidth, windowHeight);
      this.words[i] = new Word(this.names[i], this.canvases[i]);
    }
  }

  show() {
    if (!this.switching) {
      this.words[this.active].move();
    } else {
      this.switchTransition();
    }
  }

  switch() {
    this.switching = true;
  }

  switchTransition() {
    let nextActive = (this.active + 1) % this.names.length;
    let framesToSwitch = 0;
    if (this.transFrame < framesToSwitch) {
      this.words[this.active].move();
      this.words[nextActive].move();
      this.transFrame++;
    } else {
      this.active = nextActive;
      this.words[this.active].move();
      this.transFrame = 0;
      this.switching = false;
    }
  }
}

class Word {
  constructor(name, temp) {
    this.temp = temp;
    this.size = initSize;
    this.txtbox;
    this.maxSize;
    this.stripes = [];
    this.drawText(name);

    this.temp.loadPixels();
    for (let i = 0; i < lines; i++) {
      //source
      let sx = 0;
      let sy = Math.round(
        this.txtbox.y - this.txtbox.h / 2 + i * (this.txtbox.h / lines)
      );
      let sw = windowWidth;
      let sh = Math.round(this.txtbox.h / lines);

      //TODO: FIX when pixel density is different than 1 //

      //line lenght in the pixels array
      let line = this.temp.width * 4 * pixelDensity();
      //find start and end
      let start = line * sy * pixelDensity();
      let img = createImage(this.temp.width, sh);

      img.loadPixels();
      for (let k = 0; k < img.pixels.length; k++) {
        img.pixels[k] = this.temp.pixels[start + k];
      }
      img.updatePixels();

      this.stripes.push(img);
    }
  }

  move() {
    let test = createImage(windowWidth, windowHeight);
    for (let i = 0; i < lines; i++) {
      let dx = Math.round(
        map(i, 0, lines, 2, -2) *
          map(
            mouseX,
            0,
            windowWidth,
            ((this.txtbox.w / 50) * i) / lines,
            ((-this.txtbox.w / 50) * i) / lines
          )
      );
      if (mouseX === 0 && mouseY === 0) {
        dx = 0;
      }
      let dy =
        Math.round(
          this.txtbox.y - this.txtbox.h / 2 + i * (this.txtbox.h / lines)
        ) +
        Math.round(
          map(
            sin(frameCount * 0.03 + i * 0.2),
            -1,
            1,
            0,
            this.txtbox.h / 6 +
              map(
                mouseY,
                0,
                windowHeight,
                -this.txtbox.h / 3,
                this.txtbox.h / 6
              )
          )
        );
      let src = this.stripes[i].get(
        0,
        0,
        windowWidth,
        Math.round(this.txtbox.h / lines)
      );
      image(src, dx, dy);
    }
  }

  drawText(name) {
    this.temp.clear();
    this.temp.textFont(font);
    this.temp.textSize(this.size);
    this.temp.textStyle("bold");
    this.temp.textAlign(CENTER);
    while (
      this.temp.textWidth(name) <= windowWidth * (1 - 2 * paddings) &&
      this.size * 1.5 < windowHeight
    ) {
      this.size++;
      this.temp.textSize(this.size);
    }
    this.temp.text(name, windowWidth / 2, (windowHeight + this.size / 3) / 2);
    this.maxSize = this.size;
    rectMode(CENTER);
    image(this.temp, 0, 0);
    this.txtbox = {
      x: windowWidth / 2,
      y: windowHeight / 2 - this.size * 0.17,
      w: this.temp.textWidth(name),
      h: this.size * 1.12
    };
  }
}

function windowResized() {
  clear();
  resizeCanvas(windowWidth, windowHeight);
  dictionary = new Dictionary(names);
}

function mouseClicked() {
  dictionary.switch();
}
