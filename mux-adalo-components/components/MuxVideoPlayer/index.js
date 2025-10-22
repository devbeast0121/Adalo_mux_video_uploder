import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MuxVideoPlayer = ({ playbackId, editor }) => {
    const scriptLoaded = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || editor) return;

        if (!scriptLoaded.current && !window.document.querySelector('script[src*="mux-player"]')) {
            const script = window.document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mux/mux-player';
            script.async = true;
            window.document.body.appendChild(script);
            scriptLoaded.current = true;
        }
    }, [editor]);

    // Editor mode - just show placeholder
    if (editor) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderIcon}>▶️</Text>
                    <Text style={styles.placeholderText}>Mux Video Player</Text>
                    <Text style={styles.placeholderInfo}>
                        {playbackId ? `ID: ${playbackId}` : 'No Playback ID set'}
                    </Text>
                </View>
            </View>
        );
    }

    // No video loaded - show nice fallback
    if (!playbackId) {
        return (
            <View style={styles.container}>
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderIcon}>🎬</Text>
                    <Text style={styles.placeholderText}>No Videos Yet</Text>
                    <Text style={styles.placeholderHint}>Upload a video to get started</Text>
                </View>
            </View>
        );
    }

    const playerHTML = `
        <mux-player
            playback-id="${playbackId}"
            controls
            style="width: 100%; height: 100%;"
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
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 8,
        overflow: 'hidden',
        minHeight: 200,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        padding: 20,
    },
    placeholderIcon: {
        fontSize: 64,
        marginBottom: 15,
    },
    placeholderText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    placeholderInfo: {
        color: '#9ca3af',
        fontSize: 12,
        textAlign: 'center',
    },
    placeholderHint: {
        color: '#6b7280',
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
});

export default MuxVideoPlayer;