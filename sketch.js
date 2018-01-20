let inputFactor, inputUserPic, colorCheckbox, resetButton, ditherSelect;
let userFile, userImage;

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
      pixels[index + y * 4] += round(error * 5 / 16);
      if (x > 0) {
        pixels[index - 4 + y * 4] += round(error * 3 / 16);
      }
      if (x < img.width - 1) {
        pixels[index + 4 + y * 4] += round(error / 16);
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
