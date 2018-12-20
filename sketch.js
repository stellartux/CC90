let inputFactor, inputUserPic, colorCheckbox, resetButton, ditherSelect;
let userFile, userImage;
let reharmoniseCheckbox, invertCheckbox;

function setup() {
  createElement("h2", "Dither Kitty!");

  createCanvas(100, 100);

  createSpan("Dither type: ");
  ditherSelect = createSelect();
  ditherSelect.option("None");
  ditherSelect.option("Simple");
  ditherSelect.option("Floyd-Steinberg");
  ditherSelect.changed(handleChange);

  colorCheckbox = createCheckbox('Color', true);
  colorCheckbox.changed(handleChange);

  invertCheckbox = createCheckbox('Invert', false);
  invertCheckbox.changed(handleChange);

  reharmoniseCheckbox = createCheckbox('Reharmonise', false);
  reharmoniseCheckbox.changed(handleChange);

  createSpan("Dither amount: ");
  inputFactor = createSlider(1, 510, 255, 1);
  inputFactor.changed(handleChange);

  createSpan("Upload an image: ");
  inputUserPic = createFileInput(handleNewImage);
  inputUserPic.elt.accept = "image/*";

  createSpan("Get the kitten back: ");
  resetButton = createButton("Reset");
  resetButton.mouseClicked(reset);

  createA("https://github.com/stellartux/CC90", "Source Code");

  noLoop();
  reset();
}

function reset() {
  userImage = loadImage("assets/kitten.jpg", display);
  userFile = undefined;
}

function handleChange() {
  if (userFile) {
    handleNewImage(userFile);
  } else {
    reset();
  }
}

function handleNewImage(file) {
  userFile = file;
  userImage = loadImage(file.data, display);
}

function display(img) {
  resizeCanvas(img.width, img.height);
  background(0);
  if (!colorCheckbox.checked()) {
    img.filter(GRAY);
  }
  if (invertCheckbox.checked()) {
    img.filter(INVERT)
  }
  if (reharmoniseCheckbox.checked()) {
    reharmoniseColors(img);
  }
  if (ditherSelect.value() === "Simple") {
    simpleDither(img);
  } else if (ditherSelect.value() === "Floyd-Steinberg") {
    floydSteinbergDither(img);
  }
  image(img, 0, 0);
  redraw();
}

function simpleDither(img) {
  img.loadPixels();
  img.pixels.forEach((value, index) => {
    img.pixels[index] = quantise(value);
  });
  img.updatePixels();
}

function floydSteinbergDither(img) {
  img.loadPixels();
  img.pixels.forEach((value, index, pixels) => {
    let x = floor(index / 4) % img.width;
    let y = floor(index / 4 / img.width);

    pixels[index] = quantise(value);
    let error = quantError(value);
    if (x < img.width - 1) {
      pixels[index + 4] += round(error * 7 / 16);
    }
    if (y < img.height - 1) {
      pixels[index + img.width * 4] += round(error * 5 / 16);
      if (x > 0) {
        pixels[index - 4 + img.width * 4] += round(error * 3 / 16);
      }
      if (x < img.width - 1) {
        pixels[index + 4 + img.width * 4] += round(error / 16);
      }
    }
  });
  img.updatePixels();
}

function quantise(value, factor = inputFactor.value()) {
  return round(value / factor) * factor;
}
function quantError(value, factor = inputFactor.value()) {
  return value - round(value / factor) * factor;
}

function reharmoniseColors(img) {
  img.loadPixels();
  for (i = 0; i < img.pixels.length; i += 4) {
    let oldColor = {
      r: img.pixels[i],
      g: img.pixels[i+1],
      b: img.pixels[i+2]
    }
    let newColor = {
      r: oldColor.g / 2 + oldColor.b / 2,
      g: oldColor.r / 2 + oldColor.b / 2,
      b: oldColor.r / 2 + oldColor.g / 2
    }
    img.pixels[i] = newColor.r;
    img.pixels[i+1] = newColor.g;
    img.pixels[i+2] = newColor.b;
  }
  img.updatePixels();
}
