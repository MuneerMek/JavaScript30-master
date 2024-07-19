const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((localMediaStream) => {
      console.log(localMediaStream);
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch((err) => console.log("Error:", err));
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // Take the raw pixel data out
    let pixels = ctx.getImageData(0, 0, width, height);
    // Update pixels value to reflect filter function

    // pixels = rgbSplit(pixels);
    pixels = greenScreen(pixels);
    // ctx.globalAlpha = 0.8;

    // Insert it back in
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  // Plays the sound
  snap.currentTime = 0;
  snap.play();

  // Take data from the canvas
  const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "webcam-photo");
  link.textContent = "Download Image";
  link.innerHTML = `<img src="${link}" alt="Webcam Picture"></img>`;
  strip.insertBefore(link, strip.firstChild);
}

// function redEffect(pixels) {
//   for (let i = 0; i < pixels.data.length; i += 4) {
//     pixels.data[i + 0] += 100; // R
//     pixels.data[i + 1] -= 100; // G
//     pixels.data[i + 2] /= 2; // B
//     pixels.data[i + 3] *= 0.9; // B
//   }
//   //   Return data back to pixels variable
//   return pixels;
// }

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // R
    pixels.data[i + 300] = pixels.data[i + 1]; // G
    pixels.data[i - 350] = pixels.data[i + 2]; // B
  }
  //   Return data back to pixels variable
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener("canplay", paintToCanvas);
