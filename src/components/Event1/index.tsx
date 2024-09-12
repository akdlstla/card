import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Phaser from 'phaser';

interface Event1Props {
    playerHP: number;
    setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
    gold: number;
    setGold: React.Dispatch<React.SetStateAction<number>>;
    onSceneChange: (scene: string) => void;
}

interface Choice {
    text: string;
    nextDialogue?: string[];
    nextChoice?: Choice[];
    reward?: {
        gold?: number;
        hp?: number;
        life?: number;
    };
    action?: () => void;
    isLastChoice?: boolean;
}

class EventScene extends Phaser.Scene {
    private dialogue: string[];
    private choices: Choice[];
    private textIndex: number;
    private currentText: string;
    private typingSpeed: number;
    private currentPlayerHP: number;
    private maxPlayerHP: number;
    private currentGold: number;
    private updateGameState: (state: { playerHP?: number; gold?: number }) => void;
    private changeScene: (scene: string) => void;
    private continueButton: Phaser.GameObjects.Text | null; // 이 줄을 추가합니다

    constructor(
        updateGameState: (state: { playerHP?: number; gold?: number }) => void,
        changeScene: (scene: string) => void,
        initialPlayerHP: number,
        initialGold: number
    ) {
        super({ key: 'EventScene' });
        this.updateGameState = updateGameState;
        this.changeScene = changeScene;
        this.textIndex = 0;
        this.currentText = '';
        this.typingSpeed = 5;
        this.currentPlayerHP = initialPlayerHP;
        this.maxPlayerHP = initialPlayerHP;
        this.currentGold = initialGold;
        this.continueButton = null; // 이 줄을 추가합니다
        this.dialogue = [
            '당신은 숲길을 걷다가 한 무리의 사람들을 만났다.',
            '사람1: 젠장 오늘도 헛수고군.',
            '사람2: 아니 그러게 내가 뭐랬어?! 왼쪽이 더 자리가 괜찮았다니까?',
            '사람3: 자자 싸우지들 마시게. 오늘이 날이 아닌거겠지. ',
            '당신은 한 무리의 사람들에게 숲길을 계속 걸어가면 늪이 나온다는 것과',
            '거기에서 유행하고 있는 낚시대회에 대하여 듣게되었다.',
            '숲길을 벗어나 늪으로 간 당신은 낚시 대회가 열리는 장소를 금방 찾을 수 있었다.',
            '어떻게 할까?',
        ];
        this.choices = [
            {
                text: '낚시 대회에 참여한다.',
                nextDialogue: [
                    '진행자: 자! 오늘도 저희 낚시 대회에 오신 걸 환영합니다! 낚시 대회에 1등하시면 무려 10Gold를 드립니다!',
                    '당신은 낚시대회의 상금을 듣자 솔깃해져 낚시대회에 참가하기로 한다.',
                    '낚시 대회에 빈 자리는 세 군데 밖에 안남았다. 어디에 앉아서 낚시를 진행할까?',
                ],
                nextChoice: [
                    {
                        text: '왼쪽에 있는 낚시대가 걸려있는 중앙 의자로 간다.',
                        nextDialogue: [
                            '당신은 왼쪽에 있는 낚시대가 걸려있는 중앙 의자로 갔다.',
                            '이윽고 당신의 손에 입질이 오기 시작한다.',
                            '무거운 손맛에 낚시대를 홱 하고 당기다가 당신은 그만 뒤로 나자빠지면서 머리를 바닥에 부딪혔다.',
                            '당연히 물고기는 도망갔다.',
                        ],
                        reward: { hp: -5 },
                        isLastChoice: true,
                    },
                    {
                        text: '중앙에 있는 낚시대가 걸려있는 오른쪽 의자로 간다. ',
                        nextDialogue: [
                            '당신은 중앙에 있는 낚시대가 걸려있는 오른쪽 의자로 갔다.',
                            '이윽고 당신의 손에 입질이 오기 시작한다.',
                            '무거운 손맛에 낚시대를 홱 하고 당긴다.',
                            '낚여온 건... 바로 엄청 난 크기의 메기였다!',
                            '당연히 당신이 우승했고 당신은 10gold를 얻었다.',
                        ],
                        reward: { gold: 10 },
                        isLastChoice: true,
                    },
                    {
                        text: '오른쪽에 있는 낚시대가 걸려있는 왼쪽 의자로 간다. ',
                        nextDialogue: [
                            '당신은 오른쪽에 있는 낚시대가 걸려있는 왼쪽 의자로 갔다.',
                            '이상하다... 아무리 기다려도 입질이 오지 않는다.',
                            '분명 한 무리의 사람들이 추천한 자리였는데...',
                            '결국 낚시대회가 끝날 때까지 당신은 한마리도 낚지 못했다.',
                            '허무한 마음에 짐을 챙기고 일어나려는데 당신의 돈자루가 가벼워 진 걸 느꼈다.',
                            '자세히 보니 골드가 어느정도 없어졌다.',
                            '"아... 낚인 건 나였나?"',
                            '당신은 5gold를 잃었다.',
                        ],
                        reward: { gold: -5 },
                        isLastChoice: true,
                    },
                ],
            },
            {
                text: '가던 길을 간다.',
                nextDialogue: ['갈 길이 바쁜 당신은 낚시 대회를 못 본 척하고 떠나기로 결심한다.'],
                action: () => this.changeScene('map'),
            },
        ];
    }

    create() {
        this.displayText();
    }

    displayText() {
        if (this.textIndex < this.dialogue.length) {
            this.currentText = '';
            this.typeText(this.dialogue[this.textIndex], () => {
                this.textIndex++;
                if (this.textIndex < this.dialogue.length) {
                    this.time.delayedCall(200, this.displayText, [], this);
                } else {
                    // 모든 대화가 끝났을 때
                    if (this.choices.length > 0) {
                        this.displayChoices();
                    } else {
                        // 선택지가 없다면 이벤트 종료
                        this.time.delayedCall(1000, this.showResultAndContinueButton, [], this);
                    }
                }
            });
        }
    }

    typeText(text: string, onComplete: () => void) {
        const textObject = this.add.text(100, 100 + this.textIndex * 50, '', {
            font: '24px Arial',
            color: '#ffffff',
        });

        let charIndex = 0;
        const typeNextChar = () => {
            if (charIndex < text.length) {
                this.currentText += text[charIndex];
                textObject.setText(this.currentText);
                charIndex++;
                this.time.delayedCall(this.typingSpeed, typeNextChar, [], this);
            } else {
                onComplete();
            }
        };

        typeNextChar();
    }

    displayChoices() {
        this.choices.forEach((choice, index) => {
            this.add
                .text(100, 500 + index * 50, choice.text, { font: '24px Arial', color: '#ffcc00' })
                .setInteractive()
                .on('pointerdown', () => this.chooseReward(choice));
        });
    }

    chooseReward(choice: Choice) {
        console.log('chooseReward called with choice:', choice.text);

        if (choice.action) {
            console.log('Executing choice action');
            choice.action();
            return;
        }

        //let rewardApplied = false;

        if (choice.reward) {
            console.log('Applying reward:', choice.reward);
            if (choice.reward.gold !== undefined) {
                this.currentGold = Math.max(0, this.currentGold + choice.reward.gold);
                this.updateGameState({ gold: choice.reward.gold });
                console.log(
                    `Gold ${choice.reward.gold >= 0 ? 'increased' : 'decreased'} by ${Math.abs(
                        choice.reward.gold
                    )}. New total: ${this.currentGold}`
                );
                //rewardApplied = true;
            }
            if (choice.reward.hp !== undefined) {
                this.currentPlayerHP = Math.max(0, Math.min(this.currentPlayerHP + choice.reward.hp, this.maxPlayerHP));
                this.updateGameState({ playerHP: choice.reward.hp });
                console.log(
                    `HP ${choice.reward.hp >= 0 ? 'increased' : 'decreased'} by ${Math.abs(
                        choice.reward.hp
                    )}. New total: ${this.currentPlayerHP}`
                );
                // rewardApplied = true;
            }
        }

        if (choice.nextDialogue && choice.nextDialogue.length > 0) {
            console.log('Moving to next dialogue');
            this.dialogue = choice.nextDialogue;
            this.choices = choice.nextChoice || [];
            this.textIndex = 0;
            this.clearPreviousText();
            this.displayText();
        } else if (choice.isLastChoice) {
            console.log('This is the last choice. Event is ending.');
            this.clearPreviousText();
            this.showResultAndContinueButton();
        } else {
            console.log('No next dialogue or choice, but not marked as last. Continuing...');
            this.displayChoices();
        }
    }

    showResultAndContinueButton() {
        console.log('showResultAndContinueButton called');
        this.clearPreviousText();

        this.add
            .text(640, 300, '이벤트가 종료되었습니다.', {
                font: '32px Arial',
                color: '#ffffff',
            })
            .setOrigin(0.5);
        console.log('Result text added');

        this.continueButton = this.add
            .text(640, 400, '여정 계속하기', {
                font: '28px Arial',
                color: '#ffcc00',
                backgroundColor: '#333333',
                padding: { x: 20, y: 10 },
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                console.log('Continue button clicked, changing scene to map');
                this.changeScene('map');
            })
            .on('pointerover', () => this.continueButton?.setStyle({ color: '#ffffff' }))
            .on('pointerout', () => this.continueButton?.setStyle({ color: '#ffcc00' }));
        console.log('Continue button added');
    }

    clearPreviousText() {
        this.children.getAll().forEach((child) => {
            if (child instanceof Phaser.GameObjects.Text) {
                child.destroy();
            }
        });
    }
}

const Event1: React.FC<Event1Props> = ({ playerHP, setPlayerHP, gold, setGold, onSceneChange }) => {
    const gameContainer = useRef<HTMLDivElement>(null);
    const [game, setGame] = useState<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameContainer.current) return;

        const updateGameState = (state: { playerHP?: number; gold?: number }) => {
            if (state.playerHP !== undefined) setPlayerHP((prev) => Math.max(0, prev + playerHP));
            if (state.gold !== undefined) setGold((prev) => Math.max(0, prev + gold));
        };

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                parent: gameContainer.current,
                width: 1280,
                height: 740,
            },
            scene: new EventScene(updateGameState, onSceneChange, playerHP, gold),
        };

        const newGame = new Phaser.Game(config);
        setGame(newGame);

        return () => {
            newGame.destroy(true);
        };
    }, []);
    useEffect(() => {
        if (game) {
            // game 인스턴스를 사용한 추가 로직
            console.log('Phaser game instance:', game);
        }
    }, [game]);
    return <div ref={gameContainer} style={{ width: 1280, height: 740 }} />;
};

export default dynamic(() => Promise.resolve(Event1), { ssr: false });
