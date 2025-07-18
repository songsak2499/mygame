const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ✅ เปลี่ยน path ได้ตรงนี้
const background = new Image();
background.src = "../images/bg.png";

background.onload = () => {
  const bgOriginalWidth = background.width;
  const bgOriginalHeight = background.height;

  // ให้พื้นหลังเต็มขอบซ้ายขวา แต่สูงต่ำลง
  const scaleRatio = canvas.width / bgOriginalWidth;
  const bgWidth = canvas.width;
  const bgHeight = (bgOriginalHeight * scaleRatio) / 2;

  const x = 0;
  const y = (canvas.height - bgHeight) / 2;

  ctx.drawImage(background, x, y, bgWidth, bgHeight);
};