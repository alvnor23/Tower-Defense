import { Tower } from './Tower.js';

export class Enemy extends Phaser.GameObjects.Sprite {

    static allEnemies = [];

    constructor(scene, x, y, row, texture, properties) {
        super(scene, x, y, texture); // properties for sprite
        this.sprite = scene.add.existing(this);
        this.scene = scene;

        // sometimes texture becomes texture object instead of just the key (string) and then key has to be extracted
        this.textureKey = (typeof texture === 'string') ? texture : texture.key;

        // console.log(properties);
        this.speed = properties.speed || 80; // pixels per second
        this.range = properties.range || 1;
        this.damage = properties.damage || 20;
        this.health = properties.health || 100;
        this.money = properties.money || 200;
        this.points = properties.points || 100;
        this.width = properties.width || 100;
        this.hitableWidth = properties.hitableWidth || this.width;
        this.height = properties.height || 100;
        this.hitFrame = properties.hitFrame || 6;
        this.row = row;

        this.setDepth(scene.towersDepth + this.row + 0.5); // 0.5 to ensure it's above tower if on same tile
        this.gameWidth = this.scene.sys.game.config.width;

        this.isAttacking = false;
        this.isDead = false;
        this.paused = false;

        const runFrames = properties.runFrames || 6;
        const attackFrames = properties.attackFrames || 6;
        const deathFrames = properties.deathFrames || 6;

        const startRun = properties.reverseAnimOrder ? runFrames - 1 : 0;
        const endRun = properties.reverseAnimOrder ? 0 : runFrames - 1;

        const startAttack = properties.reverseAnimOrder ? attackFrames - 1 : 0;
        const endAttack = properties.reverseAnimOrder ? 0 : attackFrames - 1;

        const startDeath = properties.reverseAnimOrder ? deathFrames - 1 : 0;
        const endDeath = properties.reverseAnimOrder ? 0 : deathFrames - 1;



        // Animations added to scene if not already added
        // running animation
        if (!scene.anims.exists(this.textureKey + '_run')) {
            scene.anims.create({
                key: this.textureKey + '_run',
                // frames made from atlas require a key and a config of the files (sprite images) the json searches for
                frames: scene.anims.generateFrameNames(this.textureKey + '_run', { start: startRun, end: endRun, zeroPad: 0, prefix: '', suffix: '.png' }),
                frameRate: this.speed / 16, // animation speed in relation to speed of enemy
                repeat: -1
            });
        }

        // attacking animation
        if (!scene.anims.exists(this.textureKey + '_attack')) {
            scene.anims.create({
                key: this.textureKey + '_attack',
                frames: scene.anims.generateFrameNames(this.textureKey + '_attack', { start: startAttack, end: endAttack, zeroPad: 0, prefix: '', suffix: '.png' }),
                frameRate: 5,
                repeat: -1
            });
        }

        // death animation
        if (!scene.anims.exists(this.textureKey + '_death')) {
            scene.anims.create({
                key: this.textureKey + '_death',
                frames: scene.anims.generateFrameNames(this.textureKey + '_death', { start: startDeath, end: endDeath, zeroPad: 0, prefix: '', suffix: '.png' }),
                frameRate: 3,
            });
        }

        Enemy.allEnemies.push(this);
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
                    this.attack()
                };
            },
            onComplete: () => {
                this.scene.healthText.setText(`Health: ${this.scene.health -= 20}`);
                this.destroySelf();
            }
        });
    }

    // returns tower in range if it exists, otherwise undefined
    towerInRange() {
        const tower = Tower.placedTowers.find(tower => {
            const dx = tower.x - this.x;
            const inRange = dx >= 0 && dx <= this.scene.tileWidth * this.range;

            return inRange && this.row == tower.row;
        });
        return tower;
    }

    togglePause() {
        this.paused = !this.paused;

        if (this.moveTween) {
            this.moveTween.paused = this.paused;
        }

        if (this.anims.currentAnim) {
            if (this.paused) {
                this.anims.pause();
            } else {
                this.anims.resume();
            }
        }
    }

    attack() {
        this.isAttacking = true;
        this.targetTower = this.towerInRange();

        this.play(this.textureKey + '_attack');

        this.off("animationupdate");
        this.on('animationupdate', (animation, frame) => {
            if (this.paused) return;
            if (frame.index === this.hitFrame) {
                if (this.targetTower && !this.targetTower.isDead) {
                    this.targetTower.hurt(this.damage);
                }
            }
            if (this.targetTower?.isDead) {
                this.stopAttackingAndMove();
            }
        });
    }

    stopAttackingAndMove() {
        this.isAttacking = false;
        this.targetTower = null;
        this.anims.stop();
        this.move();
    }

    hurt(damage) {
        this.scene.tweens.add({
            targets: this,
            tint: { from: 0xffffff, to: 0xff0000 }, // White to red
            yoyo: true, // Returns to previous tint/color/condition
            duration: 300
        });

        this.health -= damage;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // add money and points
        this.scene.money += this.money;
        this.scene.points += this.points;

        this.isDead = true;
        this.togglePause();
        this.play(this.textureKey + '_death');
        this.once('animationcomplete', () => { this.destroySelf() });
    }

    // Method for very destroying the enemy
    destroySelf() {
        // Remove from the array of enemies
        const index = Enemy.allEnemies.indexOf(this);
        if (index !== -1) {
            Enemy.allEnemies.splice(index, 1);
        }

        this.stop(); // Stop animations
        this.scene.tweens.killTweensOf(this); // Stop tweens
        this.destroy(); // Destroy the object
    }
}