import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const LogicResource = await JSONCResource.get("/logic/vanilla.min.json");

export default LogicResource;
