// src/content.tsx
console.log('Content script starting...');

const GMAIL_URL_PATTERN = 'https://mail.google.com';

// Define our stage type
// For Sidebar
interface PipelineStage {
    id: string;
    name: string;
    color: string;
}

// To Avoid reloading of Sidebar 
interface ObserverState {
    isInitialized: boolean;
    sidebarCreated: boolean;
}

// For Email Data 
// Update the EmailData interface to match your extracted data structure
// First define the interfaces
interface EmailData {
    id: string;
    subject: string;
    sender: string;
    timestamp: string;
}

interface StoredEmailData {
    i: string;        // id
    s: string;        // subject
    f: string;        // from/sender
    t: string;        // timestamp
}

// Default stages
const defaultStages: PipelineStage[] = [
    { id: '1', name: 'Lead', color: '#718096' },
    { id: '2', name: 'Pitched', color: '#4299E1' },
    { id: '3', name: 'Waiting', color: '#9F7AEA' },
    { id: '4', name: 'Closed', color: '#48BB78' }
];

// To maintain multiple reloads 
const observerState: ObserverState = {
    isInitialized: false,
    sidebarCreated: false
};


// Storage utility functions
// Create the StorageUtils object with all storage-related functions
const StorageUtils = {
 

    // Save email to stage function
    async saveEmailToStage(emailData: EmailData, stageId: string): Promise<boolean> {
        try {
            const key = `stage_${stageId}`;
            const result = await chrome.storage.local.get([key]);
            let emails = result[key] || [];
            emails.push(emailData);
            
            if (emails.length > 50) {
                emails = emails.slice(-50);
            }
            
            await chrome.storage.local.set({ [key]: emails });
            return true;
        } catch (error) {
            console.error('Error saving email:', error);
            return false;
        }
    },

    // Load emails for a stage function
    async loadStageEmails(stageId: string): Promise<EmailData[]> {
        try {
            const key = `stage_${stageId}`;
            const result = await chrome.storage.local.get([key]);
            return result[key] || [];
        } catch (error) {
            console.error('Error loading emails:', error);
            return [];
        }
    }
};

// Compress email data before storage
function compressEmailData(email: EmailData): StoredEmailData {
    return {
        i: email.id,
        s: email.subject.substring(0, 100),  // Limit subject length
        f: email.sender.substring(0, 50),    // Limit sender length
        t: email.timestamp
    };
}

// Decompress email data for display
function decompressEmailData(stored: StoredEmailData): EmailData {
    return {
        id: stored.i,
        subject: stored.s,
        sender: stored.f,
        timestamp: stored.t
    };
}



// Update the createStageElement function to match your UI
function createStageElement(stage: PipelineStage) {
    const stageDiv = document.createElement('div');
    stageDiv.className = 'pipeline-stage';
    stageDiv.setAttribute('data-stage-id', stage.id);

    stageDiv.style.cssText = `
        margin-bottom: 10px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;

    // Create the header with arrow indicator
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-left: 4px solid ${stage.color};
        border-radius: 4px;
        background: white;
        cursor: pointer;
    `;

    // Modified header structure to include arrow
    headerDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <span style="
                transform: rotate(-90deg);
                transition: transform 0.2s;
                font-size: 12px;
                color: #666;
            ">▼</span>
            <span>${stage.name}</span>
            <span class="stage-count">0</span>
        </div>
        <button class="delete-stage" style="
            background: none;
            border: none;
            color: #ff4444;
            cursor: pointer;
            font-size: 18px;
            padding: 0 4px;
        ">×</button>
    `;

    // Create a container for emails that will appear below the header
    const emailsContainer = document.createElement('div');
    emailsContainer.className = 'stage-emails-container';
    emailsContainer.style.cssText = `
        padding: 8px;
        margin-top: 4px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        display: none; /* Initially hidden */
    `;

    stageDiv.appendChild(headerDiv);
    stageDiv.appendChild(emailsContainer);

    // Add collapse/expand functionality
    const arrow = headerDiv.querySelector('span');
    headerDiv.addEventListener('click', (e) => {
        // Ignore clicks on delete button
        if (!(e.target as HTMLElement).closest('.delete-stage')) {
            const isExpanded = emailsContainer.style.display !== 'none';
            emailsContainer.style.display = isExpanded ? 'none' : 'flex';
            if (arrow) {
                arrow.style.transform = isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
            }
        }
    });

    // Add existing delete functionality
    const deleteBtn = headerDiv.querySelector('.delete-stage');
    deleteBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete "${stage.name}" stage?`)) {
            chrome.storage.sync.get(['pipelineStages'], (result) => {
                const currentStages = result.pipelineStages || defaultStages;
                const updatedStages = currentStages.filter(s => s.id !== stage.id);
                chrome.storage.sync.set({ pipelineStages: updatedStages }, () => {
                    stageDiv.remove();
                });
            });
        }
    });

    return stageDiv;
}


 /// For Add Stage Button Functionality 


// For Sidebar
async function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'gmail-crm-sidebar';
    sidebar.style.cssText = `
        position: fixed;
        right: 0;
        top: 0;
        width: 450px;
        height: 100%;
        background: #f8fafc;
        box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    `;

    // Create pipeline overview header
    const pipelineOverview = document.createElement('div');
    pipelineOverview.style.cssText = `
        display: flex;
        width: 100%;
        height: 60px;
        background: linear-gradient(90deg, 
            #4B5563 0%, 
            #60A5FA 20%, 
            #C084FC 40%, 
            #EF4444 60%, 
            #34D399 80%, 
            #FCD34D 100%
        );
        color: white;
        font-size: 13px;
    `;

    // Create stage segments
    const stages = [defaultStages];
    const stagesForStage = await chrome.storage.sync.get(['pipelineStages']);
    const currentStages = stagesForStage.pipelineStages || defaultStages;
    console.log("stagesForStage:", stagesForStage);
    console.log("currentStages", currentStages);
    for (const stagessss of currentStages) {
    console.log(stagessss)    
    const stageElement = document.querySelector(`[data-stage-id="${stagessss.id}"]`);
    console.log("Stage Element inside Sidebar", stageElement)
    //const stageDiv: HTMLElement = document.createElement('div');
    if(stageElement){
    const countElement = stageElement.querySelector('.stage-count') ;
    if (countElement) {
        const currentCount = parseInt(countElement.textContent || '0');
        
        countElement.textContent = (currentCount + 1).toString();
        console.log("Called Stage Counts from Sidebar", countElement);
    }
}
}
    stages[0].forEach(stage => {
        const segment = document.createElement('div');
        segment.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 8px 4px;
            position: relative;
        `;
      
        // Add count
    const count = document.createElement('div');
    count.textContent = '0';
    count.className = `header-count-${stage.id}`; // Add this line
    count.style.cssText = `
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 4px;
    `;

        // Add stage name
        const name = document.createElement('div');
        name.textContent = stage.name;
        name.style.cssText = `
            font-size: 11px;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        `;

        segment.appendChild(count);
        segment.appendChild(name);
        pipelineOverview.appendChild(segment);
    });

    // Content section
    const contentSection = document.createElement('div');
    contentSection.style.cssText = `
        flex: 1;
        overflow-y: auto;
        padding: 16px;
    `;

    // Stages container
    const stagesContainer = document.createElement('div');
    stagesContainer.id = 'pipeline-stages';
    stagesContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 16px;
    `;
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
    
    // Adjust Gmail's main content
    const gmailContent = document.querySelector<HTMLElement>('.bkK');
    if (gmailContent) {
        gmailContent.style.marginRight = '450px';
    }

    // Load stages
    chrome.storage.sync.get(['pipelineStages'], (result) => {
        const stages = result.pipelineStages || defaultStages;
        stages.forEach((stage: PipelineStage) => {
            stagesContainer.appendChild(createStageElement(stage));
        });
    });

    await loadSavedEmails();
}
// Add this new function to handle adding emails to stages
// Update addEmailToStage function to match your UI
async function addEmailToStage(emailData: EmailData, stage: PipelineStage, stageDiv: HTMLElement) {
    try {
        // Save to storage first
        const saved = await StorageUtils.saveEmailToStage(emailData, stage.id);
        if (!saved) {
            console.error('Failed to save email');
            return;
        }

        const emailsContainer = stageDiv.querySelector('.stage-emails-container');
        if (!emailsContainer) {
            console.error('Emails container not found');
            return;
        }

        // Check for existing email
        const existingEmailInUI = emailsContainer.querySelector(`[data-email-id="${emailData.id}"]`);
        console.log("Existing Email Data: ", existingEmailInUI)
        if (existingEmailInUI) {
            console.log('Email already displayed in UI, skipping render');
            return;
        }

        interface TruncatedText {
            short: string;
            full: string;
        }

        // Truncate text function
        const truncateText = (text: string, limit: number): string | TruncatedText => {
            if (text.length <= limit) return text;
            return {
                short: text.substring(0, limit) + '...',
                full: text
            };
        };

        // Create email element with table-like layout
        const emailDiv = document.createElement('div');
        emailDiv.className = 'pipeline-email';
        emailDiv.setAttribute('data-email-id', emailData.id);
        emailDiv.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            font-size: 13px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #E5E7EB;
            min-height: 40px;
        `;

        // Format sender, subject and timestamp
        //const sender = truncateText(emailData.sender.split('@')[0], 5);
        const sender = truncateText(emailData.sender, 5);
        const subjectText = truncateText(emailData.subject, 30);
        const timestamp = new Date(emailData.timestamp).toLocaleDateString();

        // Create the row content
        emailDiv.innerHTML = `
            <div style="flex: 0 0 30px;">
                <input type="checkbox" style="margin: 0;">
            </div>
            <div style="flex: 1 1 100px; overflow: hidden; padding-right: 5px;" class="sender-cell">
                ${typeof sender === 'string' ? sender : sender.short}
                ${typeof sender === 'object' ? 
                    `<button class="see-more-btn" style="color: #4299E1; font-size: 11px; border: none; background: none; cursor: pointer; padding: 0; margin-left: 4px;">see more</button>` 
                    : ''}
            </div>
            <div style="flex: 1; overflow: hidden;" class="subject-cell">
                ${typeof subjectText === 'string' ? subjectText : subjectText.short}
                ${typeof subjectText === 'object' ? 
                    `<button class="see-more-btn" style="color: #4299E1; font-size: 11px; border: none; background: none; cursor: pointer; padding: 0; margin-left: 4px;">see more</button>` 
                    : ''}
            </div>
            <div style="flex: 0 0 100px; text-align: right; color: #6B7280;">
                ${timestamp}
            </div>
        `;

        // Add "See More" functionality
        emailDiv.querySelectorAll('.see-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cell = (btn as HTMLElement).parentElement;
                if (cell) {
                    if (cell.classList.contains('sender-cell')) {
                        cell.textContent = typeof sender === 'object' ? sender.full : sender;
                    } else if (cell.classList.contains('subject-cell')) {
                        cell.textContent = typeof subjectText === 'object' ? subjectText.full : subjectText;
                    }
                }
            });
        });

        // Add hover effect
        emailDiv.addEventListener('mouseenter', () => {
            emailDiv.style.backgroundColor = '#F3F4F6';
        });
        emailDiv.addEventListener('mouseleave', () => {
            emailDiv.style.backgroundColor = 'transparent';
        });

        // Add to container
        emailsContainer.appendChild(emailDiv);

        // Update count
        const countElement = stageDiv.querySelector('.stage-count');
        if (countElement) {
            const currentCount = parseInt(countElement.textContent || '0');
            countElement.textContent = (currentCount + 1).toString();
            console.log("Added Counts for Stages", countElement);

               // Add this section to update header count
            const headerCount = document.querySelector(`.header-count-${stage.id}`);
            if (headerCount) {
                headerCount.textContent = (currentCount + 1).toString();
                console.log("Updated header count for stage", stage.id, "to", currentCount + 1);
            }
        }
    } catch(error) {
        console.error('Error in addEmailToStage:', error);
    }
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

   function makeEmailDraggable(emailRow: HTMLElement) {
    // Verify this is actually an email row
    if (!emailRow.classList.contains('zA')) {
        console.log('Not an email row, skipping:', emailRow);
        return;
    }
    // First, check if the button is already added
    if (emailRow.querySelector('.crm-move-button')) {
        return;
    }

        const moveButton = document.createElement('button');
        moveButton.className = 'crm-move-button';
        moveButton.innerHTML = '📋';
        moveButton.title = 'Move to Pipeline';
        moveButton.style.cssText = `
                   background: linear-gradient(90deg, 
            #4B5563 0%, 
            #60A5FA 20%, 
            #C084FC 40%, 
            #EF4444 60%, 
            #34D399 80%, 
            #FCD34D 100%
        );
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            margin-right: 8px;
            position: relative;
            z-index: 9999;
            display: inline-block;
            opacity: 1;
        `;

        // Target the first TD which contains the checkbox
        const firstCell = emailRow.querySelector('td:first-child');
        if (firstCell) {
            // Insert at the beginning of the cell
            firstCell.insertBefore(moveButton, firstCell.firstChild);
            console.log('Move button inserted into email row');
        }

        moveButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Move button clicked');
            const getEmailData = (): EmailData | null => {
                // Get all table cells in the row
                const cells = emailRow.querySelectorAll('td');
                
                // Find subject from the third cell typically
                const subjectCell = Array.from(cells).find(cell => 
                    cell.querySelector('[role="link"]') || 
                    cell.querySelector('.bog') ||
                    cell.querySelector('.bqe')
                );
                const subject = subjectCell?.textContent?.trim();
    
                // Find sender from the relevant cell
                // First try to find the email directly
                let sender = emailRow.querySelector('[email]')?.getAttribute('email');
                if (!sender) {
                    // If no email attribute, try to get the sender name/email from text content
                    const senderCell = Array.from(cells).find(cell => 
                        cell.querySelector('.yP') || cell.querySelector('.bA4')
                    );
                    sender = senderCell?.textContent?.trim();
                }
    
                // Find timestamp from the last cell
                const lastCell = cells[cells.length - 1];
                const timeElement = lastCell?.querySelector('span[title]') || lastCell;
                let timestamp = timeElement?.getAttribute('title') || 
                                timeElement?.textContent?.trim();
    
                console.log('Raw extracted values:', {
                    cells: cells.length,
                    subject,
                    sender,
                    timestamp,
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
                    const anyNameOrEmail = emailRow.textContent?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0];
                    sender = anyNameOrEmail || 'Unknown Sender';
                }
    
                // Ensure we have some form of timestamp
                if (!timestamp || timestamp === '') {
                    // Use current date as fallback
                    const now = new Date();
                    timestamp = now.toLocaleString();
                }
    
                const emailData: EmailData = {
                    // Create a consistent ID by hashing the subject and sender
                    id: `${subject}-${sender}`.replace(/[^a-zA-Z0-9]/g, ''),
                    subject: subject,
                    sender: sender,
                    timestamp: timestamp
                };
            
                console.log('Final processed email data:', emailData);
                return emailData;
            };
    
            const emailData = getEmailData();
            if (emailData) {
                console.log('Email data extracted:', emailData);
                showStageSelectionPopup(emailData, e.clientX, e.clientY);
            } else {
                console.error('Failed to extract email data');
            }
        });
}

// Update the showStageSelectionPopup function to properly pass the data
// Add debug logging to track the flow
function showStageSelectionPopup(emailData: EmailData, x: number, y: number) {
    console.log('Opening stage selection popup with data:', emailData);
    
    // Remove any existing popups first
    const existingPopup = document.querySelector('.stage-selection-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Find the button that was clicked (the parent element with crm-move-button class)
    const button = document.querySelector('.crm-move-button:hover');
    if (!button) {
        console.log('Button not found');
        return;
    }
    // Get the button's position relative to the document
    const buttonRect = button.getBoundingClientRect();

    const popup = document.createElement('div');
    popup.className = 'stage-selection-popup';
    popup.style.cssText = `
        position: absolute;  /* Changed from fixed */
        left: ${x + window.scrollX}px;  /* Add scrollX */
        top: ${y + window.scrollY}px;   /* Add scrollY */
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 8px;
        z-index: 10000;
    `;
    // Add scroll event listener to update popup position
    const updatePosition = () => {
        const newRect = button.getBoundingClientRect();
        popup.style.left = `${newRect.right + 10}px`;
        popup.style.top = `${newRect.top}px`;
    };

    // Listen for scroll events on the main Gmail container
    const gmailContainer = document.querySelector('.bkK');
    if (gmailContainer) {
        gmailContainer.addEventListener('scroll', updatePosition, true);
    }
    // Add click event listener to document
    const closePopup = (e: MouseEvent) => {
        if (!popup.contains(e.target as Node)) {
            popup.remove();
            document.removeEventListener('click', closePopup);
            if (gmailContainer) {
                gmailContainer.removeEventListener('scroll', updatePosition, true);
            }
        }
    };


    // Delay adding the click listener to prevent immediate closure
    setTimeout(() => {
        document.addEventListener('click', closePopup);
    }, 0);

    chrome.storage.sync.get(['pipelineStages'], (result) => {
        console.log('Retrieved stages:', result.pipelineStages);
        const stages = result.pipelineStages || defaultStages;
        
        stages.forEach(stage => {
            const option = document.createElement('div');
            option.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                border-left: 3px solid ${stage.color};
                margin: 4px 0;
            `;
            option.textContent = stage.name;

            option.addEventListener('click', async () => {
                const stageElement = document.querySelector(`[data-stage-id="${stage.id}"]`);
                if (stageElement) {
                    await StorageUtils.saveEmailToStage(emailData, stage.id);
                    addEmailToStage(emailData, stage, stageElement as HTMLElement);
                }
                popup.remove();
                document.removeEventListener('click', closePopup);
                if (gmailContainer) {
                    gmailContainer.removeEventListener('scroll', updatePosition, true);
                }
            });

            popup.appendChild(option);
        });
    });

    document.body.appendChild(popup);
}
// Add this function to load saved emails when creating stages
// Update loadSavedEmails function
// Update the loadSavedEmails function to use StorageUtils
async function loadSavedEmails() {
    try {
        const stages = await chrome.storage.sync.get(['pipelineStages']);
        const currentStages = stages.pipelineStages || defaultStages;
        
        for (const stage of currentStages) {
            console.log("stage Called from loadSavedEmails", stage)
            const emails = await StorageUtils.loadStageEmails(stage.id);
            console.log("Emails inside LoadSavedEmails:", emails);
            //It grabs the Div for Stages in Sidebar
            const stageElement = document.querySelector(`[data-stage-id="${stage.id}"]`);
            console.log("Stage Element Called from the Load Saved emails", stageElement)
            if (stageElement) {
                // Clear existing count
                const countElement = stageElement.querySelector('.stage-count');
                console.log("Count Element Called from Stage Element", countElement)
                if (countElement) {
                    console.log("Count Element Cleared")
                    countElement.textContent = '0';
                      // Add this section to clear header count
                    const headerCount = document.querySelector(`.header-count-${stage.id}`);
                    if (headerCount) {
                        headerCount.textContent = '0';
                        console.log("Cleared header count for stage", stage.id);
                    }
                }
                
                // Clear existing emails from UI
                const emailsContainer = stageElement.querySelector('.stage-emails-container');
                console.log("Email Container Called within Stage Element Debug: ", emailsContainer)
                if (emailsContainer) {
                    console.log("Email Container Cleared")
                    emailsContainer.innerHTML = '';
                }

                // Now add the emails from storage
                emails.forEach(email => {
                    addEmailToStage(email, stage, stageElement as HTMLElement);
                });
            }
        }
    } catch (error) {
        console.error('Error loading saved emails:', error);
    }
}
async function cleanupStorage() {
    try {
        // Clear both sync and local storage
        await chrome.storage.sync.clear();
        await chrome.storage.local.clear();
        console.log('Storage cleaned successfully');
        
        // Reset to default stages
        await chrome.storage.sync.set({ pipelineStages: defaultStages });
        console.log('Default stages restored');
    } catch (error) {
        console.error('Error cleaning storage:', error);
    }
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
        const emailRows = document.querySelectorAll('tr.zA:not([data-crm-initialized])');
        
        if (emailRows.length > 0) {
            console.log(`Found ${emailRows.length} new email rows to initialize`);
            emailRows.forEach(row => {
                if (!row.querySelector('.crm-move-button')) {
                    makeEmailDraggable(row as HTMLElement);
                    row.setAttribute('data-crm-initialized', 'true');
                }
            });
        }
    }

    const findEmailContainer = () => {
        const targetNode = document.querySelector('.AO, .ain');
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

        const observer = new MutationObserver((mutations) => {
            let shouldInitialize = false;
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0 || 
                    mutation.type === 'childList') {
                    shouldInitialize = true;
                }
            });
            
            if (shouldInitialize) {
                requestAnimationFrame(() => {
                    initializeEmailRows();
                });
            }
        });

        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });

        // Initial setup
        requestAnimationFrame(() => {
            initializeEmailRows();
        });
        
        observerState.isInitialized = true;
    };

    findEmailContainer();
}
// Add this to your initialization
window.addEventListener('load', () => {
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
       const initialSetup = () => {
        setTimeout(() => {
            observeGmailInbox();
            
            // Specific first-load check for the first 10 rows
            const checkFirstRows = () => {
                const firstRows = Array.from(document.querySelectorAll('tr.zA')).slice(0, 10);
                firstRows.forEach(row => {
                    if (!row.querySelector('.crm-move-button')) {
                        makeEmailDraggable(row as HTMLElement);
                        row.setAttribute('data-crm-initialized', 'true');
                    }
                });
            };

            // Multiple checks for the first 10 rows during initial load
            [100, 500, 1000, 2000].forEach(delay => {
                setTimeout(checkFirstRows, delay);
            });
            
            // Regular backup check continues
            setInterval(() => {
                if (!document.querySelector('.crm-move-button')) {
                    console.log('Buttons missing, reinitializing...');
                    const rows = document.querySelectorAll('tr.zA:not([data-crm-initialized])');
                    rows.forEach(row => {
                        makeEmailDraggable(row as HTMLElement);
                        row.setAttribute('data-crm-initialized', 'true');
                    });
                }
            }, 5000);
        }, 1000);
    };

    initialSetup();
});
const init = () => {
    if (!window.location.origin.includes(GMAIL_URL_PATTERN)) {
        return;
    }
    console.log('Gmail detected, starting observer');
    observeGmailInbox();
};

// Start when page loads
window.addEventListener('load', init);