"use strict";

/*jshint -W030 */
document.head || (document.head = document.getElementsByTagName("head")[0]);

function changeDynFavicon(src) {
    let link = document.createElement("link"),
        oldLink = document.getElementById("dynamic-favicon");
    link.id = "dynamic-favicon";
    link.rel = "shortcut icon";
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}

function changeFavicon(src) {
    let link = document.createElement("link"),
        oldLink = document.getElementById("dynamic-favicon");
    link.id = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}

export default {
    changeFavicon: changeFavicon,
    changeDynFavicon: changeDynFavicon
};