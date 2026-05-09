// GameTrackerJS
import SimpleStateManager from "gametrackerjs/statemanager/SimpleStateManager.js";
// Track-OOT
import SongsResource from "../../resource/SongsResource.js";
import DefaultSongState from "./DefaultSongState.js";

const resourceData = SongsResource.get();

const SongStateManager = new SimpleStateManager(DefaultSongState, resourceData);

export default SongStateManager;
