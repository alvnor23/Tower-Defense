import { Enemy } from './Enemy.js';
import { Tower } from './Tower.js';

export class BossEnemy extends Enemy {
    constructor(scene, x, y, row, texture, properties) {
        super(scene, x, y, row, texture, properties);
        this.intendedHeight = properties.height;

        this.maxHealth = properties.health;
        this.healthBarBg = this.scene.add.graphics();
        this.healthBar = this.scene.add.graphics();
        this.updateHealthBar();
    }

    move() {
        if (this.isAttacking || this.isDead) return;

        this.play(this.textureKey + '_run');

        // go toward other side
        const targetX = this.gameWidth + this.width;

        this.moveTween = this.scene.tweens.add({
            targets: this,
            x: targetX,
            duration: ((targetX - this.x) / this.speed) * 1000, // time = distance / speed. convert to ms.
            onUpdate: () => {
                // Check if tower in range
                if (this.towerInRange()) {
                    this.moveTween.pause();
                    this.zigzagTween.pause();
                    if (this.zigzagLoopTween) this.zigzagLoopTween.pause();
                    this.attack();
                };
            },
            onComplete: () => {
                this.scene.health = 0; // game lost regardless of health of boss left
                this.destroySelf();
            }
        });

        const topY = this.scene.bridgeY - this.intendedHeight / 2 + this.scene.tileHeight / 2;
        const bottomY = this.scene.bridgeY + this.scene.tileHeight * (this.scene.gridRows - 0.5) - this.intendedHeight / 2;

        const firstTargetY = (bottomY - this.y >= this.y - topY) ? bottomY : topY;
        const secondTargetY = (firstTargetY == bottomY) ? topY : bottomY;

        this.zigzagTween = this.scene.tweens.add({
            // first go to first target
            targets: this,
            y: firstTargetY,
            duration: 30000,
            ease: 'linear',
            onUpdate: () => {
                const bottom = this.y + this.intendedHeight / 2;

                // Row calculation may spill to +-1 from the limits of the the amount of rows
                const unclampedRow = Math.floor((bottom - this.scene.bridgeY) / this.scene.tileHeight);
                // Phaser method makes sure it is between 1 and this.gridRows
                this.row = Phaser.Math.Clamp(unclampedRow, 1, this.scene.gridRows);
            },
            onComplete: () => {
                // then bounce between one target and the other
                this.zigzagLoopTween = this.scene.tweens.add({
                    targets: this,
                    y: secondTargetY,
                    duration: 30000,
                    ease: 'linear',
                    onUpdate: () => {
                        const bottom = this.y + this.intendedHeight / 2;

                        // Row calculation may spill to +-1 from the limits of the the amount of rows
                        const unclampedRow = Math.floor((bottom - this.scene.bridgeY) / this.scene.tileHeight);
                        // Phaser method makes sure it is between 1 and gridRows
                        this.row = Phaser.Math.Clamp(unclampedRow, 1, this.scene.gridRows);
                    },
                    yoyo: true,
                    repeat: -1
                });
            }
        });

    }

    togglePause() {
        this.anims.isPlaying = !this.anims.isPlaying;

        this.moveTween.paused = !this.moveTween.paused;
        this.zigzagTween.paused = !this.zigzagTween.paused;

        // if inner zig zag tween exists, also toggle it
        if (this.zigzagLoopTween && this.zigzagLoopTween.paused) this.zigzagLoopTween.paused = false;
        else if (this.zigzagLoopTween && !this.zigzagLoopTween.paused) this.zigzagLoopTween.paused = true;
    }

    // returns tower in range if it exists, otherwise undefined
    towerInRange() {
        const tower = Tower.placedTowers.find(tower => tower.x - this.x < this.scene.tileWidth * this.range &&
            this.row == tower.row && tower.x - this.x >= 0);
        return tower;
    }

    updateHealthBar() {
        this.healthBar.clear();
        this.healthBarBg.clear();

        const barX = this.scene.gameWidth / 2;
        const barY = this.scene.gameHeight / 50;
        const barWidth = this.scene.gameWidth / 2;
        const barHeight = this.scene.gameWidth / 30;
        const barMarginX = barWidth * 0.01;
        const barMarginY = barHeight * 0.05;

        // background - gray
        this.healthBarBg.fillStyle(0x222222, 1);
        this.healthBarBg.fillRect(barX - barWidth / 2, barY, barWidth, barHeight);

        const healthRatio = Math.max(this.health, 0) / this.maxHealth;

        // Health - red
        this.healthBar.fillStyle(0xff0000, 1);
        this.healthBar.fillRect(
            barX + barMarginX - barWidth / 2,
            barY + barMarginY,
            (barWidth - 2 * barMarginX) * healthRatio,
            barHeight - 2 * barMarginY
        );
    }

    die() {
        // add money and points
        this.scene.money += this.money;
        this.scene.points += this.points;

        this.isDead = true;
        this.togglePause();
        this.play(this.textureKey + '_death');
        this.once('animationcomplete', () => {
            // Call to scene's end game function
            this.scene.endGame("win");

            // destroy health bar
            this.healthBar.destroy();
            this.healthBarBg.destroy();

            // destroy self
            this.destroySelf();
        });
    }

}