import { Tower } from '../classes/Tower.js';
import { Enemy } from '../classes/Enemy.js';
import { ProjectileEnemy } from '../classes/ProjectileEnemy.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene'); // calls parent constructor with identifier/key 'GameScene',
        // allowing it to be referenced and managed by Phaser's Scene Manager
    }

    preload() { // Loads images etc
        this.load.image('background', 'assets/backgrounds/1/bamboo bridge.png');

        // fonts
        this.load.bitmapFont('menuFont', 'assets/fonts/menu_font/menu_font0.png', 'assets/fonts/menu_font/menu_font.xml.fnt');

        // buttons
        this.load.image('playButton', 'assets/buttons/play.png');
        this.load.image('pauseButton', 'assets/buttons/pause.png');
        this.load.image('bin', 'assets/buttons/bin.png');
        this.load.image('upgrade', 'assets/buttons/upgrade.png');
        this.load.image('sell', 'assets/buttons/sell.png');
        this.load.image('close', 'assets/buttons/close.png');
        this.load.image('deathScreenButton', 'assets/buttons/simple/12.png'); // fix when removing useless media

        // coin
        this.load.image('coin', 'assets/coin.png');

        // towers
        this.load.spritesheet('archerTower', 'assets/towers/1.png', { frameWidth: 70, frameHeight: 130 });
        this.load.spritesheet('mageTower', 'assets/towers/3.png', { frameWidth: 70, frameHeight: 130 });
        this.load.spritesheet('fireTower', 'assets/towers/4.png', { frameWidth: 70, frameHeight: 130 });

        // projectiles
        this.load.image('magic', 'assets/projectiles/magic.png'); // for mage Tower
        this.load.image('mageOrb', 'assets/projectiles/mageOrb.png'); // for mage enemy
        this.load.image('arrow', 'assets/projectiles/arrow.png');
        this.load.image('fire', 'assets/projectiles/fire.png');

        // rat
        this.load.atlas('rat_run', 'assets/enemies/rat/run/texture.png', 'assets/enemies/rat/run/texture.json');
        this.load.atlas('rat_attack', 'assets/enemies/rat/attack/texture.png', 'assets/enemies/rat/attack/texture.json');
        this.load.atlas('rat_death', 'assets/enemies/rat/death/texture.png', 'assets/enemies/rat/death/texture.json');

        // horseman
        this.load.atlas('horseman_run', 'assets/enemies/horseman/run/texture.png', 'assets/enemies/horseman/run/texture.json');
        this.load.atlas('horseman_attack', 'assets/enemies/horseman/attack/texture.png', 'assets/enemies/horseman/attack/texture.json');
        this.load.atlas('horseman_death', 'assets/enemies/horseman/death/texture.png', 'assets/enemies/horseman/death/texture.json');

        this.load.atlas('mage_run', 'assets/enemies/mage/fly/texture.png', 'assets/enemies/mage/fly/texture.json');
        this.load.atlas('mage_attack', 'assets/enemies/mage/attack/texture.png', 'assets/enemies/mage/attack/texture.json');
        this.load.atlas('mage_death', 'assets/enemies/mage/death/texture.png', 'assets/enemies/mage/death/texture.json');

        // skeleton
        this.load.atlas('skeleton_run', 'assets/enemies/skeleton/run/texture.png', 'assets/enemies/skeleton/run/texture.json');
        this.load.atlas('skeleton_attack', 'assets/enemies/skeleton/attack/texture.png', 'assets/enemies/skeleton/attack/texture.json');
        this.load.atlas('skeleton_death', 'assets/enemies/skeleton/death/texture.png', 'assets/enemies/skeleton/death/texture.json');

        // orc berserk
        this.load.atlas('orcBerserk_run', 'assets/enemies/OrcBerserk/walk/texture.png', 'assets/enemies/OrcBerserk/walk/texture.json');
        this.load.atlas('orcBerserk_attack', 'assets/enemies/OrcBerserk/attack/texture.png', 'assets/enemies/OrcBerserk/attack/texture.json');
        this.load.atlas('orcBerserk_death', 'assets/enemies/OrcBerserk/death/texture.png', 'assets/enemies/OrcBerserk/death/texture.json');

        // orc warrior
        this.load.atlas('orcWarrior_run', 'assets/enemies/OrcWarrior/walk/texture.png', 'assets/enemies/OrcWarrior/walk/texture.json');
        this.load.atlas('orcWarrior_attack', 'assets/enemies/OrcWarrior/attack/texture.png', 'assets/enemies/OrcWarrior/attack/texture.json');
        this.load.atlas('orcWarrior_death', 'assets/enemies/OrcWarrior/death/texture.png', 'assets/enemies/OrcWarrior/death/texture.json');

        // samurai
        this.load.atlas('samurai_run', 'assets/enemies/samurai/walk/texture.png', 'assets/enemies/samurai/walk/texture.json');
        this.load.atlas('samurai_attack', 'assets/enemies/samurai/attack/texture.png', 'assets/enemies/samurai/attack/texture.json');
        this.load.atlas('samurai_death', 'assets/enemies/samurai/death/texture.png', 'assets/enemies/samurai/death/texture.json');
    }

    create() { // Displays objects on screen
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.gameHeight = this.sys.game.config.height;
        this.gameWidth = this.sys.game.config.width;
        this.menuColor = 0x0000066;
        this.highlightMenuColor = 0x2222cc;

        // Start values
        this.health = 100;
        this.money = 600;
        this.round = 0;
        this.points = 0;
        this.highScore = this.registry.get('highScore') || 0; // either 0 or previous high score
        this.dead = false;
        this.gameState = "inactive";

        this.gridRows = 5;
        this.gridColumns = 12;
        this.tileWidth = this.gameWidth / this.gridColumns;
        this.bridgeY = 16 * this.gameHeight / 50;
        this.bridgeHeight = 8 * this.gameHeight / 20;
        this.tileHeight = this.bridgeHeight / this.gridRows;

        // depth levels
        this.behindTowersDepth = 0
        this.towersDepth = 50
        this.aheadTowersDepth = 100;
        this.deathScreenDepth = 200;

        // Infobar along the bottom
        const infoBarHeight = this.gameHeight / 10;
        this.infoBar = this.add.rectangle(this.gameWidth / 2, this.gameHeight - infoBarHeight / 2,
            this.gameWidth, infoBarHeight, this.menuColor, 1);

        // items placed in infoBar get x and y position later
        this.startButton = this.createButton(0, 0, 'playButton', { width: 90, height: 90 },
            () => {
                const buttonImg = this.startButton.list[0];
                if (buttonImg.texture.key == "playButton") { // == game is paused or not started
                    buttonImg.setTexture('pauseButton');

                    // unpause enemies and towers if paused, if game inactive start it
                    if (this.gameState == "paused") {
                        this.pauseGame();
                    } else {
                        this.round++;
                        console.log("start " + this.round);
                        this.applyLevel(this.round);
                        Enemy.allEnemies.forEach(enemy => enemy.move());
                    }

                    this.gameState = "playing";
                } else { // == game is playing
                    // pause the game
                    buttonImg.setTexture('playButton');
                    this.gameState = "paused";

                    // pause enemies and towers
                    Enemy.allEnemies.forEach(enemy => enemy.togglePause());
                    Tower.placedTowers.forEach(tower => tower.togglePause());
                }
            });
        this.healthText = this.add.text(0, 0, `Health: ${this.health}`, { fontSize: '50px' }).setOrigin(0, 0.5);
        this.moneyText = this.add.text(0, 0, `Money: ${this.convertToK(this.money)}`, { fontSize: '50px' }).setOrigin(0, 0.5);
        this.roundText = this.add.text(0, 0, `Round: ${this.round}`, { fontSize: '50px' }).setOrigin(0, 0.5);
        this.pointsText = this.add.text(0, 0, `Points: ${this.convertToK(this.points)}`, { fontSize: '50px' }).setOrigin(0, 0.5);

        this.infoBarItems = this.add.container(this.gameWidth / 15, this.gameHeight - infoBarHeight / 2, [
            this.startButton, this.healthText, this.moneyText, this.roundText, this.pointsText
        ]);
        this.adjustInfoX(); // position info elements


        this.shopWidth = 300;
        this.shopExtensionWidth = 70;

        // background
        this.background = this.add.image(centerX, centerY - infoBarHeight / 2, 'background')
            .setDisplaySize(this.gameWidth, this.gameHeight - infoBarHeight)
            .setDepth(this.behindTowersDepth - 200);


        // shop for towers
        this.shop = this.add.rectangle(this.gameWidth + this.shopWidth / 2, // x and y is for the center
            this.gameHeight / 2 - infoBarHeight, this.shopWidth, this.gameHeight, this.menuColor, 0.7);
        this.shop.setDepth(this.aheadTowersDepth);
        this.shopActive = false;

        // clickable bar extending the shop and toggling it
        this.shopExtension = this.add.rectangle(this.gameWidth - this.shopExtensionWidth / 2,
            this.gameHeight / 2 - infoBarHeight, this.shopExtensionWidth, this.gameHeight, this.menuColor, 0.7);
        this.shopExtension.setInteractive({ cursor: 'pointer' });
        this.shopExtension.setDepth(this.aheadTowersDepth);

        // Arrow indicating shop can be shown/hidden. part of shopExtension
        this.shopArrowWidth = this.shopExtensionWidth / 2;
        this.shopArrowHeight = 80;
        this.shopArrow = this.add.triangle(
            this.gameWidth - 4 * this.shopExtensionWidth / 5,
            this.gameHeight / 2,
            this.shopArrowWidth, -this.shopArrowHeight / 2, // top point
            this.shopArrowWidth, this.shopArrowHeight / 2, // bottom point
            0, 0, // middle point
            0xffffff, 1
        ).setOrigin(0, 0.5).setDepth(this.aheadTowersDepth);

        this.shopExtension.on("pointerover", () => {
            this.shopExtension.setFillStyle(this.highlightMenuColor, 0.7);
        });

        this.shopExtension.on("pointerout", () => {
            this.shopExtension.setFillStyle(this.menuColor, 0.7);
        });

        this.shopExtension.on("pointerdown", () => { this.toggleShop() });

        // Tower proportions (given in preload)
        const towerFrameWidth = 70;
        const towerFrameHeight = 130;

        this.towerShopWidth = this.shop.width * 0.5;
        this.towerShopHeight = (towerFrameHeight / towerFrameWidth) * (this.towerShopWidth); // Maintain aspect ratio
        this.towerWidthInGame = 120;
        this.towerHeightInGame = (towerFrameHeight / towerFrameWidth) * (this.towerWidthInGame); // Maintain aspect ratio

        this.towers = this.add.group([ // groups are like arrays but make managing similar game objects easier
            new Tower(this, 0, 0, 'archerTower', {
                health: 100, range: 10, damage: 5, shootSpeed: 5, projectileTexture: 'arrow'
            }),
            new Tower(this, 0, 0, 'fireTower', {
                health: 100, range: 4, damage: 20, shootSpeed: 3, projectileTexture: 'fire'
            }),
            new Tower(this, 0, 0, 'mageTower', {
                health: 100, range: 6, damage: 50, shootSpeed: 2, projectileTexture: 'magic', projectileWidth: 50, projectileHeight: 25
            }),
        ]);

        this.shopTowers = this.add.container(this.gameWidth + this.shopWidth / 2, towerFrameHeight, this.towers.getChildren())
            .setDepth(this.aheadTowersDepth);

        Tower.shopTowers = []; // safely add new towers to the array
        this.shopTowers.list.forEach(shopTower => {
            Tower.shopTowers.push(shopTower);
            shopTower.input.cursor = 'grab';
            shopTower.setDisplaySize(this.towerShopWidth, this.towerShopHeight);
        });
        this.shopTowerDragged = false;

        // Grid for shop
        this.shopGrid = Phaser.Actions.GridAlign(this.shopTowers.list, {
            width: 1,
            height: this.shopTowers.list.length,
            cellWidth: this.towerShopWidth,
            cellHeight: this.towerShopHeight,
            // Adjust misalignment caused by GridAlign
            x: - towerFrameWidth / 2,
            y: - towerFrameHeight / 2
        });

        // tower prices
        this.towerPrices = {
            'archerTower': 120,
            'fireTower': 700,
            'mageTower': 2000
        }

        // price tags
        for (let i = 0; i < this.shopTowers.list.length; i++) {
            const tower = this.shopTowers.list[i];

            const bg = this.add.graphics().fillStyle(0x00000, 0.9);
            const priceTagHeight = 50;
            const priceTagWidth = this.towerShopWidth - 20 * 2; // 20 is about adjustment for tower image discrepancy
            bg.fillRoundedRect(0, 0, priceTagWidth, priceTagHeight,
                { tl: 10, tr: 10, bl: 0, br: 0 });

            // coin image
            const coin = this.add.image(0, 0, 'coin').setScale(0.02, 0.02).setOrigin(0, 0.5);
            coin.x = 5;
            coin.y = priceTagHeight / 2;

            let price = this.towerPrices[tower.texture.key];

            // Add price text
            const priceText = this.add.text(0, 0, `${this.convertToK(price)}`, {
                fontSize: '40px',
                fill: '#ff0000'
            }).setOrigin(0.5, 0);
            priceText.x = coin.x + 10 + (priceTagWidth - coin.x) / 2;
            priceText.y = priceText.height / 4 - 2;
            priceText.name = 'priceText'; // allow for referencing

            const priceTagX = this.shopTowers.x - priceTagWidth / 2;
            const priceTagY = tower.y + this.towerShopHeight - 20 - priceTagHeight;

            const priceTag = this.add.container(priceTagX, priceTagY, [bg, coin, priceText]);
            priceTag.setDepth(this.aheadTowersDepth);

            // store price tags
            tower.priceTag = priceTag;
        }

        // obstuction zone in middle of the screen for tower from shop to be discarded in instead of placed
        this.obstructionZone = this.add.graphics();
        this.obstructionZone.fillStyle(0xff00000, 0.8);
        this.obstructionZoneHeight = this.gameHeight / 4;
        this.obstructionZoneWidth = this.gameWidth / 5;
        this.obstructionZone.fillRoundedRect(0, -this.obstructionZoneHeight, this.obstructionZoneWidth,
            this.obstructionZoneHeight, { tl: 0, tr: 0, bl: 0, br: 50 });
        // hit area for obstruction zone
        this.obstructionZone.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.obstructionZoneWidth,
            this.obstructionZoneHeight), Phaser.Geom.Rectangle.ContainsRect); // necessary?

        // bin icon for obstruction zone
        this.binIcon = this.add.image(this.obstructionZoneWidth / 2, -this.obstructionZoneHeight / 2, 'bin').setDisplaySize(120, 120);

        // Array of lines making grid for the game objects to be placed on
        // All lines alpha values will be toggled/tweened when shop tower is purchased
        this.gameGridLines = [];
        this.gameGridActive = false;

        this.gameGridLineWidth = 5;

        // horizontal lines/rows for game grid
        for (let i = 0; i <= this.gridRows; i++) {
            const y = this.bridgeY + i * this.tileHeight;
            const line = this.add.line(0, y, 0, 0, this.gameWidth * 2, 0, 0x000000)
                .setAlpha(0).setLineWidth(this.gameGridLineWidth).setDepth(this.behindTowersDepth + 10);
            this.gameGridLines.push(line);
        }

        // vertical lines/columns for game grid
        for (let i = 0; i <= this.gridColumns; i++) {
            const x = i * this.tileWidth;
            const line = this.add.line(x, this.bridgeY + this.bridgeHeight / 2, 0, 0, 0, this.bridgeHeight, 0x000000)
                .setAlpha(0).setLineWidth(this.gameGridLineWidth).setDepth(this.behindTowersDepth + 10);
            this.gameGridLines.push(line);
        }


        // Pick up tower
        Tower.shopTowers.forEach(tower => {
            tower.on("pointerdown", (pointer) => {
                if (!this.selectedTower && tower.purchasable && this.shopActive) {
                    this.selectedTower = new Tower(this, pointer.x, pointer.y, tower.texture.key, tower.properties);
                    this.selectedTower.setDisplaySize(this.towerWidthInGame, this.towerHeightInGame);
                    this.selectedTower.setDepth(this.aheadTowersDepth + 10); // shown clearly when placing.
                    this.selectedTower.input.cursor = 'grab';
                    this.selectedTower.placed = false;

                    this.dragStartTime = Date.now();

                    // Hide shop, show grid and show obstruction zone
                    this.toggleShop();
                    this.toggleGameGrid();
                    this.toggleObstructionZone();
                }
            });
        });

        // Dragging selected tower from shop
        this.input.on("pointermove", (pointer) => {
            if (this.selectedTower) {
                // Create the tower when mouse starts moving
                this.selectedTower.x = pointer.x;
                this.selectedTower.y = pointer.y;

                this.shopExtension.disableInteractive(); // disable shop temporarily

                let tileX;
                let tileY;
                let towerRow;
                let towerColumn; // Nothing utilizes column yet
                [tileX, tileY, towerRow, towerColumn] = this.tileBelowTowerDrag(); // x, y, row, column

                this.tileCenterBelow = [tileX, tileY];
                this.selectedTower.row = towerRow;
                this.selectedTower.column = towerColumn;

                // highlight tower range from the tile its hovering.
                this.highlightTowerRange(this.selectedTower, tileX, tileY);

                const towerBounds = this.selectedTower.getBounds();
                const graphicsBounds = this.obstructionZone.input.hitArea;

                // remove tower if in 80 % in obstuction zone
                if (this.checkOverlap(towerBounds, graphicsBounds, 0.8)) {
                    console.log("INTERSECTION");
                    this.toggleGameGrid();
                    this.toggleObstructionZone();
                    Tower.placedTowers.pop();
                    this.selectedTower.destroy();
                    this.tileCenterBelow = null;
                    this.selectedTower = null;
                    this.shopExtension.setInteractive(); // make shop interactive again
                }
            }
        });

        // Place tower
        this.input.on("pointerdown", () => {
            // Small delay is added so putting tower down doesn't coincide with picking it up
            if (this.selectedTower && this.validTowerPlace() && (Date.now() - this.dragStartTime > 50)) {
                this.shopExtension.setInteractive(); // make shop interactive again

                this.selectedTower.x = this.tileCenterBelow[0];
                this.selectedTower.y = this.tileCenterBelow[1] - this.towerHeightInGame / 2 + 20; // adjusted for space in image
                console.log(`Tower placed at (${this.selectedTower.x}, ${this.selectedTower.y})`);
                Tower.placedTowers.push(this.selectedTower);
                this.selectedTower.setDepth(this.towersDepth + this.selectedTower.row);
                this.selectedTower.input.cursor = "pointer";

                const localTower = this.selectedTower;
                localTower.on('pointerdown', () => {
                    this.closePopUp(); // always remove previous pop-up
                    this.createPopUp(localTower);
                    this.highlightTowerRange(localTower, localTower.x, localTower.y + localTower.height / 2);
                });

                // change cursor to pointer on hover
                localTower.on("pointerover", () => this.input.setDefaultCursor("pointer"));
                localTower.on("pointerout", () => this.input.setDefaultCursor("default"));

                // deduct money spent
                const cost = this.towerPrices[this.selectedTower.texture.key];
                this.money -= cost;

                // remove highlighting
                this.tileSquares?.forEach(square => square.destroy());

                // Reset selected tower
                this.toggleGameGrid();
                this.toggleObstructionZone();
                this.tileCenterBelow = null;
                this.selectedTower = null;
            }
        });

        // Close potential tower options pop-up when clicking outside it
        this.input.on('pointerdown', (pointer) => {
            if (this.isPopUpOpen && this.towerPopUp) {
                const popUpBounds = new Phaser.Geom.Rectangle(this.towerPopUp.x, this.towerPopUp.y, this.popUpWidth, this.popUpWidth);
                const popUpTowerBounds = Tower.placedTowers[this.towerPopUp.towerId]?.getBounds();

                if (popUpTowerBounds && !popUpBounds.contains(pointer.x, pointer.y) && !popUpTowerBounds.contains(pointer.x, pointer.y)) {
                    this.towerPopUp.destroy(true); // destroying container destroys its children
                    this.towerPopUp = null;
                    this.isPopUpOpen = false;

                    // remove range highlighting
                    this.tileSquares?.forEach(square => square.destroy()); // destroy existing squares
                }
            }
        });


        this.rowOccupancy = {};
        for (let i = 1; i <= this.gridRows; i++) {
            this.rowOccupancy[`${i}`] = 0;
        }

        // Logic for levels
        this.levels = [

            // develop system where one "troop" must be behind another
            // maybe by saying all rows have an extra occupancy for the troops
            // that could also allow more spacing between enemies

            // also definetly make seperate classes for enemies, especially does with different abilites
            // than just punch so there is some more variation
            // orc could be giants and have more health and damage, but be slower

            // test level first
            // { orcWarriors: 1, orcBerserks: 1, rats: 1, horsemen: 1, skeletons: 1, samurais: 1, mages: 1},
            // { samurais: 1 },
            { rats: 4 },
            { rats: 3, horsemen: 2 },
            { horsemen: 4, rats: 3 },
            { horsemen: 9, rats: 2, skeletons: 3 },
            { skeletons: 7 }
            // rats, horsemen, mages, skeleton
            // does orc_berserk and orc_warrior work?
            // also add le samurai boss
        ];

        // Enemies added as projectile enemies will be of the ProjectileEnemy class (subclass of Enemy)
        this.projectileEnemies = [
            "mage"
        ];        
    }

    update(t, dt) { // game loop following continuous actions

        // make towers which you can afford purchasable
        for (const [towerType, cost] of Object.entries(this.towerPrices)) {
            const shopTower = Tower.shopTowers.find(tower => tower.texture.key == towerType);
            const priceText = shopTower.priceTag.list.find(child => child.name == 'priceText');
            if (!priceText) continue; // skips function loop, useful when game somtimes hasn't fully initialized in create
            if (this.money >= cost) {
                // tower purchsable
                priceText.setStyle({ fill: '#ffffff' });
                shopTower.purchasable = true;
                shopTower.input.cursor = "grab";
                shopTower.clearTint();
            } else if (this.money < cost) {
                // tower not purchsable
                priceText.setStyle({ fill: '#ff0000' });
                shopTower.purchasable = false;
                shopTower.input.cursor = "default";
                shopTower.setTint(0x000000);
            }
        }

        // Lose check
        if (this.health <= 0 && !this.dead) {
            this.dead = true;
            this.health = 0;
            this.endGame();
        }

        // If enemies cleared, allow next wave to be started
        if (Enemy.allEnemies.length == 0) {
            this.startButton.list[0].setTexture("playButton");
            this.gameState = "inactive"; // allows start button to begin next wave
        }

        this.updateAllText();
        // adjust text x positions for text getting longer
        this.adjustInfoX();

        // Update existing towers
        Tower.placedTowers?.forEach(tower => tower?.update?.());
    }

    // Pause game, disable game interactivity, show death screen 
    endGame() {
        this.pauseGame();

        // disable other interactivity
        this.startButton.disableInteractive();
        this.stopButton.disableInteractive();
        this.shopExtension.disableInteractive();

        // tint overlay 
        this.deathScreenOverlay = this.add.rectangle(this.gameWidth / 2, this.gameHeight / 2, this.gameWidth, this.gameHeight, 0x000000, 0.4)
            .setDepth(this.deathScreenDepth);

        // 'You died' text
        this.deathScreenText = this.add.text(this.gameWidth / 2, this.gameHeight / 7, 'You Died', {
            fontSize: '200px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(this.deathScreenDepth);

        // scores
        const score = this.add.text(0, 0, `Score: ${this.points}`, { fontSize: '80px', color: 'white' }).setOrigin(0.5);
        const highScoreText = (this.points > this.highScore) ? `NEW High Score: ${this.points}` : `High Score: ${this.highScore}`;
        const highScore = this.add.text(0, 100, highScoreText, { fontSize: '60px', color: 'yellow' }).setOrigin(0.5);

        // update high score
        this.highScore = Math.max(this.points, this.highScore);
        this.registry.set('highScore', this.highScore);

        // score container
        this.deathSceneScores = this.add.container(this.gameWidth / 2, this.gameHeight / 3, [score, highScore])
            .setDepth(this.deathScreenDepth);

        // buttons
        const buttonWidth = this.gameWidth / 3;
        const buttonHeight = 300;
        const bounds = {
            width: buttonWidth,
            height: buttonHeight,
            interactiveWidth: 0.83,
            interactiveHeight: 0.35
        };

        const restartButtonX = this.gameWidth / 2;
        const restartButtonY = this.gameHeight * 3 / 5;

        const restartText = this.add.text(0, 0, 'Restart', { fontSize: '56px', color: '#000000' }).setOrigin(0.5);
        const restartButton = this.createButton(0, 0, 'deathScreenButton', bounds,
            () => {
                // remove overlay
                this.deathScreenOverlay.destroy();
                this.deathScreenText.destroy();
                this.deathSceneScores.destroy();
                this.deathScreenButtons.destroy();

                // restore interactity
                this.startButton.setInteractive();
                this.stopButton.setInteractive();
                this.shopExtension.setInteractive();

                // restart
                this.resetGame();

            }).add(restartText);

        const homeText = this.add.text(0, 0, 'Home Screen', { fontSize: '56px', color: '#000000' }).setOrigin(0.5);
        const homeButton = this.createButton(0, 150, 'deathScreenButton', bounds,
            () => {
                this.resetGame(); // for safe exit
                this.scene.start('Home', { skipIntro: true });
            }).add(homeText);

        // button container
        this.deathScreenButtons = this.add.container(restartButtonX, restartButtonY, [restartButton, homeButton])
            .setDepth(this.deathScreenDepth);
    }

    pauseGame() {
        Enemy.allEnemies.forEach(enemy => enemy.togglePause());
        Tower.placedTowers.forEach(tower => tower.togglePause());
    }

    // convert strings of 1000's to k
    convertToK(num) {
        num = parseInt(num);
        if (num < 1000) return num;

        let result = (num / 1000).toFixed(1); // returns as string
        if (result.endsWith('.0')) {
            // if no decimals needed
            result = result.split('.')[0]; // keep only part before decimals
        }
        return result + 'k';
    }

    // adjust text x positions info in infobar
    adjustInfoX() {
        const infoSpace = this.gameWidth / 30;

        for (let i = 1; i < this.infoBarItems.list.length; i++) {
            let current = this.infoBarItems.list[i];
            let previous = this.infoBarItems.list[i - 1];
            current.x = previous.x + previous.displayWidth + infoSpace;
        }
    }

    createPopUp(tower) {
        // don't create pop up for tower that already has one
        if (this.towerPopUp?.towerId == Tower.placedTowers.indexOf(tower)) return;

        this.popUpWidth = this.gameWidth / 7;
        this.popUpHeight = this.gameHeight / 4;

        const popUpY = tower.y - this.popUpHeight / 2;
        let popUpX = tower.x + this.towerWidthInGame / 2;
        // reposition x if pop up goes beyond the right of the screen
        if (popUpX + this.popUpWidth > this.gameWidth) {
            popUpX = tower.x - this.towerWidthInGame / 2 - this.popUpWidth;
        }

        const popUpBg = this.add.graphics()
            .fillStyle(0x888855, 1)
            .fillRoundedRect(0, 0, this.popUpWidth, this.popUpHeight, 15);


        const btnHeight = this.popUpHeight / 7;
        const btnWidth = this.popUpWidth * 0.2;
        const leftMargin = this.popUpWidth / 10;
        const spacingY = (this.popUpHeight - btnHeight * 5) / 6 // what is left of the height divided evenly

        // Rows for stats one can upgrade
        const rowProperties = { x: 0, y: 0, tower, fontSize: 20, btnFontSize: 30, textColor: "black", btnWidth, btnHeight };
        const rangeRow = this.createStatRow("range", rowProperties);
        const damageRow = this.createStatRow("damage", rowProperties);
        const shootSpeedRow = this.createStatRow("shootSpeed", rowProperties);
        const healthRow = this.createStatRow("health", rowProperties);

        const gridItems = [rangeRow, damageRow, shootSpeedRow, healthRow]; // add rows to gridItems

        // sell price slightly less than price of tower
        const sellPrice = (0.7 * this.towerPrices[tower.texture.key]).toFixed(0);
        const sellText = this.add.text(0, 0, this.convertToK(sellPrice), {
            fontSize: '40px',
            color: '#000',
        }).setOrigin(0.5);

        const sellBtn = this.createButton(this.popUpWidth / 2, this.popUpHeight - btnHeight / 2 - spacingY, 'sell', { width: btnWidth * 3, height: btnHeight }, () => {
            // add money, close and destroy tower
            this.money += parseInt(sellPrice);
            this.closePopUp();
            tower.destroySelf();
        }).add(sellText);

        const closeBtn = this.createButton(this.popUpWidth, 0, 'close', { width: 40, height: 40 }, () => this.closePopUp());

        // GridAlign the stat rows for the pop up
        new Phaser.Actions.GridAlign(gridItems, {
            width: 1,
            height: 5,
            cellWidth: this.popUpWidth / 2,
            cellHeight: btnHeight + spacingY,
            x: leftMargin,
            y: spacingY
        });

        // the position of the pop up is done with a container
        const popUpContainer = this.add.container(popUpX, popUpY, [
            popUpBg, ...gridItems, closeBtn, sellBtn
        ]).setDepth(this.aheadTowersDepth + 20);

        this.towerPopUp = popUpContainer;
        this.towerPopUp.towerId = Tower.placedTowers.indexOf(tower);
        this.isPopUpOpen = true;
    }

    createStatRow(stat, rowProperties) {
        const x = 0;
        const y = 0;
        const fontSize = 20;
        const btnFontSize = 30;
        const textColor = "black";

        const tower = rowProperties.tower;
        const btnWidth = rowProperties.btnWidth;
        const btnHeight = rowProperties.btnHeight;

        let price = 50 * (tower.upgrades[stat] + 1);
        const startValue = tower[stat] - tower.upgrades[stat];
        const maxValue = startValue + 5; // 5 upgrades from start value available

        const statLabel = this.add.text(0, 0, `${stat[0].toUpperCase() + stat.substring(1)} (${tower[stat]})`, { fontSize: `${fontSize}px`, color: textColor });
        
        const statInstallments = this.createStatInstallmentsBar(0, fontSize, tower.upgrades[stat], 5);
        const upgradePriceText = this.add.text(0, 0, `${price < 300 ? price : "max"}`, { fontSize: btnFontSize, color: textColor }).setOrigin(0.5);
        const upgradeButton = this.createButton(0, 0, "upgrade", { width: btnWidth, height: btnHeight }, () => {
            if (this.money >= price && tower[stat] < maxValue) {
                this.money -= price;
                // upgrade stat and counter of stat upgrades
                tower[stat] += 1;
                tower.upgrades[stat] += 1;

                // update range highlighting if range upgraded
                if (stat == "range") {
                    this.highlightTowerRange(tower, tower.x, tower.y + tower.height / 2);
                }

                // update visbile values
                container.update();
            }
        });

        // change cursor to "not allowed" if one can't afford upgrade
        upgradeButton.on("pointerover", () => {
            if (this.money < price) {
                this.input.setDefaultCursor("not-allowed");
            }
        });

        // reset cursor when leaving button in case it changed style on it
        upgradeButton.on("pointerout", () => {
            this.input.setDefaultCursor("default");
        })

        const container = this.add.container(x, y, [
            statLabel,
            statInstallments,
            this.add.container(this.popUpWidth * 0.95 - btnWidth, fontSize, [upgradeButton, upgradePriceText])
        ]);

        container.update = () => {
            statLabel.setText(`${stat[0].toUpperCase() + stat.substring(1)} (${tower[stat]})`);
            price += 50;
            upgradePriceText.setText(`${price < 300 ? price : "max"}`);
            statInstallments.updateValue(tower.upgrades[stat])

            if (this.money < price) {
                this.input.setDefaultCursor("not-allowed");
            }
        };

        return container;
    }

    createStatInstallmentsBar(x, y, currentValue, maxValue, options = {}) {
        // default values for installemnt bars
        const {
            width = 20,
            height = 10,
            spacing = 5,
            activeColor = 0x00ff00,
            inactiveColor = 0x999999,
            cornerRadius = 4,
        } = options;

        const container = this.add.container(x, y);

        for (let i = 0; i < maxValue; i++) {
            // add small bar representing stat progression/installments
            // uses activeColor if upgraded/achieved, else inactiveColor

            const bar = this.add.graphics();
            bar.fillStyle(i < currentValue ? activeColor : inactiveColor, 1);
            bar.fillRoundedRect(0, 0, width, height, cornerRadius);
            bar.x = i * (width + spacing);
            container.add(bar);
        }

        container.updateValue = (newValue) => {
            container.list.forEach((bar, i) => {
                bar.clear();
                bar.fillStyle(i < newValue ? activeColor : inactiveColor, 1);
                bar.fillRoundedRect(0, 0, width, height, cornerRadius);
            });
        };

        return container;
    }

    // close pop up and remove range highlighting
    closePopUp() {
        if (this.isPopUpOpen && this.towerPopUp) {
            this.towerPopUp.destroy(true);
            this.towerPopUp = null;
            this.isPopUpOpen = false;

            // remove range highlighting
            this.tileSquares?.forEach(square => square.destroy()); // destroy existing squares
        }
    }

    updateAllText() {
        this.healthText.setText(`Health: ${this.health}`);
        this.moneyText.setText(`Money: ${this.convertToK(this.money)}`);
        this.roundText.setText(`Round: ${this.round}`);
        this.pointsText.setText(`Points: ${this.convertToK(this.points)}`);
    }

    // remove enemies, towers and reset values
    resetGame() {
        this.health = 100;
        this.money = 600;
        this.round = 0;
        this.points = 0;
        this.dead = false;
        this.updateAllText();

        [...Tower.placedTowers].forEach(tower => tower.destroySelf()); // copy arrray handles deleting elements
        [...Enemy.allEnemies].forEach(enemy => enemy.destroySelf());

        for (let i = 1; i <= this.gridRows; i++) {
            this.rowOccupancy[`${i}`] = 0;
        }

        this.gameState = "inactive";
        this.startButton.list[0].setTexture('playButton');
    }

    // BTW level speed should normally be very slow like PvZ. TODO: make all things way slower

    // enemy health and damage could maybe go up with later rounds
    // BTW REMEMBER I COULD USE MY VARIABLE THIS.ROUND

    applyLevel(levelIndex) {
        // begin by removing previous enemies and clearing rows
        Enemy.allEnemies.forEach(enemy => enemy.destroy());
        Enemy.allEnemies = []; // secure array is empty
        for (let i = 1; i <= this.gridRows; i++) {
            this.rowOccupancy[`${i}`] = 0;
        }

        const level = this.levels[levelIndex - 1];

        // TODO: Add speed!, range, damage! and health! where necessary. samurai should basically 1-hit

        if (level.rats) {
            this.spawnEnemy('rat', level.rats, { width: 160, height: 90, speed: 100, reverseAnimOrder: true });
        }
        if (level.horsemen) {
            this.spawnEnemy('horseman', level.horsemen, { width: 300, height: 250, reverseAnimOrder: true, hitableWidth: 220 });
        }
        if (level.mages) {
            this.spawnEnemy('mage', level.mages, { width: 150, height: 150, range: 3, reverseAnimOrder: true, hitableWidth: 70 });
        }
        if (level.orcBerserks) {
            this.spawnEnemy('orcBerserk', level.orcBerserks,
                { width: 220, height: 220, runFrames: 7, attackFrames: 5, deathFrames: 4, hitFrame: 5, hitableWidth: 125 });
        }
        if (level.orcWarriors) {
            this.spawnEnemy('orcWarrior', level.orcWarriors,
                { width: 220, height: 220, runFrames: 7, attackFrames: 4, deathFrames: 4, hitFrame: 4, hitableWidth: 125 });
        }
        if (level.skeletons) {
            this.spawnEnemy('skeleton', level.skeletons,
                { width: 180, height: 180, runFrames: 8, attackFrames: 7, deathFrames: 3, hitableWidth: 100 });
        }
        if (level.samurais) { 
            this.spawnEnemy('samurai', level.samurais,
                { width: 620, height: 620, speed: 30, runFrames: 9, attackFrames: 5, hitFrame: 5, hitableWidth: 350 });
        } 
    }

    spawnEnemy(type, count, properties) {
        // TODO: add bossEnemy and add comment to it that updates will come to it
        // IDEA: make so boss move up and down in map - adds challenge
        // Boss should have visible health bar and die very slowly
        // SideNote: remember to make victory Screen (like death screen but victory text?)
        for (let i = 0; i < count; i++) {
            let [x, y, row, column] = this.enemySpawnPos(properties.width, properties.height);

            let enemy;
            if (this.projectileEnemies.includes(type)) {
                if (type == "mage") y -= 50; // make mage float
                enemy = new ProjectileEnemy(this, x, y, row, type, properties);
            }
            else {
                enemy = new Enemy(this, x, y, row, type, properties);
            }
            this.time.delayedCall(10, () => { // ...displaySize needs delay for object initialization
                enemy.width = properties.width;
                enemy.height = properties.height;
                enemy.setDisplaySize(enemy.width, enemy.height);
            });
        }
    }

    // returns position enemy can spawn in as well as the row.
    // the row is random and the x is either the start (left) or further left depending on row occupancy
    enemySpawnPos(width, height) {
        const row = Math.floor(Math.random() * this.gridRows) + 1;

        const enemySpacing = 100; // adjust

        // x depends on enemy width (1/2 because x is the center) and the enemy count on the same row
        const x = -width / 2 - enemySpacing * this.rowOccupancy[row];

        const y = this.bridgeY + this.tileHeight * (row - 0.5) - height / 2;

        this.rowOccupancy[row]++;

        return [x, y, row];
    }

    createButton(x, y, texture, bounds, callback) {
        const width = bounds.width;
        const height = bounds.height;
        const interactiveWidth = bounds.interactiveWidth || 1;
        const interactiveHeight = bounds.interactiveHeight || 1;

        const button = this.add.image(0, 0, texture)
        button.setDisplaySize(width, height);
        button.on('pointerdown', callback);
        button.on('pointerover', () => button.setTint(0x999999));
        button.on('pointerout', () => button.clearTint());

        // buttonContainer acts like button but is the actual clickable size
        const buttonContainer = this.add.container(x, y, button);
        buttonContainer.setSize(button.displayWidth * interactiveWidth, button.displayHeight * interactiveHeight);
        buttonContainer.setInteractive({ cursor: 'pointer' });

        buttonContainer.on('pointerdown', callback);
        buttonContainer.on('pointerover', () => button.setTint(0x999999));
        buttonContainer.on('pointerout', () => button.clearTint());

        return buttonContainer;
    }

    toggleShop() {
        const direction = this.shopActive ? `+=${this.shopWidth}` : `-=${this.shopWidth}`;
        const arrowRotation = this.shopActive ? 0 : Math.PI // Rotate arrow 180 degrees
        const arrowAlignWidth = this.shopActive ? -this.shopArrowWidth : this.shopArrowWidth;
        const arrowAlignHeight = this.shopActive ? this.shopArrowHeight : -this.shopArrowHeight;

        const priceElements = [];
        for (let i = 0; i < this.shopTowers.list.length; i++) {
            const tower = this.shopTowers.list[i];
            priceElements.push(tower.priceTag);
        }

        // Slide tower shop to the left
        this.tweens.add({
            targets: [this.shop, this.shopExtension, this.shopArrow, this.shopTowers, ...priceElements],
            x: direction,
            duration: 500,
            ease: "Power1",
            onStart: () => {
                this.shopExtension.disableInteractive(true);
                this.shopExtension.setFillStyle(this.menuColor, 0.7);
            },
            onComplete: () => {
                this.shopActive = !this.shopActive;
                this.shopExtension.setInteractive();
                this.shopArrow.setRotation(arrowRotation);
                this.shopArrow.x += arrowAlignWidth;
                this.shopArrow.y += arrowAlignHeight;
            }
        });
    }

    // Slide obstruction zone down from above the screen
    toggleObstructionZone() {
        this.shopTowerDragged = !this.shopTowerDragged;
        const direction = this.shopTowerDragged ? `+= ${this.obstructionZoneHeight}` : `-= ${this.obstructionZoneHeight}`;

        this.tweens.add({
            targets: [this.obstructionZone, this.binIcon],
            y: direction,
            duration: 300,
            ease: "Power1"
        })
    }

    checkOverlap(bounds1, bounds2, overlap) {
        // Gets percentage of overlap area
        const overlapArea = Phaser.Geom.Rectangle.Intersection(bounds1, bounds2);
        const obj1Area = bounds1.width * bounds1.height;
        const overlapPercentage = (overlapArea.width * overlapArea.height) / obj1Area;

        if (overlapPercentage >= overlap) {
            return true;
        }
        return false;
    }

    toggleGameGrid() {
        this.gameGridActive = !this.gameGridActive;

        // Show game grid by incresing alpha value
        const alpha = this.gameGridActive ? 0.5 : 0;

        this.gameGridLines.forEach(gridLine => {
            this.tweens.add({
                targets: gridLine,
                alpha: alpha,
                duration: 600,
                ease: 'Power1',
            });
        });
    }

    validTowerPlace() {
        // Tower bottom x and y must be on bridge
        if (!(0 <= this.selectedTower.x && this.selectedTower.x <= this.gameWidth &&
            this.bridgeY <= this.selectedTower.y + this.selectedTower.displayHeight / 2 &&
            this.selectedTower.y + this.selectedTower.displayHeight / 2 <= this.bridgeY + this.bridgeHeight)) {
            return false;
        }

        // Make sure there is a tile below
        if (!this.tileCenterBelow) return false;

        // Tower can't be on same square as another. intended x and y stand for where this tower would be placed if placed.
        const intendedX = this.tileCenterBelow[0];
        const intendedY = this.tileCenterBelow[1] - this.selectedTower.displayHeight / 2 + 20; // adjusted for space in image
        if (Tower.placedTowers.some(tower => tower.x == intendedX & tower.y == intendedY)) return false;

        return true;
    }

    // Highlights tile below tower drag and returns its central position as well as row and column
    tileBelowTowerDrag() {
        let tileX; // center x
        let tileY; // center y
        let row; // row of tile
        let column; // column of tile

        const tower = this.selectedTower;

        // Determines central x position of tile that is being overlapped by bottom center of tower
        for (let i = 0; i < this.gridColumns; i++) {
            if (this.tileWidth * i <= tower.x &&
                tower.x <= this.tileWidth * (i + 1)) {
                tileX = this.tileWidth * (i + 0.5);
                column = i + 1;
            }
        }

        // Determines central y position of tile that is being overlapped by bottom center of tower
        for (let i = 0; i < this.gridRows; i++) {
            if (this.bridgeY + this.tileHeight * i <= tower.y + tower.displayHeight / 2 &&
                tower.y + tower.displayHeight / 2 <= this.bridgeY + this.tileHeight * (i + 1)) {
                tileY = this.bridgeY + this.tileHeight * (i + 0.5);
                row = i + 1;
            }
        }

        return [tileX, tileY, row, column];
    }

    // add highlighting for tile under tower and tiles in tower range
    highlightTowerRange(tower, tileX, tileY) { // tileX and Y is just tower position if tower placed
        this.tileSquares?.forEach(square => square.destroy()); // destroy existing squares

        this.tileSquares = [];

        if (tileX && tileY) {
            for (let i = 0; i <= tower.range; i++) {
                const tileSquare = this.add.rectangle(tileX - i * this.tileWidth, tileY, this.tileWidth,
                    this.tileHeight, 0xffffff, 0.5).setDepth(this.behindTowersDepth);
                this.tileSquares.push(tileSquare);
            }
        }
    }
}