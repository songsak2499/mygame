const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = new Image();
player.src = "player_idle.png";

player.onload = () => {
  ctx.drawImage(player, 100, 100, 64, 64);
};
