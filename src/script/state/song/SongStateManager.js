import EntityStateManager from "@emcjs/core/data/state/entity/EntityStateManager.js";
import SongsResource from "../../resource/SongsResource.js";
import DefaultSongState from "./DefaultSongState.js";

const resourceData = SongsResource.get();

const SongStateManager = new EntityStateManager(DefaultSongState, resourceData);

export default SongStateManager;
