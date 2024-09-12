import React, { useRef, useEffect } from 'react';
import Phaser from 'phaser';

// 이미지 import (Next.js에서는 public 폴더에 이미지를 저장합니다)
import villageImg from '../../../public/images/Village.jpg';
import blacksmithImg from '../../../public/images/blacksmith.jpg';
import innImg from '../../../public/images/inn.jpg';
import veteran from '../../../public/images/veteran.jpg';
import skill from '../../../public/images/skillmaster.jpg';
import man from '../../../public/images/man.jpg';

// Props 타입 정의
interface VillageProps {
    onSceneChange: (scene: string) => void;
    playerHP: number;
    setPlayerHP: React.Dispatch<React.SetStateAction<number>>;
    gold: number;
    setGold: React.Dispatch<React.SetStateAction<number>>;
    maxPlayerHP: number;
}
interface DialogueOption {
    text: string;
    nextId?: string;
    action?: () => void;
}

interface DialogueEntry {
    id: string;
    text: string;
    next: string | DialogueOption[];
}

// 무기 타입 정의
interface Weapon {
    name: string;
    price: number;
}

const Village: React.FC<VillageProps> = ({ onSceneChange, playerHP, setPlayerHP, gold, setGold, maxPlayerHP }) => {
    const gameContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Phaser 씬 클래스 정의
        class VillageScene extends Phaser.Scene {
            private circles: Record<string, Phaser.GameObjects.Arc> = {};
            private dialogueGroup!: Phaser.GameObjects.Group;
            private goldText!: Phaser.GameObjects.Text;
            private hpText!: Phaser.GameObjects.Text;
            private goldValue: number;
            private hpValue: number;
            private maxPlayerHP: number; // 최대 체력 설정

            constructor() {
                super({ key: 'Village' });
                this.circles = {};
                this.dialogueGroup = {} as Phaser.GameObjects.Group;
                this.goldValue = gold;
                this.hpValue = playerHP;
                this.maxPlayerHP = maxPlayerHP;
            }

            preload() {
                this.load.image('village', villageImg.src);
                this.load.image('blacksmith', blacksmithImg.src);
                this.load.image('inn', innImg.src);
                this.load.image('veteran', veteran.src);
                this.load.image('skill', skill.src);
                this.load.image('man', man.src);
            }

            create() {
                this.add.image(640, 340, 'village');

                // Gold 표시
                this.goldText = this.add.text(10, 40, `Gold: ${this.goldValue}`, {
                    font: '24px Arial',
                    color: '#ffffff',
                });

                // HP 표시
                this.hpText = this.add.text(10, 10, `HP: ${this.hpValue}`, { font: '24px Arial', color: '#ffffff' });

                this.dialogueGroup = this.add.group();

                // 무기점
                const weaponShop = this.add.circle(1160, 300, 50, 0xffffff, 0.5).setInteractive();
                weaponShop.setScale(2);
                weaponShop.on('pointerdown', () => {
                    this.hideAllCircles();
                    this.showBlacksmithDialogue();
                });

                // 다른 이벤트들
                const skill = this.add.circle(710, 410, 50, 0xffffff, 0.5).setInteractive();
                skill.setScale(2.3);
                skill.on('pointerdown', () => {
                    this.hideAllCircles();
                    this.showSkillDialogue();
                });

                const inn = this.add.circle(350, 100, 50, 0xffffff, 0.5).setInteractive();
                inn.setScale(2);
                inn.on('pointerdown', () => {
                    this.hideAllCircles();
                    this.showinnDialogue();
                });

                const square = this.add.circle(660, 295, 30, 0xffff33, 0.5).setInteractive();
                square.setScale(2);
                square.on('pointerdown', () => {
                    this.hideAllCircles();
                    this.showVeteranDialogue();
                });

                const farm = this.add.circle(200, 550, 50, 0xffff33, 0.5).setInteractive();
                farm.setScale(2);
                farm.on('pointerdown', () => {
                    this.hideAllCircles();
                    this.showfarmDialogue();
                });

                const exit = this.add.circle(600, 770, 50, 0xff0000, 0.5).setInteractive();
                exit.setScale(4);
                exit.on('pointerdown', () => {
                    onSceneChange('map');
                });

                this.circles = { weaponShop, skill, inn, square, farm, exit };
            }

            hideAllCircles = () => {
                Object.values(this.circles).forEach((circle) => circle.setVisible(false));
            };

            showBlacksmithDialogue() {
                this.dialogueGroup.clear(true, true);

                const dialogueBox = this.add.graphics();
                dialogueBox.fillStyle(0x000000, 0.7);
                dialogueBox.fillRect(200, 450, 1080, 290);
                this.dialogueGroup.add(dialogueBox);

                const blacksmithImage = this.add.image(150, 600, 'blacksmith').setScale(0.3);
                this.dialogueGroup.add(blacksmithImage);

                const dialogues: DialogueEntry[] = [
                    {
                        id: 'intro',
                        text: '대장장이: "모험가인가? 오르페우스 무기점에 온 걸 환영하네"',
                        next: 'welcome',
                    },
                    {
                        id: 'welcome',
                        text: '대장장이: "다양한 무기가 있으니 골라보게!"',
                        next: 'shop',
                    },
                    {
                        id: 'shop',
                        text: '무기를 구매하시겠습니까?',
                        next: [
                            { text: '네', action: () => this.showWeaponShop() },
                            { text: '아니오', action: () => this.closeDialogue() },
                        ],
                    },
                ];

                let currentDialogueText: Phaser.GameObjects.Text | null = null;
                let currentButtons: Phaser.GameObjects.Text[] = [];

                const showDialogue = (id: string) => {
                    const currentDialogue = dialogues.find((d) => d.id === id);
                    if (!currentDialogue) return;

                    if (currentDialogueText) currentDialogueText.destroy();
                    currentButtons.forEach((button) => button.destroy());
                    currentButtons = [];

                    currentDialogueText = this.add.text(350, 500, currentDialogue.text, {
                        font: '28px Arial',
                        color: '#ffffff',
                        wordWrap: { width: 800 },
                    });
                    currentDialogueText.setLineSpacing(10);
                    this.dialogueGroup.add(currentDialogueText);

                    if (typeof currentDialogue.next === 'string') {
                        dialogueBox.setInteractive(
                            new Phaser.Geom.Rectangle(200, 450, 1080, 290),
                            Phaser.Geom.Rectangle.Contains
                        );
                        dialogueBox.on('pointerdown', () => {
                            dialogueBox.off('pointerdown');
                            showDialogue(currentDialogue.next as string);
                        });

                        const clickPrompt = this.add.text(1100, 700, '클릭하여 계속', {
                            font: '20px Arial',
                            color: '#ffcc00',
                        });
                        this.dialogueGroup.add(clickPrompt);
                        currentButtons.push(clickPrompt);
                    } else if (Array.isArray(currentDialogue.next)) {
                        currentDialogue.next.forEach((option, index) => {
                            const button = this.add
                                .text(350, 600 + index * 50, option.text, {
                                    font: '24px Arial',
                                    color: '#ffcc00',
                                })
                                .setInteractive();
                            this.dialogueGroup.add(button);
                            currentButtons.push(button);

                            button.on('pointerdown', () => {
                                if (option.action) {
                                    option.action();
                                } else if (option.nextId) {
                                    showDialogue(option.nextId);
                                }
                            });
                        });
                    }
                };

                showDialogue('intro');
            }

            showWeaponShop() {
                const weapons: Weapon[] = [
                    { name: '단검', price: 10 },
                    { name: '브로드 소드', price: 20 },
                    { name: '원형 방패', price: 15 },
                ];

                const dialogueBox = this.add.graphics();
                dialogueBox.fillStyle(0x000000, 0.7);
                dialogueBox.fillRect(0, 0, 1280, 740);

                weapons.forEach((weapon, index) => {
                    const weaponText = this.add
                        .text(400, 300 + index * 50, `${weapon.name} - ${weapon.price} 골드`, {
                            font: '24px Arial',
                            color: '#ffffff',
                        })
                        .setInteractive()
                        .on('pointerdown', () => {
                            this.purchaseWeapon(weapon);
                        });
                    this.dialogueGroup.add(dialogueBox);
                    this.dialogueGroup.add(weaponText);
                });
                // 나가기 버튼 배경
                const exitButtonBackground = this.add.graphics();
                exitButtonBackground.fillStyle(0xff0000, 1);
                exitButtonBackground.fillRoundedRect(1100, 620, 160, 60, 10);
                exitButtonBackground.setInteractive(
                    new Phaser.Geom.Rectangle(1100, 620, 160, 60),
                    Phaser.Geom.Rectangle.Contains
                );
                this.dialogueGroup.add(exitButtonBackground);

                // 나가기 버튼 텍스트
                const exitButton = this.add
                    .text(1180, 650, '나가기', {
                        font: 'bold 28px Arial',
                        color: '#ffffff',
                    })
                    .setOrigin(0.5);

                const exitShop = () => {
                    this.closeDialogue();
                    Object.values(this.circles).forEach((circle) => circle.setVisible(true));
                    exitButtonBackground.destroy();
                    exitButton.destroy();
                };

                // 나가기 버튼 호버 효과 및 클릭 이벤트
                [exitButtonBackground, exitButton].forEach((item) => {
                    item.setInteractive();
                    item.on('pointerover', () => {
                        exitButtonBackground.clear();
                        exitButtonBackground.fillStyle(0xff5a5a, 1);
                        exitButtonBackground.fillRoundedRect(1100, 620, 160, 60, 10);
                        exitButton.setStyle({ color: '#ffff00' });
                    });

                    item.on('pointerout', () => {
                        exitButtonBackground.clear();
                        exitButtonBackground.fillStyle(0xff0000, 1);
                        exitButtonBackground.fillRoundedRect(1100, 620, 160, 60, 10);
                        exitButton.setStyle({ color: '#ffffff' });
                    });

                    item.on('pointerdown', exitShop);
                });

                this.dialogueGroup.add(exitButton);
            }

            purchaseWeapon(weapon: Weapon) {
                if (this.goldValue >= weapon.price) {
                    this.goldValue -= weapon.price;
                    setGold(this.goldValue);
                    this.goldText.setText(`Gold: ${this.goldValue}`);
                    console.log(`${weapon.name} 구매 완료!`);
                    const purchaseText = this.add.text(400, 500, `${weapon.name}을(를) 구매했습니다!`, {
                        font: '24px Arial',
                        color: '#00ff00',
                    });
                    this.time.delayedCall(800, () => {
                        purchaseText.destroy();
                    });
                } else {
                    const errorText = this.add.text(400, 500, '골드가 부족합니다!', {
                        font: '24px Arial',
                        color: '#ff0000',
                    });
                    this.time.delayedCall(800, () => {
                        errorText.destroy();
                    });
                }
            }

            closeDialogue() {
                this.dialogueGroup.clear(true, true);
                Object.values(this.circles).forEach((circle) => circle.setVisible(true));
            }

            showinnDialogue() {
                this.dialogueGroup.clear(true, true);

                const dialogueBox = this.add.graphics();
                dialogueBox.fillStyle(0x000000, 0.7);
                dialogueBox.fillRect(200, 450, 1080, 290);
                this.dialogueGroup.add(dialogueBox);

                const innImage = this.add.image(150, 600, 'inn').setScale(0.3);
                this.dialogueGroup.add(innImage);

                const dialogues: DialogueEntry[] = [
                    {
                        id: 'intro',
                        text: '여관직원: "안녕하세요 모험가님 낙원의 주점에 오신 걸 환영합니다"',
                        next: 'welcome',
                    },
                    {
                        id: 'welcome',
                        text: '여관직원: "저희 주점에서 편안히 쉬시고 체력도 회복하세요!"',
                        next: 'cost',
                    },
                    {
                        id: 'cost',
                        text: '여관직원: "숙박료는 5gold 입니다!"',
                        next: 'rest',
                    },
                    {
                        id: 'rest',
                        text: '휴식을 취하시겠습니까? (5 골드)',
                        next: [
                            { text: '네', action: () => this.rest() },
                            { text: '아니오', action: () => this.closeDialogue() },
                        ],
                    },
                ];

                let currentDialogueText: Phaser.GameObjects.Text | null = null;
                let currentButtons: Phaser.GameObjects.Text[] = [];

                const showDialogue = (id: string) => {
                    const currentDialogue = dialogues.find((d) => d.id === id);
                    if (!currentDialogue) return;

                    if (currentDialogueText) currentDialogueText.destroy();
                    currentButtons.forEach((button) => button.destroy());
                    currentButtons = [];

                    currentDialogueText = this.add.text(350, 500, currentDialogue.text, {
                        font: '28px Arial',
                        color: '#ffffff',
                        wordWrap: { width: 800 },
                    });
                    currentDialogueText.setLineSpacing(10);
                    this.dialogueGroup.add(currentDialogueText);

                    if (typeof currentDialogue.next === 'string') {
                        dialogueBox.setInteractive(
                            new Phaser.Geom.Rectangle(200, 450, 1080, 290),
                            Phaser.Geom.Rectangle.Contains
                        );
                        dialogueBox.on('pointerdown', () => {
                            dialogueBox.off('pointerdown');
                            showDialogue(currentDialogue.next as string);
                        });

                        const clickPrompt = this.add.text(1100, 700, '클릭하여 계속', {
                            font: '20px Arial',
                            color: '#ffcc00',
                        });
                        this.dialogueGroup.add(clickPrompt);
                        currentButtons.push(clickPrompt);
                    } else if (Array.isArray(currentDialogue.next)) {
                        currentDialogue.next.forEach((option, index) => {
                            const button = this.add
                                .text(350, 600 + index * 50, option.text, {
                                    font: '24px Arial',
                                    color: '#ffcc00',
                                })
                                .setInteractive();
                            this.dialogueGroup.add(button);
                            currentButtons.push(button);

                            button.on('pointerdown', () => {
                                if (option.action) {
                                    option.action();
                                } else if (option.nextId) {
                                    showDialogue(option.nextId);
                                }
                            });
                        });
                    }
                };

                showDialogue('intro');
            }
            rest() {
                const restCost = 5; // 휴식 비용

                // 배경을 어둡게 만드는 함수
                const createDimmedBackground = () => {
                    const dimmer = this.add.graphics();
                    dimmer.fillStyle(0x000000, 0.7);
                    dimmer.fillRect(0, 0, this.sys.game.config.width as number, this.sys.game.config.height as number);
                    return dimmer;
                };

                // 메시지를 표시하는 함수
                const showMessage = (message: string, color: string) => {
                    const dimmer = createDimmedBackground();
                    const text = this.add
                        .text(640, 360, message, {
                            font: '28px Arial',
                            color: color,
                        })
                        .setOrigin(0.5);

                    this.time.delayedCall(1000, () => {
                        dimmer.destroy();
                        text.destroy();
                        this.showVillage();
                    });
                };

                if (this.goldValue >= restCost) {
                    // 골드가 충분한 경우
                    this.goldValue -= restCost;
                    this.hpValue = this.maxPlayerHP; // 체력을 최대로 회복
                    setGold(this.goldValue);
                    setPlayerHP(this.hpValue);

                    // 골드와 HP 텍스트 업데이트
                    this.goldText.setText(`Gold: ${this.goldValue}`);
                    this.hpText.setText(`HP: ${this.hpValue}`);

                    showMessage('휴식을 취했습니다. 체력이 완전히 회복되었습니다!', '#00ff00');
                } else {
                    // 골드가 부족한 경우
                    showMessage('골드가 부족합니다!', '#ff0000');
                }
            }

            showVillage() {
                // 모든 원형 버튼을 다시 표시
                Object.values(this.circles).forEach((circle) => circle.setVisible(true));
            }

            showVeteranDialogue() {
                this.dialogueGroup.clear(true, true);

                const dialogueBox = this.add.graphics();
                dialogueBox.fillStyle(0x000000, 0.7);
                dialogueBox.fillRect(200, 450, 1080, 290);
                this.dialogueGroup.add(dialogueBox);

                const veteranImage = this.add.image(150, 600, 'veteran').setScale(0.3);
                this.dialogueGroup.add(veteranImage);

                const dialogues: DialogueEntry[] = [
                    {
                        id: 'intro',
                        text: '베테랑 모험가: "딱보니 초보 모험가네~ 반가워 나는 베테랑 모험가야!"',
                        next: 'name',
                    },
                    {
                        id: 'name',
                        text: '베테랑 모험가: "응? 이름은 안알려주냐고? 하하 나중에 더 친해지면 알려줄께~"',
                        next: 'purpose',
                    },
                    {
                        id: 'purpose',
                        text: '베테랑 모험가: "근데 여기서 뭐하는거야?"',
                        next: [
                            { text: '게임하는 법을 알려주세요', nextId: 'game' },
                            { text: '이 주변엔 뭐가 있어요?', nextId: 'map' },
                            { text: '앞으로의 개발 방향을 알려주세요!', nextId: 'update' },
                            { text: '대화 종료', action: () => this.closeDialogue() },
                        ],
                    },
                    {
                        id: 'game',
                        text: '베테랑 모험가: "아 게임 하는 방법을 알려줄까? "',
                        next: 'game1',
                    },
                    {
                        id: 'game1',
                        text: '베테랑 모험가: " 이 게임은 카드를 이용해 몬스터를 잡는 카드전투 RPG야 "',
                        next: 'game2',
                    },
                    {
                        id: 'game2',
                        text: '베테랑 모험가: " 맨 처음 접속하면 map이 있을텐데 map에는 총 세가지 이벤트가 있어 "',
                        next: 'game3',
                    },
                    {
                        id: 'game3',
                        text: '베테랑 모험가: " 첫번째는 마을! 마을에서는 장비를 사거나 카드를 사거나 퀘스트를 받을 수 있어! 숨겨진 보물이나 숨겨진 퀘스트가 있을 수 있으니 마을을 잘 둘러보는것도 중요하겠지?"',
                        next: 'game4',
                    },
                    {
                        id: 'game4',
                        text: '베테랑 모험가: " 두번째는 이벤트! 이벤트는 이벤트 대화가 있고 선택하면 보상을 받는 시스템이야. 한 번 밖에 선택을 못하고 선택에 따라 보상이 달라지니 신중하게 골라야 해!"',
                        next: 'game5',
                    },
                    {
                        id: 'game5',
                        text: '베테랑 모험가: " 세번째는 전투! 몬스터와 카드로 싸우는 거야! 전투로 인해 돈을 많이 벌어서 마을에서 소비한다! 그게 이 게임의 기본 요소지!"',
                        next: 'game6',
                    },
                    {
                        id: 'game6',
                        text: '베테랑 모험가: "이렇게 잘 알려주는데! 나중에 돈 많~~~이 벌면 나한테 밥이라도 쏴야해~ 알았지?"',
                        next: 'game7',
                    },
                    {
                        id: 'game7',
                        text: '베테랑 모험가: "아무튼 게임에 대한 소개는 끝난거 같네. 다른 질문 있어?"',
                        next: 'purpose',
                    },
                    {
                        id: 'map',
                        text: '베테랑 모험가: "이 주변? 일단 처음 시작하자마자 지도에 나오는 빨간점들은 몬스터야! 그러니 싸울때 게임오버가 되지 않도록 hp 확인을 잘해야겠지?"',
                        next: 'map2',
                    },
                    {
                        id: 'map',
                        text: '베테랑 모험가: "흰색점은 마을이야! 바로 여기지! 나중에 기회되면 마을을 추가하겠지만 일단 지금은 여기밖에 없어!"',
                        next: 'map2',
                    },
                    {
                        id: 'map2',
                        text: '베테랑 모험가: "노란색 점은 이벤트야! 이벤트 종류에 따라 좋은 일이 생길 수도 있고 안좋은 일이 생길 수도 있으니 조심해야겠지?"',
                        next: 'map3',
                    },
                    {
                        id: 'map3',
                        text: '베테랑 모험가: "마을 안에서는 흰색점과 빨간점 노란점의 기능이 조금 달라 "',
                        next: 'map4',
                    },
                    {
                        id: 'map4',
                        text: '베테랑 모험가: "마을 안에서 흰색 점은 상점이나 아니면 여관같은 주요기능이야! 한 번씩 들러봐바 "',
                        next: 'map5',
                    },
                    {
                        id: 'map5',
                        text: '베테랑 모험가: "노란색 점은 마을 사람과 대화하면서 정보를 얻거나 퀘스트를 받을 수 있는 곳이라 생각하면 될 거 같아"',
                        next: 'map6',
                    },
                    {
                        id: 'map6',
                        text: '베테랑 모험가: "빨간색 점은 다시 밖으로 나가서 지도로 돌아간다고 보면 돼! 간단하지?"',
                        next: 'map7',
                    },
                    {
                        id: 'map7',
                        text: '베테랑 모험가: "설명을 다시 듣고싶다면 다시 질문해도 돼 ㅎㅎ 또 다른 질문 있어?"',
                        next: 'purpose',
                    },
                    {
                        id: 'end',
                        text: '베테랑 모험가: "그럼 다음에 또 보자구!"',
                        next: 'close',
                    },
                    {
                        id: 'update',
                        text: '앞으로의 업데이트 방향에 대해서 설명하도록 하겠습니다. 개발 순서는 critical/major/minor로 설정되어 있으며 critical부터 우선적으로 개발하려고 합니다',
                        next: 'critical',
                    },
                    {
                        id: 'critical',
                        text: 'critical: 1. 이벤트 추가 2. 몬스터 추가 3. 스킬샵에서 카드 구매가능 기능 추가',
                        next: 'major',
                    },
                    {
                        id: 'major',
                        text: 'major: 1. 카드에 속성 추가 2. 무기점에서 무기 구매시 같은 속성 카드 데미지 증가 3. 퀘스트 기능 추가',
                        next: 'minor',
                    },
                    {
                        id: 'minor',
                        text: 'minor: 1. 애니메이션 효과 추가 2. 카드 이펙트 추가 3. 각종 버그 수정 ',
                        next: 'update2',
                    },
                    {
                        id: 'update2',
                        text: '지금은 밋밋하고 단순한 게임이지만 좀 더 개발해서 개성있는 게임으로 만들어보고 싶은 마음이 있네요 ',
                        next: 'update3',
                    },
                    {
                        id: 'update3',
                        text: '아마 모두들 그러실테지만 작업하면서 힘들고 후회한 만큼 나중에 기억으로 많이 남을 거 같습니다 ㅎㅎ ',
                        next: 'update4',
                    },
                    {
                        id: 'update4',
                        text: '추가적으로 좋은 아이디어가 있다면 공유부탁드립니다!',
                        next: 'update5',
                    },
                    {
                        id: 'update5',
                        text: '베테랑 모험가: "앗! 내가 무슨 말은 한거지?? 아무튼 다른 질문 있어?"',
                        next: 'purpose',
                    },
                ];

                let currentDialogueText: Phaser.GameObjects.Text | null = null;
                let currentButtons: Phaser.GameObjects.Text[] = [];

                const showDialogue = (id: string) => {
                    const currentDialogue = dialogues.find((d) => d.id === id);
                    if (!currentDialogue) return;

                    // 이전 대화 텍스트와 버튼 제거
                    if (currentDialogueText) currentDialogueText.destroy();
                    currentButtons.forEach((button) => button.destroy());
                    currentButtons = [];

                    currentDialogueText = this.add.text(350, 500, currentDialogue.text, {
                        font: '28px Arial',
                        color: '#ffffff',
                        wordWrap: { width: 800 },
                    });
                    currentDialogueText.setLineSpacing(10);
                    this.dialogueGroup.add(currentDialogueText);

                    if (typeof currentDialogue.next === 'string') {
                        if (currentDialogue.next === 'close') {
                            this.closeDialogue();
                            return;
                        }

                        // 대화 상자 클릭 이벤트 추가
                        dialogueBox.setInteractive(
                            new Phaser.Geom.Rectangle(200, 450, 1080, 290),
                            Phaser.Geom.Rectangle.Contains
                        );
                        dialogueBox.on('pointerdown', () => {
                            dialogueBox.off('pointerdown'); // 이벤트 리스너 제거
                            showDialogue(currentDialogue.next as string);
                        });

                        // 클릭 가능함을 나타내는 텍스트 추가
                        const clickPrompt = this.add.text(1100, 700, '클릭하여 계속', {
                            font: '20px Arial',
                            color: '#ffcc00',
                        });
                        this.dialogueGroup.add(clickPrompt);
                        currentButtons.push(clickPrompt);
                    } else if (Array.isArray(currentDialogue.next)) {
                        const optionStartY = 580; // 시작 Y 좌표를 위로 조정
                        const optionSpacing = 40; // 옵션 간 간격 줄임
                        const optionColumnWidth = 500; // 옵션 열의 너비
                        const optionsPerColumn = Math.ceil(currentDialogue.next.length / 2); // 한 열당 옵션 수

                        currentDialogue.next.forEach((option, optionIndex) => {
                            const column = Math.floor(optionIndex / optionsPerColumn);
                            const row = optionIndex % optionsPerColumn;
                            const x = 350 + column * optionColumnWidth;
                            const y = optionStartY + row * optionSpacing;

                            const optionButton = this.add
                                .text(x, y, option.text, {
                                    font: '22px Arial', // 폰트 크기 약간 줄임
                                    color: '#ffcc00',
                                })
                                .setInteractive();
                            this.dialogueGroup.add(optionButton);
                            currentButtons.push(optionButton);

                            optionButton.on('pointerdown', () => {
                                if (option.action) {
                                    option.action();
                                } else if (option.nextId) {
                                    showDialogue(option.nextId);
                                }
                            });

                            // 호버 효과 추가
                            optionButton.on('pointerover', () => {
                                optionButton.setStyle({ fill: '#ffffff' });
                            });
                            optionButton.on('pointerout', () => {
                                optionButton.setStyle({ fill: '#ffcc00' });
                            });
                        });
                    }
                };

                showDialogue('intro');
            }

            showSkillDialogue() {
                this.dialogueGroup.clear(true, true);

                const dialogueBox = this.add.graphics();
                dialogueBox.fillStyle(0x000000, 0.7);
                dialogueBox.fillRect(200, 450, 1080, 290);
                this.dialogueGroup.add(dialogueBox);

                const skillImage = this.add.image(150, 600, 'skill').setScale(0.3);
                this.dialogueGroup.add(skillImage);

                const dialogues: DialogueEntry[] = [
                    {
                        id: 'intro',
                        text: '카드마스터: "안녕하신가 모험가? 카드좀 보고 가게"',
                        next: 'card1',
                    },
                    {
                        id: 'card1',
                        text: '카드마스터: "앗! 미안하네 지금은 내부수리 중이네. 아마 카드를 사려면 꽤 시간이 지나야 살 수 있을꺼야"',
                        next: 'card2',
                    },
                    {
                        id: 'card2',
                        text: '카드 구매 기능은 업데이트 예정입니다.',
                        next: 'end',
                    },
                    {
                        id: 'end',
                        text: '카드마스터: "다음에 다시 오게나!"',
                        next: 'close',
                    },
                ];

                let currentDialogueText: Phaser.GameObjects.Text | null = null;

                const showDialogue = (id: string) => {
                    const currentDialogue = dialogues.find((d) => d.id === id);
                    if (!currentDialogue) return;

                    if (currentDialogueText) currentDialogueText.destroy();

                    currentDialogueText = this.add.text(350, 500, currentDialogue.text, {
                        font: '28px Arial',
                        color: '#ffffff',
                        wordWrap: { width: 800 },
                    });
                    currentDialogueText.setLineSpacing(10);
                    this.dialogueGroup.add(currentDialogueText);

                    if (currentDialogue.next === 'close') {
                        const closeButton = this.add
                            .text(1100, 650, '대화 종료', {
                                font: '24px Arial',
                                color: '#ffcc00',
                            })
                            .setInteractive();
                        this.dialogueGroup.add(closeButton);

                        closeButton.on('pointerdown', () => {
                            this.closeDialogue();
                        });
                    } else {
                        dialogueBox.setInteractive(
                            new Phaser.Geom.Rectangle(200, 450, 1080, 290),
                            Phaser.Geom.Rectangle.Contains
                        );
                        dialogueBox.on('pointerdown', () => {
                            dialogueBox.off('pointerdown');
                            showDialogue(currentDialogue.next as string);
                        });

                        const clickPrompt = this.add.text(1100, 700, '클릭하여 계속', {
                            font: '20px Arial',
                            color: '#ffcc00',
                        });
                        this.dialogueGroup.add(clickPrompt);
                    }
                };

                showDialogue('intro');
            }
            showfarmDialogue() {
                this.dialogueGroup.clear(true, true);

                const dialogueBox = this.add.graphics();
                dialogueBox.fillStyle(0x000000, 0.7);
                dialogueBox.fillRect(200, 450, 1080, 290);
                this.dialogueGroup.add(dialogueBox);

                const manImage = this.add.image(150, 600, 'man').setScale(0.3);
                this.dialogueGroup.add(manImage);

                const dialogues: DialogueEntry[] = [
                    {
                        id: 'intro',
                        text: '농부: "자네 혹시 내 부탁을 들어줄 수 있겠는가?"',
                        next: 'man1',
                    },
                    {
                        id: 'man1',
                        text: '농부: "마을 밖에 몬스터 중에 데드우드라는 몬스터가 있다네. 마치 나무처럼 생긴 몬스터지"',
                        next: 'man2',
                    },
                    {
                        id: 'man2',
                        text: '농부: "그 몬스터는 아주 흉폭하지만 몇몇 데드우드는 아주 좋은 품질의 열매를 떨어트리기도 한다네"',
                        next: 'man3',
                    },
                    {
                        id: 'man3',
                        text: '농부: "혹시 그걸 나에게 가져와 줄 수 있겠는가? 그걸 밭에 키워 양산이 가능하다면 떼부자가 될 수 있을껄세"',
                        next: 'man4',
                    },
                    {
                        id: 'man4',
                        text: '퀘스트 시스템은 추후 업데이트 할 예정입니다.',
                        next: 'close',
                    },
                ];

                let currentDialogueText: Phaser.GameObjects.Text | null = null;

                const showDialogue = (id: string) => {
                    const currentDialogue = dialogues.find((d) => d.id === id);
                    if (!currentDialogue) return;

                    if (currentDialogueText) currentDialogueText.destroy();

                    currentDialogueText = this.add.text(350, 500, currentDialogue.text, {
                        font: '28px Arial',
                        color: '#ffffff',
                        wordWrap: { width: 800 },
                    });
                    currentDialogueText.setLineSpacing(10);
                    this.dialogueGroup.add(currentDialogueText);

                    if (currentDialogue.next === 'close') {
                        const closeButton = this.add
                            .text(1100, 650, '대화 종료', {
                                font: '24px Arial',
                                color: '#ffcc00',
                            })
                            .setInteractive();
                        this.dialogueGroup.add(closeButton);

                        closeButton.on('pointerdown', () => {
                            this.closeDialogue();
                        });
                    } else {
                        dialogueBox.setInteractive(
                            new Phaser.Geom.Rectangle(200, 450, 1080, 290),
                            Phaser.Geom.Rectangle.Contains
                        );
                        dialogueBox.on('pointerdown', () => {
                            dialogueBox.off('pointerdown');
                            showDialogue(currentDialogue.next as string);
                        });

                        const clickPrompt = this.add.text(1100, 700, '클릭하여 계속', {
                            font: '20px Arial',
                            color: '#ffcc00',
                        });
                        this.dialogueGroup.add(clickPrompt);
                    }
                };

                showDialogue('intro');
            }
        }

        // Phaser 게임 설정
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                parent: gameContainer.current || undefined,
                width: 1280,
                height: 740,
            },
            scene: VillageScene,
        };

        const game = new Phaser.Game(config);

        return () => {
            game.destroy(true);
        };
    }, [onSceneChange, playerHP, gold, setGold]); // 의존성 배열에 playerHP와 gold 추가

    return <div ref={gameContainer} style={{ width: 1280, height: 740 }} />;
};

export default Village;
