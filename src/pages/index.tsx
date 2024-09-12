import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const MapScene = dynamic(() => import('@/components/MapScene'), { ssr: false });
const Card2 = dynamic(() => import('@/components/Card2'), { ssr: false });
const Village = dynamic(() => import('@/components/Village'), { ssr: false });
const Event1 = dynamic(() => import('@/components/Event1'), { ssr: false });

export default function Home() {
    const [currentScene, setCurrentScene] = useState('map');
    const [playerHP, setPlayerHP] = useState(50);
    const [gold, setGold] = useState(0);
    const [completedEvents, setCompletedEvents] = useState<Record<string, boolean>>({});

    const handleSceneChange = (scene: string) => {
        setCurrentScene(scene);
    };

    return (
        <>
            {currentScene === 'map' && (
                <MapScene
                    onSceneChange={handleSceneChange}
                    playerHP={playerHP}
                    setPlayerHP={setPlayerHP}
                    gold={gold}
                    setGold={setGold}
                    completedEvents={completedEvents}
                    setCompletedEvents={setCompletedEvents}
                />
            )}
            {currentScene === 'cardGame' && (
                <Card2
                    onSceneChange={handleSceneChange}
                    playerHP={playerHP}
                    setPlayerHP={setPlayerHP}
                    gold={gold}
                    setGold={setGold}
                />
            )}
            {currentScene === 'village' && (
                <Village
                    onSceneChange={handleSceneChange}
                    playerHP={playerHP}
                    setPlayerHP={setPlayerHP}
                    gold={gold}
                    setGold={setGold}
                />
            )}
            {currentScene === 'event1' && (
                <Event1
                    onSceneChange={handleSceneChange}
                    playerHP={playerHP}
                    setPlayerHP={setPlayerHP}
                    gold={gold}
                    setGold={setGold}
                />
            )}
        </>
    );
}
