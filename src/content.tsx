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
    // Added for Email Drag and Drop 
    stageDiv.setAttribute('data-stage-id', stage.id);

    // Log the created stage
    console.log('Stage created with ID:', stage.id);

    // Add drop zone styling and handlers
    stageDiv.style.cssText = `
    margin-bottom: 10px;
    padding: 10px;
    background: white;
    border-left: 4px solid ${stage.color};
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.2s;
    min-height: 50px;
   `;
    // Further modifying it for remove Button 
    stageDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${stage.name}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
            <span class="stage-count">0</span>
                            <button class="delete-stage" style="
                    background: none;
                    border: none;
                    color:rgb(255, 0, 0);
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0 4px;
                ">×</button>
            </div>
        </div>
    `;

    
        // Add delete functionality
        const deleteBtn = stageDiv.querySelector('.delete-stage');
        deleteBtn?.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent stage click event
            if (confirm(`Are you sure you want to delete "${stage.name}" stage?`)) {
                // Remove from storage
                chrome.storage.sync.get(['pipelineStages'], (result) => {
                    const currentStages: PipelineStage[] = result.pipelineStages || defaultStages;
                    const updatedStages = currentStages.filter(s => s.id !== stage.id);
                    chrome.storage.sync.set({ pipelineStages: updatedStages }, () => {
                        // Remove from UI
                        stageDiv.remove();
                    });
                });
            }
        });

        
    // Add drop zone event listeners
       // Update drop zone event listeners
       stageDiv.addEventListener('dragenter', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Drag entered stage:', stage.name);
        stageDiv.style.backgroundColor = '#f0f5ff';
    });

    stageDiv.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Dragging over stage:', stage.name);
        stageDiv.style.backgroundColor = '#f0f5ff';
    });

    stageDiv.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Drag left stage:', stage.name);
        stageDiv.style.backgroundColor = 'white';
    });

    stageDiv.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Drop event on stage:', stage.name);
        stageDiv.style.backgroundColor = 'white';

        try {
            // Log the raw data first
            const rawData = e.dataTransfer?.getData('text/plain');
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

            const emailData = JSON.parse(rawData);
            console.log('Successfully parsed email data:', emailData);
            addEmailToStage(emailData, stage, stageDiv);
        } catch (error) {
            console.error('Error processing dropped email:', error);
           // console.error('Error details:', error.message);
        }
    });

    stageDiv.addEventListener('mouseover', () => {
        stageDiv.style.backgroundColor = '#f7fafc';
    });
    stageDiv.addEventListener('mouseout', () => {
        stageDiv.style.backgroundColor = 'white';
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
}

// Add this new function to handle adding emails to stages
    function addEmailToStage(emailData: EmailData, stage: PipelineStage, stageDiv: HTMLElement) {
        try{
        const emailElement = document.createElement('div');
        emailElement.className = 'pipeline-email';
        emailElement.style.cssText = `
            margin: 8px 0;
            padding: 8px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 12px;
        `;

        emailElement.innerHTML = `
            <div style="font-weight: bold;">${emailData.subject}</div>
            <div style="color: #666;">${emailData.sender}</div>
            <div style="color: #888; font-size: 11px;">${emailData.timestamp}</div>
        `;

        // Find or create the emails container in the stage
        let emailsContainer = stageDiv.querySelector('.stage-emails');
        if (!emailsContainer) {
            emailsContainer = document.createElement('div');
            emailsContainer.className = 'stage-emails';
            stageDiv.appendChild(emailsContainer);
        }

        emailsContainer.appendChild(emailElement);
        
        // Update the count
        const countElement = stageDiv.querySelector('.stage-count');
        if (countElement) {
            const currentCount = parseInt(countElement.textContent || '0');
            countElement.textContent = (currentCount + 1).toString();
        }

        // Save to storage
        saveEmailToStage(emailData, stage.id);

                // Remove any existing popups using the safer method
        const existingPopup = document.querySelector('.crm-stage-popup');
        
        if (existingPopup) {
            existingPopup.remove();
        }
    } catch (error) {
        console.error('Error adding email to stage:', error);
    }
}

    // 5:11 AM on Friday the 10th 
    
        // Add this function to save email data to storage
    function saveEmailToStage(emailData: EmailData, stageId: string) {

        // Validate email data before saving
        if (!emailData.subject || !emailData.sender || !emailData.timestamp) {
            console.error('Invalid email data:', emailData);
            return;
        }

        chrome.storage.sync.get(['emailStages'], (result) => {
            const emailStages = result.emailStages || {};
            if (!emailStages[stageId]) {
                emailStages[stageId] = [];
            }
        // Add email only if it's valid
        emailStages[stageId].push(emailData);
        chrome.storage.sync.set({ emailStages }, () => {
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

        // Click handler for the move button
        moveButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const getEmailData = (): EmailData | null => {
                // Gmail-specific selectors for email data
                const subject = emailRow.querySelector('.bqe')?.textContent?.trim() ||
                              emailRow.querySelector('.y6')?.textContent?.trim();
                
                const sender = emailRow.querySelector('.yX')?.getAttribute('email') ||
                              emailRow.querySelector('.yP')?.textContent?.trim();
                
                const timestamp = emailRow.querySelector('.xW')?.querySelector('span')?.getAttribute('title') ||
                                emailRow.querySelector('.xW')?.textContent?.trim();
    
                console.log('Extracted data:', { subject, sender, timestamp });
    
                if (!subject || !sender || !timestamp) {
                    return null;
                }
    
                return {
                    id: Date.now().toString(),
                    subject,
                    sender,
                    timestamp
                };
            };
    
            const emailData = getEmailData();
            if (emailData) {
                showStageSelectionPopup(emailData, e.clientX, e.clientY);
            } else {
                console.error('Failed to extract email data');
            }
        });
}

    function showStageSelectionPopup(emailData: EmailData, x: number, y: number) {

            // Remove any existing popups first
        const existingPopup = document.querySelector('.crm-stage-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Create popup container
        const popup = document.createElement('div');
        popup.className = 'crm-stage-popup'; // Add a class for easy identification
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

        // Get stages and create options
        chrome.storage.sync.get(['pipelineStages'], (result) => {
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

                option.addEventListener('mouseover', () => {
                    option.style.backgroundColor = '#f7fafc';
                });

                option.addEventListener('mouseout', () => {
                    option.style.backgroundColor = 'white';
                });

                option.addEventListener('click', () => {
                    // Find stage element
                    const stageElement = document.querySelector(`[data-stage-id="${stage.id}"]`);
                    if (stageElement) {
                        addEmailToStage(emailData, stage, stageElement as HTMLElement);
                    }
                    //document.body.removeChild(popup);
                      // Use safer removal method
                    popup.remove();
                });

                popup.appendChild(option);
            });
        });

    // Close popup when clicking outside
    function handleClickOutside(e: MouseEvent) {
        if (!popup.contains(e.target as Node)) {
            popup.remove();
            document.removeEventListener('click', handleClickOutside);
        }
    }

    // Delay adding the click listener to prevent immediate closure
    setTimeout(() => {
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