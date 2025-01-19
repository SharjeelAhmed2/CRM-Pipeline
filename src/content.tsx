

// src/content.tsx
console.log('Content script starting...');

const GMAIL_URL_PATTERN = 'https://mail.google.com';
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
  senderName: string;
  timestamp: string;
}

interface StoredEmailData {
  i: string;        // id
  s: string;        // subject
  f: string;        // from/sender
  t: string;        // timestamp
  n: string;
}

// Default stages
const defaultStages: PipelineStage[] = [
  { id: '1', name: 'Lead', color: '#4A5568' },             // Dark gray
  { id: '2', name: 'Pitched', color: '#4299E1' },          // Blue
  { id: '3', name: 'Waiting for Proposal', color: '#9F7AEA' }, // Purple
  { id: '4', name: 'Warm Lead', color: '#F56565' }         // Red
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
  },

  async removeEmailFromStage(emailId: string, stageId: string): Promise<boolean> {
    try {
      const key = `stage_${stageId}`;
      const result = await chrome.storage.local.get([key]);
      let emails = result[key] || [];
      emails = emails.filter(email => email.id !== emailId);
      await chrome.storage.local.set({ [key]: emails });
      return true;
    } catch (error) {
      console.error('Error removing email:', error);
      return false;
    }
  }
};

// Compress email data before storage
function compressEmailData(email: EmailData): StoredEmailData {
  return {
    i: email.id,
    s: email.subject.substring(0, 100),  // Limit subject length
    f: email.sender.substring(0, 50),    // Limit sender length
    t: email.timestamp,
    n: email.senderName
  };
}

// Decompress email data for display
function decompressEmailData(stored: StoredEmailData): EmailData {
  return {
    id: stored.i,
    subject: stored.s,
    sender: stored.f,
    timestamp: stored.t,
    senderName: stored.n
  };
}

// 4. Implement drop zone handlers
function handleDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
}

function handleDragEnter(e: DragEvent) {
  e.preventDefault();
  if (e.target instanceof HTMLElement) {
    e.target.classList.add('drag-over');
  }
}

function handleDragLeave(e: DragEvent) {
  if (e.target instanceof HTMLElement) {
    e.target.classList.remove('drag-over');
  }
}

async function handleDrop(e: DragEvent) {
  e.preventDefault();
  if (!e.target || !(e.target instanceof HTMLElement)) return;

  // Remove drag-over styling
  e.target.classList.remove('drag-over');

  if (!e.dataTransfer) return;

  try {
    // Get the dragged email data
    const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
    const { emailId, sourceStageId } = dragData;

    // Find the target stage
    const targetStageElement = (e.target as HTMLElement).closest('.pipeline-stage');
    if (!targetStageElement) return;

    const targetStageId = targetStageElement.getAttribute('data-stage-id');
    if (!targetStageId || targetStageId === sourceStageId) return;

    // Get email data from source stage
    const sourceEmails = await StorageUtils.loadStageEmails(sourceStageId);
    const emailToMove = sourceEmails.find(email => email.id === emailId);

    if (!emailToMove) return;
    // Remove email from source stage storage
    await chrome.storage.local.set({ [`stage_${sourceStageId}`]: sourceEmails.filter(email => email.id !== emailId) });

    const filteredEmails = sourceEmails.filter(email => email.id !== emailId);
    // Remove from source stage
    for (const email of filteredEmails) {
      await StorageUtils.saveEmailToStage(email, sourceStageId);
    }
    // Add to target stage
    const targetEmails = await StorageUtils.loadStageEmails(targetStageId);
    await chrome.storage.local.set({ [`stage_${targetStageId}`]: [...targetEmails, emailToMove] });

    //const existingEmails = await StorageUtils.loadStageEmails(targetStageId);
    const updatedEmails = [...targetEmails, emailToMove];

    for (const email of updatedEmails) {
      await StorageUtils.saveEmailToStage(email, targetStageId);
    }
    // Add to target stage
    // await StorageUtils.saveEmailToStage(targetStageId, [
    //     ...(await StorageUtils.loadStageEmails(targetStageId)),
    //     emailToMove
    // ]);

  } catch (error) {
    console.error('Error during drop:', error);
  }
}


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

  // Create a new table cell for our button
  const buttonCell = document.createElement('td');
  buttonCell.style.cssText = `
            padding: 0 8px;
            width: 40px;
            vertical-align: middle;
            border: none;
        `;
  buttonCell.appendChild(moveButton);


  // Insert the new cell after the checkbox cell
  const firstCell = emailRow.querySelector('td');
  if (firstCell) {
    firstCell.after(buttonCell);
    console.log("Button inserted in Make Email Dragable")
  }

  moveButton.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Move button clicked');
    const getEmailData = (): EmailData | null => {
      // Get all table cells in the row
      const cells = emailRow.querySelectorAll('td');

      console.log([...cells].map(item => item.innerText))

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
      let senderName = emailRow.querySelector('[email]')?.getAttribute('name') || "";
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
        senderName,
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
        senderName: senderName,
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
        await StorageUtils.saveEmailToStage(emailData, stage.id);
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
    // if (!observerState.sidebarCreated) {
    //     console.log('Found Gmail container, creating sidebar and observer');
    //     createSidebar();
    //     observerState.sidebarCreated = true;
    // }

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


function createPipelineButton() {
  // Skip if button already exists
  if (document.querySelector('#pipeline-button')) return;

  // Find Gmail's sidebar navigation list
  const sidebarNav = document.querySelector('.ain');
  if (!sidebarNav) return;

  // Create button container to match Gmail's style
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'pipeline-button';
  buttonContainer.style.cssText = `
        padding: 0 8px;
        height: 32px;
        margin: 4px 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        border-radius: 16px;
        padding: 0px 12px 0px 26px;
    `;

  // Hover effect
  buttonContainer.addEventListener('mouseenter', () => {
    buttonContainer.style.backgroundColor = 'rgba(32, 33, 36, 0.059)';
  });
  buttonContainer.addEventListener('mouseleave', () => {
    buttonContainer.style.backgroundColor = '';
  });

  // Button content
  buttonContainer.innerHTML = `
        <div style="margin-right: 12px;">📈</div>
        <div style="font-size: 14px; font-weight: bolder">Boxy</div>
    `;

  // Insert after Inbox
  const inboxButton = document.querySelector('[data-tooltip="Inbox"]');
  if (inboxButton) {
    const parentElement = inboxButton.parentElement;
    if (parentElement && parentElement.parentElement) {
      parentElement.parentElement.insertBefore(buttonContainer, parentElement.nextSibling);
    }
  }

  buttonContainer.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'openOptionsPage' });
  });
}
// Setup MutationObserver to watch for changes
function setupButtonObserver() {
  const observer = new MutationObserver((mutations) => {
    // Check if our button exists
    if (!document.querySelector('#pipeline-button')) {
      createPipelineButton();
    }
  });

  // Start observing the body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
const addGlobalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
        /* Adjust the main content width to accommodate new column */
        .aeF {
            width: calc(100% - 40px) !important;
        }
        
        /* Ensure proper alignment of all cells */
        .zA > td {
            padding: 0 8px;
        }
        
        /* Style for our new column */
        .crm-move-button {
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        .zA:hover .crm-move-button {
            opacity: 1;
        }
    `;
  document.head.appendChild(style);
};

// Add this to your initialization
window.addEventListener('load', () => {
  console.log('Page loaded, initializing CRM...');
  // createPipelineButton();
  addGlobalStyles();
  // Initial setup with multiple retry attempts for first load
  const initialSetup = () => {
    setTimeout(() => {
      observeGmailInbox();

      // Specific first-load check for the first 10 rows
      const checkFirstRows = () => {
        const firstRows = Array.from(document.querySelectorAll('tr.zA')).slice(0, 50);
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
  createPipelineButton();
  setupButtonObserver();
});
const init = () => {
  if (!window.location.origin.includes(GMAIL_URL_PATTERN)) {
    return;
  }
  console.log('Gmail detected, starting observer');
  observeGmailInbox();
  createPipelineButton();
  setupButtonObserver();
};

// Start when page loads
window.addEventListener('load', init);