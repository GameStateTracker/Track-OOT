import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const DungeonstateResource = await JSONCResource.get("/database/dungeonstate.json");

export default DungeonstateResource;
