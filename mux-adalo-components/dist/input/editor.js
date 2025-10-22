import {
  MuxVideoUploader,
  MuxVideoPlayer
} from '../../index.js'

export const components = {
  MuxVideoUploader,
  MuxVideoPlayer
}

export const config = {"displayName":"Mux Video Components","description":"Upload and play videos using Mux","version":"dev","author":"The Uncoders","details":"Upload and play videos using Mux","logo":"./logo.png","demoAppURL":"https://previewer.adalo.com/1f4a64f2-8ccd-4660-a0e0-2be2ab124b88","supportURL":"https://tally.so/r/3jyvD1","name":"mux-adalo-components","components":[{"name":"MuxVideoUploader","displayName":"Mux Video Uploader","icon":"video-camera","defaultWidth":300,"defaultHeight":200,"props":[{"name":"backendUrl","displayName":"Backend Server URL","type":"text","default":"http://localhost:8080","role":"text","description":"Your Node.js backend URL"},{"name":"onUploadComplete","displayName":"On Upload Complete","type":"action","description":"Action triggered when upload completes","arguments":[{"name":"playbackId","displayName":"Playback ID","type":"text"},{"name":"assetId","displayName":"Asset ID","type":"text"}]}],"resizeX":true,"resizeY":true},{"name":"MuxVideoPlayer","displayName":"Mux Video Player","icon":"play-circle","defaultWidth":300,"defaultHeight":200,"props":[{"name":"playbackId","displayName":"Playback ID","type":"text","role":"text","description":"Mux playback ID to play video"}],"resizeX":true,"resizeY":true}]}