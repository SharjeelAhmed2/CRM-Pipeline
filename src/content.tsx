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

// For Email Data 
// Update the EmailData interface to match your extracted data structure
interface EmailData {
    id: string;
    subject: string;
    sender: string;
    timestamp: string;
}
// Default stages
const defaultStages: PipelineStage[] = [
    { id: '1', name: 'Lead', color: '#718096' },
    { id: '2', name: 'Pitched', color: '#4299E1' },
    { id: '3', name: 'Waiting', color: '#9F7AEA' },
    { id: '4', name: 'Closed', color: '#48BB78' }
];
function createStageElement(stage: PipelineStage) {
    console.log('Creating stage element:', stage.name);
    const stageDiv = document.createElement('div');
    stageDiv.className = 'pipeline-stage';
    stageDiv.setAttribute('data-stage-id', stage.id);

    stageDiv.style.cssText = `
        margin-bottom: 10px;
        background: white;
        border-left: 4px solid ${stage.color};
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;

    // Create header section
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e2e8f0;
    `;
    
    headerDiv.innerHTML = `
        <div style="display: flex; align-items: center;">
            <span style="font-weight: 500;">${stage.name}</span>
            <span class="stage-count" style="margin-left: 8px; color: #666;">0</span>
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

    // Create emails container
    const emailsContainer = document.createElement('div');
    emailsContainer.className = 'stage-emails-container';
    emailsContainer.style.cssText = `
        padding: 10px;
        min-height: 30px;
    `;

    stageDiv.appendChild(headerDiv);
    stageDiv.appendChild(emailsContainer);

    // Add delete functionality
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

    // Add drop zone handlers
    stageDiv.addEventListener('dragover', (e) => {
        e.preventDefault();
        emailsContainer.style.backgroundColor = '#f7fafc';
    });

    stageDiv.addEventListener('dragleave', (e) => {
        e.preventDefault();
        emailsContainer.style.backgroundColor = 'transparent';
    });

    stageDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        emailsContainer.style.backgroundColor = 'transparent';
        
        try {
            const emailData = JSON.parse(e.dataTransfer?.getData('text/plain') || '');
            addEmailToStage(emailData, stage, stageDiv);
        } catch (error) {
            console.error('Error processing dropped email:', error);
        }
    });

    return stageDiv;
}

 /// For Add Stage Button Functionality 

 function createAddStageForm() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 10001;
        width: 300px;
    `;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
    `;

    const form = document.createElement('form');
    form.innerHTML = `
        <h3 style="margin-bottom: 15px; font-weight: bold;">Add New Stage</h3>
        <div style="margin-bottom: 15px;">
            <input type="text" id="stageName" placeholder="Stage Name" style="
                width: 100%;
                padding: 8px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                margin-bottom: 10px;
            ">
            <input type="color" id="stageColor" value="#718096" style="
                width: 100%;
                height: 40px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
            ">
        </div>
        <div style="display: flex; gap: 10px;">
            <button type="submit" style="
                flex: 1;
                padding: 8px;
                background: #4299E1;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Add</button>
            <button type="button" id="cancelBtn" style="
                flex: 1;
                padding: 8px;
                background: #CBD5E0;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">Cancel</button>
        </div>
    `;

    modal.appendChild(form);

    // Handle form submission 
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('stageName') as HTMLInputElement;
        const colorInput = document.getElementById('stageColor') as HTMLInputElement;
        
        const newStage: PipelineStage = {
            id: Date.now().toString(),
            name: nameInput.value,
            color: colorInput.value
        };

        // Get current stages and add new one
        chrome.storage.sync.get(['pipelineStages'], (result) => {
            const currentStages: PipelineStage[] = result.pipelineStages || defaultStages;
            const updatedStages = [...currentStages, newStage];
            
            // Save updated stages
            chrome.storage.sync.set({ pipelineStages: updatedStages }, () => {
                // Add new stage to UI
                const stagesContainer = document.getElementById('pipeline-stages');
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
    const cancelBtn = form.querySelector('#cancelBtn');
    cancelBtn?.addEventListener('click', () => {
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
    const sidebar = document.createElement('div');
    sidebar.id = 'gmail-crm-sidebar';
    sidebar.style.cssText = `
    position: fixed;
    right: 0;
    top: 0;
    width: 250px;
    height: 100vh;
    background: #f8fafc;
    box-shadow: -2px 0 5px rgba(0,0,0,0.1);
    z-index: 1000;
    padding: 20px;
    overflow-y: auto;
`;
    // Add title
    const title = document.createElement('h2');
    title.textContent = 'CRM Pipeline';
    title.style.cssText = 'margin-bottom: 15px; font-weight: bold; color: #2d3748;';
    sidebar.appendChild(title);
 
    //Stages Work
        // Get stages from storage or use defaults
        //This is Chrome's storage API that syncs data across user's browsers
        chrome.storage.sync.get(['pipelineStages'], (result) => {
            const stages = result.pipelineStages || defaultStages;
            
            // Create stages container
            const stagesContainer = document.createElement('div');
            stagesContainer.id = 'pipeline-stages';
            console.log('Created pipeline-stages container');
            // stages.forEach(stage => {
            //     stagesContainer.appendChild(createStageElement(stage));
            // });
            // Explicitly type the stage parameter
            stages.forEach((stage: PipelineStage) => {
                stagesContainer.appendChild(createStageElement(stage));
            });
            sidebar.appendChild(stagesContainer);
            // Add "Add Stage" button

        const addButton = document.createElement('button');
        addButton.textContent = '+ Add Stage';
        addButton.style.cssText = `
            width: 100%;
            padding: 8px;
            background: #4299E1;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        `;
        addButton.addEventListener('click', createAddStageForm);
        sidebar.appendChild(addButton);
        });

    // Add to page
    document.body.appendChild(sidebar);
    
    // Adjust Gmail's main content
    const gmailContent =  document.querySelector<HTMLElement>('.bkK');
    if (gmailContent) {

        gmailContent.style.marginRight = '250px' ;
    }
    loadSavedEmails();
}

// Add this new function to handle adding emails to stages
function addEmailToStage(emailData: EmailData, stage: PipelineStage, stageDiv: HTMLElement) {
    console.log('Adding email to stage:', stage.name, emailData);

    const emailsContainer = stageDiv.querySelector('.stage-emails-container');
    if (!emailsContainer) {
        console.error('Emails container not found');
        return;
    }

    // Create email element
    const emailDiv = document.createElement('div');
    emailDiv.className = 'pipeline-email';
    emailDiv.style.cssText = `
        margin-bottom: 8px;
        padding: 8px;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
    `;

    // Create email content
    const formattedDate = new Date(emailData.timestamp).toLocaleDateString();
    emailDiv.innerHTML = `
        <div style="margin-bottom: 4px; font-weight: 500; color: #2d3748;">${emailData.subject}</div>
        <div style="display: flex; justify-content: space-between; color: #718096;">
            <span>${emailData.sender}</span>
            <span>${formattedDate}</span>
        </div>
    `;

    // Add hover effect
    emailDiv.addEventListener('mouseenter', () => {
        emailDiv.style.backgroundColor = '#f7fafc';
    });
    emailDiv.addEventListener('mouseleave', () => {
        emailDiv.style.backgroundColor = '#ffffff';
    });

    // Add to container
    emailsContainer.appendChild(emailDiv);

    // Update count
    const countElement = stageDiv.querySelector('.stage-count');
    if (countElement) {
        const currentCount = parseInt(countElement.textContent || '0');
        countElement.textContent = (currentCount + 1).toString();
    }

    // Save to storage
    chrome.storage.sync.get(['emailStages'], (result) => {
        const emailStages = result.emailStages || {};
        if (!emailStages[stage.id]) {
            emailStages[stage.id] = [];
        }
        emailStages[stage.id].push(emailData);
        
        chrome.storage.sync.set({ emailStages }, () => {
            console.log('Email saved to storage:', emailData);
        });
    });
}

    // 5:11 AM on Friday the 10th 
    
        // Add this function to save email data to storage
        function saveEmailToStage(emailData: EmailData, stageId: string) {
            // Validate the data
            if (!emailData.subject || !emailData.sender || !emailData.timestamp) {
                console.error('Invalid email data:', emailData);
                return;
            }
        
            // Save to Chrome storage
            chrome.storage.sync.get(['emailStages'], (result) => {
                const emailStages = result.emailStages || {};
                if (!emailStages[stageId]) {
                    emailStages[stageId] = [];
                }
                emailStages[stageId].push(emailData);
                
                chrome.storage.sync.set({ emailStages }, () => {
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
            background: #4299E1;
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
                    id: Date.now().toString(),
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
    
    const popup = document.createElement('div');
    popup.className = 'stage-selection-popup';
    popup.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 8px;
        z-index: 10000;
    `;

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

            option.addEventListener('click', () => {
                console.log('Stage selected:', stage.name);
                const stageElement = document.querySelector(`[data-stage-id="${stage.id}"]`);
                if (stageElement) {
                    console.log('Found stage element, adding email');
                    addEmailToStage(emailData, stage, stageElement as HTMLElement);
                } else {
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
    chrome.storage.sync.get(['emailStages'], (result) => {
        const emailStages = result.emailStages || {};
        
        Object.entries(emailStages).forEach(([stageId, emails]) => {
            const stageElement = document.querySelector(`[data-stage-id="${stageId}"]`);
            if (stageElement) {
                const stage = defaultStages.find(s => s.id === stageId);
                if (stage) {
                    (emails as EmailData[]).forEach(email => {
                        addEmailToStage(email, stage, stageElement as HTMLElement);
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
        const emailRows = document.querySelectorAll('tr.zA');
        console.log(`Found ${emailRows.length} email rows`);

        emailRows.forEach(row => {
            if (!row.hasAttribute('data-crm-initialized')) {
                makeEmailDraggable(row as HTMLElement);
                row.setAttribute('data-crm-initialized', 'true');
                console.log('Initialized email row with classes:', row.className);
            }
        });
    }

    // Update the target node to specifically watch the email list
    const findEmailContainer = () => {
        // Gmail's main content area where emails are listed
        const targetNode = document.querySelector('.AO');
        if (!targetNode) {
            console.log('Gmail email container not found, retrying...');
            setTimeout(findEmailContainer, 1000);
            return;
        }

        console.log('Found Gmail email container');
        createSidebar();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(() => {
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
window.addEventListener('load', () => {
    console.log('Page loaded, initializing CRM...');
    setTimeout(observeGmailInbox, 1000); // Give Gmail a moment to set up
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