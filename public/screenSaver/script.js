const canv = document.getElementById("canvas");
const ctx = canv.getContext("2d");

canv.width = window.innerWidth;
canv.height = window.innerHeight;

window.addEventListener("resize", function() {
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
});

function loop() {
    ctx.clearRect(0, 0, canv.width, canv.height);
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canv.width, Math.random() * canv.height, 10, 0, Math.PI * 2);
        ctx.fill();
    }
    setTimeout(loop, 700);
}

loop();