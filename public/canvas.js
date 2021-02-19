const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const hiddenInput = document.getElementById("hiddenInput")

let drawIt = false;
let x = 0;
let y = 0;

canvas.addEventListener("mousedown", (e) => {
    drawIt = true;
    x = e.offsetX;
    y = e.offsetY;
    console.log("x", x);
    console.log("y", y);
});

canvas.addEventListener("mousemove", (e) => {
    if (drawIt === true) {
        console.log("offsetX", e.offsetX);
        console.log("offsetY", e.offsetY);
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.moveTo(x, y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.closePath();
        x = e.offsetX;
        y = e.offsetY;
        let canvasValue = canvas.toDataURL();
        hiddenInput.value = canvasValue;
    }
});

canvas.addEventListener("mouseout", (e) => {
    if (drawIt === true) {
         x = e.offsetX;
         y = e.offsetY;
    }
});

canvas.addEventListener("mouseup", (e) => {
    if (drawIt === true) {
        drawIt = false;
        x = 0;
        y = 0;
    }
});

document.addEventListener("mouseup", (e) => {
    if (drawIt === true) {
        drawIt = false;
        x = 0;
        y = 0;
    }
});
