import CustomElement from "@emcjs/fe/ui/element/CustomElement.js";
import LocalStorage from "@emcjs/core/data/storage/global/LocalStorage.js";
import DeveloperData from "../../../data/DeveloperData.js";
import TPL from "./CreditsPanel.js.html" assert {type: "html"};
import STYLE from "./CreditsPanel.js.css" assert {type: "css"};

const SUPPORTER_URL = new URL("/patreon", location);
if (location.hostname == "localhost") {
    SUPPORTER_URL.port = 10001;
}

function sortNames(a, b) {
    if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
    }
    return 1;
}

function sortTiers([, a], [, b]) {
    if (a.value > b.value) {
        return -1;
    }
    return 1;
}

function createDevEntry(name, type) {
    const el = document.createElement("li");
    el.classList.add("name");
    el.classList.add(type);
    el.innerHTML = name;
    return el;
}

function createSupporterPanel(title, data) {
    if (data != null && Array.isArray(data.names) && data.names.length > 0) {
        const res = document.createElement("label");
        const ttl = document.createElement("span");
        ttl.classList.add("title");
        ttl.innerHTML = title;
        const lst = document.createElement("ul");
        for (const name of new Set(data.names)) {
            const el = document.createElement("li");
            el.classList.add("name");
            el.innerHTML = name;
            el.style.color = data.color || "";
            lst.append(el);
        }
        res.append(ttl);
        res.append(lst);
        return res;
    }
}

async function fillCredits(teamList, contributorList, supporterList) {
    teamList.append(createDevEntry(DeveloperData.owner, "owner"));
    const team = DeveloperData.team.sort(sortNames);
    for (const name of team) {
        teamList.append(createDevEntry(name, "team"));
    }
    const contributors = DeveloperData.contributors.sort(sortNames);
    for (const name of contributors) {
        contributorList.append(createDevEntry(name, "contributor"));
    }
    let supporters = LocalStorage.get("supporters", {});
    try {
        const r = await fetch(SUPPORTER_URL);
        if (r.status < 200 || r.status >= 300) {
            throw new Error(`error loading patreon data - status: ${r.status}`);
        }
        supporters = await r.json();
        LocalStorage.set("supporters", supporters);
    } catch (err) {
        console.error(err);
    }
    for (const [key, value] of Object.entries(supporters).sort(sortTiers)) {
        const el = createSupporterPanel(key, value);
        if (el != null) {
            supporterList.append(el);
        }
    }
}

export default class CreditsPanel extends CustomElement {

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        const teamList = this.shadowRoot.getElementById("team");
        const contributorList = this.shadowRoot.getElementById("contributor");
        const supporterList = this.shadowRoot.getElementById("supporters");
        fillCredits(teamList, contributorList, supporterList);
    }

}

customElements.define("tootr-about-panel-credits", CreditsPanel);
