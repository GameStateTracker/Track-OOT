import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const ShopsResource = await JSONCResource.get("/database/shops.json");

export default ShopsResource;
