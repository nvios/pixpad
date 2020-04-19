const sizePicker = document.querySelector('.size-picker');
const colorPicker = document.querySelector('.color-picker');
const colors = document.querySelector('.colors');
const sizeSelect = document.querySelector('.size');
const pixelCanvas = document.querySelector('.pixel-canvas');
const quickFill = document.querySelector('.quick-fill');
const drawMode = document.querySelector('.draw-mode');
const eraseMode = document.querySelector('.erase-mode');
const fillMode = document.querySelector('.fill-mode');
const zoomIn = document.querySelector('.zoom-in');
const zoomOut = document.querySelector('.zoom-out');
const save = document.querySelector('.save');
const palette = {
  A: "rgb(0,0,0)",
  B: "rgb(60,60,60)",
  C: "rgb(110,110,110)",
  D: "rgb(180,180,180)",
  E: "rgb(255,255,254)",
  F: "rgb(250,224,197)",
  G: "rgb(232,165,121)",
  H: "rgb(255,229,69)",
  I: "rgb(179,85,18)",
  J: "rgb(84,54,41)",
  K: "rgb(252,184,226)",
  L: "rgb(214,21,105)",
  M: "rgb(159,212,68)",
  N: "rgb(77,219,255)",
  O: "rgb(22,114,181)",
  P: "rgb(11,51,125)",
  Q: "rgb(242,81,36)",
  R: "rgb(191,29,33)",
  S: "rgb(112,35,44)",
  T: "rgb(125,28,138)"
};
// Modal
const modal = document.getElementById("modal");
const modalButton = document.getElementById("modal-button");
const span = document.getElementsByClassName("close")[0];

function loadImage(image) {
  let gridHeight = image.length;
  let gridWidth = image[0].length;
  xMax = Number(gridHeight - 1);
  yMax = Number(gridWidth - 1);

  for (let i = 0; i < gridHeight; i++) {
    let gridRow = document.createElement('tr');
    pixelCanvas.appendChild(gridRow);

    for (let j = 0; j < gridWidth; j++) {
      let gridCell = document.createElement('td');
      gridRow.appendChild(gridCell);
      gridCell.style.backgroundColor = image[i][j][1];
      gridCell.setAttribute('id', `${i},${j}`);
    };
  };
};

function makeGrid() {
  localStorage.clear()
  let gridHeight = document.querySelector('.input-height').value;
  let gridWidth = document.querySelector('.input-width').value;
  xMax = Number(gridHeight - 1);
  yMax = Number(gridWidth - 1);

  if (pixelCanvas.hasChildNodes()) {
    if (confirm("Are you sure you want to discard the changes made to the current artwork?")) {
      pixelCanvas.innerHTML = '';
    }
    else return;
    }

  for (let i = 0; i < gridHeight; i++) {
    let gridRow = document.createElement('tr');
    pixelCanvas.appendChild(gridRow);
    for (let j = 0; j < gridWidth; j++) {
      let gridCell = document.createElement('td');
      gridRow.appendChild(gridCell);
      gridCell.style.backgroundColor = "rgb(255,255,254)";
      gridCell.setAttribute('id', `${i},${j}`);
     }
  }
}

function createPalette(palette) {
  let counter = 0
  for (const i in palette) {
    let button = document.createElement("button");
    colors.appendChild(button);
    button.style.backgroundColor = palette[i];
    if (counter === 3) {
      colors.appendChild(document.createElement("br"))
      counter = -1
    }
    counter++
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!document.cookie) {
    modal.style.display = "block";
    document.cookie = "visited = true"
  }
  if (localStorage.canvas) {
    const image = JSON.parse(localStorage.getItem("canvas"));
    loadImage(image);
  }
  else {
    makeGrid();
  }
  createPalette(palette); 
});

if (sizePicker) {
  sizePicker.addEventListener('submit', function(e) {
    e.preventDefault();
    makeGrid();
  });
}

let paletteVisible = false;

colorPicker.addEventListener('click', function(e) {
  e.preventDefault();
  if (paletteVisible == false) {
    document.querySelector('.colors').style.visibility = "visible";
    paletteVisible = true;
  } else {
    document.querySelector('.colors').style.visibility = "hidden";
    paletteVisible = false;
  };
});

colors.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
      colorPicker.style.backgroundColor = e.target.style.backgroundColor;
      document.querySelector('.colors').style.visibility = "hidden";
      visible = false;
      if (eraseModeOn) {
        drawModeOn = true;
        eraseModeOn = false;
      }
    };
});

let size = 0;

sizeSelect.addEventListener('change', function() {
  size = parseInt(this.value);
});

zoomIn.addEventListener('click', function(e) {
  e.preventDefault();
  zoom(2)
});

zoomOut.addEventListener('click', function(e) {
  e.preventDefault();
  zoom(-2)
});

function zoom(value) {
  pixelSize = (parseInt(getComputedStyle(pixelCanvas.querySelector('td')).height) + value) + "px";
  pixelCanvas.querySelectorAll('td').forEach(function(td) {
    td.style.height =  pixelSize;
    td.style.width =  pixelSize;
    td.style.minWidth =  pixelSize;
  });
}

save.addEventListener('click', function(e) {
  e.preventDefault();
  createInstructions();
  window.location.href = "instructions.html";
});

// DRAW AND ERASE MODES:

let path = [];
let undoObject = {};
let redoObject;
let undoArray = [];
let redoArray = [];
let xMax = 0;
let yMax = 0;
let down = false;
let drawModeOn = true;
let eraseModeOn = false;
let fillModeOn = false;

pixelCanvas.addEventListener('dblclick', e => {
  e.target.style.backgroundColor = "rgb(255,255,254)";
});

drawMode.addEventListener('click', () => {
  drawModeOn = true; 
  eraseModeOn = false;
  fillModeOn = false;
  if (!drawMode.classList.contains('pressed')) drawMode.classList.add('pressed');
  if (eraseMode.classList.contains('pressed')) eraseMode.classList.remove('pressed');
  if (fillMode.classList.contains('pressed')) fillMode.classList.remove('pressed');
});

eraseMode.addEventListener('click', () => {
  drawModeOn = false; 
  eraseModeOn = true;
  fillModeOn = false;
  if (drawMode.classList.contains('pressed')) drawMode.classList.remove('pressed');
  if (!eraseMode.classList.contains('pressed')) eraseMode.classList.add('pressed');
  if (fillMode.classList.contains('pressed')) fillMode.classList.remove('pressed');
});

fillMode.addEventListener('click', () => {
  drawModeOn = false; 
  eraseModeOn = false;
  fillModeOn = true;
  if (drawMode.classList.contains('pressed')) drawMode.classList.remove('pressed');
  if (eraseMode.classList.contains('pressed')) eraseMode.classList.remove('pressed');
  if (!fillMode.classList.contains('pressed')) fillMode.classList.add('pressed');
});

pixelCanvas.addEventListener('mousedown', function(e) {
  e.preventDefault();
  if (drawModeOn) draw(e);
  if (eraseModeOn) erase(e);
  if (fillModeOn) {
    const id = e.target.getAttribute('id')
    const [x, y] = id.split(',').map(numStr => parseInt(numStr));
    const oldColor = document.getElementById(id).style.backgroundColor;
    const newColor = colorPicker.style.backgroundColor;
    floodFill(x, y, xMax, yMax, oldColor, newColor);
    updateUndoHistory();
  }
}, true);

function updateUndoHistory() {
  if (Object.keys(undoObject).length > 0) {
    if (undoArray.length > 20) undoArray.splice(0, 1);
    undoArray.push(undoObject);
    undoObject = {};
  };
}

function undo() {
  if (undoArray.length > 0) {
    redoObject = {};
    for (let [id, color] of Object.entries(undoArray[undoArray.length - 1])) {
      redoObject[id] = document.getElementById(id).style.backgroundColor;
      document.getElementById(id).style.backgroundColor = color;
    };
    undoArray.splice(-1, 1);
    redoArray.push(redoObject);
  }
};

function redo() {
  if (redoArray.length > 0) {
    undoObject = {};
    for (let [id, color] of Object.entries(redoArray[redoArray.length - 1])) {
      undoObject[id] = document.getElementById(id).style.backgroundColor;
      document.getElementById(id).style.backgroundColor = color;
    };
    redoArray.splice(-1, 1);
    undoArray.push(undoObject);
  }
};

function findNeighbors(id) {
  const [x, y] = id.split(',').map(numStr => parseInt(numStr));
  neighbors = [];
  for (let i = -size; i <= size; i++) {
    for (let j = -size; j <= size; j++) {
      if (x + i >= 0 && x + i <= xMax && y + j >= 0 && y + j <= yMax) {
        neighbors.push(`${x + i},${y + j}`);
      };
    };
  };
  return neighbors;
};

function draw(e) {
  down = true;
  redoArray = [];
  let prevPixel = e.target.getAttribute('id');
  for (id of findNeighbors(e.target.getAttribute('id'))) {
    undoObject[id] = document.getElementById(id).style.backgroundColor;
    document.getElementById(id).style.backgroundColor = colorPicker.style.backgroundColor;
  }
  pixelCanvas.addEventListener('mouseover', function(e) {
    if (down && drawModeOn) {
      if (e.target.tagName === 'TD') {
        curPixel = e.target.getAttribute('id');
        if (prevPixel && prevPixel != curPixel) {
          coordsList = findPath(prevPixel, curPixel);
          prevPixel = curPixel;
          path = [];
          for (let coords of coordsList) {
            for (let id of findNeighbors(coords)) {
              if (undoObject[id] == undefined) {
                undoObject[id] = document.getElementById(id).style.backgroundColor;
                document.getElementById(id).style.backgroundColor = colorPicker.style.backgroundColor;
              };
            };
          };
        };
      };
    };
  });
  pixelCanvas.addEventListener('mouseup', function() {
    down = false;
    prevPixel = false;
    updateUndoHistory();
  });
  pixelCanvas.addEventListener('mouseleave', function() {
    down = false;
    prevPixel = false;
    updateUndoHistory();
  });
};

function erase(e) {
  down = true;
  redoArray = [];
  for (let id of findNeighbors(e.target.getAttribute('id'))) {
    undoObject[id] = document.getElementById(id).style.backgroundColor;
    document.getElementById(id).style.backgroundColor = "rgb(255,255,254)";
  };
  pixelCanvas.addEventListener('mouseover', function(e) {
    if (down && eraseModeOn) {
      if (e.target.tagName === 'TD') {
        for (let id of findNeighbors(e.target.getAttribute('id'))) {
          if (undoObject[id] == undefined) {
            undoObject[id] = document.getElementById(id).style.backgroundColor;
            document.getElementById(id).style.backgroundColor = "rgb(255,255,254)";
          };
        };
      };
    };
  });
  pixelCanvas.addEventListener('mouseup', function() {
    down = false;
    updateUndoHistory();
  });
  pixelCanvas.addEventListener('mouseleave', function() {
    down = false;
    updateUndoHistory();
  });
};

function floodFill(x, y, xMax, yMax, oldColor, newColor) {
  //console.log(x, y, xMax, yMax)
  redoArray = [];
  const id = `${x},${y}`
  let curPixelColor = document.getElementById(id).style.backgroundColor;

  if (oldColor === newColor) return;
  if (oldColor !== curPixelColor) return;
 
  if (oldColor === curPixelColor) {
    undoObject[id] = curPixelColor;
    document.getElementById(id).style.backgroundColor = newColor;
  };

  if (x > 0) floodFill(x-1, y, xMax, yMax, oldColor, newColor);
  if (y > 0) floodFill(x, y-1, xMax, yMax, oldColor, newColor);
  if (x < xMax) floodFill(x+1, y, xMax, yMax, oldColor, newColor);
  if (y < yMax) floodFill(x, y+1, xMax, yMax, oldColor, newColor);
}

// CREATE ASSEMBLY INSTRUCTIONS:

function createInstructions() {
  let invPalette = {};
  let bricks = {};
  let canvas = [];
  for (let [k,v] of Object.entries(palette)) {
    invPalette[v] = k;
  };
  document.querySelectorAll("tr").forEach(function(e) {
    let row = [];
    e.querySelectorAll("td").forEach(function(e) {
      let color = e.style.backgroundColor.replace(/ /g, "")
      if (bricks[invPalette[color]]) bricks[invPalette[color]]++;
      else bricks[invPalette[color]] = 1;
      row.push([invPalette[color], color])
    });
    canvas.push(row)
  });
  localStorage.setItem("brickQuantities", JSON.stringify(bricks))
  localStorage.setItem("canvas", JSON.stringify(canvas))
};

function shortcuts(e) {
  // cmd+z or ctrl+z
  if (!e.shiftKey && e.keyCode == 90) {
    if (e.metaKey || e.ctrlKey) undo();
  }
  // cmd+shift+z or ctrl+shift+z
  if (e.shiftKey && e.keyCode == 90) {
    if (e.metaKey || e.ctrlKey) redo();
  }
  // =
  if (e.keyCode == 187) {
    zoom(2);
  }
  // -
  if (e.keyCode == 189) {
    zoom(-2);
  }
  // s
  if (e.keyCode == 83) {
    sizeSelect.selectedIndex = "0";
    size = 0;
  }
  // m
  if (e.keyCode == 77) {
    sizeSelect.selectedIndex = "1";
    size = 1;
  }
  // l
  if (e.keyCode == 76) {
    sizeSelect.selectedIndex = "2";
    size = 2;
  }
  // d
  if (e.keyCode == 68) {
    drawModeOn = true; 
    eraseModeOn = false;
    fillModeOn = false;
    if (!drawMode.classList.contains('pressed')) drawMode.classList.add('pressed');
    if (eraseMode.classList.contains('pressed')) eraseMode.classList.remove('pressed');
    if (fillMode.classList.contains('pressed')) fillMode.classList.remove('pressed');
  }
  // e
  if (e.keyCode == 69) {
    drawModeOn = false; 
    eraseModeOn = true;
    fillModeOn = false;
    if (drawMode.classList.contains('pressed')) drawMode.classList.remove('pressed');
    if (!eraseMode.classList.contains('pressed')) eraseMode.classList.add('pressed');
    if (fillMode.classList.contains('pressed')) fillMode.classList.remove('pressed');
  }
  // f
  if (e.keyCode == 70) {
    drawModeOn = false; 
    eraseModeOn = false;
    fillModeOn = true;
    if (drawMode.classList.contains('pressed')) drawMode.classList.remove('pressed');
    if (eraseMode.classList.contains('pressed')) eraseMode.classList.remove('pressed');
    if (!fillMode.classList.contains('pressed')) fillMode.classList.add('pressed');
  }
}
document.onkeydown = shortcuts;

// INSTRUCTIONS MODAL:

modalButton.addEventListener("click", () => modal.style.display = "block");
span.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", () => {
  if (event.target == modal) modal.style.display = "none";
});

// PATH FINDING ALGORITHM:

function findPath(startPixel, endPixel) {
  const [startX, startY] = startPixel.split(',').map(numStr => parseInt(numStr));
  const [endX, endY] = endPixel.split(',').map(numStr => parseInt(numStr));
  let adjacent = false;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (startX + i >= 0 && startX + i <= xMax && startY + j >= 0 && startY + j <= yMax) {
        if (endX + i == startX && endY + i == startY) adjacent = true;
      };
    };
  };
  if (!adjacent) {
    pathRecursion(startX, startY, endX, endY);
    return path;
  }
  else return [endPixel];
};

function pathRecursion(startX, startY, endX, endY) {
  path.push(`${startX},${startY}`);
  if (endX > startX) {
    if (endY > startY) pathRecursion(startX+1, startY+1, endX, endY)
    else if (endY < startY) pathRecursion(startX+1, startY-1, endX, endY)
    else if (endY == startY) pathRecursion(startX+1, startY, endX, endY);
  }
  else if (endX < startX) {
    if (endY > startY) pathRecursion(startX-1, startY+1, endX, endY)
    else if (endY < startY) pathRecursion(startX-1, startY-1, endX, endY)
    else if (endY == startY) pathRecursion(startX-1, startY, endX, endY);
  }
  else if (endX == startX) {
    if (endY > startY) pathRecursion(startX, startY+1, endX, endY)
    else if (endY < startY) pathRecursion(startX, startY-1, endX, endY)
    else if (endY == startY) return;
  };
};