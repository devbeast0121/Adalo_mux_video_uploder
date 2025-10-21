// Import required packages
const express = require('express');
const Mux = require('@mux/mux-node');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from frontend
app.use(express.json()); // Parse JSON bodies

// Initialize Mux client
const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
});

// Root endpoint - test if server is running
app.get('/', (req, res) => {
    res.json({
        message: 'Mux Backend Server is running! 🚀',
        status: 'OK'
    });
});

// CREATE UPLOAD URL
// Frontend calls this to get a URL for uploading videos
app.post('/api/create-upload', async (req, res) => {
    try {
        console.log('📤 Creating upload URL...');

        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                playback_policy: ['public'],
                mp4_support: 'none'
            },
            cors_origin: '*'
        });

        console.log('✅ Upload URL created:', upload.id);

        res.json({
            success: true,
            data: upload
        });

    } catch (error) {
        console.error('❌ Error creating upload:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET UPLOAD STATUS
// Check upload and get asset_id
app.get('/api/upload/:uploadId', async (req, res) => {
    try {
        const { uploadId } = req.params;
        console.log('🔍 Checking upload status:', uploadId);

        const upload = await mux.video.uploads.retrieve(uploadId);

        console.log('📊 Upload status:', upload.status);
        console.log('📦 Asset ID:', upload.asset_id);

        res.json({
            success: true,
            data: upload
        });

    } catch (error) {
        console.error('❌ Error getting upload:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET ASSET STATUS
// Check if video is ready for playback
app.get('/api/asset/:assetId', async (req, res) => {
    try {
        const { assetId } = req.params;
        console.log('🔍 Checking asset status:', assetId);

        const asset = await mux.video.assets.retrieve(assetId);

        console.log('📊 Asset status:', asset.status);

        res.json({
            success: true,
            data: asset
        });

    } catch (error) {
        console.error('❌ Error getting asset:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// LIST ALL VIDEOS
// Get all videos from your Mux account
app.get('/api/videos', async (req, res) => {
    try {
        console.log('📋 Fetching all videos...');

        const assets = await mux.video.assets.list({
            limit: 100
        });

        console.log('✅ Found', assets.length, 'videos');

        res.json({
            success: true,
            data: assets
        });

    } catch (error) {
        console.error('❌ Error listing videos:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// DELETE VIDEO
// Remove a video from Mux
app.delete('/api/asset/:assetId', async (req, res) => {
    try {
        const { assetId } = req.params;
        console.log('🗑️ Deleting asset:', assetId);

        await mux.video.assets.delete(assetId);

        console.log('✅ Asset deleted');

        res.json({
            success: true,
            message: 'Asset deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting asset:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 Mux Backend Server Started!\n');
    console.log('📍 Server running at: http://localhost:' + PORT);
    console.log('📍 Test endpoint: http://localhost:' + PORT + '/');
    console.log('\n✅ Ready to accept requests!\n');
    console.log('🔐 Using Mux Token ID:', process.env.MUX_TOKEN_ID?.substring(0, 10) + '...');
    console.log('\n📡 Available endpoints:');
    console.log('  POST   /api/create-upload');
    console.log('  GET    /api/upload/:uploadId');
    console.log('  GET    /api/asset/:assetId');
    console.log('  GET    /api/videos');
    console.log('  DELETE /api/asset/:assetId');
    console.log('\n');
});