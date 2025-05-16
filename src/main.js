import { Home } from './scenes/Home.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Tower Defense',
    description: '',
    parent: 'game-container',
    width: 1920,
    height: 1080,
    backgroundColor: '#000000',
    pixelArt: true,
    scene: [
        GameScene // change so Home first
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
