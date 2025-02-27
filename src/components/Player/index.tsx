import { useRef, useEffect, useState } from 'react';
import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';
import Button from '../Button'
import Image from 'next/image'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import styles from './style.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export default function Player() {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [progress, setProgress] = useState(0)

    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious

    } = usePlayer();

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play();

        } else {
            audioRef.current.pause();
        }

    }, [isPlaying])

    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor((audioRef.current.currentTime)));

        }
        )
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext()
        } else {

        }
    }

    const episode = episodeList[currentEpisodeIndex]
    return (

        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora" />
                <strong>Tocando Agora </strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image
                        width={592}
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}
            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>

                    <div className={styles.slider}>{episode ?
                        (<Slider
                            max={episode.duration}
                            value={progress}
                            trackStyle={{ backgroundColor: '#04d361' }}
                            railStyle={{ backgroundColor: '#9f75ff' }}
                            onChange={handleSeek}
                            handleStyle={{ borderColor: '#04d361', borderWidth: 4 }} />
                        ) : (<div className={styles.emptySlider} />)}
                    </div>

                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div >
                {episode && (
                    <audio
                        src={episode.url}
                        ref={audioRef}
                        loop={isLooping}
                        autoPlay
                        onEnded={handleEpisodeEnded}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onLoadedMetadata={setupProgressListener}

                    />
                )}

                <div className={styles.buttons}>
                    <Button src="/shuffle.svg" alt="Embaralhar" disabled={!episode || episodeList.length === 1} onClick={toggleShuffle} className={isShuffling ? styles.isActive : ''} />
                    <Button src="/play-previous.svg" alt="Tocar anterior" disabled={!episode || !hasPrevious} onClick={playPrevious} />

                    <Button src={isPlaying ? "/pause.svg" : "/play.svg"} alt="Tocar"
                        className={styles.playButton} disabled={!episode} onClick={togglePlay} />

                    <Button src="/play-next.svg" alt="Tocar próxima" disabled={!episode || !hasNext} onClick={playNext} />
                    <Button src="/repeat.svg" alt="Repetir" disabled={!episode} onClick={toggleLoop} className={isLooping ? styles.isActive : ''} />
                </div>
            </footer >
        </div>



    );
}