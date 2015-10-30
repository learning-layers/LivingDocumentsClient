"use strict";

import jQuery from "jquery";
import AppActions from "../reflux/app/appActions";

let whenWithProgress = function(arrayOfPromiseObjWrappers) {
    let dfd = jQuery.Deferred();
    // TODO start progress indication modal

    let arrayOfPromiseNames = [];
    let arrayOfPromises = [];
    arrayOfPromiseObjWrappers.forEach((promiseObjWrapper) => {
        arrayOfPromises.push(promiseObjWrapper.promiseObj);
        arrayOfPromiseNames.push(promiseObjWrapper.promiseName);
    });

    AppActions.loading(arrayOfPromiseNames);

    for (let i = 0; i < arrayOfPromiseObjWrappers.length; i++) {
        // TODO add current progress to the modal
        let promiseName = arrayOfPromiseObjWrappers[i].promiseName;
        arrayOfPromiseObjWrappers[i].promiseObj.then((success) => {
            AppActions.loadingProgress({success: success, promiseName: promiseName});
            dfd.notify({success: success, promiseName: promiseName});
        }, (error) => {
            AppActions.loadingProgress({error: error, promiseName: promiseName});
            dfd.notify({error: error, promiseName: promiseName});
        });
    }

    jQuery.when.apply(jQuery, arrayOfPromises).then(() => {
            if (arguments[0]) {
                try {
                    let currentArgs = arguments[0];
                    let newArgs = [];
                    currentArgs.forEach((currentArg) => {
                        newArgs.push(JSON.parse(currentArg.promiseObj.responseText));
                    });
                    AppActions.loadingComplete({success: newArgs});
                    dfd.resolve.apply(this, newArgs);
                } catch (e) {
                    console.error(e);
                    AppActions.loadingComplete({error: "Could not parse received JSON!"});
                    dfd.reject(e);
                }
            } else {
                AppActions.loadingComplete({error: "Didn't received required data!"});
                dfd.reject(arguments);
            }
    }, () => {
        AppActions.loadingComplete({error: "Didn't received required data!"});
        dfd.reject(arguments);
    });
    return dfd.promise();
};

export default {
    whenWithProgress: whenWithProgress
};