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
// To maintain multiple reloads 
var observerState = {
    isInitialized: false,
    sidebarCreated: false
};
// Storage utility functions
// Create the StorageUtils object with all storage-related functions
var StorageUtils = {
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
    // Create the header with arrow indicator
    var headerDiv = document.createElement('div');
    headerDiv.style.cssText = "\n        padding: 10px;\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        border-left: 4px solid ".concat(stage.color, ";\n        border-radius: 4px;\n        background: white;\n        cursor: pointer;\n    ");
    // Modified header structure to include arrow
    headerDiv.innerHTML = "\n        <div style=\"display: flex; align-items: center; gap: 8px; flex: 1;\">\n            <span style=\"\n                transform: rotate(-90deg);\n                transition: transform 0.2s;\n                font-size: 12px;\n                color: #666;\n            \">\u25BC</span>\n            <span>".concat(stage.name, "</span>\n            <span class=\"stage-count\">0</span>\n        </div>\n        <button class=\"delete-stage\" style=\"\n            background: none;\n            border: none;\n            color: #ff4444;\n            cursor: pointer;\n            font-size: 18px;\n            padding: 0 4px;\n        \">\u00D7</button>\n    ");
    // Create a container for emails that will appear below the header
    var emailsContainer = document.createElement('div');
    emailsContainer.className = 'stage-emails-container';
    emailsContainer.style.cssText = "\n        padding: 8px;\n        margin-top: 4px;\n        display: flex;\n        flex-direction: column;\n        gap: 8px;\n        display: none; /* Initially hidden */\n    ";
    stageDiv.appendChild(headerDiv);
    stageDiv.appendChild(emailsContainer);
    // Add collapse/expand functionality
    var arrow = headerDiv.querySelector('span');
    headerDiv.addEventListener('click', function (e) {
        // Ignore clicks on delete button
        if (!e.target.closest('.delete-stage')) {
            var isExpanded = emailsContainer.style.display !== 'none';
            emailsContainer.style.display = isExpanded ? 'none' : 'flex';
            if (arrow) {
                arrow.style.transform = isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
        }
    });
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
// For Sidebar
function createSidebar() {
    return __awaiter(this, void 0, void 0, function () {
        var sidebar, pipelineOverview, stages, contentSection, stagesContainer, gmailContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sidebar = document.createElement('div');
                    sidebar.id = 'gmail-crm-sidebar';
                    sidebar.style.cssText = "\n        position: fixed;\n        right: 0;\n        top: 0;\n        width: 450px;\n        height: 100%;\n        background: #f8fafc;\n        box-shadow: -2px 0 5px rgba(0,0,0,0.1);\n        z-index: 1000;\n        display: flex;\n        flex-direction: column;\n        overflow: hidden;\n    ";
                    pipelineOverview = document.createElement('div');
                    pipelineOverview.style.cssText = "\n        display: flex;\n        width: 100%;\n        height: 60px;\n        background: linear-gradient(90deg, \n            #4B5563 0%, \n            #60A5FA 20%, \n            #C084FC 40%, \n            #EF4444 60%, \n            #34D399 80%, \n            #FCD34D 100%\n        );\n        color: white;\n        font-size: 13px;\n    ";
                    stages = [defaultStages];
                    stages[0].forEach(function (stage) {
                        var segment = document.createElement('div');
                        segment.style.cssText = "\n            flex: 1;\n            display: flex;\n            flex-direction: column;\n            justify-content: center;\n            align-items: center;\n            text-align: center;\n            padding: 8px 4px;\n            position: relative;\n        ";
                        // Add count
                        var count = document.createElement('div');
                        count.textContent = '0';
                        count.style.cssText = "\n            font-size: 18px;\n            font-weight: bold;\n            margin-bottom: 4px;\n        ";
                        // Add stage name
                        var name = document.createElement('div');
                        name.textContent = stage.name;
                        name.style.cssText = "\n            font-size: 11px;\n            line-height: 1.2;\n            white-space: nowrap;\n            overflow: hidden;\n            text-overflow: ellipsis;\n            max-width: 100%;\n        ";
                        segment.appendChild(count);
                        segment.appendChild(name);
                        pipelineOverview.appendChild(segment);
                    });
                    contentSection = document.createElement('div');
                    contentSection.style.cssText = "\n        flex: 1;\n        overflow-y: auto;\n        padding: 16px;\n    ";
                    stagesContainer = document.createElement('div');
                    stagesContainer.id = 'pipeline-stages';
                    stagesContainer.style.cssText = "\n        display: flex;\n        flex-direction: column;\n        gap: 16px;\n    ";
                    contentSection.appendChild(stagesContainer);
                    // Footer with Add Stage button
                    // const footerSection = document.createElement('div');
                    // footerSection.style.cssText = `
                    //     padding: 16px;
                    //     border-top: 1px solid #e5e7eb;
                    //     background: white;
                    // `;
                    // const addButton = document.createElement('button');
                    // addButton.textContent = '+ Add Stage';
                    // addButton.style.cssText = `
                    //     width: 100%;
                    //     padding: 8px;
                    //     background: #4299E1;
                    //     color: white;
                    //     border: none;
                    //     border-radius: 4px;
                    //     cursor: pointer;
                    //     transition: background-color 0.2s;
                    // `;
                    // addButton.addEventListener('click', createAddStageForm);
                    // footerSection.appendChild(addButton);
                    // Assemble sidebar
                    sidebar.appendChild(pipelineOverview);
                    sidebar.appendChild(contentSection);
                    //sidebar.appendChild(footerSection);
                    // Add to page
                    document.body.appendChild(sidebar);
                    gmailContent = document.querySelector('.bkK');
                    if (gmailContent) {
                        gmailContent.style.marginRight = '450px';
                    }
                    // Load stages
                    chrome.storage.sync.get(['pipelineStages'], function (result) {
                        var stages = result.pipelineStages || defaultStages;
                        stages.forEach(function (stage) {
                            stagesContainer.appendChild(createStageElement(stage));
                        });
                    });
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
        var saved, emailsContainer, existingEmailInUI, truncateText, emailDiv_1, sender_1, subjectText_1, timestamp, countElement, currentCount, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, StorageUtils.saveEmailToStage(emailData, stage.id)];
                case 1:
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
                    existingEmailInUI = emailsContainer.querySelector("[data-email-id=\"".concat(emailData.id, "\"]"));
                    if (existingEmailInUI) {
                        console.log('Email already displayed in UI, skipping render');
                        return [2 /*return*/];
                    }
                    truncateText = function (text, limit) {
                        if (text.length <= limit)
                            return text;
                        return {
                            short: text.substring(0, limit) + '...',
                            full: text
                        };
                    };
                    emailDiv_1 = document.createElement('div');
                    emailDiv_1.className = 'pipeline-email';
                    emailDiv_1.setAttribute('data-email-id', emailData.id);
                    emailDiv_1.style.cssText = "\n            padding: 8px 16px;\n            cursor: pointer;\n            font-size: 13px;\n            display: flex;\n            align-items: center;\n            border-bottom: 1px solid #E5E7EB;\n            min-height: 40px;\n        ";
                    sender_1 = truncateText(emailData.sender, 5);
                    subjectText_1 = truncateText(emailData.subject, 30);
                    timestamp = new Date(emailData.timestamp).toLocaleDateString();
                    // Create the row content
                    emailDiv_1.innerHTML = "\n            <div style=\"flex: 0 0 30px;\">\n                <input type=\"checkbox\" style=\"margin: 0;\">\n            </div>\n            <div style=\"flex: 0 0 150px; overflow: hidden;\" class=\"sender-cell\">\n                ".concat(typeof sender_1 === 'string' ? sender_1 : sender_1.short, "\n                ").concat(typeof sender_1 === 'object' ?
                        "<button class=\"see-more-btn\" style=\"color: #4299E1; font-size: 11px; border: none; background: none; cursor: pointer; padding: 0; margin-left: 4px;\">see more</button>"
                        : '', "\n            </div>\n            <div style=\"flex: 1; overflow: hidden;\" class=\"subject-cell\">\n                ").concat(typeof subjectText_1 === 'string' ? subjectText_1 : subjectText_1.short, "\n                ").concat(typeof subjectText_1 === 'object' ?
                        "<button class=\"see-more-btn\" style=\"color: #4299E1; font-size: 11px; border: none; background: none; cursor: pointer; padding: 0; margin-left: 4px;\">see more</button>"
                        : '', "\n            </div>\n            <div style=\"flex: 0 0 100px; text-align: right; color: #6B7280;\">\n                ").concat(timestamp, "\n            </div>\n        ");
                    // Add "See More" functionality
                    emailDiv_1.querySelectorAll('.see-more-btn').forEach(function (btn) {
                        btn.addEventListener('click', function (e) {
                            e.stopPropagation();
                            var cell = btn.parentElement;
                            if (cell) {
                                if (cell.classList.contains('sender-cell')) {
                                    cell.textContent = typeof sender_1 === 'object' ? sender_1.full : sender_1;
                                }
                                else if (cell.classList.contains('subject-cell')) {
                                    cell.textContent = typeof subjectText_1 === 'object' ? subjectText_1.full : subjectText_1;
                                }
                            }
                        });
                    });
                    // Add hover effect
                    emailDiv_1.addEventListener('mouseenter', function () {
                        emailDiv_1.style.backgroundColor = '#F3F4F6';
                    });
                    emailDiv_1.addEventListener('mouseleave', function () {
                        emailDiv_1.style.backgroundColor = 'transparent';
                    });
                    // Add to container
                    emailsContainer.appendChild(emailDiv_1);
                    countElement = stageDiv.querySelector('.stage-count');
                    if (countElement) {
                        currentCount = parseInt(countElement.textContent || '0');
                        countElement.textContent = (currentCount + 1).toString();
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error in addEmailToStage:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
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
                // Create a consistent ID by hashing the subject and sender
                id: "".concat(subject, "-").concat(sender).replace(/[^a-zA-Z0-9]/g, ''),
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
                        var emails, stageElement, countElement, emailsContainer;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, StorageUtils.loadStageEmails(stage.id)];
                                case 1:
                                    emails = _b.sent();
                                    stageElement = document.querySelector("[data-stage-id=\"".concat(stage.id, "\"]"));
                                    if (stageElement) {
                                        countElement = stageElement.querySelector('.stage-count');
                                        if (countElement) {
                                            console.log("Count Element Cleared");
                                            countElement.textContent = '0';
                                        }
                                        emailsContainer = stageElement.querySelector('.stage-emails-container');
                                        if (emailsContainer) {
                                            console.log("Email Container Cleared");
                                            emailsContainer.innerHTML = '';
                                        }
                                        // Now add the emails from storage
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
function cleanupStorage() {
    return __awaiter(this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    // Clear both sync and local storage
                    return [4 /*yield*/, chrome.storage.sync.clear()];
                case 1:
                    // Clear both sync and local storage
                    _a.sent();
                    return [4 /*yield*/, chrome.storage.local.clear()];
                case 2:
                    _a.sent();
                    console.log('Storage cleaned successfully');
                    // Reset to default stages
                    return [4 /*yield*/, chrome.storage.sync.set({ pipelineStages: defaultStages })];
                case 3:
                    // Reset to default stages
                    _a.sent();
                    console.log('Default stages restored');
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _a.sent();
                    console.error('Error cleaning storage:', error_5);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function observeGmailInbox() {
    // Prevent multiple initialization
    if (observerState.isInitialized) {
        console.log('Observer already initialized, skipping...');
        return;
    }
    console.log('Starting Gmail observer...');
    function initializeEmailRows() {
        // Only initialize rows that don't have buttons
        var emailRows = document.querySelectorAll('tr.zA:not([data-crm-initialized])');
        if (emailRows.length > 0) {
            console.log("Found ".concat(emailRows.length, " new email rows to initialize"));
            emailRows.forEach(function (row) {
                if (!row.querySelector('.crm-move-button')) {
                    makeEmailDraggable(row);
                    row.setAttribute('data-crm-initialized', 'true');
                }
            });
        }
    }
    var findEmailContainer = function () {
        var targetNode = document.querySelector('.AO, .ain');
        if (!targetNode) {
            console.log('Gmail container not found, retrying...');
            setTimeout(findEmailContainer, 1000);
            return;
        }
        // Only create sidebar once
        if (!observerState.sidebarCreated) {
            console.log('Found Gmail container, creating sidebar and observer');
            createSidebar();
            observerState.sidebarCreated = true;
        }
        var observer = new MutationObserver(function (mutations) {
            var shouldInitialize = false;
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length > 0 ||
                    mutation.type === 'childList') {
                    shouldInitialize = true;
                }
            });
            if (shouldInitialize) {
                requestAnimationFrame(function () {
                    initializeEmailRows();
                });
            }
        });
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
        // Initial setup
        requestAnimationFrame(function () {
            initializeEmailRows();
        });
        observerState.isInitialized = true;
    };
    findEmailContainer();
}
// Add this to your initialization
window.addEventListener('load', function () {
    console.log('Page loaded, initializing CRM...');
    // Clean storage before initialization
    // cleanupStorage().then(() => {
    //     setTimeout(observeGmailInbox, 1000);
    // });
    // Added periodic check to maintain buttons
    // const maintainButtons = () => {
    //     const uninitializedRows = document.querySelectorAll('tr.zA:not([data-crm-initialized])');
    //     if (uninitializedRows.length > 0) {
    //         uninitializedRows.forEach(row => {
    //             makeEmailDraggable(row as HTMLElement);
    //             row.setAttribute('data-crm-initialized', 'true');
    //         });
    //     }
    // };
    // // Initial setup with delay
    // setTimeout(observeGmailInbox, 1000);
    // // Maintain buttons periodically
    // setInterval(maintainButtons, 2000);
    // Initial setup with multiple retry attempts for first load
    var initialSetup = function () {
        setTimeout(function () {
            observeGmailInbox();
            // Specific first-load check for the first 10 rows
            var checkFirstRows = function () {
                var firstRows = Array.from(document.querySelectorAll('tr.zA')).slice(0, 10);
                firstRows.forEach(function (row) {
                    if (!row.querySelector('.crm-move-button')) {
                        makeEmailDraggable(row);
                        row.setAttribute('data-crm-initialized', 'true');
                    }
                });
            };
            // Multiple checks for the first 10 rows during initial load
            [100, 500, 1000, 2000].forEach(function (delay) {
                setTimeout(checkFirstRows, delay);
            });
            // Regular backup check continues
            setInterval(function () {
                if (!document.querySelector('.crm-move-button')) {
                    console.log('Buttons missing, reinitializing...');
                    var rows = document.querySelectorAll('tr.zA:not([data-crm-initialized])');
                    rows.forEach(function (row) {
                        makeEmailDraggable(row);
                        row.setAttribute('data-crm-initialized', 'true');
                    });
                }
            }, 5000);
        }, 1000);
    };
    initialSetup();
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