import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const LayoutsResource = await JSONCResource.get("/database/layouts.json");

export default LayoutsResource;
