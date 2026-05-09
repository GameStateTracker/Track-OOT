import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const SpoilerOptionsResource = await JSONCResource.get("/database/spoiler_options.json");

export default SpoilerOptionsResource;
