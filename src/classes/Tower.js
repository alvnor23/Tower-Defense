import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';
import { BossEnemy } from './BossEnemy.js';

export class Tower extends Phaser.GameObjects.Sprite { // Tower works as a sprite

    static shopTowers = []; // keep track of all tower objects in the shop
    static placedTowers = []; // keep track of all placed tower objects

    constructor(scene, x, y, texture, properties) {
        super(scene, x, y, texture); // Sprite constructor is called with these parameters

        // global access
        this.scene = scene;
        this.texture = texture;
        this.properties = properties;
        this.health = properties.health || 100;
        this.range = properties.range || 10;
        this.damage = properties.damage || 20;
        this.shootSpeed = properties.shootSpeed || 5;
        this.projectileTexture = properties.projectileTexture || 'arrow';
        this.projectileWidth = properties.projectileWidth || 30;
        this.projectileHeight = properties.projectileHeight || 30;
        this.shootingTimer = 0; // time since last shot
        this.isDead = false;
        this.paused = false;

        this.upgrades = {
            "range": 0,
            "damage": 0,
            "shootSpeed": 0,
            "health": 0
        }

        this.projectiles = [];

        scene.add.existing(this); // Add tower to scene

        this.setInteractive();

        // Add idle animation
        if (!scene.anims.exists(texture + '_idle')) {
            scene.anims.create({
                key: texture + '_idle',
                frames: scene.anims.generateFrameNumbers(texture, { start: 0, end: 5 }),
                frameRate: 5,
                repeat: -1
            });
        }
        this.play(texture + '_idle');
    }

    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            clearInterval(this.shootingID);
            this.projectiles.forEach(projectile => projectile.togglePause());
            this.anims.pause();
        } else {
            this.projectiles.forEach(projectile => projectile.togglePause());
            this.anims.resume();
        }
    }

    update() {
        const shootInterval = 10000 / this.shootSpeed; // shootInterval decreases with more shoot speed
        if (this.aliveEnemyInRange() && (Date.now() - this.shootingTimer) > shootInterval &&
            this.scene.gameState != "paused") {
            this.shoot();
        }
    }

    aliveEnemyInRange() {
        if (!this.scene) return; // safe check

        const aliveEnemy = Enemy.allEnemies.find(enemy => {
            const dx = this.x - enemy.x;
            const inRange = dx >= 0 && dx <= this.scene.tileWidth * this.range;

            // If enemy is a boss it cares about seeing any part of it
            // Otherwise it must be on the same row.
            if (enemy instanceof BossEnemy) {
                const enemyTop = enemy.y - enemy.displayHeight / 2;
                const enemyBottom = enemy.y + enemy.displayHeight / 2;
                const overlapY = enemyTop <= this.y && enemyBottom >= this.y;
                return inRange && !enemy.isDead && overlapY;
            }

            return inRange && this.row == enemy.row && !enemy.isDead;
        }
        );

        if (aliveEnemy) return true;
        return false;
    }

    shoot() {
        this.shootingTimer = Date.now();

        // maybe add if statement for scene existing
        const projectile = new Projectile(this.scene, this.x, this.y, this.projectileTexture, this.projectileWidth, this.projectileHeight, 300, this, this.damage);
        this.projectiles.push(projectile);
    }

    hurt(damage) {
        this.scene.tweens.add({
            targets: this,
            tint: { from: 0xffffff, to: 0xff0000 }, // White to red
            yoyo: true, // Returns to previous color/tint/condition
            duration: 300
        });

        this.health -= damage;
        if (this.health <= 0) {
            this.destroySelf();
            this.isDead = true;
        }
    }

    destroySelf() {
        // Remove pop ups
        if (this.scene.towerPopUp?.towerId === Tower.placedTowers.indexOf(this)) {
            this.scene.closePopUp()
        }

        // Remove from the array of placed towers
        const index = Tower.placedTowers.indexOf(this);
        if (index !== -1) {
            Tower.placedTowers.splice(index, 1);
        }

        // Remove all projectiles of the tower
        this.projectiles.forEach(projectile => projectile.destroySelf());
        this.projectiles = []; // Clear the projectiles array

        this.stop(); // Stop animations
        this.scene.tweens.killTweensOf(this); // Stop tweens
        this.destroy(); // Destroy the object

    }
}