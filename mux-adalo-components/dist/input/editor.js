import {
  MuxVideoUploader,
  MuxVideoPlayer
} from '../../index.js'

export const components = {
  MuxVideoUploader,
  MuxVideoPlayer
}

export const config = {"displayName":"Mux Video Components","description":"Upload and play videos using Mux","version":"1.0.0","author":"The Uncoders","details":"Upload and play videos using Mux","logo":"./logo.png","demoAppURL":"https://previewer.adalo.com/1f4a64f2-8ccd-4660-a0e0-2be2ab124b88","supportURL":"https://tally.so/r/3jyvD1","name":"mux-video-components","components":[{"name":"MuxVideoUploader","displayName":"Mux Video Uploader","icon":"video-camera","props":[{"name":"backendUrl","displayName":"Backend Server URL","type":"text","default":"http://localhost:3000","required":true,"role":"text","description":"Your Node.js backend URL"},{"name":"maxFileSize","displayName":"Max File Size (MB)","type":"number","default":500,"role":"number"},{"name":"onUploadComplete","displayName":"Upload Complete Action","type":"action","description":"Triggered when upload finishes"},{"name":"uploadedAssetId","displayName":"Asset ID","type":"text","role":"output","description":"Mux asset ID after upload"},{"name":"uploadedPlaybackId","displayName":"Playback ID","type":"text","role":"output","description":"Mux playback ID for video player"}],"childComponents":[]},{"name":"MuxVideoPlayer","displayName":"Mux Video Player","icon":"play-circle","props":[{"name":"playbackId","displayName":"Playback ID","type":"text","required":true,"role":"text","description":"Mux playback ID from uploader"},{"name":"autoplay","displayName":"Autoplay","type":"boolean","default":false,"role":"switch"},{"name":"showControls","displayName":"Show Controls","type":"boolean","default":true,"role":"switch"},{"name":"onPlaybackStarted","displayName":"On Play","type":"action"},{"name":"onPlaybackEnded","displayName":"On End","type":"action"}],"childComponents":[]}]}