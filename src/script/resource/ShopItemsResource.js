import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const ShopItemsResource = await JSONCResource.get("/database/shop_items.json");

export default ShopItemsResource;
