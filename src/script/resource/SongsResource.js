import JSONCResource from "@emcjs/core/data/resource/file/JSONCResource.js";

const SongsResource = await JSONCResource.get("/database/songs.json");

export default SongsResource;
