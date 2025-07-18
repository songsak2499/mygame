const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const background = new Image();
background.src = "../images/bg.png"; // เปลี่ยน path ให้ตรง

background.onload = () => {
  draw();
};

function draw() {
  const scale = canvas.width / background.width;
  const drawHeight = background.height * scale / 2; // ลดความสูงลงครึ่ง
  const y = (canvas.height - drawHeight) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, y, canvas.width, drawHeight);
}
