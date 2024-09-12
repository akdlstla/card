// import Phaser from 'phaser';

// interface Card {
//     id: number;
//     type: string;
//     name: string;
//     damage?: number;
//     cost: number;
//     healAmount?: number;
//     goldAmount?: number;
//     baseDamage?: number;
//     extraCost?: number;
//     extraDamage?: number;
// }

// interface SceneProps {
//     playerHP: number;
//     setPlayerHP: (hp: number) => void;
//     gold: number;
//     setGold: (gold: number) => void;
//     onSceneChange: (scene: string) => void;
// }

// interface GameOptions {
//     totalCards: number;
//     cardsInHand: number;
//     cardWidth: number;
//     cardHeight: number;
//     handSizeRatio: number;
//     boardSizeRatio: number;
// }

// interface HandCoordinates {
//     x: number;
//     y: number;
//     r: number;
// }
// export class CardGame extends Phaser.Scene {
//     private maxCostPerTurn: number = 20;
//     private currentCost: number = this.maxCostPerTurn;
//     private isPlayerAlive: boolean = true;
//     private cards: Card[];
//     private gameOptions: GameOptions;
//     private currentPlayerHP!: number;
//     private maxPlayerHP!: number;
//     private setPlayerHP!: (hp: number) => void;
//     private currentGold!: number;
//     private setGold!: (gold: number) => void;
//     private onSceneChange!: (scene: string) => void;

//     private boardGroup!: Phaser.GameObjects.Group;
//     private handGroup!: Phaser.GameObjects.Group;
//     private background!: Phaser.GameObjects.Sprite;
//     private monster!: Phaser.GameObjects.Image;
//     private hpBarBackground!: Phaser.GameObjects.Graphics;
//     private hpBar!: Phaser.GameObjects.Graphics;
//     private playerHPBarBackground!: Phaser.GameObjects.Graphics;
//     private playerHPBar!: Phaser.GameObjects.Graphics;
//     private costText!: Phaser.GameObjects.Text;
//     private goldeText!: Phaser.GameObjects.Text;
//     private HPText!: Phaser.GameObjects.Text;
//     private endTurnButton!: Phaser.GameObjects.Text;
//     private cardPreview!: Phaser.GameObjects.Sprite;
//     private allCards: Phaser.GameObjects.Sprite[] = [];
//     private deck: Phaser.GameObjects.Sprite[] = [];
//     private zone!: Phaser.GameObjects.Zone;
//     private dimmedOverlay!: Phaser.GameObjects.Graphics;
//     private gameOverText!: Phaser.GameObjects.Text;

//     constructor(props: any) {
//         super({ key: 'CardGame' });
//         this.cards = [
//             { id: 0, type: 'attack', name: '기본 공격 1', damage: 5, cost: 1 },
//             { id: 1, type: 'attack', name: '기본 공격 2', damage: 5, cost: 1 },
//             { id: 2, type: 'attack', name: '강력한 공격', damage: 8, cost: 2 },
//             { id: 3, type: 'heal', name: '치료', healAmount: 10, cost: 2 },
//             { id: 4, type: 'gold', name: '돈 획득', goldAmount: 1, cost: 0 },
//             {
//                 id: 5,
//                 type: 'enhanced_attack',
//                 name: '강화된 공격',
//                 baseDamage: 8,
//                 extraCost: 3,
//                 extraDamage: 5,
//                 cost: 2,
//             },
//             { id: 6, type: 'attack', name: '화염 공격', damage: 12, cost: 3 },
//             { id: 7, type: 'heal', name: '대규모 치료', healAmount: 20, cost: 4 },
//             { id: 8, type: 'gold', name: '대량 금 획득', goldAmount: 3, cost: 2 },
//             { id: 9, type: 'attack', name: '냉기 공격', damage: 10, cost: 2 },
//             {
//                 id: 10,
//                 type: 'enhanced_attack',
//                 name: '번개 공격',
//                 baseDamage: 15,
//                 extraCost: 5,
//                 extraDamage: 10,
//                 cost: 3,
//             },
//             { id: 11, type: 'attack', name: '단검 공격', damage: 3, cost: 1 },
//             { id: 12, type: 'heal', name: '응급 치료', healAmount: 5, cost: 1 },
//             { id: 13, type: 'gold', name: '소량 금 획득', goldAmount: 2, cost: 1 },
//             { id: 14, type: 'attack', name: '독 공격', damage: 7, cost: 2 },
//             {
//                 id: 15,
//                 type: 'enhanced_attack',
//                 name: '폭발 공격',
//                 baseDamage: 12,
//                 extraCost: 4,
//                 extraDamage: 6,
//                 cost: 2,
//             },
//             { id: 16, type: 'attack', name: '암흑 공격', damage: 9, cost: 3 },
//             { id: 17, type: 'heal', name: '신속 치료', healAmount: 15, cost: 3 },
//             { id: 18, type: 'gold', name: '무작위 금 획득', goldAmount: 1, cost: 1 },
//             { id: 19, type: 'attack', name: '마법 공격', damage: 11, cost: 3 },
//         ];
//         this.gameOptions = {
//             totalCards: 20,
//             cardsInHand: 6,
//             cardWidth: 265,
//             cardHeight: 400,
//             handSizeRatio: 0.5,
//             boardSizeRatio: 0.3,
//         };
//     }

//     init(data: SceneProps) {
//         this.currentPlayerHP = data.playerHP;
//         this.maxPlayerHP = data.playerHP;
//         this.setPlayerHP = data.setPlayerHP;
//         this.currentGold = data.gold;
//         this.setGold = data.setGold;
//         this.onSceneChange = data.onSceneChange;
//     }

//     preload() {
//         this.load.image('background', '/images/background.jpg');
//         this.load.spritesheet('cards', '/images/cards.png', {
//             frameWidth: this.gameOptions.cardWidth,
//             frameHeight: this.gameOptions.cardHeight,
//         });
//         this.load.image('monster', '/images/monster.png');
//         this.load.image('scratch', '/images/wound.png');
//         this.load.image('victory', '/images/victory.png');
//     }

//     create() {
//         this.boardGroup = this.add.group();
//         this.handGroup = this.add.group();

//         this.background = this.add.sprite(
//             (this.sys.game.config.width as number) / 2,
//             (this.sys.game.config.height as number) / 2,
//             'background'
//         );

//         this.monster = this.add.image(640, 350, 'monster');
//         this.monster.setScale(0.45);
//         this.monster.setData('maxHP', 10);
//         this.monster.setData('currentHP', this.monster.getData('maxHP'));

//         this.hpBarBackground = this.add.graphics();
//         this.hpBar = this.add.graphics();
//         this.playerHPBarBackground = this.add.graphics();
//         this.playerHPBar = this.add.graphics();

//         this.drawHPBar();
//         this.drawPlayerHPBar();

//         this.costText = this.add.text(50, 50, '', {
//             font: '32px Arial',
//             color: '#ffffff',
//         });
//         this.updateCostText();

//         this.goldeText = this.add.text(50, 90, '', {
//             font: '32px Arial',
//             color: '#ffffff',
//         });
//         this.updateGoldText();

//         this.setupDragEvents();

//         // 카드 스프라이트시트 로딩 확인
//         if (this.textures.exists('cards')) {
//             console.log('Cards spritesheet loaded successfully');
//             const frameCount = this.textures.get('cards').frameTotal;
//             console.log(`Total frames in cards spritesheet: ${frameCount}`);
//         } else {
//             console.error('Cards spritesheet failed to load');
//         }

//         this.HPText = this.add.text(50, 150, '', {
//             font: '32px Arial',
//             color: '#ffffff',
//         });
//         this.updateHPText();

//         //this.createEndTurnButton();
//         this.createCardPreview();
//         this.createAllCards();
//         this.drawInitialHand();
//         this.createDropZone();
//         //this.setupInputEvents();

//         this.dimmedOverlay = this.add.graphics();
//         this.dimmedOverlay.fillStyle(0x000000, 0.7);
//         this.dimmedOverlay.fillRect(0, 0, this.sys.game.config.width as number, this.sys.game.config.height as number);
//         this.dimmedOverlay.setVisible(false);

//         this.gameOverText = this.add
//             .text(
//                 (this.sys.game.config.width as number) / 2,
//                 (this.sys.game.config.height as number) / 2,
//                 'Game Over',
//                 {
//                     font: '64px Arial',
//                     color: '#ff0000',
//                 }
//             )
//             .setOrigin(0.5, 0.5);
//         this.gameOverText.setVisible(false);

//         this.input.keyboard?.on('keydown-SPACE', this.handleSpaceKey, this);
//     }

//     createCardPreview() {
//         this.cardPreview = this.add.sprite(0, 0, 'cards');
//         this.cardPreview.visible = false;
//         this.cardPreview.alpha = 0.25;
//         this.cardPreview.displayWidth = this.gameOptions.cardWidth * this.gameOptions.boardSizeRatio;
//         this.cardPreview.displayHeight = this.gameOptions.cardHeight * this.gameOptions.boardSizeRatio;
//         this.cardPreview.setOrigin(0.5, 1);
//     }

//     createCard(n: number): Phaser.GameObjects.Sprite {
//         let coordinates = this.setHandCoordinates(n, this.gameOptions.totalCards);
//         let card = this.add.sprite(coordinates.x, coordinates.y, 'cards', n);
//         card.setOrigin(0.5, 1);
//         card.rotation = coordinates.r;
//         card.setData('handPosition', n);
//         card.setInteractive({ draggable: true });
//         card.displayWidth = this.gameOptions.cardWidth * this.gameOptions.handSizeRatio;
//         card.displayHeight = this.gameOptions.cardHeight * this.gameOptions.handSizeRatio;

//         // 카드 속성을 this.cards 배열에서 가져옴
//         let cardData = this.cards[n];

//         // 카드 타입에 따라 속성 설정
//         card.setData('damage', cardData.damage || 0);
//         card.setData('cost', cardData.cost || 0);
//         card.setData('healAmount', cardData.healAmount || 0);
//         card.setData('goldAmount', cardData.goldAmount || 0);
//         card.setData('extraCost', cardData.extraCost || 0);
//         card.setData('extraDamage', cardData.extraDamage || 0);
//         card.setData('type', cardData.type);

//         return card; // 생성된 카드 객체를 반환
//     }
//     handleDraw() {
//         let cardsToDraw = Math.min(this.gameOptions.cardsInHand, this.deck.length);

//         if (cardsToDraw === 0) {
//             console.log('덱이 비어 있습니다. 다시 셔플합니다.');
//             this.allCards = [];
//             for (let i = 0; i < this.gameOptions.totalCards; i++) {
//                 let card = this.createCard(i);
//                 card.setVisible(false);
//                 this.allCards.push(card);
//             }
//             this.deck = Phaser.Utils.Array.Shuffle([...this.allCards]);
//             cardsToDraw = this.gameOptions.cardsInHand;
//             console.log('덱 셔플 후:', this.deck);
//         }

//         if (cardsToDraw > 0) {
//             this.drawCards(cardsToDraw);
//         } else {
//             console.log('No cards left to draw');
//         }
//     }

//     drawCards(count: number) {
//         let drawnCards = this.deck.splice(0, count);
//         drawnCards.forEach((card: Phaser.GameObjects.Sprite) => {
//             card.setPosition((this.sys.game.config.width as number) / 2, (this.sys.game.config.height as number) / 2);
//             card.setVisible(true);
//             this.handGroup.add(card);
//         });
//         this.arrangeCardsInHand();
//         console.log(`Drew ${drawnCards.length} cards. Hand size: ${this.handGroup.getChildren().length}`);
//     }

//     setPreviewCoordinates(n: number, totalCards: number): { x: number; y: number } {
//         return {
//             x:
//                 (this.sys.game.config.width as number) / 2 -
//                 (totalCards - 1) * this.gameOptions.cardWidth * this.gameOptions.boardSizeRatio * 0.6 +
//                 n * this.gameOptions.cardWidth * this.gameOptions.boardSizeRatio * 1.2,
//             y: 700,
//         };
//     }

//     arrangeCardsOnBoard(preview: boolean): void {
//         let cardsOnBoard = this.boardGroup.countActive() + (preview ? 1 : 0);

//         this.boardGroup.children.entries.forEach((gameObject, i) => {
//             if (gameObject instanceof Phaser.GameObjects.Sprite) {
//                 let coordinates = this.setPreviewCoordinates(i, cardsOnBoard);
//                 gameObject.x = coordinates.x;
//                 gameObject.y = coordinates.y;
//             }
//         });

//         if (preview) {
//             let cardPreviewPosition = this.setPreviewCoordinates(cardsOnBoard - 1, cardsOnBoard);
//             this.cardPreview.x = cardPreviewPosition.x;
//             this.cardPreview.y = cardPreviewPosition.y;
//         }
//     }

//     setHandCoordinates(n: number, totalCards: number): HandCoordinates {
//         let rotation = (Math.PI / 4 / totalCards) * (totalCards - n - 1);
//         let xPosition = (this.sys.game.config.width as number) + 200 * Math.cos(rotation + Math.PI / 2);
//         let yPosition = (this.sys.game.config.height as number) + 200 - 200 * Math.sin(rotation + Math.PI / 2);
//         return {
//             x: xPosition,
//             y: yPosition,
//             r: -rotation,
//         };
//     }

//     drawHPBar(): void {
//         if (!this.hpBarBackground || !this.hpBar || !this.monster) {
//             console.error('Required objects for drawHPBar are not initialized');
//             return;
//         }
//         const barWidth = 200;
//         const barHeight = 20;

//         this.hpBarBackground.clear();
//         this.hpBarBackground.fillStyle(0x000000, 1);
//         this.hpBarBackground.fillRect(this.monster.x - barWidth / 2, this.monster.y - 250, barWidth, barHeight);

//         const hpPercentage = this.monster.getData('currentHP') / this.monster.getData('maxHP');
//         this.hpBar.clear();
//         this.hpBar.fillStyle(0xff0000, 1);
//         this.hpBar.fillRect(this.monster.x - barWidth / 2, this.monster.y - 250, barWidth * hpPercentage, barHeight);
//     }

//     drawPlayerHPBar(): void {
//         if (!this.playerHPBar || !this.playerHPBarBackground) {
//             console.error('Required objects for drawPlayerHPBar are not initialized');
//             return;
//         }
//         this.playerHPBar.clear();
//         this.playerHPBarBackground.clear();
//         const barWidth = 200;
//         const barHeight = 20;

//         const hpPercentage = Math.max(this.currentPlayerHP / this.maxPlayerHP, 0);

//         this.playerHPBar.fillStyle(0x000000, 1);
//         this.playerHPBar.fillRect(50, 130, barWidth, barHeight);

//         this.playerHPBar.fillStyle(0x00ff00, 1);
//         this.playerHPBar.fillRect(50, 130, barWidth * hpPercentage, barHeight);
//     }

//     setupDragEvents() {
//         this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
//             this.children.bringToTop(gameObject);
//             console.log('Drag started');
//         });

//         this.input.on(
//             'drag',
//             (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite, dragX: number, dragY: number) => {
//                 gameObject.x = dragX;
//                 gameObject.y = dragY;
//                 console.log('Dragging');
//             }
//         );

//         this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Sprite) => {
//             console.log('Drag ended');
//             // 여기에 카드를 놓았을 때의 로직을 구현합니다.
//         });
//         this.input.on(
//             'drop',
//             (
//                 pointer: Phaser.Input.Pointer,
//                 gameObject: Phaser.GameObjects.Sprite,
//                 dropZone: Phaser.GameObjects.Zone
//             ) => {
//                 gameObject.x = dropZone.x;
//                 gameObject.y = dropZone.y;
//                 console.log('Card dropped on drop zone');
//                 // 여기에 카드가 드롭 존에 놓였을 때의 게임 로직을 구현합니다.
//             }
//         );
//     }

//     arrangeCardsInHand(): void {
//         this.handGroup.children.entries.forEach((gameObject, i) => {
//             if (gameObject instanceof Phaser.GameObjects.Sprite) {
//                 gameObject.setDepth(i);
//                 const coordinates = this.setHandCoordinates(i, this.handGroup.countActive());
//                 this.tweens.add({
//                     targets: gameObject,
//                     rotation: coordinates.r,
//                     x: coordinates.x,
//                     y: coordinates.y,
//                     displayWidth: this.gameOptions.cardWidth / 2,
//                     displayHeight: this.gameOptions.cardHeight / 2,
//                     duration: 150,
//                 });
//             }
//         });
//     }

//     startTurn(): void {
//         this.currentCost = this.maxCostPerTurn;
//     }

//     endTurn(): void {
//         this.handGroup.clear(true, false);
//         this.arrangeCardsInHand();
//         this.monsterAttack();
//         this.handleDraw();
//         this.startTurn();
//         this.updateCostText();
//     }

//     updateCostText(): void {
//         this.costText.setText(`Cost: ${this.currentCost}/${this.maxCostPerTurn}`);
//     }

//     updateGoldText(): void {
//         console.log('Updating gold text');
//         this.goldeText.setText(`Gold: ${this.currentGold}`);
//     }

//     updateHPText(): void {
//         this.HPText.setText(`HP: ${this.currentPlayerHP}/${this.maxPlayerHP}`);
//     }

//     showCostWarning(): void {
//         const warningText = this.add
//             .text(680, 500, '코스트가 부족합니다', {
//                 font: '64px Arial',
//                 color: '#ffffff',
//             })
//             .setOrigin(0.5, 0.5);

//         this.tweens.add({
//             targets: warningText,
//             alpha: 0,
//             duration: 2000,
//             ease: 'Power2',
//             onComplete: function (this: Phaser.Tweens.Tween) {
//                 warningText.destroy();
//             },
//         });
//     }

//     takeDamage(damage: number): void {
//         console.log('Taking damage:', damage);

//         const newHP = this.currentPlayerHP - damage;
//         const clampedHP = Math.max(newHP, 0);

//         this.currentPlayerHP = clampedHP;

//         const damageText = this.add
//             .text(100, 100, `-${damage}`, {
//                 font: '32px Arial',
//                 color: '#ff0000',
//             })
//             .setOrigin(0.5, 0.5);

//         damageText.setPosition(100, 150);

//         this.tweens.add({
//             targets: damageText,
//             y: damageText.y - 50,
//             alpha: 0,
//             duration: 1000,
//             ease: 'Power2',
//             onComplete: function (this: Phaser.Tweens.Tween) {
//                 damageText.destroy();
//             },
//         });

//         if (clampedHP <= 0) {
//             this.handlePlayerDeath();
//         }
//     }

//     monsterAttack(): void {
//         const setPlayerHP = this.setPlayerHP;
//         if (!this.isPlayerAlive || !setPlayerHP) return;

//         const scratch = this.add.image(640, 310, 'scratch');

//         this.tweens.add({
//             targets: scratch,
//             x: 640,
//             y: 310,
//             alpha: 0,
//             duration: 1000,
//             ease: 'Power2',
//             onComplete: function (this: Phaser.Tweens.Tween) {
//                 scratch.setVisible(false);
//             },
//         });
//         this.cameras.main.shake(300, 0.2);

//         const damage = Phaser.Math.Between(15, 25);
//         this.currentPlayerHP -= damage;
//         setPlayerHP(this.currentPlayerHP);

//         this.drawPlayerHPBar();
//         this.updateHPText();

//         if (this.currentPlayerHP <= 0) {
//             this.handlePlayerDeath();
//         }
//     }

//     handlePlayerDeath(): void {
//         console.log('플레이어가 사망했습니다!');

//         this.isPlayerAlive = false;
//         this.dimmedOverlay.setVisible(true);
//         if (this.input.mouse) {
//             this.input.mouse.enabled = false;
//         }

//         this.add
//             .text(
//                 (this.sys.game.config.width as number) / 2,
//                 (this.sys.game.config.height as number) / 2 + 100,
//                 '스페이스 바를 누르면 게임이 다시 시작됩니다.',
//                 {
//                     font: '32px Arial',
//                     color: '#ffffff',
//                 }
//             )
//             .setOrigin(0.5, 0.5);

//         this.gameOverText.setVisible(true);
//     }

//     handleVictory(): void {
//         this.dimmedOverlay.setVisible(true);

//         const victory = this.add.image(600, 400, 'victory');
//         victory.setScale(0.5);
//         this.tweens.add({
//             targets: victory,
//             scale: { from: 0.5, to: 1.5 },
//             duration: 500,
//             ease: 'Back.easeIn',
//             yoyo: true,
//             repeat: 0,
//             onComplete: () => {
//                 this.tweens.add({
//                     targets: victory,
//                     scale: { from: 1.5, to: 1 },
//                     duration: 200,
//                     ease: 'Power1',
//                 });
//             },
//         });

//         this.input.once('pointerdown', () => {
//             this.cameras.main.fadeOut(500, 0, 0, 0);

//             this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
//                 if (typeof this.onSceneChange === 'function') {
//                     this.onSceneChange('map');
//                 } else {
//                     console.error('onSceneChange is not available or not a function');
//                 }
//             });
//         });
//     }

//     handleCardEffect(card: Card): void {
//         console.log('handleCardEffect called for card:', card);
//         console.log('Card type:', card.type);
//         switch (card.type) {
//             case 'attack':
//                 if (card.damage !== undefined) {
//                     this.dealDamage(card.damage);
//                 }
//                 break;
//             case 'heal':
//                 if (card.healAmount !== undefined) {
//                     this.healPlayer(card.healAmount);
//                 }
//                 break;
//             case 'gold':
//                 console.log('Gold card used, calling gainGold');
//                 if (card.goldAmount !== undefined) {
//                     this.gainGold(card.goldAmount);
//                 }
//                 break;
//             case 'enhanced_attack':
//                 this.handleEnhancedAttack(card);
//                 break;
//             default:
//                 break;
//         }
//     }

//     handleEnhancedAttack(card: Card): void {
//         if (
//             card.type === 'enhanced_attack' &&
//             card.cost !== undefined &&
//             card.extraCost !== undefined &&
//             card.baseDamage !== undefined &&
//             card.extraDamage !== undefined
//         ) {
//             if (this.currentCost >= card.cost + card.extraCost) {
//                 const totalCost = card.cost + card.extraCost;
//                 const totalDamage = card.baseDamage + card.extraDamage;
//                 this.currentCost -= totalCost;
//                 //this.attackMonster(totalDamage);
//             } else {
//                 this.currentCost -= card.cost;
//                 //this.attackMonster(card.baseDamage);
//             }
//             this.updateCostText();
//         }
//     }

//     dealDamage = (amount: number): void => {
//         console.log('Dealing damage:', amount);

//         const currentHP = this.monster.getData('currentHP') as number;
//         this.monster.setData('currentHP', Math.max(currentHP - amount, 0));

//         const damageText = this.add
//             .text(this.monster.x, this.monster.y - 150, `-${amount}`, {
//                 font: '64px Arial',
//                 color: '#FFFFFF',
//             })
//             .setOrigin(0.5, 0.5);

//         this.tweens.add({
//             targets: damageText,
//             y: this.monster.y - 200,
//             alpha: 0,
//             duration: 800,
//             ease: 'Power2',
//             onComplete: function (this: Phaser.Tweens.Tween) {
//                 damageText.destroy();
//             },
//         });

//         this.drawHPBar();

//         if (this.monster.getData('currentHP') <= 0) {
//             this.monster.setVisible(false);
//             this.hpBarBackground.setVisible(false);
//             this.hpBar.setVisible(false);
//             this.handleVictory();
//         }
//     };

//     gainGold(amount: number): void {
//         console.log(`gainGold called with amount: ${amount}`);

//         // 현재 골드에 amount를 더함
//         this.currentGold += amount;

//         console.log(`Gold updated: ${this.currentGold}`);

//         // 외부 상태 업데이트
//         if (typeof this.setGold === 'function') {
//             this.setGold(this.currentGold);
//         }

//         // UI 업데이트
//         this.updateGoldText();
//     }

//     healPlayer(amount: number): void {
//         const newHP = this.currentPlayerHP + amount;
//         const clampedHP = Math.min(newHP, this.maxPlayerHP);

//         // Update local state
//         this.currentPlayerHP = clampedHP;

//         // Update external state if setPlayerHP function exists
//         const setPlayerHP = this.data?.get('setPlayerHP');
//         if (typeof setPlayerHP === 'function') {
//             setPlayerHP(clampedHP);
//         }

//         // Update UI
//         this.drawPlayerHPBar();
//         this.updateHPText();

//         console.log(`Player healed for ${amount}. New HP: ${clampedHP}`);
//     }

//     update() {
//         if (!this.isPlayerAlive) {
//             return;
//         }
//         // ... 추가적인 업데이트 로직 ...
//     }

//     // private createEndTurnButton() {
//     //     // ... 턴 종료 버튼 생성 로직 ...
//     // }

//     createAllCards() {
//         this.allCards = [];
//         for (let i = 0; i < this.gameOptions.totalCards; i++) {
//             let card = this.createCard(i);
//             card.setVisible(false);
//             this.allCards.push(card);
//         }
//         console.log(`Created ${this.allCards.length} cards`);
//     }
//     drawInitialHand() {
//         this.deck = Phaser.Utils.Array.Shuffle([...this.allCards]);
//         this.drawCards(this.gameOptions.cardsInHand);
//     }

//     createDropZone() {
//         let dropZone = this.add.zone(400, 300, 300, 200).setRectangleDropZone(300, 200);

//         // 시각적 피드백을 위한 그래픽 (선택적)
//         let dropZoneOutline = this.add.graphics();
//         dropZoneOutline.lineStyle(2, 0xffff00);
//         if (dropZone.input && dropZone.input.hitArea) {
//             dropZoneOutline.strokeRect(
//                 dropZone.x - dropZone.input.hitArea.width / 2,
//                 dropZone.y - dropZone.input.hitArea.height / 2,
//                 dropZone.input.hitArea.width,
//                 dropZone.input.hitArea.height
//             );
//         } else {
//             // 기본값 사용
//             dropZoneOutline.strokeRect(dropZone.x - 150, dropZone.y - 100, 300, 200);
//         }
//     }
//     // private setupInputEvents() {
//     //     // ... 입력 이벤트 설정 로직 ...
//     // }

//     private handleSpaceKey() {
//         if (!this.isPlayerAlive) {
//             window.location.reload();
//         }
//     }
// }
