/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************!*\
  !*** ./src/content.tsx ***!
  \*************************/

// src/content.tsx
console.log('Content script starting...');
var GMAIL_URL_PATTERN = 'https://mail.google.com';
function observeGmailInbox() {
    // Gmail's main content area usually has role="main"
    var targetNode = document.querySelector('[role="main"]');
    if (!targetNode) {
        console.log('Gmail main content area not found, retrying...');
        setTimeout(observeGmailInbox, 1000);
        return;
    }
    console.log('Found Gmail main content area, setting up observer');
    // A MutationObserver is created to monitor changes in the DOM (Document Object Model) of the targetNode.
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            // Look for email rows
            var emailRows = document.querySelectorAll('tr[role="row"]');
            if (emailRows.length > 0) {
                console.log('Emails found:', emailRows.length);
                // We'll process these emails later
            }
        });
    });
    //Changes in child elements (childList: true).
    //Changes deep within the DOM tree (subtree: true).
    observer.observe(targetNode, {
        childList: true,
        subtree: true
    });
}
var init = function () {
    if (!window.location.origin.includes(GMAIL_URL_PATTERN)) {
        return;
    }
    console.log('Gmail detected, starting observer');
    observeGmailInbox();
};
// Start when page loads
window.addEventListener('load', init);

/******/ })()
;
//# sourceMappingURL=content.js.map