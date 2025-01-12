/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content.tsx":
/*!*************************!*\
  !*** ./src/content.tsx ***!
  \*************************/
/***/ (function() {


var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
    console.log('Creating stage element:', stage.name);
    var stageDiv = document.createElement('div');
    stageDiv.className = 'pipeline-stage';
    // Added for Email Drag and Drop 
    stageDiv.setAttribute('data-stage-id', stage.id);
    // Log the created stage
    console.log('Stage created with ID:', stage.id);
    // Add drop zone styling and handlers
    stageDiv.style.cssText = "\n    margin-bottom: 10px;\n    padding: 10px;\n    background: white;\n    border-left: 4px solid ".concat(stage.color, ";\n    border-radius: 4px;\n    box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    cursor: pointer;\n    transition: all 0.2s;\n    min-height: 50px;\n   ");
    // Further modifying it for remove Button 
    stageDiv.innerHTML = "\n        <div style=\"display: flex; justify-content: space-between; align-items: center;\">\n            <span>".concat(stage.name, "</span>\n            <div style=\"display: flex; align-items: center; gap: 8px;\">\n            <span class=\"stage-count\">0</span>\n                            <button class=\"delete-stage\" style=\"\n                    background: none;\n                    border: none;\n                    color:rgb(255, 0, 0);\n                    cursor: pointer;\n                    font-size: 18px;\n                    padding: 0 4px;\n                \">\u00D7</button>\n            </div>\n        </div>\n    ");
    // Add delete functionality
    var deleteBtn = stageDiv.querySelector('.delete-stage');
    deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent stage click event
        if (confirm("Are you sure you want to delete \"".concat(stage.name, "\" stage?"))) {
            // Remove from storage
            chrome.storage.sync.get(['pipelineStages'], function (result) {
                var currentStages = result.pipelineStages || defaultStages;
                var updatedStages = currentStages.filter(function (s) { return s.id !== stage.id; });
                chrome.storage.sync.set({ pipelineStages: updatedStages }, function () {
                    // Remove from UI
                    stageDiv.remove();
                });
            });
        }
    });
    // Add drop zone event listeners
    // Update drop zone event listeners
    stageDiv.addEventListener('dragenter', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Drag entered stage:', stage.name);
        stageDiv.style.backgroundColor = '#f0f5ff';
    });
    stageDiv.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Dragging over stage:', stage.name);
        stageDiv.style.backgroundColor = '#f0f5ff';
    });
    stageDiv.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Drag left stage:', stage.name);
        stageDiv.style.backgroundColor = 'white';
    });
    stageDiv.addEventListener('drop', function (e) {
        var _a;
        e.preventDefault();
        e.stopPropagation();
        console.log('Drop event on stage:', stage.name);
        stageDiv.style.backgroundColor = 'white';
        try {
            // Log the raw data first
            var rawData = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
            console.log('Raw dropped Datas:', rawData);
            if (!rawData) {
                throw new Error('No data received in drop event');
            }
            // In case of NayaPay testing
            // const parts = rawData.split('/');
            // const userId = parts[parts.indexOf('u') + 1];
            // const mailboxType = parts[parts.length - 2].replace('#', '');
            // const messageId = parts[parts.length - 1];
            // // Construct JSON
            // const emailData = {
            //     userId: userId,
            //     mailboxType: mailboxType,
            //     messageId: messageId
            // };
            // console.log(emailData);
            var emailData = JSON.parse(rawData);
            console.log('Successfully parsed email data:', emailData);
            addEmailToStage(emailData, stage, stageDiv);
        }
        catch (error) {
            console.error('Error processing dropped email:', error);
            // console.error('Error details:', error.message);
        }
    });
    stageDiv.addEventListener('mouseover', function () {
        stageDiv.style.backgroundColor = '#f7fafc';
    });
    stageDiv.addEventListener('mouseout', function () {
        stageDiv.style.backgroundColor = 'white';
    });
    return stageDiv;
}
/// For Add Stage Button Functionality 
function createAddStageForm() {
    var modal = document.createElement('div');
    modal.style.cssText = "\n        position: fixed;\n        top: 50%;\n        left: 50%;\n        transform: translate(-50%, -50%);\n        background: white;\n        padding: 20px;\n        border-radius: 8px;\n        box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        z-index: 10001;\n        width: 300px;\n    ";
    var overlay = document.createElement('div');
    overlay.style.cssText = "\n        position: fixed;\n        top: 0;\n        left: 0;\n        right: 0;\n        bottom: 0;\n        background: rgba(0,0,0,0.5);\n        z-index: 10000;\n    ";
    var form = document.createElement('form');
    form.innerHTML = "\n        <h3 style=\"margin-bottom: 15px; font-weight: bold;\">Add New Stage</h3>\n        <div style=\"margin-bottom: 15px;\">\n            <input type=\"text\" id=\"stageName\" placeholder=\"Stage Name\" style=\"\n                width: 100%;\n                padding: 8px;\n                border: 1px solid #e2e8f0;\n                border-radius: 4px;\n                margin-bottom: 10px;\n            \">\n            <input type=\"color\" id=\"stageColor\" value=\"#718096\" style=\"\n                width: 100%;\n                height: 40px;\n                border: 1px solid #e2e8f0;\n                border-radius: 4px;\n            \">\n        </div>\n        <div style=\"display: flex; gap: 10px;\">\n            <button type=\"submit\" style=\"\n                flex: 1;\n                padding: 8px;\n                background: #4299E1;\n                color: white;\n                border: none;\n                border-radius: 4px;\n                cursor: pointer;\n            \">Add</button>\n            <button type=\"button\" id=\"cancelBtn\" style=\"\n                flex: 1;\n                padding: 8px;\n                background: #CBD5E0;\n                color: white;\n                border: none;\n                border-radius: 4px;\n                cursor: pointer;\n            \">Cancel</button>\n        </div>\n    ";
    modal.appendChild(form);
    // Handle form submission 
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var nameInput = document.getElementById('stageName');
        var colorInput = document.getElementById('stageColor');
        var newStage = {
            id: Date.now().toString(),
            name: nameInput.value,
            color: colorInput.value
        };
        // Get current stages and add new one
        chrome.storage.sync.get(['pipelineStages'], function (result) {
            var currentStages = result.pipelineStages || defaultStages;
            var updatedStages = __spreadArray(__spreadArray([], currentStages, true), [newStage], false);
            // Save updated stages
            chrome.storage.sync.set({ pipelineStages: updatedStages }, function () {
                // Add new stage to UI
                var stagesContainer = document.getElementById('pipeline-stages');
                if (stagesContainer) {
                    stagesContainer.appendChild(createStageElement(newStage));
                }
                // Remove modal that we created when we clicked on Add Stage button
                document.body.removeChild(modal);
                document.body.removeChild(overlay);
            });
        });
    });
    // Handle cancel
    var cancelBtn = form.querySelector('#cancelBtn');
    cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', function () {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    });
    // Add modal and overlay to page
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}
// For Sidebar
function createSidebar() {
    console.log('Creating sidebarfff');
    var sidebar = document.createElement('div');
    sidebar.id = 'gmail-crm-sidebar';
    sidebar.style.cssText = "\n    position: fixed;\n    right: 0;\n    top: 0;\n    width: 250px;\n    height: 100vh;\n    background: #f8fafc;\n    box-shadow: -2px 0 5px rgba(0,0,0,0.1);\n    z-index: 1000;\n    padding: 20px;\n    overflow-y: auto;\n";
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
        console.log('Created pipeline-stages container');
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
        addButton.style.cssText = "\n            width: 100%;\n            padding: 8px;\n            background: #4299E1;\n            color: white;\n            border: none;\n            border-radius: 4px;\n            cursor: pointer;\n            margin-top: 10px;\n        ";
        addButton.addEventListener('click', createAddStageForm);
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
// Add this new function to handle adding emails to stages
function addEmailToStage(emailData, stage, stageDiv) {
    try {
        var emailElement = document.createElement('div');
        emailElement.className = 'pipeline-email';
        emailElement.style.cssText = "\n            margin: 8px 0;\n            padding: 8px;\n            background: white;\n            border: 1px solid #e2e8f0;\n            border-radius: 4px;\n            font-size: 12px;\n        ";
        emailElement.innerHTML = "\n            <div style=\"font-weight: bold;\">".concat(emailData.subject, "</div>\n            <div style=\"color: #666;\">").concat(emailData.sender, "</div>\n            <div style=\"color: #888; font-size: 11px;\">").concat(emailData.timestamp, "</div>\n        ");
        // Find or create the emails container in the stage
        var emailsContainer = stageDiv.querySelector('.stage-emails');
        if (!emailsContainer) {
            emailsContainer = document.createElement('div');
            emailsContainer.className = 'stage-emails';
            stageDiv.appendChild(emailsContainer);
        }
        emailsContainer.appendChild(emailElement);
        // Update the count
        var countElement = stageDiv.querySelector('.stage-count');
        if (countElement) {
            var currentCount = parseInt(countElement.textContent || '0');
            countElement.textContent = (currentCount + 1).toString();
        }
        // Save to storage
        saveEmailToStage(emailData, stage.id);
        // Remove any existing popups using the safer method
        var existingPopup = document.querySelector('.crm-stage-popup');
        if (existingPopup) {
            existingPopup.remove();
        }
    }
    catch (error) {
        console.error('Error adding email to stage:', error);
    }
}
// 5:11 AM on Friday the 10th 
// Add this function to save email data to storage
function saveEmailToStage(emailData, stageId) {
    // Validate email data before saving
    if (!emailData.subject || !emailData.sender || !emailData.timestamp) {
        console.error('Invalid email data:', emailData);
        return;
    }
    chrome.storage.sync.get(['emailStages'], function (result) {
        var emailStages = result.emailStages || {};
        if (!emailStages[stageId]) {
            emailStages[stageId] = [];
        }
        // Add email only if it's valid
        emailStages[stageId].push(emailData);
        chrome.storage.sync.set({ emailStages: emailStages }, function () {
            console.log('Email successfully saved to stage:', stageId, emailData);
        });
    });
}
/// Email Dragable Function
/*
The move button is now always created and positioned next to the checkbox
The button becomes visible on row hover instead of row selection
Added a simple icon (📋) to make it more compact
Added proper z-index to ensure the button stays above other elements
Added transition effects for smooth appearance/disappearance
Added checks to prevent duplicate buttons
Improved the initialization tracking
*/
/**Simplified the selectors to better match Gmail's structure
Removed the opacity transition and hover effects (making buttons always visible)
Increased z-index to ensure buttons appear above Gmail's interface
Added more specific targeting for email elements
Added more debug logging
Fixed the observer logic
Added a delay after page load to ensure Gmail is fully initialized */
function makeEmailDraggable(emailRow) {
    // Verify this is actually an email row
    if (!emailRow.classList.contains('zA')) {
        console.log('Not an email row, skipping:', emailRow);
        return;
    }
    // First, check if the button is already added
    if (emailRow.querySelector('.crm-move-button')) {
        return;
    }
    var moveButton = document.createElement('button');
    moveButton.className = 'crm-move-button';
    moveButton.innerHTML = '📋';
    moveButton.title = 'Move to Pipeline';
    moveButton.style.cssText = "\n            background: #4299E1;\n            color: white;\n            border: none;\n            padding: 4px 8px;\n            border-radius: 4px;\n            font-size: 12px;\n            cursor: pointer;\n            margin-right: 8px;\n            position: relative;\n            z-index: 9999;\n            display: inline-block;\n            opacity: 1;\n        ";
    // Target the first TD which contains the checkbox
    var firstCell = emailRow.querySelector('td:first-child');
    if (firstCell) {
        // Insert at the beginning of the cell
        firstCell.insertBefore(moveButton, firstCell.firstChild);
        console.log('Move button inserted into email row');
    }
    // Click handler for the move button
    moveButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var getEmailData = function () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            // Gmail-specific selectors for email data
            var subject = ((_b = (_a = emailRow.querySelector('.bqe')) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) ||
                ((_d = (_c = emailRow.querySelector('.y6')) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim());
            var sender = ((_e = emailRow.querySelector('.yX')) === null || _e === void 0 ? void 0 : _e.getAttribute('email')) ||
                ((_g = (_f = emailRow.querySelector('.yP')) === null || _f === void 0 ? void 0 : _f.textContent) === null || _g === void 0 ? void 0 : _g.trim());
            var timestamp = ((_j = (_h = emailRow.querySelector('.xW')) === null || _h === void 0 ? void 0 : _h.querySelector('span')) === null || _j === void 0 ? void 0 : _j.getAttribute('title')) ||
                ((_l = (_k = emailRow.querySelector('.xW')) === null || _k === void 0 ? void 0 : _k.textContent) === null || _l === void 0 ? void 0 : _l.trim());
            console.log('Extracted data:', { subject: subject, sender: sender, timestamp: timestamp });
            if (!subject || !sender || !timestamp) {
                return null;
            }
            return {
                id: Date.now().toString(),
                subject: subject,
                sender: sender,
                timestamp: timestamp
            };
        };
        var emailData = getEmailData();
        if (emailData) {
            showStageSelectionPopup(emailData, e.clientX, e.clientY);
        }
        else {
            console.error('Failed to extract email data');
        }
    });
}
function showStageSelectionPopup(emailData, x, y) {
    // Remove any existing popups first
    var existingPopup = document.querySelector('.crm-stage-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    // Create popup container
    var popup = document.createElement('div');
    popup.className = 'crm-stage-popup'; // Add a class for easy identification
    popup.style.cssText = "\n            position: fixed;\n            left: ".concat(x, "px;\n            top: ").concat(y, "px;\n            background: white;\n            border-radius: 8px;\n            box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n            padding: 8px;\n            z-index: 10000;\n        ");
    // Get stages and create options
    chrome.storage.sync.get(['pipelineStages'], function (result) {
        var stages = result.pipelineStages || defaultStages;
        stages.forEach(function (stage) {
            var option = document.createElement('div');
            option.style.cssText = "\n                    padding: 8px 16px;\n                    cursor: pointer;\n                    border-left: 3px solid ".concat(stage.color, ";\n                    margin: 4px 0;\n                ");
            option.textContent = stage.name;
            option.addEventListener('mouseover', function () {
                option.style.backgroundColor = '#f7fafc';
            });
            option.addEventListener('mouseout', function () {
                option.style.backgroundColor = 'white';
            });
            option.addEventListener('click', function () {
                // Find stage element
                var stageElement = document.querySelector("[data-stage-id=\"".concat(stage.id, "\"]"));
                if (stageElement) {
                    addEmailToStage(emailData, stage, stageElement);
                }
                //document.body.removeChild(popup);
                // Use safer removal method
                popup.remove();
            });
            popup.appendChild(option);
        });
    });
    // Close popup when clicking outside
    function handleClickOutside(e) {
        if (!popup.contains(e.target)) {
            popup.remove();
            document.removeEventListener('click', handleClickOutside);
        }
    }
    // Delay adding the click listener to prevent immediate closure
    setTimeout(function () {
        document.addEventListener('click', handleClickOutside);
    }, 100);
    // Add popup to document
    document.body.appendChild(popup);
}
function observeGmailInbox() {
    console.log('Starting Gmail observer...');
    function initializeEmailRows() {
        // Target only the table rows that contain actual emails
        // Gmail uses 'zA' class for email rows
        var emailRows = document.querySelectorAll('tr.zA');
        console.log("Found ".concat(emailRows.length, " email rows"));
        emailRows.forEach(function (row) {
            if (!row.hasAttribute('data-crm-initialized')) {
                makeEmailDraggable(row);
                row.setAttribute('data-crm-initialized', 'true');
                console.log('Initialized email row with classes:', row.className);
            }
        });
    }
    // Update the target node to specifically watch the email list
    var findEmailContainer = function () {
        // Gmail's main content area where emails are listed
        var targetNode = document.querySelector('.AO');
        if (!targetNode) {
            console.log('Gmail email container not found, retrying...');
            setTimeout(findEmailContainer, 1000);
            return;
        }
        console.log('Found Gmail email container');
        createSidebar();
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function () {
                initializeEmailRows();
            });
        });
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
        // Initial call
        initializeEmailRows();
    };
    // Start looking for the email container
    findEmailContainer();
}
// Add this to your initialization
window.addEventListener('load', function () {
    console.log('Page loaded, initializing CRM...');
    setTimeout(observeGmailInbox, 1000); // Give Gmail a moment to set up
});
var init = function () {
    if (!window.location.origin.includes(GMAIL_URL_PATTERN)) {
        return;
    }
    console.log('Gmail detected, starting observer');
    observeGmailInbox();
};
// Start when page loads
window.addEventListener('load', init);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/content.tsx"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=content.js.map