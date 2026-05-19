import EntityStateManager from "@emcjs/core/data/state/entity/EntityStateManager.js";
import DungeonstateResource from "../../resource/DungeonstateResource.js";
import DefaultDungeonState from "./DefaultDungeonState.js";

const resourceData = DungeonstateResource.get();

const DungeonStateManager = new EntityStateManager(DefaultDungeonState, resourceData);

export default DungeonStateManager;
