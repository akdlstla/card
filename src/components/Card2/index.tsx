import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import background from '../../../public/images/background.jpg';
import monster from '../../../public/images/monster.png';
import wound from '../../../public/images/wound.png';
import cards from '../../../public/images/cards.png';
import victory from '../../../public/images/victory.png';

interface Card {
    id: number;
    type: 'attack' | 'heal' | 'gold' | 'enhanced_attack';
    name: string;
    damage?: number;
    cost: number;
    healAmount?: number;
    goldAmount?: number;
    baseDamage?: number;
    extraCost?: number;
    extraDamage?: number;
}

interface Card2Props {
    playerHP: number;
    gold: number;
    setPlayerHP: (hp: number) => void;
    setGold: (gold: number | ((prevGold: number) => number)) => void;
    onSceneChange: (scene: string) => void;
}

class PlayGame extends Phaser.Scene {
    private initialProps: Card2Props;
    private maxCostPerTurn: number = 20;
    private currentCost: number = this.maxCostPerTurn;
    private isPlayerAlive: boolean = true;
    private cards: Card[] = [];
    private gameOptions = {
        totalCards: 20,
        cardsInHand: 6,
        cardWidth: 265,
        cardHeight: 400,
        handSizeRatio: 0.5,
        boardSizeRatio: 0.3,
    };
    private currentPlayerHP!: number;
    private maxPlayerHP!: number;
    private currentGold!: number;
    private boardGroup!: Phaser.GameObjects.Group;
    private handGroup!: Phaser.GameObjects.Group;
    private background!: Phaser.GameObjects.Sprite;
    private monster!: Phaser.GameObjects.Image;
    private hpBarBackground!: Phaser.GameObjects.Graphics;
    private hpBar!: Phaser.GameObjects.Graphics;
    private playerHPBarBackground!: Phaser.GameObjects.Graphics;
    private playerHPBar!: Phaser.GameObjects.Graphics;
    private costText!: Phaser.GameObjects.Text;
    private goldText!: Phaser.GameObjects.Text;
    private HPText!: Phaser.GameObjects.Text;
    private endTurnButton!: Phaser.GameObjects.Text;
    private cardPreview!: Phaser.GameObjects.Sprite;
    private allCards!: Phaser.GameObjects.Sprite[];
    private deck!: Phaser.GameObjects.Sprite[];
    private zone!: Phaser.GameObjects.Zone;
    private dimmedOverlay!: Phaser.GameObjects.Graphics;
    private gameOverText!: Phaser.GameObjects.Text;
    private props!: Card2Props;

    constructor(props: Card2Props) {
        super('PlayGame');
        this.maxPlayerHP = 0;
        this.currentPlayerHP = 0;
        this.initialProps = props;
        this.cards = [
            { id: 0, type: 'attack', name: '기본 공격 1', damage: 5, cost: 3 },
            { id: 1, type: 'attack', name: '기본 공격 2', damage: 5, cost: 3 },
            { id: 2, type: 'attack', name: '강력한 공격', damage: 8, cost: 5 },
            { id: 3, type: 'heal', name: '치료', healAmount: 10, cost: 4 },
            { id: 4, type: 'gold', name: '돈 획득', goldAmount: 1, cost: 2 },
            {
                id: 5,
                type: 'enhanced_attack',
                name: '강화된 공격',
                baseDamage: 8,
                extraCost: 2,
                extraDamage: 5,
                cost: 5,
            },
            { id: 6, type: 'attack', name: '화염 공격', damage: 12, cost: 7 },
            { id: 7, type: 'heal', name: '대규모 치료', healAmount: 20, cost: 6 },
            { id: 8, type: 'gold', name: '대량 금 획득', goldAmount: 3, cost: 5 },
            { id: 9, type: 'attack', name: '냉기 공격', damage: 10, cost: 7 },
            {
                id: 10,
                type: 'enhanced_attack',
                name: '번개 공격',
                baseDamage: 15,
                extraCost: 5,
                extraDamage: 10,
                cost: 6,
            },
            { id: 11, type: 'attack', name: '단검 공격', damage: 3, cost: 1 },
            { id: 12, type: 'heal', name: '응급 치료', healAmount: 5, cost: 1 },
            { id: 13, type: 'gold', name: '소량 금 획득', goldAmount: 2, cost: 3 },
            { id: 14, type: 'attack', name: '독 공격', damage: 7, cost: 4 },
            {
                id: 15,
                type: 'enhanced_attack',
                name: '폭발 공격',
                baseDamage: 12,
                extraCost: 2,
                extraDamage: 6,
                cost: 6,
            },
            { id: 16, type: 'attack', name: '암흑 공격', damage: 9, cost: 5 },
            { id: 17, type: 'heal', name: '신속 치료', healAmount: 15, cost: 4 },
            { id: 18, type: 'gold', name: '무작위 금 획득', goldAmount: 1, cost: 2 },
            { id: 19, type: 'attack', name: '마법 공격', damage: 11, cost: 5 },
        ];
    }

    init(data: Card2Props) {
        this.initialProps = data;
        this.props = data;
        if (this.maxPlayerHP === 0) {
            this.maxPlayerHP = data.playerHP;
        }
        this.currentPlayerHP = data.playerHP;
        this.updateGameState();
    }

    updateGameState() {
        this.currentPlayerHP = this.props.playerHP;
        this.currentGold = this.props.gold;
        // Update any relevant game objects or UI here
        this.updateHPText();
        this.updateGoldText();
        this.drawPlayerHPBar();
    }

    preload() {
        this.load.image('background', background.src);
        this.load.spritesheet('cards', cards.src, {
            frameWidth: this.gameOptions.cardWidth,
            frameHeight: this.gameOptions.cardHeight,
        });
        this.load.image('monster', monster.src);
        this.load.image('scratch', wound.src);
        this.load.image('victory', victory.src);
    }

    create() {
        // ... (existing create code)

        this.input.on('dragstart', (pointer: Phaser.Input.Pointer, card: Phaser.GameObjects.Sprite) => {
            if (this.handGroup.contains(card)) {
                this.handGroup.remove(card);
                this.arrangeCardsInHand();
                card.setDepth(this.handGroup.countActive());
                this.cardPreview.setFrame(card.frame.name);

                this.tweens.add({
                    targets: card,
                    angle: 0,
                    x: pointer.x,
                    y: pointer.y,
                    displayWidth: this.gameOptions.cardWidth,
                    displayHeight: this.gameOptions.cardHeight,
                    duration: 150,
                });

                this.tweens.add({
                    targets: this.background,
                    alpha: 0.3,
                    duration: 150,
                });
            }
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer, card: Phaser.GameObjects.Sprite) => {
            if (!this.handGroup.contains(card) && !this.boardGroup.contains(card)) {
                card.x = pointer.x;
                card.y = pointer.y;
            }
        });

        this.input.on('dragenter', () => {
            this.cardPreview.visible = true;
            this.arrangeCardsOnBoard(true);
        });

        this.input.on('dragleave', () => {
            this.cardPreview.visible = false;
            this.arrangeCardsOnBoard(false);
        });

        this.input.on('drop', (pointer: Phaser.Input.Pointer, card: Phaser.GameObjects.Sprite) => {
            if (card.getData('cost') <= this.currentCost) {
                this.handleCardEffect(card);

                card.setDepth(0);

                this.tweens.add({
                    targets: card,
                    angle: 0,
                    x: this.cardPreview.x,
                    y: this.cardPreview.y,
                    displayWidth: this.gameOptions.cardWidth * this.gameOptions.boardSizeRatio,
                    displayHeight: this.gameOptions.cardHeight * this.gameOptions.boardSizeRatio,
                    duration: 150,
                    callbackScope: this,
                    onComplete: function (this: PlayGame) {
                        this.cameras.main.shake(300, 0.02);
                        this.boardGroup.add(card);
                        card.setTint(0xff0000);

                        this.tweens.add({
                            targets: card,
                            x: card.x - 1000,
                            duration: 300,
                            ease: 'Power2',
                            callbackScope: this,
                            onComplete: function (this: PlayGame) {
                                card.setVisible(false);
                                this.monster.setTint(0xff0000);

                                if (this.monster.getData('currentHP') < 0) {
                                    this.monster.setData('currentHP', 0);
                                }

                                this.drawHPBar();

                                this.time.delayedCall(100, () => {
                                    this.monster.clearTint();
                                });
                                this.background.setTint(0xff0000);
                                this.time.delayedCall(100, () => {
                                    this.background.clearTint();
                                });
                                if (this.monster.getData('currentHP') <= 0) {
                                    this.monster.setVisible(false);
                                    this.hpBarBackground.setVisible(false);
                                    this.hpBar.setVisible(false);
                                    this.handleVictory();
                                }
                            },
                        });

                        this.arrangeCardsOnBoard(false);
                    },
                });
            } else {
                this.handGroup.add(card);
                this.arrangeCardsInHand();
                this.showCostWarning();
            }
        });

        this.input.on('dragend', (pointer: Phaser.Input.Pointer, card: Phaser.GameObjects.Sprite, dropped: boolean) => {
            if (!this.handGroup.contains(card) && !this.boardGroup.contains(card)) {
                this.cardPreview.visible = false;

                if (!dropped) {
                    this.handGroup.add(card);
                    this.arrangeCardsInHand();
                }

                this.tweens.add({
                    targets: this.background,
                    alpha: 1,
                    duration: 150,
                });
            }
        });

        this.boardGroup = this.add.group();
        this.handGroup = this.add.group();

        this.background = this.add.sprite(
            (this.sys.game.config.width as number) / 2,
            (this.sys.game.config.height as number) / 2,
            'background'
        );

        this.monster = this.add.image(640, 420, 'monster');
        this.monster.setScale(1.3);
        this.monster.setData('maxHP', 100);
        this.monster.setData('currentHP', this.monster.getData('maxHP'));

        if (this.initialProps) {
            this.currentPlayerHP = this.initialProps.playerHP;
            this.maxPlayerHP = this.currentPlayerHP;
            this.currentGold = this.initialProps.gold;
        } else {
            console.error('initialProps is not set');
            // 기본값 설정 또는 에러 처리
            this.currentPlayerHP = 1000; // 예시 기본값
            this.maxPlayerHP = 1000;
            this.currentGold = 1000;
        }

        this.hpBarBackground = this.add.graphics();
        this.hpBar = this.add.graphics();
        this.drawHPBar();

        this.playerHPBarBackground = this.add.graphics();
        this.playerHPBar = this.add.graphics();
        this.drawPlayerHPBar();

        this.costText = this.add.text(50, 50, '', {
            font: '32px Arial',
            color: '#ffffff',
        });
        this.updateCostText();

        this.goldText = this.add.text(50, 90, '', {
            font: '32px Arial',
            color: '#ffffff',
        });
        this.updateGoldText();

        this.HPText = this.add.text(50, 150, '', {
            font: '32px Arial',
            color: '#ffffff',
        });
        this.updateHPText();

        this.endTurnButton = this.add
            .text(1000, 50, 'End Turn', {
                font: '32px Arial',
                color: '#ffffff',
                backgroundColor: '#ff0000',
                padding: { x: 10, y: 5 },
            })
            .setInteractive();

        this.endTurnButton.on('pointerdown', () => {
            this.endTurn();
        });

        this.createCardPreview();
        this.allCards = [];
        for (let i = 0; i < this.gameOptions.totalCards; i++) {
            const card = this.createCard(i);
            card.setVisible(false);
            this.allCards.push(card);
        }

        this.deck = Phaser.Utils.Array.Shuffle([...this.allCards]);
        this.drawCards(this.gameOptions.cardsInHand);

        this.zone = this.add.zone(650, 460, 800, 200);
        this.zone.setRectangleDropZone(800, 200);

        this.input.on('dragend', (pointer: Phaser.Input.Pointer, card: Phaser.GameObjects.Sprite, dropped: boolean) => {
            if (!this.handGroup.contains(card) && !this.boardGroup.contains(card)) {
                this.cardPreview.visible = false;

                if (!dropped) {
                    this.handGroup.add(card);
                    this.arrangeCardsInHand();
                }

                this.tweens.add({
                    targets: this.background,
                    alpha: 1,
                    duration: 150,
                });
            }
        });

        this.input.keyboard?.on('keydown-SPACE', () => {
            if (!this.isPlayerAlive) {
                window.location.reload();
            }
        });

        this.dimmedOverlay = this.add.graphics();
        this.dimmedOverlay.fillStyle(0x000000, 0.7);
        this.dimmedOverlay.fillRect(0, 0, this.sys.game.config.width as number, this.sys.game.config.height as number);
        this.dimmedOverlay.setVisible(false);

        this.gameOverText = this.add
            .text(
                (this.sys.game.config.width as number) / 2,
                (this.sys.game.config.height as number) / 2,
                'Game Over',
                {
                    font: '64px Arial',
                    color: '#ff0000',
                }
            )
            .setOrigin(0.5, 0.5);
        this.gameOverText.setVisible(false);
    }

    createCardPreview() {
        this.cardPreview = this.add.sprite(0, 0, 'cards');
        this.cardPreview.visible = false;
        this.cardPreview.alpha = 0.25;
        this.cardPreview.displayWidth = this.gameOptions.cardWidth * this.gameOptions.boardSizeRatio;
        this.cardPreview.displayHeight = this.gameOptions.cardHeight * this.gameOptions.boardSizeRatio;
        this.cardPreview.setOrigin(0.5, 1);
    }

    createCard(n: number): Phaser.GameObjects.Sprite {
        const coordinates = this.setHandCoordinates(n, this.gameOptions.totalCards);
        const card = this.add.sprite(coordinates.x, coordinates.y, 'cards', n);
        card.setOrigin(0.5, 1);
        card.rotation = coordinates.r;
        card.setData('handPosition', n);
        card.setInteractive({ draggable: true });
        card.displayWidth = this.gameOptions.cardWidth * this.gameOptions.handSizeRatio;
        card.displayHeight = this.gameOptions.cardHeight * this.gameOptions.handSizeRatio;

        const cardData = this.cards[n];

        card.setData('damage', cardData.damage || 0);
        card.setData('cost', cardData.cost || 0);
        card.setData('extraCost', cardData.extraCost || 0);
        card.setData('healAmount', cardData.healAmount || 0);
        card.setData('goldAmount', cardData.goldAmount || 0);
        card.setData('baseDamage', Number(cardData.baseDamage) || 0);
        card.setData('extraDamage', cardData.extraDamage || 0);
        card.setData('type', cardData.type);

        return card;
    }

    handleDraw() {
        let cardsToDraw = Math.min(this.gameOptions.cardsInHand, this.deck.length);

        if (cardsToDraw === 0) {
            console.log('덱이 비어 있습니다. 다시 셔플합니다.');
            this.allCards = [];
            for (let i = 0; i < this.gameOptions.totalCards; i++) {
                const card = this.createCard(i);
                card.setVisible(false);
                this.allCards.push(card);
            }
            this.deck = Phaser.Utils.Array.Shuffle([...this.allCards]);
            cardsToDraw = this.gameOptions.cardsInHand;
            console.log('덱 셔플 후:', this.deck);
        }

        if (cardsToDraw > 0) {
            this.drawCards(cardsToDraw);
        } else {
            console.log('No cards left to draw');
        }
    }

    drawCards(count: number) {
        const drawnCards = this.deck.splice(0, count);
        drawnCards.forEach((card: Phaser.GameObjects.Sprite) => {
            card.setPosition((this.sys.game.config.width as number) / 2, (this.sys.game.config.height as number) / 2);
            card.setVisible(true);
            card.clearTint();
            card.setAlpha(1);
            this.handGroup.add(card);
        });
        this.arrangeCardsInHand();
    }

    setPreviewCoordinates(n: number, totalCards: number): { x: number; y: number } {
        return {
            x:
                (this.sys.game.config.width as number) / 2 -
                (totalCards - 1) * this.gameOptions.cardWidth * this.gameOptions.boardSizeRatio * 0.6 +
                n * this.gameOptions.cardWidth * this.gameOptions.boardSizeRatio * 1.2,
            y: 700,
        };
    }

    arrangeCardsOnBoard(preview: boolean) {
        const cardsOnBoard = this.boardGroup.countActive() + (preview ? 1 : 0);

        function isSprite(gameObject: Phaser.GameObjects.GameObject): gameObject is Phaser.GameObjects.Sprite {
            return gameObject instanceof Phaser.GameObjects.Sprite;
        }

        this.boardGroup.getChildren().forEach((card, index) => {
            if (isSprite(card)) {
                const coordinates = this.setPreviewCoordinates(index, cardsOnBoard);
                card.x = coordinates.x;
                card.y = coordinates.y;
            }
        });

        if (preview) {
            const cardPreviewPosition = this.setPreviewCoordinates(cardsOnBoard - 1, cardsOnBoard);
            this.cardPreview.x = cardPreviewPosition.x;
            this.cardPreview.y = cardPreviewPosition.y;
        }
    }

    setHandCoordinates(n: number, totalCards: number): { x: number; y: number; r: number } {
        const rotation = (Math.PI / 4 / totalCards) * (totalCards - n - 1);
        const xPosition = (this.sys.game.config.width as number) + 200 * Math.cos(rotation + Math.PI / 2);
        const yPosition = (this.sys.game.config.height as number) + 200 - 200 * Math.sin(rotation + Math.PI / 2);
        return {
            x: xPosition,
            y: yPosition,
            r: -rotation,
        };
    }

    drawHPBar() {
        const barWidth = 200;
        const barHeight = 20;

        this.hpBarBackground.clear();
        this.hpBarBackground.fillStyle(0x000000, 1);
        this.hpBarBackground.fillRect(this.monster.x - barWidth / 2, this.monster.y - 300, barWidth, barHeight);

        const hpPercentage = this.monster.getData('currentHP') / this.monster.getData('maxHP');
        this.hpBar.clear();
        this.hpBar.fillStyle(0xff0000, 1);
        this.hpBar.fillRect(this.monster.x - barWidth / 2, this.monster.y - 300, barWidth * hpPercentage, barHeight);
    }

    drawPlayerHPBar() {
        if (!this.playerHPBar) {
            this.playerHPBar = this.add.graphics();
        }
        this.playerHPBar.clear();
        const barWidth = 200;
        const barHeight = 20;

        const hpPercentage = Math.max(this.currentPlayerHP / this.maxPlayerHP, 0);

        this.playerHPBar.fillStyle(0x000000, 1);
        this.playerHPBar.fillRect(50, 130, barWidth, barHeight);

        this.playerHPBar.fillStyle(0x00ff00, 1);
        this.playerHPBar.fillRect(50, 130, barWidth * hpPercentage, barHeight);
        console.log(`Drawing HP bar: ${this.currentPlayerHP}/${this.maxPlayerHP}`);
    }

    arrangeCardsInHand() {
        function isSprite(gameObject: Phaser.GameObjects.GameObject): gameObject is Phaser.GameObjects.Sprite {
            return gameObject instanceof Phaser.GameObjects.Sprite;
        }

        this.handGroup.getChildren().forEach((gameObject, i) => {
            if (isSprite(gameObject)) {
                const card = gameObject;
                card.setDepth(i);
                const coordinates = this.setHandCoordinates(i, this.handGroup.countActive());
                this.tweens.add({
                    targets: card,
                    rotation: coordinates.r,
                    x: coordinates.x,
                    y: coordinates.y,
                    displayWidth: this.gameOptions.cardWidth / 2,
                    displayHeight: this.gameOptions.cardHeight / 2,
                    duration: 150,
                });
            }
        });
    }

    startTurn() {
        this.currentCost = this.maxCostPerTurn;
    }

    endTurn() {
        this.handGroup.clear(true, false);
        this.arrangeCardsInHand();
        this.monsterAttack();
        this.handleDraw();
        this.startTurn();
        this.updateCostText();
    }

    updateCostText() {
        this.costText.setText(`Cost: ${this.currentCost}/${this.maxCostPerTurn}`);
    }

    updateGoldText() {
        if (this.goldText) {
            this.goldText.setText(`Gold: ${this.currentGold}`);
        } else {
            console.warn('goldText is not initialized');
        }
    }

    updateHPText() {
        if (this.HPText) {
            this.HPText.setText(`HP: ${this.currentPlayerHP}/${this.maxPlayerHP}`);
        } else {
            console.warn('HPText is not initialized');
        }
    }

    showCostWarning() {
        const warningText = this.add
            .text(680, 500, '코스트가 부족합니다', {
                font: '64px Arial',
                color: '#ffffff',
            })
            .setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: warningText,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: function (this: Phaser.Tweens.Tween) {
                warningText.destroy();
            },
        });
    }

    takeDamage(damage: number) {
        console.log('Taking damage:', damage);

        const newHP = this.currentPlayerHP - damage;
        const clampedHP = Math.max(newHP, 0);

        this.currentPlayerHP = clampedHP;

        const damageText = this.add
            .text(100, 100, `-${damage}`, {
                font: '32px Arial',
                color: '#ff0000',
            })
            .setOrigin(0.5, 0.5);

        damageText.setPosition(100, 150);

        this.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: function (this: Phaser.Tweens.Tween) {
                damageText.destroy();
            },
        });

        if (clampedHP <= 0) {
            this.handlePlayerDeath();
        }
    }

    monsterAttack() {
        const setPlayerHP = this.initialProps.setPlayerHP;
        if (!this.isPlayerAlive || !setPlayerHP) return;

        const scratch = this.add.image(640, 310, 'scratch');

        this.tweens.add({
            targets: scratch,
            x: 640,
            y: 310,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: function (this: Phaser.Tweens.Tween) {
                scratch.setVisible(false);
            },
        });
        this.cameras.main.shake(300, 0.2);

        const damage = Phaser.Math.Between(15, 20);
        this.currentPlayerHP = Math.max(this.currentPlayerHP - damage, 0);
        this.initialProps.setPlayerHP(this.currentPlayerHP);

        this.drawPlayerHPBar();
        this.updateHPText();

        if (this.currentPlayerHP <= 0) {
            this.handlePlayerDeath();
        }
    }

    handlePlayerDeath() {
        console.log('플레이어가 사망했습니다!');

        this.isPlayerAlive = false;
        this.dimmedOverlay.setVisible(true);
        if (this.input.mouse) {
            this.input.mouse.enabled = false;
        }

        this.add
            .text(
                (this.sys.game.config.width as number) / 2,
                (this.sys.game.config.height as number) / 2 + 100,
                '스페이스 바를 누르면 게임이 다시 시작됩니다.',
                {
                    font: '32px Arial',
                    color: '#ffffff',
                }
            )
            .setOrigin(0.5, 0.5);

        this.gameOverText.setVisible(true);
    }

    healPlayer(amount: number) {
        const newHP = this.currentPlayerHP + amount;
        const clampedHP = Math.min(newHP, this.maxPlayerHP);

        this.currentPlayerHP = clampedHP;
        this.initialProps.setPlayerHP(clampedHP);

        this.drawPlayerHPBar();
        this.updateHPText();

        console.log(`Player healed for ${amount}. New HP: ${clampedHP}`);
    }

    handleVictory() {
        this.dimmedOverlay.setVisible(true);

        const victory = this.add.image(600, 400, 'victory');
        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 500,
            ease: 'Back.easeIn',
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const v = tween.getValue();
                const minScale = 0.5;
                // const maxScale = 1.5;
                const currentScale = 1 + v;
                victory.setScale(Math.max(minScale, currentScale));
            },
            onComplete: () => {
                this.tweens.addCounter({
                    from: 1,
                    to: 0,
                    duration: 200,
                    ease: 'Power1',
                    onUpdate: (tween: Phaser.Tweens.Tween) => {
                        const v = tween.getValue();
                        const minScale = 0.5;
                        const maxScale = 1.5;
                        const currentScale = 1 + v * (maxScale - minScale);
                        victory.setScale(currentScale);
                    },
                });
            },
        });

        this.input.once('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.initialProps.onSceneChange('map');
            });
        });
    }

    handleCardEffect(card: Phaser.GameObjects.Sprite) {
        console.log('handleCardEffect called for card:', card);
        console.log('Card type:', card.getData('type'));
        const cardCost = Number(card.getData('cost')) || 0;
        switch (card.getData('type')) {
            case 'attack':
                this.currentCost -= cardCost;
                this.updateCostText();
                this.dealDamage(card.getData('damage'));
                break;
            case 'heal':
                this.currentCost -= cardCost;
                this.updateCostText();
                this.healPlayer(card.getData('healAmount'));
                break;
            case 'gold':
                this.currentCost -= cardCost;
                this.updateCostText();
                console.log('Gold card used, calling gainGold');
                this.gainGold(card.getData('goldAmount'));
                break;
            case 'enhanced_attack':
                this.handleEnhancedAttack(card);
                break;
            default:
                break;
        }
    }

    handleEnhancedAttack(card: Phaser.GameObjects.Sprite) {
        console.log('Current cost before enhanced attack:', this.currentCost);
        if (card.getData('type') === 'enhanced_attack') {
            const baseCost = Number(card.getData('cost')) || 0;
            const extraCost = Number(card.getData('extraCost')) || 0;
            const baseDamage = Number(card.getData('baseDamage')) || 0;
            const extraDamage = Number(card.getData('extraDamage')) || 0;

            let totalDamage = baseDamage;
            let totalCost = baseCost;

            // extraCost를 지불할 수 있는지 확인
            if (this.currentCost >= baseCost + extraCost) {
                totalDamage += extraDamage;
                totalCost += extraCost;
                console.log(
                    `Enhanced attack! Dealing ${totalDamage} damage (${baseDamage} + ${extraDamage}) Cost (${baseCost} + ${extraCost})`
                );
            } else if (this.currentCost >= baseCost) {
            } else {
                this.showCostWarning();
                return;
            }

            this.currentCost -= totalCost;
            this.dealDamage(totalDamage);
            this.updateCostText();
            // 여기에 몬스터 HP 체크 로직 추가
            if (this.monster.getData('currentHP') <= 0) {
                this.handleMonsterDefeat();
            }
        }
    }

    // 새로운 메서드 추가
    handleMonsterDefeat() {
        this.monster.setVisible(false);
        this.hpBarBackground.setVisible(false);
        this.hpBar.setVisible(false);
        const rewardGold = 20;
        this.gainGold(rewardGold);
        this.handleVictory();
    }

    dealDamage = (amount: number): void => {
        console.log('Dealing damage:', amount);

        const currentHP = Number(this.monster.getData('currentHP')) || 0;
        const newHP = Math.max(currentHP - amount, 0);
        this.monster.setData('currentHP', newHP);

        const damageText = this.add
            .text(this.monster.x, this.monster.y - 150, `-${amount}`, {
                font: '64px Arial',
                color: '#FFFFFF',
            })
            .setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: damageText,
            y: this.monster.y - 200,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: function (this: Phaser.Tweens.Tween) {
                damageText.destroy();
            },
        });

        this.drawHPBar();
        if (newHP <= 0) {
            this.handleMonsterDefeat();
        }
    };
    gainGold(amount: number): void {
        console.log(`gainGold called with amount: ${amount}`);
        this.props.setGold((prevGold) => prevGold + amount);
        this.currentGold += amount;
        this.updateGoldText();
    }
    update(): void {
        if (!this.isPlayerAlive) {
            return;
        }
        // 추가적인 업데이트 로직이 필요한 경우 여기에 구현
    }
}

const Card2: React.FC<Card2Props> = (props) => {
    const gameContainer = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameContainer.current) return;

        if (!gameInstanceRef.current) {
            const gameConfig: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    parent: gameContainer.current,
                    width: 1280,
                    height: 740,
                },
                scene: [PlayGame],
            };
            gameInstanceRef.current = new Phaser.Game(gameConfig);

            gameInstanceRef.current.events.once('ready', () => {
                const scene = gameInstanceRef.current?.scene.getScene('PlayGame') as PlayGame;
                if (scene) {
                    scene.init(props);
                }
            });

            // 씬이 생성될 때까지 기다립니다
            const initScene = () => {
                const scene = gameInstanceRef.current?.scene.getScene('PlayGame') as PlayGame | undefined;
                if (scene) {
                    scene.init(props);
                } else {
                    requestAnimationFrame(initScene);
                }
            };

            requestAnimationFrame(initScene);
        }

        return () => {
            if (gameInstanceRef.current) {
                gameInstanceRef.current.destroy(true);
                gameInstanceRef.current = null;
            }
        };
    }, []); // Empty dependency array

    useEffect(() => {
        if (gameInstanceRef.current) {
            const scene = gameInstanceRef.current.scene.getScene('PlayGame') as PlayGame | null;
            if (scene) {
                scene.init(props);
            } else {
                console.error('PlayGame scene not found');
            }
        }
    }, [props.playerHP, props.gold]); // Only re-run when playerHP or gold changes

    return <div ref={gameContainer} style={{ width: 1280, height: 740 }} />;
};

export default Card2;
