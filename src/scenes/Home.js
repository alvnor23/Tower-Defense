export class Home extends Phaser.Scene {
    constructor() {
        super('Home'); // scene key - key is used for reference, much like variable names
    }

    preload() { // Loads images, music
        this.load.image('background', 'assets/backgrounds/1/bamboo bridge.png');
        this.load.bitmapFont('menuFont', 'assets/fonts/menu_font/menu_font0.png', 'assets/fonts/menu_font/menu_font.xml.fnt');
        this.load.image('startButton', 'assets/buttons/simple/6.png');
    }

    create() { // Displays objects on screen
        this.gameWidth = this.sys.game.config.width;
        this.gameHeight = this.sys.game.config.height;

        this.background = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'background').setDisplaySize(this.gameWidth, this.gameHeight);

        this.menuText = this.add.bitmapText(this.gameWidth / 2, this.gameHeight / 2, 'menuFont', "TOWER DEFENSE", 104);
        this.menuText.setOrigin(0.5).setTintFill(0xffffff); // center and make white

        // playButton
        this.playButton = this.add.image(0, 0, 'startButton'); // 0, 0 is center of container
        this.playButton.setDisplaySize(720, 480);
        this.playButtonText = this.add.bitmapText(0, -15, 'menuFont', 'Play', 85).setOrigin(0.5); // move back a little for middle of non-shadowed area of button

        // Since playButton img is bigger than the button, a container is needed for interactivity
        this.buttonContainer = this.add.container(this.gameWidth / 2, this.gameHeight * (2 / 3)).setAlpha(0);
        this.buttonContainer.setSize(this.playButton.displayWidth * (5 / 6), this.playButton.displayHeight * (1 / 3));
        this.buttonContainer.setInteractive();
        this.buttonContainer.add([this.playButton, this.playButtonText]);


        this.buttonContainer.on('pointerdown', () => {
            // this.buttonContainer.setInteractive(false);
            this.tweens.add({
                targets: [this.buttonContainer, this.menuText],
                y: -500,
                alpha: 0,
                ease: 'Power2.easeInOut',
                duration: 1000,
                onComplete: () => { // Ensures animation is done before transitioning
                    this.scene.start('GameScene');
                }
            });
        });

        // Adding hover effect
        this.buttonContainer.on('pointerover', () => {
            this.playButton.setTint(0xCCCCCC);
        });

        this.buttonContainer.on('pointerout', () => {
            this.playButton.clearTint();
        });


        // data passed through if exiting to home screen to skip intro
        const { skipIntro } = this.scene.settings.data || {};

        if (!skipIntro) {
            this.tweens.chain({
                tweens: [
                    // ease in menu text
                    {
                        targets: this.menuText,
                        y: '-=250',
                        ease: 'Cubic.easeIn',
                        duration: 3000
                    },
                    // make play button visible
                    {
                        targets: this.buttonContainer,
                        alpha: 1,
                        duration: 1000,
                        ease: 'linear',
                        delay: 300
                    }
                ]
            });
        } else {
            this.menuText.y -= 250;
            this.buttonContainer.setAlpha(1);
        }
    }
}