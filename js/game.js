const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ปรับขนาด canvas ให้เต็มหน้าจอ
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// โหลดภาพพื้นหลัง
const background = new Image();
background.src = "images/bg.png";  // ตำแหน่งภาพพื้นหลัง

background.onload = () => {
  // วาดภาพพื้นหลังขยายเต็ม canvas
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
};
