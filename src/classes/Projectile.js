import { Enemy } from './Enemy.js';
import { Tower } from './Tower.js';
import { BossEnemy } from './BossEnemy.js';

export class Projectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, width, height, speed, shooter, damage = 20) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.shooter = shooter;
        this.speed = speed;
        this.damage = damage;
        this.paused = false;

        this.setDepth(this.scene.aheadTowersDepth);
        this.setDisplaySize(width, height);

        const targetX = (shooter instanceof Tower) ? 0 : this.scene.gameWidth * 1.1;
        const duration = Math.abs(targetX - this.x) / this.speed * 1000 // time = distance / speed

        this.flyTween = scene.tweens.add({
            targets: this,
            x: targetX, // arrow fly toward shooting direction
            duration: duration,
            ease: 'Linear',
            onUpdate: () => {
                // Check if it collides with any enemy/tower
                const target = this.targetCollision();
                if (target) {
                    target.hurt(damage);
                    this.destroySelf();
                }
            },
            onComplete: () => {
                this.destroySelf();
            }
        });
    }

    // checks collision with tower or enemy depending on who's shooting
    // friendly fire off
    targetCollision() {
        const thisX = this.getWorldTransformMatrix().tx; // this.x not in sync with tween of movement
        const thisLeft = thisX - this.displayWidth / 2;
        const thisRight = thisX + this.displayWidth / 2;

        if (this.shooter instanceof Tower) {
            const targetEnemies = Enemy.allEnemies.filter(enemy => {
                const enemyLeft = enemy.x - enemy.displayWidth / 2;
                const enemyRight = enemyLeft + enemy.hitableWidth;
                const overlapX = thisRight >= enemyLeft && thisLeft <= enemyRight;

                // Projectile will hit any part of enemy that is a boss
                // but only enemies on same row if not.
                if (enemy instanceof BossEnemy) {
                    const enemyTop = enemy.y - enemy.displayHeight / 2;
                    const enemyBottom = enemy.y + enemy.displayHeight / 2;
                    const overlapY = enemyTop <= this.y && enemyBottom >= this.y;
                    return overlapX && !enemy.isDead && overlapY;
                }

                return overlapX && !enemy.isDead && this.shooter.row === enemy.row;
            });

            const closestEnemy = targetEnemies.sort((a, b) => a.x - b.x)[0]; // smallest delta x
            return closestEnemy || null;
        }
        if (this.shooter instanceof Enemy) {
            const targetTowers = Tower.placedTowers.filter(tower => {
                const towerLeft = tower.x - tower.displayWidth / 2;
                const towerRight = tower.x + tower.displayWidth / 2;
                const overlapX = thisRight >= towerLeft && thisLeft <= towerRight;

                return overlapX && !tower.isDead && this.shooter.row === tower.row;
            });

            const closestTower = targetTowers.sort((a, b) => b.x - a.x)[0]; // smallest delta x
            return closestTower || null;
        }
    }

    // secure destruction
    destroySelf() {
        if (this.scene) {
            this.scene.tweens.killTweensOf(this); // Stop tweens
        }
        this.destroy(); // Destroy the object
    }

    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.flyTween.paused = true;
        } else {
            this.flyTween.paused = false;
        }
    }
}
