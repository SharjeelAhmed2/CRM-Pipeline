/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!*************************!*\
  !*** ./src/content.tsx ***!
  \*************************/

// src/content.tsx
console.log('Content script starting...');
var GMAIL_URL_PATTERN = 'https://mail.google.com';
// Default stages
var defaultStages = [
    { id: '1', name: 'Lead', color: '#718096' },
    { id: '2', name: 'Pitched', color: '#4299E1' },
    { id: '3', name: 'Waiting', color: '#9F7AEA' },
    { id: '4', name: 'Closed', color: '#48BB78' }
];
function createStageElement(stage) {
    var stageDiv = document.createElement('div');
    stageDiv.className = 'pipeline-stage';
    stageDiv.style.cssText = "\n        margin-bottom: 10px;\n        padding: 10px;\n        background: white;\n        border-left: 4px solid ".concat(stage.color, ";\n        border-radius: 4px;\n        box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n        cursor: pointer;\n        transition: all 0.2s;\n    ");
    stageDiv.innerHTML = "\n        <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n            <span>".concat(stage.name, "</span>\n            <span class=\"stage-count\">0</span>\n        </div>\n    ");
    stageDiv.addEventListener('mouseover', function () {
        stageDiv.style.backgroundColor = '#f7fafc';
    });
    stageDiv.addEventListener('mouseout', function () {
        stageDiv.style.backgroundColor = 'white';
    });
    return stageDiv;
}
/// For Add Stage Button Functionality 
// For Sidebar
function createSidebar() {
    var sidebar = document.createElement('div');
    sidebar.id = 'gmail-crm-sidebar';
    sidebar.style.cssText = "\n        position: fixed;\n        right: 0;\n        top: 0;\n        width: 250px;\n        height: 100vh;\n        background: #f8fafc;\n        box-shadow: -2px 0 5px rgba(0,0,0,0.1);\n        z-index: 1000;\n        padding: 20px;\n        overflow-y: auto;\n    ";
    // Add title
    var title = document.createElement('h2');
    title.textContent = 'CRM Pipeline';
    title.style.cssText = 'margin-bottom: 15px; font-weight: bold; color: #2d3748;';
    sidebar.appendChild(title);
    //Stages Work
    // Get stages from storage or use defaults
    //This is Chrome's storage API that syncs data across user's browsers
    chrome.storage.sync.get(['pipelineStages'], function (result) {
        var stages = result.pipelineStages || defaultStages;
        // Create stages container
        var stagesContainer = document.createElement('div');
        stagesContainer.id = 'pipeline-stages';
        // stages.forEach(stage => {
        //     stagesContainer.appendChild(createStageElement(stage));
        // });
        // Explicitly type the stage parameter
        stages.forEach(function (stage) {
            stagesContainer.appendChild(createStageElement(stage));
        });
        sidebar.appendChild(stagesContainer);
        // Add "Add Stage" button
        var addButton = document.createElement('button');
        addButton.textContent = '+ Add Stage';
        addButton.style.cssText = "\n                width: 100%;\n                padding: 8px;\n                background: #4299E1;\n                color: white;\n                border: none;\n                border-radius: 4px;\n                cursor: pointer;\n                margin-top: 10px;\n            ";
        sidebar.appendChild(addButton);
    });
    // Add to page
    document.body.appendChild(sidebar);
    // Adjust Gmail's main content
    var gmailContent = document.querySelector('.bkK');
    if (gmailContent) {
        gmailContent.style.marginRight = '250px';
    }
}
function observeGmailInbox() {
    // Gmail's main content area usually has role="main"
    var targetNode = document.querySelector('[role="main"]');
    if (!targetNode) {
        console.log('Gmail main content area not found, retrying...');
        setTimeout(observeGmailInbox, 1000);
        return;
    }
    console.log('Found Gmail main content area, setting up observer');
    createSidebar(); // Add sidebar when we find the main content
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