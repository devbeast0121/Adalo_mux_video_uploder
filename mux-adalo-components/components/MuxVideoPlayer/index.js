import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MuxVideoPlayer = ({
    playbackId,
    autoplay,
    showControls,
    onPlaybackStarted,
    onPlaybackEnded
}) => {
    const videoRef = useRef(null);

    useEffect(() => {
        // Load Mux player script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mux/mux-player';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePlay = () => {
        if (onPlaybackStarted) {
            onPlaybackStarted();
        }
    };

    const handleEnded = () => {
        if (onPlaybackEnded) {
            onPlaybackEnded();
        }
    };

    if (!playbackId) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>No video loaded</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <mux-player
                ref={videoRef}
                playback-id={playbackId}
                autoplay={autoplay}
                controls={showControls}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px'
                }}
                onPlay={handlePlay}
                onEnded={handleEnded}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        borderRadius: 8,
        overflow: 'hidden',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1f2937',
    },
    placeholderText: {
        color: '#9ca3af',
        fontSize: 16,
    },
});

export default MuxVideoPlayer;