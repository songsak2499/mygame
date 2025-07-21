import { clamp } from "../core/util.js";
import { playerImages } from "../assets/images.js";
import { canvas } from "../core/canvas.js";

export const player = {
  x: 100,
  y: 0,
  frame: 0,
  frameTimer: 0,
  frameInterval: 150,
  animation: "idle",
  lastAnimation: "idle",
  facingLeft: false,
  jumpVelocity: 0,
  isRunningLeft: false,
  isRunningRight: false,
  isJumping: false,
  isAttacking: false,
  scale: 1.4,
  moveSpeed: 2,
};

export function updatePlayer(deltaTime, groundY) {
  const drawHeight = 64 * player.scale;

  if (player.isJumping) {
    player.jumpVelocity += 0.5;
    player.y += player.jumpVelocity;
    if (player.y >= groundY - drawHeight) {
      player.y = groundY - drawHeight;
      player.isJumping = false;
      player.jumpVelocity = 0;
    }
  } else {
    player.y = groundY - drawHeight;
  }

  if (!player.isAttacking) {
    if (player.isRunningRight) {
      player.x += player.moveSpeed;
      player.facingLeft = false;
    }
    if (player.isRunningLeft) {
      player.x -= player.moveSpeed;
      player.facingLeft = true;
    }
    const drawWidth = 100 * player.scale;
    player.x = clamp(player.x, 0, canvas.width - drawWidth);
  }
}

export function updatePlayerAnimation(deltaTime) {
  const anim = {
    idle: 4,
    run: 7,
    attack: 6,
    jump: 6,
  };

  player.frameTimer += deltaTime;
  if (player.frameTimer >= player.frameInterval) {
    player.frameTimer = 0;
    player.frame = (player.frame + 1) % anim[player.animation];

    if (player.animation === "attack" && player.frame === 5) {
      player.isAttacking = false;
    }
  }
}