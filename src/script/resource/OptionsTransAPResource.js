import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const OptionsTransAPResource = await JSONCResource.get("/database/options_trans_ap.json");

export default OptionsTransAPResource;
