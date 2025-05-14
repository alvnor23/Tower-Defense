import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';

// TODO: maybe make into class ProjectileEnemy? if so mb also add more projectile enemies
export class ProjectileEnemy extends Enemy { // child class to Enemy
    constructor(scene, x, y, row, texture, properties) {
        super(scene, x, y, row, texture, properties);

        this.hitFrame = properties.hitFrame || 6;
        this.projectiles = [];
    }

    attack() { // individual attack method overrides one in parent class
        this.isAttacking = true;
        this.targetTower = this.towerInRange();

        this.play(this.textureKey + '_attack');

        // Fire a projectile on provided "hitframe" of the attack animation
        this.on('animationupdate', (animation, frame) => {
            if (frame.index === this.hitFrame && this.isAttacking && !this.isDead) {
                if (this.targetTower && !this.targetTower.isDead) {
                    this.shootProjectile();
                } else {
                    this.stopAttackingAndMove();
                }
            }
        });
    }

    shootProjectile() {
        if (!this.targetTower || this.targetTower.isDead) {
            this.stopAttackingAndMove(); // Don't shoot if there's no target
            return;
        }
        const projectile = new Projectile(this.scene, this.x, this.y, 'mageOrb', 20, 20, 300, this);
        this.projectiles.push(projectile);
    }

    // override destruction method to ensure destruction of projectiles as well
    destroySelf() {
        // Remove from the array of enemies
        const index = Enemy.allEnemies.indexOf(this);
        if (index !== -1) {
            Enemy.allEnemies.splice(index, 1);
        }

        // Remove all projectiles of the enemy
        this.projectiles.forEach(projectile => projectile.destroySelf());
        this.projectiles = []; // Clear the projectiles array

        this.stop(); // Stop animations
        this.scene.tweens.killTweensOf(this); // Stop tweens
        this.destroy(); // Destroy the object
    }

}