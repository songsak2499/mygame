import { player } from "../entities/player.js";

export function setupControls() {
  document.getElementById("runButton").addEventListener("touchstart", () => player.isRunningRight = true);
  document.getElementById("runButton").addEventListener("touchend", () => player.isRunningRight = false);

  document.getElementById("leftButton").addEventListener("touchstart", () => player.isRunningLeft = true);
  document.getElementById("leftButton").addEventListener("touchend", () => player.isRunningLeft = false);

  document.getElementById("attackButton").addEventListener("touchstart", () => {
    if (!player.isAttacking) {
      player.isAttacking = true;
    }
  });

  document.getElementById("jumpButton").addEventListener("touchstart", () => {
    if (!player.isJumping) {
      player.isJumping = true;
      player.jumpVelocity = -10;
    }
  });

  document.addEventListener("gesturestart", e => e.preventDefault(), { passive: false });
  document.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
}