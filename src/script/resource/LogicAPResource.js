import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const LogicAPResource = await JSONCResource.get("/logic/ap_vanilla.min.json");

export default LogicAPResource;
