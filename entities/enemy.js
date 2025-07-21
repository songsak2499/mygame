import { enemyImages } from "../assets/images.js";

export const enemy = {
  x: 600,
  y: 0,
  frame: 0,
  frameTimer: 0,
  frameInterval: 200,
  state: "idle",
  facingLeft: true,
  scale: 1.4,
};

export function updateEnemyAI(playerX) {
  const dist = Math.abs(enemy.x - playerX);
  if (dist < 150) {
    if (enemy.state !== "attack") {
      enemy.state = "attack";
      enemy.frame = 0;
    }
  } else {
    enemy.state = "idle";
  }

  enemy.facingLeft = enemy.x > playerX;
}

export function updateEnemyAnimation(deltaTime) {
  enemy.frameTimer += deltaTime;
  if (enemy.frameTimer >= enemy.frameInterval) {
    enemy.frameTimer = 0;
    if (enemy.state === "attack") {
      enemy.frame++;
      if (enemy.frame >= 4) {
        enemy.frame = 0;
        enemy.state = "idle";
      }
    } else {
      enemy.frame = (enemy.frame + 1) % 6;
    }
  }
}