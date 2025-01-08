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
// Default stages
const defaultStages: PipelineStage[] = [
    { id: '1', name: 'Lead', color: '#718096' },
    { id: '2', name: 'Pitched', color: '#4299E1' },
    { id: '3', name: 'Waiting', color: '#9F7AEA' },
    { id: '4', name: 'Closed', color: '#48BB78' }
];
function createStageElement(stage: PipelineStage) {
    const stageDiv = document.createElement('div');
    stageDiv.className = 'pipeline-stage';
    stageDiv.style.cssText = `
        margin-bottom: 10px;
        padding: 10px;
        background: white;
        border-left: 4px solid ${stage.color};
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.2s;
    `;
    stageDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${stage.name}</span>
            <span class="stage-count">0</span>
        </div>
    `;
    stageDiv.addEventListener('mouseover', () => {
        stageDiv.style.backgroundColor = '#f7fafc';
    });
    stageDiv.addEventListener('mouseout', () => {
        stageDiv.style.backgroundColor = 'white';
    });
    return stageDiv;
}

 /// For Add Stage Button Functionality 

 

// For Sidebar
function createSidebar() {
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

function observeGmailInbox() {
    // Gmail's main content area usually has role="main"
    const targetNode = document.querySelector('[role="main"]');
    
    if (!targetNode) {
        console.log('Gmail main content area not found, retrying...');
        setTimeout(observeGmailInbox, 1000);
        return;
    }

    console.log('Found Gmail main content area, setting up observer');
    createSidebar(); // Add sidebar when we find the main content

    // A MutationObserver is created to monitor changes in the DOM (Document Object Model) of the targetNode.
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            // Look for email rows
            const emailRows = document.querySelectorAll('tr[role="row"]');
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

const init = () => {
    if (!window.location.origin.includes(GMAIL_URL_PATTERN)) {
        return;
    }
    console.log('Gmail detected, starting observer');
    observeGmailInbox();
};

// Start when page loads
window.addEventListener('load', init);