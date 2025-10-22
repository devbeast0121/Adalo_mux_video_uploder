import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';

const MuxVideoUploader = ({
    backendUrl,
    maxFileSize,
    onUploadComplete,
    uploadedAssetId,
    uploadedPlaybackId
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [assetId, setAssetId] = useState('');
    const [playbackId, setPlaybackId] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
            Alert.alert('Error', `File size exceeds ${maxFileSize}MB limit`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            Alert.alert('Error', 'Please select a valid video file');
            return;
        }

        await uploadToMux(file);
    };

    const uploadToMux = async (file) => {
        try {
            setUploading(true);
            setUploadStatus('Creating upload URL...');
            setProgress(10);

            // Step 1: Get upload URL from your backend
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

            // Step 2: Upload file directly to Mux
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });

            if (!uploadResponse.ok) {
                throw new Error('Upload failed');
            }

            setProgress(60);
            setUploadStatus('Processing video...');

            // Step 3: Poll for upload completion and get asset ID
            const asset = await pollUploadStatus(uploadId);

            setProgress(100);
            setUploadStatus('Upload complete!');

            // Set output values
            setAssetId(asset.id);
            setPlaybackId(asset.playback_ids[0].id);

            // Trigger Adalo action
            if (onUploadComplete) {
                onUploadComplete({
                    assetId: asset.id,
                    playbackId: asset.playback_ids[0].id,
                    duration: asset.duration,
                    status: asset.status
                });
            }

            setTimeout(() => {
                setUploading(false);
                setUploadStatus('');
                setProgress(0);
            }, 2000);

        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Error', error.message);
            setUploading(false);
            setUploadStatus('');
            setProgress(0);
        }
    };

    const pollUploadStatus = async (uploadId, maxAttempts = 30) => {
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

            const statusResponse = await fetch(`${backendUrl}/api/upload/${uploadId}`);
            const statusData = await statusResponse.json();

            if (statusData.success && statusData.data.asset_id) {
                // Get full asset details
                const assetResponse = await fetch(`${backendUrl}/api/asset/${statusData.data.asset_id}`);
                const assetData = await assetResponse.json();

                if (assetData.success && assetData.data.status === 'ready') {
                    return assetData.data;
                }
            }
        }

        throw new Error('Upload processing timeout');
    };

    return (
        <View style={styles.container}>
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            <TouchableOpacity
                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                onPress={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? (
                    <ActivityIndicator color="#fff" />
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

            {assetId && !uploading && (
                <View style={styles.successContainer}>
                    <Text style={styles.successText}>✅ Video uploaded successfully!</Text>
                    <Text style={styles.infoText}>Asset ID: {assetId}</Text>
                    <Text style={styles.infoText}>Playback ID: {playbackId}</Text>
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
    },
});

export default MuxVideoUploader;