import LogList from "/emcJS/ui/dataview/datalist/LogList.js";
import "./components/ChatListEntry.js";

export default class ChatList extends LogList {

    createListEntry() {
        return document.createElement("ootrt-ap-chatlist-entry");
    }

}

customElements.define("ootrt-ap-chatlist", ChatList);
