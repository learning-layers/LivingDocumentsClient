"use strict";

import i18n from "../i18n/i18n.js";
import areIntlLocalesSupported from "intl-locales-supported";
import ReactIntl from "../../node_modules/react-intl";

const locales = [
    "en",
    "en-US",
    "de",
    "de-DE"
];

if (global.Intl) {
    if (!areIntlLocalesSupported(locales)) {
        require("intl");
        // @see http://formatjs.io/guides/runtime-environments/
        Intl.NumberFormat = IntlPolyfill.NumberFormat; // jshint ignore:line
        Intl.DateTimeFormat = IntlPolyfill.DateTimeFormat; // jshint ignore:line
    }
} else {
    global.Intl = require("intl");
}

let i18nActive = false;


const initialLocale = "en";
let currentLocale = null;
if (i18nActive) {
    currentLocale = window.navigator.userLanguage || window.navigator.language || navigator.language || initialLocale;
} else {
    currentLocale = initialLocale;
}

let usedLocale = null;
let messages = null;
window.ReactIntl = ReactIntl;
global.ReactIntl = ReactIntl;

try {
    console.info("Trying to load messages for locale=" + currentLocale);
    try {
        // TODO fix this for sublocales
        var deLang = require("../../node_modules/react-intl/dist/locale-data/" + currentLocale);
    } catch (e) {
        //
    }
    messages = i18n.messages[currentLocale];
    usedLocale = currentLocale;
} catch (e) {
    messages = i18n.messages[initialLocale];
    usedLocale = initialLocale;
}

export default {
    formats: {},
    locales: usedLocale,
    messages: messages
};