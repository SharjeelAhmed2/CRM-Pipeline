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
    stageDiv.setAttribute('data-stage-id', stage.id);
    stageDiv.style.cssText = "\n        margin-bottom: 10px;\n        background: white;\n        border-left: 4px solid ".concat(stage.color, ";\n        border-radius: 4px;\n        box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    ");
    // Create header section
    var headerDiv = document.createElement('div');
    headerDiv.style.cssText = "\n        padding: 10px;\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        border-bottom: 1px solid #e2e8f0;\n    ";
    headerDiv.innerHTML = "\n        <div style=\"display: flex; align-items: center;\">\n            <span style=\"font-weight: 500;\">".concat(stage.name, "</span>\n            <span class=\"stage-count\" style=\"margin-left: 8px; color: #666;\">0</span>\n        </div>\n        <button class=\"delete-stage\" style=\"\n            background: none;\n            border: none;\n            color: #ff4444;\n            cursor: pointer;\n            font-size: 18px;\n            padding: 0 4px;\n        \">\u00D7</button>\n    ");
    // Create emails container
    var emailsContainer = document.createElement('div');
    emailsContainer.className = 'stage-emails-container';
    emailsContainer.style.cssText = "\n        padding: 10px;\n        min-height: 30px;\n    ";
    stageDiv.appendChild(headerDiv);
    stageDiv.appendChild(emailsContainer);
    // Add delete functionality
    var deleteBtn = headerDiv.querySelector('.delete-stage');
    deleteBtn === null || deleteBtn === void 0 ? void 0 : deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete \"".concat(stage.name, "\" stage?"))) {
            chrome.storage.sync.get(['pipelineStages'], function (result) {
                var currentStages = result.pipelineStages || defaultStages;
                var updatedStages = currentStages.filter(function (s) { return s.id !== stage.id; });
                chrome.storage.sync.set({ pipelineStages: updatedStages }, function () {
                    stageDiv.remove();
                });
            });
        }
    });
    // Add drop zone handlers
    stageDiv.addEventListener('dragover', function (e) {
        e.preventDefault();
        emailsContainer.style.backgroundColor = '#f7fafc';
    });
    stageDiv.addEventListener('dragleave', function (e) {
        e.preventDefault();
        emailsContainer.style.backgroundColor = 'transparent';
    });
    stageDiv.addEventListener('drop', function (e) {
        var _a;
        e.preventDefault();
        emailsContainer.style.backgroundColor = 'transparent';
        try {
            var emailData = JSON.parse(((_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain')) || '');
            addEmailToStage(emailData, stage, stageDiv);
        }
        catch (error) {
            console.error('Error processing dropped email:', error);
        }
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
    loadSavedEmails();
}
// Add this new function to handle adding emails to stages
function addEmailToStage(emailData, stage, stageDiv) {
    console.log('Adding email to stage:', stage.name, emailData);
    var emailsContainer = stageDiv.querySelector('.stage-emails-container');
    if (!emailsContainer) {
        console.error('Emails container not found');
        return;
    }
    // Create email element
    var emailDiv = document.createElement('div');
    emailDiv.className = 'pipeline-email';
    emailDiv.style.cssText = "\n        margin-bottom: 8px;\n        padding: 8px;\n        background-color: #ffffff;\n        border: 1px solid #e2e8f0;\n        border-radius: 4px;\n        font-size: 12px;\n        cursor: pointer;\n        transition: all 0.2s;\n    ";
    // Create email content
    var formattedDate = new Date(emailData.timestamp).toLocaleDateString();
    emailDiv.innerHTML = "\n        <div style=\"margin-bottom: 4px; font-weight: 500; color: #2d3748;\">".concat(emailData.subject, "</div>\n        <div style=\"display: flex; justify-content: space-between; color: #718096;\">\n            <span>").concat(emailData.sender, "</span>\n            <span>").concat(formattedDate, "</span>\n        </div>\n    ");
    // Add hover effect
    emailDiv.addEventListener('mouseenter', function () {
        emailDiv.style.backgroundColor = '#f7fafc';
    });
    emailDiv.addEventListener('mouseleave', function () {
        emailDiv.style.backgroundColor = '#ffffff';
    });
    // Add to container
    emailsContainer.appendChild(emailDiv);
    // Update count
    var countElement = stageDiv.querySelector('.stage-count');
    if (countElement) {
        var currentCount = parseInt(countElement.textContent || '0');
        countElement.textContent = (currentCount + 1).toString();
    }
    // Save to storage
    chrome.storage.sync.get(['emailStages'], function (result) {
        var emailStages = result.emailStages || {};
        if (!emailStages[stage.id]) {
            emailStages[stage.id] = [];
        }
        emailStages[stage.id].push(emailData);
        chrome.storage.sync.set({ emailStages: emailStages }, function () {
            console.log('Email saved to storage:', emailData);
        });
    });
}
// 5:11 AM on Friday the 10th 
// Add this function to save email data to storage
function saveEmailToStage(emailData, stageId) {
    // Validate the data
    if (!emailData.subject || !emailData.sender || !emailData.timestamp) {
        console.error('Invalid email data:', emailData);
        return;
    }
    // Save to Chrome storage
    chrome.storage.sync.get(['emailStages'], function (result) {
        var emailStages = result.emailStages || {};
        if (!emailStages[stageId]) {
            emailStages[stageId] = [];
        }
        emailStages[stageId].push(emailData);
        chrome.storage.sync.set({ emailStages: emailStages }, function () {
            console.log('Email saved to stage:', stageId, emailData);
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
    moveButton.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Move button clicked');
        var getEmailData = function () {
            var _a, _b, _c, _d, _e, _f;
            // Get all table cells in the row
            var cells = emailRow.querySelectorAll('td');
            // Find subject from the third cell typically
            var subjectCell = Array.from(cells).find(function (cell) {
                return cell.querySelector('[role="link"]') ||
                    cell.querySelector('.bog') ||
                    cell.querySelector('.bqe');
            });
            var subject = (_a = subjectCell === null || subjectCell === void 0 ? void 0 : subjectCell.textContent) === null || _a === void 0 ? void 0 : _a.trim();
            // Find sender from the relevant cell
            // First try to find the email directly
            var sender = (_b = emailRow.querySelector('[email]')) === null || _b === void 0 ? void 0 : _b.getAttribute('email');
            if (!sender) {
                // If no email attribute, try to get the sender name/email from text content
                var senderCell = Array.from(cells).find(function (cell) {
                    return cell.querySelector('.yP') || cell.querySelector('.bA4');
                });
                sender = (_c = senderCell === null || senderCell === void 0 ? void 0 : senderCell.textContent) === null || _c === void 0 ? void 0 : _c.trim();
            }
            // Find timestamp from the last cell
            var lastCell = cells[cells.length - 1];
            var timeElement = (lastCell === null || lastCell === void 0 ? void 0 : lastCell.querySelector('span[title]')) || lastCell;
            var timestamp = (timeElement === null || timeElement === void 0 ? void 0 : timeElement.getAttribute('title')) ||
                ((_d = timeElement === null || timeElement === void 0 ? void 0 : timeElement.textContent) === null || _d === void 0 ? void 0 : _d.trim());
            console.log('Raw extracted values:', {
                cells: cells.length,
                subject: subject,
                sender: sender,
                timestamp: timestamp,
                rowHTML: emailRow.innerHTML
            });
            // Clean up and validate the data
            if (!subject || subject === '') {
                console.log('Missing subject');
                return null;
            }
            // Ensure we have some form of sender identification
            if (!sender || sender === '') {
                // Try to get any sender information from the row
                var anyNameOrEmail = (_f = (_e = emailRow.textContent) === null || _e === void 0 ? void 0 : _e.match(/[\w.-]+@[\w.-]+\.\w+/)) === null || _f === void 0 ? void 0 : _f[0];
                sender = anyNameOrEmail || 'Unknown Sender';
            }
            // Ensure we have some form of timestamp
            if (!timestamp || timestamp === '') {
                // Use current date as fallback
                var now = new Date();
                timestamp = now.toLocaleString();
            }
            var emailData = {
                id: Date.now().toString(),
                subject: subject,
                sender: sender,
                timestamp: timestamp
            };
            console.log('Final processed email data:', emailData);
            return emailData;
        };
        var emailData = getEmailData();
        if (emailData) {
            console.log('Email data extracted:', emailData);
            showStageSelectionPopup(emailData, e.clientX, e.clientY);
        }
        else {
            console.error('Failed to extract email data');
        }
    });
}
// Update the showStageSelectionPopup function to properly pass the data
// Add debug logging to track the flow
function showStageSelectionPopup(emailData, x, y) {
    console.log('Opening stage selection popup with data:', emailData);
    var popup = document.createElement('div');
    popup.className = 'stage-selection-popup';
    popup.style.cssText = "\n        position: fixed;\n        left: ".concat(x, "px;\n        top: ").concat(y, "px;\n        background: white;\n        border-radius: 8px;\n        box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n        padding: 8px;\n        z-index: 10000;\n    ");
    chrome.storage.sync.get(['pipelineStages'], function (result) {
        console.log('Retrieved stages:', result.pipelineStages);
        var stages = result.pipelineStages || defaultStages;
        stages.forEach(function (stage) {
            var option = document.createElement('div');
            option.style.cssText = "\n                padding: 8px 16px;\n                cursor: pointer;\n                border-left: 3px solid ".concat(stage.color, ";\n                margin: 4px 0;\n            ");
            option.textContent = stage.name;
            option.addEventListener('click', function () {
                console.log('Stage selected:', stage.name);
                var stageElement = document.querySelector("[data-stage-id=\"".concat(stage.id, "\"]"));
                if (stageElement) {
                    console.log('Found stage element, adding email');
                    addEmailToStage(emailData, stage, stageElement);
                }
                else {
                    console.error('Stage element not found:', stage.id);
                }
                popup.remove();
            });
            popup.appendChild(option);
        });
    });
    document.body.appendChild(popup);
}
// Add this function to load saved emails when creating stages
function loadSavedEmails() {
    chrome.storage.sync.get(['emailStages'], function (result) {
        var emailStages = result.emailStages || {};
        Object.entries(emailStages).forEach(function (_a) {
            var stageId = _a[0], emails = _a[1];
            var stageElement = document.querySelector("[data-stage-id=\"".concat(stageId, "\"]"));
            if (stageElement) {
                var stage_1 = defaultStages.find(function (s) { return s.id === stageId; });
                if (stage_1) {
                    emails.forEach(function (email) {
                        addEmailToStage(email, stage_1, stageElement);
                    });
                }
            }
        });
    });
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