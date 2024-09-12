import React, { useRef, useEffect, Dispatch, SetStateAction } from 'react';
import dynamic from 'next/dynamic';
import Phaser from 'phaser';
import mapImage from '../../../public/images/map.jpg';

interface MapSceneProps {
    onSceneChange: (scene: string) => void;
    playerHP: number;
    setPlayerHP: Dispatch<SetStateAction<number>>;
    gold: number;
    setGold: Dispatch<SetStateAction<number>>;
    completedEvents: Record<string, boolean>;
    setCompletedEvents: Dispatch<SetStateAction<Record<string, boolean>>>;
}

interface EventPoint {
    x: number;
    y: number;
    scale: number;
    color: number;
    eventKey: string;
    sceneName: string;
}

function MapScene({ onSceneChange, playerHP, gold, completedEvents, setCompletedEvents }: MapSceneProps): JSX.Element {
    const gameContainer = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameContainer.current) return;

        const eventPoints: EventPoint[] = [
            { x: 780, y: 270, scale: 3, color: 0xffff33, eventKey: 'event1', sceneName: 'event1' },
            // 추가 이벤트 포인트를 여기에 추가할 수 있습니다.
        ];

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                parent: gameContainer.current,
                width: 1280,
                height: 740,
            },
            scene: {
                preload: function (this: Phaser.Scene) {
                    this.load.image('map', mapImage.src);
                },
                create: function (this: Phaser.Scene) {
                    this.add.image(640, 340, 'map');

                    // 전투 이벤트 지점
                    const battlePoint = this.add
                        .circle(1000, 460, 50, 0xff0000, 0.5)
                        .setInteractive({ useHandCursor: true });
                    battlePoint.on('pointerdown', () => {
                        this.cameras.main.fadeOut(500, 0, 0, 0);

                        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                            onSceneChange('cardGame');
                        });
                    });

                    const battlePoint2 = this.add
                        .circle(750, 580, 70, 0xff0000, 0.5)
                        .setInteractive({ useHandCursor: true });
                    battlePoint2.on('pointerdown', () => {
                        this.cameras.main.fadeOut(500, 0, 0, 0);

                        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                            onSceneChange('cave');
                        });
                    });

                    // 마을 이벤트 지점
                    const villagePoint = this.add
                        .circle(370, 280, 50, 0xffffff, 0.5)
                        .setInteractive({ useHandCursor: true })
                        .setScale(3);
                    villagePoint.on('pointerdown', () => {
                        onSceneChange('village');
                    });

                    // 동적 이벤트 포인트 생성
                    eventPoints.forEach((point) => {
                        if (!completedEvents[point.eventKey]) {
                            const eventPoint = this.add
                                .circle(point.x, point.y, 30, point.color, 0.5)
                                .setInteractive({ useHandCursor: true })
                                .setScale(point.scale);
                            eventPoint.on('pointerdown', () => {
                                setCompletedEvents((prev) => ({ ...prev, [point.eventKey]: true }));
                                onSceneChange(point.sceneName);
                            });
                        }
                    });

                    // playerHP와 gold 정보를 화면에 표시
                    this.add.text(10, 10, `HP: ${playerHP}`, { fontSize: '24px', color: '#ffffff' }).setName('hpText');
                    this.add.text(10, 40, `Gold: ${gold}`, { fontSize: '24px', color: '#ffffff' }).setName('goldText');
                },
            },
        };

        gameRef.current = new Phaser.Game(config);

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
            }
        };
    }, [onSceneChange, completedEvents, setCompletedEvents]);

    useEffect(() => {
        if (gameRef.current) {
            const scene = gameRef.current.scene.getScene('default') as Phaser.Scene;
            if (scene) {
                const hpText = scene.children.getByName('hpText') as Phaser.GameObjects.Text;
                const goldText = scene.children.getByName('goldText') as Phaser.GameObjects.Text;
                if (hpText) hpText.setText(`HP: ${playerHP}`);
                if (goldText) goldText.setText(`Gold: ${gold}`);
            }
        }
    }, [playerHP, gold]);

    return <div ref={gameContainer} style={{ width: 1280, height: 740 }} />;
}

// SSR을 비활성화하여 Phaser가 브라우저에서만 실행되게 설정
export default dynamic<MapSceneProps>(() => Promise.resolve(MapScene), { ssr: false });
