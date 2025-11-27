export { handleJoinRoom } from "@socket/handlers/joinRoom.handler";
export {
  handleOffer,
  handleAnswer,
  handleIceCandidate,
} from "@socket/handlers/webrtc.handler";
export { handleMediaState } from "@socket/handlers/mediaState.handler";
export { handleDisconnect } from "@socket/handlers/disconnect.handler";
export {
  registerDoodleHandlers,
  handleDoodleDisconnect,
} from "@socket/handlers/doodle.handler";
export { getBufferedStrokes } from "@socket/handlers/doodle.handler";
