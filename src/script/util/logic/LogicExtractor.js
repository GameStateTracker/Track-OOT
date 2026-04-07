
import IDBStorage from "/emcJS/data/storage/IDBStorage.js";
import WorldResource from "/GameTrackerJS/data/resource/WorldResource.js";
import SettingsObserver from "/GameTrackerJS/util/observer/SettingsObserver.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import LogicResource from "../../resource/LogicResource.js";
import LogicGlitchedResource from "../../resource/LogicGlitchedResource.js";
import LogicAPResource from "../../resource/LogicAPResource.js";
import LogicAPGlitchedResource from "../../resource/LogicAPGlitchedResource.js";

const CONFIG = WorldResource.get("config");
const GATEWAYS_VARIANTS = CONFIG.gateways?.variants;

const logicRulesObserver = new OptionsObserver("logic_rules");
const customLogicObserver = new SettingsObserver("use_custom_logic");

export function getMixinLogic(ref) {
    if (logicRulesObserver.value == "logic_rules_glitchless") {
        const data = LogicResource.get();
        return data.logic[ref];
    }
    if (logicRulesObserver.value == "logic_rules_glitched") {
        const data = LogicGlitchedResource.get();
        return data.logic[ref];
    }
    if (logicRulesObserver.value == "logic_rules_ap_glitchless") {
        const data = LogicAPResource.get();
        return data.logic[ref];
    }
    if (logicRulesObserver.value == "logic_rules_ap_glitched") {
        const data = LogicAPGlitchedResource.get();
        return data.logic[ref];
    }
    return null;
}

export async function getEdgeLogic(ref) {
    if (logicRulesObserver.value == "logic_rules_glitchless") {
        return getNormalLogic(ref);
    }
    if (logicRulesObserver.value == "logic_rules_glitched") {
        return getGlitchedLogic(ref);
    }
    if (logicRulesObserver.value == "logic_rules_ap_glitchless") {
        return getNormalAPLogic(ref);
    }
    if (logicRulesObserver.value == "logic_rules_ap_glitched") {
        return getGlitchedAPLogic(ref);
    }
    return [];
}

async function getNormalLogic(ref) {
    const data = LogicResource.get();
    if (customLogicObserver.value) {
        const LogicsStorage = new IDBStorage("logics");
        const customData = await LogicsStorage.getAll();
        return extractLogic(ref, data, customData);
    } else {
        return extractLogic(ref, data);
    }
}

async function getGlitchedLogic(ref) {
    const data = LogicGlitchedResource.get();
    if (customLogicObserver.value) {
        const LogicsStorage = new IDBStorage("logics_glitched");
        const customData = await LogicsStorage.getAll();
        return extractLogic(ref, data, customData);
    } else {
        return extractLogic(ref, data);
    }
}

async function getNormalAPLogic(ref) {
    const data = LogicAPResource.get();
    if (customLogicObserver.value) {
        const LogicsStorage = new IDBStorage("logics_ap");
        const customData = await LogicsStorage.getAll();
        return extractLogic(ref, data, customData);
    } else {
        return extractLogic(ref, data);
    }
}

async function getGlitchedAPLogic(ref) {
    const data = LogicAPGlitchedResource.get();
    if (customLogicObserver.value) {
        const LogicsStorage = new IDBStorage("logics_ap_glitched");
        const customData = await LogicsStorage.getAll();
        return extractLogic(ref, data, customData);
    } else {
        return extractLogic(ref, data);
    }
}

function extractLogic(ref, data = {}, customData = {}) {
    const res = [];
    for (const name in data.logic) {
        if (matchesRegion(name, ref)) {
            if (customData[name] != null) {
                res.push({
                    logic: customData[name],
                    parent: ""
                });
            } else {
                res.push({
                    logic: data.logic[name],
                    parent: ""
                });
            }
        }
    }
    for (const region in data.edges) {
        for (const name in data.edges[region]) {
            if (matchesRegion(name, ref)) {
                const key = `${region} -> ${name}`;
                if (customData[key] != null) {
                    res.push({
                        logic: customData[key],
                        parent: region
                    });
                } else {
                    res.push({
                        logic: data.edges[region][name],
                        parent: region
                    });
                }
            }
        }
    }
    return res;
}

function matchesRegion(name, ref) {
    if (name === ref) {
        return true;
    }
    if (Array.isArray(GATEWAYS_VARIANTS) && GATEWAYS_VARIANTS.length > 0) {
        for (const variant of GATEWAYS_VARIANTS) {
            if (name === `${ref}{${variant}}`) {
                return true;
            }
        }
    }
    return false;
}
