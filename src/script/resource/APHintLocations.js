import JSONCResource from "/emcJS/data/resource/file/JSONCResource.js";

const data = await JSONCResource.get("/database/ap_hint_locations.json");

// const LOCATIONS_AP = data.get();
// const LOCATION_NAMES_AP = Object.keys(LOCATIONS_AP).reduce((res, value) => {
//     res[`excluded_location[${value}]`] = `location[${value}]`;
//     return res;
// }, {});
// const apLocationsOptionGrouup = new OptionGroupRegistry("Locations.ap_names");
// apLocationsOptionGrouup.setAll(LOCATION_NAMES_AP);

export default data;
