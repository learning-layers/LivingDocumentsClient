"use strict";

let I18N = {
    locales: ["en-US", "de"],
    messages: {
        en: {
            retrieveDocument: "Loading document data from server",
            retrieveBreadcrumbs: "Loading discussion data from server",
            retrieveEtherpadInfo: "Loading document editor",
            SHORT: "{product} cost {price, number, usd} if ordered by {deadline, date, medium}",
            LONG: "{product} cost {price, number, usd} (or {price, number, eur}) if ordered by {deadline, date, medium}",
            LONG_WITH_HTML: "{product} cost <b>{price, number, usd}</b> (<i>or {price, number, eur}</i>) if ordered by {deadline, date, medium}"
        },
        de: {
            retrieveDocument: "Daten des aufgerufenen Dokumentes werden geladen",
            retrieveBreadcrumbs: "Daten der zugeh&ouml;rigen Diskussionen werden geladen",
            retrieveEtherpadInfo: "Editor wird initialisiert",
            SHORT: "{product} kostet {price, number, eur} wenn es bis zum {deadline, date, medium} bestellt wird",
            LONG: "{product} cost {price, number, eur} (or {price, number, eur}) if ordered by {deadline, date, medium}",
            LONG_WITH_HTML: "{product} cost <b>{price, number, usd}</b> (<i>or {price, number, eur}</i>) if ordered by {deadline, date, medium}"
        }
    },
    formats: {
        en: {

        },
        de: {
            relative: "Posted {ago}"
        }
    }
};

export default I18N;