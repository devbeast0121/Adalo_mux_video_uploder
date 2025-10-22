import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MuxVideoPlayer = ({
    playbackId,
    autoplay,
    showControls,
    onPlaybackStarted,
    onPlaybackEnded
}) => {
    useEffect(() => {
        // Load Mux player script only once
        if (typeof window !== 'undefined' && !window.document.querySelector('script[src*="mux-player"]')) {
            const script = window.document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mux/mux-player';
            script.async = true;
            window.document.body.appendChild(script);
        }
    }, []);

    if (!playbackId) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>No video loaded</Text>
                </View>
            </View>
        );
    }

    // Create the player HTML
    const playerHTML = `
        <mux-player
            playback-id="${playbackId}"
            ${autoplay ? 'autoplay' : ''}
            ${showControls ? 'controls' : ''}
            style="width: 100%; height: 100%; border-radius: 8px;"
        ></mux-player>
    `;

    return (
        <View style={styles.container}>
            <div dangerouslySetInnerHTML={{ __html: playerHTML }} />
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