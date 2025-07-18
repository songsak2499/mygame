const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const background = new Image();
background.src = "../images/bg.png"; // ตรวจสอบว่าที่อยู่ถูกต้อง

background.onload = () => {
  draw();
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const imgRatio = background.width / background.height;
  const targetWidth = canvas.width;
  const targetHeight = canvas.width / imgRatio;

  const drawHeight = targetHeight * 0.5; // ปรับแค่ส่วนนี้เพื่อเพิ่ม/ลดความสูงของภาพ
  const y = (canvas.height - drawHeight) / 2;

  ctx.drawImage(background, 0, y, canvas.width, drawHeight);
}
