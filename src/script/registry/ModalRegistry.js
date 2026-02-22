import modalRegistry from "/emcJS/data/registry/ModalRegistry.js";
import LoadSavestateModal from "/GameTrackerJS/ui/modal/savestate/LoadSavestateModal.js";
import SaveSavestateModal from "/GameTrackerJS/ui/modal/savestate/SaveSavestateModal.js";
import ManageSavestateModal from "/GameTrackerJS/ui/modal/savestate/ManageSavestateModal.js";
import RemoteItemViewModal from "../ui/modal/rtc/itemview/RemoteItemViewModal.js";
import APConnectModal from "../ui/modal/APConnectModal.js";
import ClearDataModal from "../ui/modal/ClearDataModal.js";
import NewGameModal from "../ui/modal/NewGameModal.js";
import SpoilerLogModal from "../ui/modal/SpoilerLogModal.js";

export function initModals() {
    modalRegistry.register("LoadSavestate", new LoadSavestateModal());
    modalRegistry.register("SaveSavestate", new SaveSavestateModal());
    modalRegistry.register("ManageSavestate", new ManageSavestateModal());
    modalRegistry.register("RemoteItemView", new RemoteItemViewModal());
    modalRegistry.register("Archipelago", new APConnectModal());
    modalRegistry.register("ClearData", new ClearDataModal());
    modalRegistry.register("NewGame", new NewGameModal());
    modalRegistry.register("SpoilerLog", new SpoilerLogModal());
}
