import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const OptionsTransResource = await JSONCResource.get("/database/options_trans.json");

export default OptionsTransResource;
