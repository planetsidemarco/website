

const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
const totalStars = 1000;
const maxBrightness = 100;
var speed = 0.01;
let w;
let h;

window.onbeforeunload = function(){
  for (let i=0; i<10; i++) {
    speedUpStarsOnUnload(i);
  }
   
 function speedUpStarsOnUnload(i) {
    setTimeout(function() {
      speed = speed + speed*2;
    }, 75 * i);
  }
}

const setCanvasExtents = () => {
  w = document.body.clientWidth;
  h = document.body.clientHeight;
  canvas.width = w;
  canvas.height = h;
  };

  setCanvasExtents();

  window.onresize = () => {
  setCanvasExtents();
  };

  const makeStars = count => {
  const out = [];
  for (let i = 0; i < count; i++) {
      const s = {
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 1000
      };
      out.push(s);
  }
  return out;
};

let stars = makeStars(totalStars);



const clear = () => {
  var hour = new Date().getHours();
  var gradient = c.createLinearGradient(0, 200, 0, 2200);
  var top_gradient = "#011111"
  if (hour >= 20 || hour <= 4) {
    var bottom_gradient = "#450538"; // evening
  } else if ((hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19)) {
    var bottom_gradient = "#b52121"; // dawn / sunset
  } else if ((hour >= 8 && hour <= 9) || (hour >= 15 && hour <= 16)) {
    var bottom_gradient = "#1b6582"; // morning / evening
  } else if ((hour == 10) || (hour == 14)) {
    var bottom_gradient = "#39616e"; // mid-morning / afternoon
  } else if ((hour >= 11) && (hour <= 13)) {
    var bottom_gradient = "#40767d"; // midday
  }
  gradient.addColorStop(0, top_gradient);
  gradient.addColorStop(1, bottom_gradient);
  c.fillStyle = gradient;
  c.fillRect(0, 0, canvas.width, canvas.height);
};

const putPixel = (x, y, z, brightness) => {
const intensity = brightness * maxBrightness;

  if (intensity > 17) {
    var rgb = "rgb(" + intensity + "," + intensity + "," + intensity + ")";
  } else {
    var rgb = "rgb(1, 17, 17)";
  }

  var xSize = 2 / ( z * 0.001);
  var ySize = 2 / ( z * 0.001);

  c.fillStyle = rgb;
  c.fillRect(x, y, xSize, ySize);
};

const moveStars = distance => {
  const count = stars.length;
  for (var i = 0; i < count; i++) {
    const s = stars[i];
    s.x -= distance;
    while (s.x <= 1) {
      s.x += 1000;
    }
  }
};

let prevTime;
const init = time => {
  prevTime = time;
  requestAnimationFrame(tick);
};

const tick = time => {
  let elapsed = time - prevTime;
  prevTime = time;

  moveStars(elapsed * speed);

  clear();

  const count = stars.length;
  for (var i = 0; i < count; i++) {
    const star = stars[i];

    const x = star.x / (star.z * 0.001);
    const y = star.y / (star.z * 0.001);

    if (x < 0 || x >= w || y < 0 || y >= h) {
      continue;
    }

    const d = star.z / 1000.0;
    const b = 1 - d;

    putPixel(x, y, star.z, b);
  }

  requestAnimationFrame(tick);
};

requestAnimationFrame(init);