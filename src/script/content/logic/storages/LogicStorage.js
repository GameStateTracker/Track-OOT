// frameworks
import ObservableIDBProxyStorage from "@emcjs/core/data/storage/observable/ObservableIDBProxyStorage.js";

class LogicStorage extends ObservableIDBProxyStorage {

    constructor() {
        super("logics");
    }

}

const storage = new LogicStorage();

export default await storage.awaitLoaded();
