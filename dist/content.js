/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************!*\
  !*** ./src/content.tsx ***!
  \*************************/

// src/content.tsx
console.log('Content script loaded initially');
var GMAIL_URL_PATTERN = 'https://mail.google.com';
var init = function () {
    console.log('Init function called');
    if (!window.location.origin.includes(GMAIL_URL_PATTERN)) {
        console.log('Not on Gmail');
        return;
    }
    console.log('Gmail detected!');
    // Add a visible element to confirm injection
    var div = document.createElement('div');
    div.style.padding = '10px';
    div.style.backgroundColor = 'red';
    div.textContent = 'Gmail CRM Extension Loaded!';
    document.body.prepend(div);
};
// Start the extension
init();

/******/ })()
;
//# sourceMappingURL=content.js.map