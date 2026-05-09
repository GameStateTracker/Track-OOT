// GameTrackerJS
import SimpleStateManager from "gametrackerjs/statemanager/SimpleStateManager.js";
// Track-OOT
import DungeonstateResource from "../../resource/DungeonstateResource.js";
import DefaultDungeonState from "./DefaultDungeonState.js";

const resourceData = DungeonstateResource.get();

const DungeonStateManager = new SimpleStateManager(DefaultDungeonState, resourceData);

export default DungeonStateManager;
