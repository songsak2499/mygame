// จัดการ canvas ขนาดเต็มหน้าจอ
export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");

export function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();