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
        GameScene // change so Home first, maybe split game scene into tutorial and game scene
        // Tutorial should among other things show what tower does what, maybe there should also be a symbol
        // near the tower

        // TODO: maybe add settings and the option to swap map if other bridges have the same height and y-pos
        // in settings there could also be stats or stats could be somewhere else (enemies - killcount etc)

        // TODO: maybe make point of the game not letting 5(?) monster pass to the other side

        // turn pause icon into play on the startbutton and add hint/textbox + arrow that shows "click to start next round" (jumping)
        // with alternative in settings (add in-game settings both icon and Esc) with auto-start next round

        // TODO: add exit/quit button as well and when returning to home screen, maybe skip tween animation
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
