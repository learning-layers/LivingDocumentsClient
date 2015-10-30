"use strict";

let Reflux = require("reflux");

//HACK components listening to this store refresh every x seconds
let RefreshStore = Reflux.createStore({
    authenticationInProgress: false,
    state: {
    },
    init() {
        let that = this;
        (function refreshComponents() {
            setTimeout(() => {
                that.onRefresh();
                refreshComponents(that);
            }, 30000);
        })();
    },
    getInitialState() {
        return this.state;
    },
    onRefresh() {
        this.trigger(this.state);
    }
});

module.exports = RefreshStore;