import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const MuxVideoUploader = ({ backendUrl, editor, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [localPlaybackId, setLocalPlaybackId] = useState('');

    if (editor) {
        return (
            <View style={styles.container}>
                <View style={styles.editorMode}>
                    <Text style={styles.editorText}>📹 Mux Video Uploader</Text>
                    <Text style={styles.editorInfo}>Backend: {backendUrl}</Text>
                    <Text style={styles.editorHint}>Component will be functional in preview/published app</Text>
                </View>
            </View>
        );
    }

    const selectFile = () => {
        if (typeof window === 'undefined' || !window.document) return;

        const input = window.document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await handleFileSelect(file);
            }
        };

        input.click();
    };

    const handleFileSelect = async (file) => {
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 500) {
            alert('File size exceeds 500MB limit');
            return;
        }

        if (!file.type.startsWith('video/')) {
            alert('Please select a valid video file');
            return;
        }

        await uploadToMux(file);
    };

    const uploadToMux = async (file) => {
        try {
            setUploading(true);
            setUploadStatus('Creating upload URL...');
            setProgress(10);

            const createResponse = await fetch(`${backendUrl}/api/create-upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const createData = await createResponse.json();

            if (!createData.success) {
                throw new Error('Failed to create upload URL');
            }

            const uploadUrl = createData.data.url;
            const uploadId = createData.data.id;

            setUploadStatus('Uploading video...');
            setProgress(30);

            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            setProgress(60);
            setUploadStatus('Processing video...');

            const asset = await pollUploadStatus(uploadId);

            setProgress(100);
            setUploadStatus('Upload complete!');

            setLocalPlaybackId(asset.playback_ids[0].id);

            // Trigger callback ONLY ONCE - pass values as separate parameters
            if (onUploadComplete) {
                onUploadComplete(
                    asset.playback_ids[0].id,  // First parameter: playbackId
                    asset.id                    // Second parameter: assetId
                );
            }

            setTimeout(() => {
                setUploading(false);
                setUploadStatus('');
                setProgress(0);
            }, 3000);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload Error: ' + error.message);
            setUploading(false);
            setUploadStatus('');
            setProgress(0);
        }
    };

    const pollUploadStatus = async (uploadId, maxAttempts = 30) => {
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const statusResponse = await fetch(`${backendUrl}/api/upload/${uploadId}`);
            const statusData = await statusResponse.json();

            if (statusData.success && statusData.data.asset_id) {
                const assetResponse = await fetch(`${backendUrl}/api/asset/${statusData.data.asset_id}`);
                const assetData = await assetResponse.json();

                if (assetData.success && assetData.data.status === 'ready') {
                    return assetData.data;
                }
            }
        }

        throw new Error('Upload processing timeout');
    };

    const copyToClipboard = (text) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            alert('✅ Playback ID copied to clipboard!');
        } else {
            alert('❌ Copy not supported in this browser');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={selectFile}
                disabled={uploading}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={styles.uploadButtonText}>📹 Select Video to Upload</Text>
                )}
            </TouchableOpacity>

            {uploading && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.statusText}>{uploadStatus}</Text>
                    <Text style={styles.progressText}>{progress}%</Text>
                </View>
            )}

            {localPlaybackId && !uploading && (
                <View style={styles.successContainer}>
                    <Text style={styles.successText}>✅ Upload Complete!</Text>
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => copyToClipboard(localPlaybackId)}
                    >
                        <Text style={styles.copyButtonText}>📋 Copy Playback ID</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        minHeight: 150,
    },
    editorMode: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    editorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    editorInfo: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    editorHint: {
        fontSize: 11,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 10,
    },
    uploadButton: {
        backgroundColor: '#6366f1',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    progressContainer: {
        marginTop: 20,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6366f1',
    },
    statusText: {
        marginTop: 10,
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
    },
    progressText: {
        marginTop: 5,
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    successContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#d1fae5',
        borderRadius: 8,
    },
    successText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#065f46',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 12,
        color: '#047857',
        marginTop: 5,
        wordBreak: 'break-all',
    },
    copyHint: {
        fontSize: 10,
        color: '#059669',
        marginTop: 5,
        fontStyle: 'italic',
    },
    copyButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#059669',
        borderRadius: 6,
        alignItems: 'center',
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});

export default MuxVideoUploader;