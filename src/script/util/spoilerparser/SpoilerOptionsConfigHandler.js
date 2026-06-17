import SettingsConfigHandler from "@emcjs/fe/util/settings/SettingsConfigHandler.js";
import SpoilerOptionsResource from "../../resource/SpoilerOptionsResource.js";

const options = SpoilerOptionsResource.get();
const SpoilerOptionsConfigHandler = new SettingsConfigHandler(options, {getLabel: (label) => `parse[${label}]`});

export default SpoilerOptionsConfigHandler;
