/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/content.tsx":
/*!*************************!*\
  !*** ./src/content.tsx ***!
  \*************************/
/***/ (function() {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
// Storage utility functions
// Create the StorageUtils object with all storage-related functions
var StorageUtils = {
    // Helper function to compress email data
    compressEmailData: function (email) {
        return {
            i: email.id,
            s: email.subject.substring(0, 100),
            f: email.sender.substring(0, 50),
            t: email.timestamp
        };
    },
    // Helper function to decompress email data
    decompressEmailData: function (stored) {
        return {
            id: stored.i,
            subject: stored.s,
            sender: stored.f,
            timestamp: stored.t
        };
    },
    // Save email to stage function
    saveEmailToStage: function (emailData, stageId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, result, emails, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        key = "stage_".concat(stageId);
                        return [4 /*yield*/, chrome.storage.local.get([key])];
                    case 1:
                        result = _b.sent();
                        emails = result[key] || [];
                        emails.push(emailData);
                        if (emails.length > 50) {
                            emails = emails.slice(-50);
                        }
                        return [4 /*yield*/, chrome.storage.local.set((_a = {}, _a[key] = emails, _a))];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _b.sent();
                        console.error('Error saving email:', error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    // Load emails for a stage function
    loadStageEmails: function (stageId) {
        return __awaiter(this, void 0, void 0, function () {
            var key, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        key = "stage_".concat(stageId);
                        return [4 /*yield*/, chrome.storage.local.get([key])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[key] || []];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error loading emails:', error_2);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
// Compress email data before storage
function compressEmailData(email) {
    return {
        i: email.id,
        s: email.subject.substring(0, 100), // Limit subject length
        f: email.sender.substring(0, 50), // Limit sender length
        t: email.timestamp
    };
}
// Decompress email data for display
function decompressEmailData(stored) {
    return {
        id: stored.i,
        subject: stored.s,
        sender: stored.f,
        timestamp: stored.t
    };
}
// Update the createStageElement function to match your UI
function createStageElement(stage) {
    var stageDiv = document.createElement('div');
    stageDiv.className = 'pipeline-stage';
    stageDiv.setAttribute('data-stage-id', stage.id);
    stageDiv.style.cssText = "\n        margin-bottom: 10px;\n        background: white;\n        border-radius: 4px;\n        box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n    ";
    // Create the header with your existing UI structure
    var headerDiv = document.createElement('div');
    headerDiv.style.cssText = "\n        padding: 10px;\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        border-left: 4px solid ".concat(stage.color, ";\n        border-radius: 4px;\n        background: white;\n    ");
    headerDiv.innerHTML = "\n        <div style=\"display: flex; align-items: center; gap: 8px;\">\n            <span>".concat(stage.name, "</span>\n            <span class=\"stage-count\">0</span>\n        </div>\n        <button class=\"delete-stage\" style=\"\n            background: none;\n            border: none;\n            color: #ff4444;\n            cursor: pointer;\n            font-size: 18px;\n            padding: 0 4px;\n        \">\u00D7</button>\n    ");
    // Create a container for emails that will appear below the header
    var emailsContainer = document.createElement('div');
    emailsContainer.className = 'stage-emails-container';
    emailsContainer.style.cssText = "\n        padding: 8px;\n        margin-top: 4px;\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n    ";
    stageDiv.appendChild(headerDiv);
    stageDiv.appendChild(emailsContainer);
    // Add existing delete functionality
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
    return __awaiter(this, void 0, void 0, function () {
        var sidebar, title, gmailContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Creating sidebarfff');
                    sidebar = document.createElement('div');
                    sidebar.id = 'gmail-crm-sidebar';
                    sidebar.style.cssText = "\n    position: fixed;\n    right: 0;\n    top: 0;\n    width: 250px;\n    height: 100vh;\n    background: #f8fafc;\n    box-shadow: -2px 0 5px rgba(0,0,0,0.1);\n    z-index: 1000;\n    padding: 20px;\n    overflow-y: auto;\n";
                    title = document.createElement('h2');
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
                    gmailContent = document.querySelector('.bkK');
                    if (gmailContent) {
                        gmailContent.style.marginRight = '250px';
                    }
                    return [4 /*yield*/, loadSavedEmails()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Add this new function to handle adding emails to stages
// Update addEmailToStage function to match your UI
function addEmailToStage(emailData, stage, stageDiv) {
    return __awaiter(this, void 0, void 0, function () {
        var saved, emailsContainer, emailDiv_1, timestamp, formattedDate, countElement, currentCount, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Adding email to stage:', stage.name, emailData);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, StorageUtils.saveEmailToStage(emailData, stage.id)];
                case 2:
                    saved = _a.sent();
                    if (!saved) {
                        console.error('Failed to save email');
                        return [2 /*return*/];
                    }
                    emailsContainer = stageDiv.querySelector('.stage-emails-container');
                    if (!emailsContainer) {
                        console.error('Emails container not found');
                        return [2 /*return*/];
                    }
                    emailDiv_1 = document.createElement('div');
                    emailDiv_1.className = 'pipeline-email';
                    emailDiv_1.style.cssText = "\n        background: white;\n        border: 1px solid #e2e8f0;\n        border-radius: 4px;\n        padding: 8px;\n        margin-top: 4px;\n        cursor: pointer;\n        font-size: 13px;\n    ";
                    timestamp = new Date(emailData.timestamp);
                    formattedDate = timestamp.toLocaleString();
                    // Set email content
                    emailDiv_1.innerHTML = "\n        <div style=\"display: flex; justify-content: space-between; align-items: start;\">\n            <div style=\"flex-grow: 1;\">\n                <div style=\"font-weight: 500; margin-bottom: 4px; color: #2d3748;\">".concat(emailData.subject, "</div>\n                <div style=\"color: #718096; font-size: 12px;\">").concat(emailData.sender, "</div>\n            </div>\n            <div style=\"color: #a0aec0; font-size: 11px; white-space: nowrap;\">\n                ").concat(formattedDate, "\n            </div>\n        </div>\n    ");
                    // Add hover effect
                    emailDiv_1.addEventListener('mouseenter', function () {
                        emailDiv_1.style.backgroundColor = '#f7fafc';
                    });
                    emailDiv_1.addEventListener('mouseleave', function () {
                        emailDiv_1.style.backgroundColor = 'white';
                    });
                    // Add to container
                    emailsContainer.appendChild(emailDiv_1);
                    countElement = stageDiv.querySelector('.stage-count');
                    if (countElement) {
                        currentCount = parseInt(countElement.textContent || '0');
                        countElement.textContent = (currentCount + 1).toString();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error in addEmailToStage:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// 5:11 AM on Friday the 10th 
// Add this function to save email data to storage
// Update saveEmailToStage to include better error handling
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
    var _this = this;
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
            option.addEventListener('click', function () { return __awaiter(_this, void 0, void 0, function () {
                var stageElement;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            stageElement = document.querySelector("[data-stage-id=\"".concat(stage.id, "\"]"));
                            if (!stageElement) return [3 /*break*/, 2];
                            return [4 /*yield*/, StorageUtils.saveEmailToStage(emailData, stage.id)];
                        case 1:
                            _a.sent();
                            addEmailToStage(emailData, stage, stageElement);
                            _a.label = 2;
                        case 2:
                            popup.remove();
                            return [2 /*return*/];
                    }
                });
            }); });
            popup.appendChild(option);
        });
    });
    document.body.appendChild(popup);
}
// Add this function to load saved emails when creating stages
// Update loadSavedEmails function
// Update the loadSavedEmails function to use StorageUtils
function loadSavedEmails() {
    return __awaiter(this, void 0, void 0, function () {
        var stages, currentStages, _loop_1, _i, currentStages_1, stage, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, chrome.storage.sync.get(['pipelineStages'])];
                case 1:
                    stages = _a.sent();
                    currentStages = stages.pipelineStages || defaultStages;
                    _loop_1 = function (stage) {
                        var emails, stageElement;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, StorageUtils.loadStageEmails(stage.id)];
                                case 1:
                                    emails = _b.sent();
                                    stageElement = document.querySelector("[data-stage-id=\"".concat(stage.id, "\"]"));
                                    if (stageElement) {
                                        emails.forEach(function (email) {
                                            addEmailToStage(email, stage, stageElement);
                                        });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, currentStages_1 = currentStages;
                    _a.label = 2;
                case 2:
                    if (!(_i < currentStages_1.length)) return [3 /*break*/, 5];
                    stage = currentStages_1[_i];
                    return [5 /*yield**/, _loop_1(stage)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.error('Error loading saved emails:', error_4);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
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