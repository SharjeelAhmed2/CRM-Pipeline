(() => {

  const defaultStages: PipelineStage[] = [
    { id: '1', name: 'Lead', color: '#4A5568' },
    { id: '2', name: 'Pitched', color: '#4299E1' },
    { id: '3', name: 'Waiting for Proposal', color: '#9F7AEA' },
    { id: '4', name: 'Warm Lead', color: '#F56565' }
  ];

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

    async deleteEmailFromStage(email: string, stageId: string): Promise<boolean> {
      try {
        const key = `stage_${stageId}`;
        const result = await chrome.storage.local.get([key]);
        let emails: EmailData[] = result[key] || [];

        const updatedEmails = emails.filter(e => e.sender !== email);

        if (updatedEmails.length === emails.length) {
          console.log(`No email with sender ${email} found in stage ${stageId}.`);
          return false;
        }

        await chrome.storage.local.set({ [key]: updatedEmails });
        console.log(`Email with sender ${email} deleted from stage ${stageId}.`);
        return true;
      } catch (error) {
        console.error('Error deleting email:', error);
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

  function updatePipelineHeader(stages: PipelineStage[]) {
    const pipelineOverview = document.getElementById('pipeline-overview');
    if (!pipelineOverview) return;

    pipelineOverview.innerHTML = '';
    stages.forEach(stage => {
        const segment = document.createElement('div');
        segment.id = `header-${stage.name.replaceAll(' ', '-')}`;
        segment.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 8px 4px;
            position: relative;
            background-color: ${stage.color};
        `;

        // Add count
        const count = document.createElement('div');
        count.textContent = '0';
        count.className = `header-count-${stage.id}`;
        count.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 4px;
        `;

        // Add stage name
        const name = document.createElement('div');
        name.textContent = stage.name;
        name.style.cssText = `
            font-size: 20px;
            line-height: 1.2;
            font-weight: 200;
            padding: 10px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
        `;

        segment.appendChild(count);
        segment.appendChild(name);
        pipelineOverview.appendChild(segment);
    });
}

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
      border-radius: 4px;
      background: white;
      cursor: pointer;
  `;

    // Modified header structure to include arrow
    // Modified header content structure with new styling for stage name
    headerDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
          <span style="
              transform: rotate(-90deg);
              transition: transform 0.2s;
              font-size: 12px;
              color: #666;
          ">▼</span>
          
          <div style="
              background: ${stage.color};
              padding: 4px 12px;
              border-radius: 4px;
              color: white;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 80px;
          ">
              <span id="${stage.name}">${stage.name}</span>
              <span class="stage-count" style="
                  background: rgba(255, 255, 255, 0.2);
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-size: 12px;
              ">0</span>
          </div>
      </div>
      <button class="delete-stage" style="
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 18px;
          padding: 0 4px;
          margin-left: 8px;
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
    // Add drop zone handlers
    emailsContainer.addEventListener('dragover', handleDragOver);
    emailsContainer.addEventListener('dragenter', handleDragEnter);
    emailsContainer.addEventListener('dragleave', handleDragLeave);
    emailsContainer.addEventListener('drop', handleDrop);
    stageDiv.appendChild(headerDiv);
    stageDiv.appendChild(emailsContainer);

    // Add collapse/expand functionality
    const arrow = headerDiv.querySelector('span');
    headerDiv.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
    
      const selected = target.querySelector('span[id]');

      if (target instanceof HTMLElement) {
        if (selected) {
          console.log('Span content:', selected.textContent);
          const card = document.querySelector(`#header-${selected.textContent?.trim().replaceAll(' ', '-')}`) as HTMLElement;
          if (card) {
            const isExpanded = emailsContainer.style.display !== 'none';
            card.style.flex = isExpanded ? "1 1 0%" : "2 1 0%";
          }
        } else {
          console.log('No span element found!');
        }
      }
    
      if (!(e.target as HTMLElement).closest('.delete-stage')) {
        const isExpanded = emailsContainer.style.display !== 'none';
        emailsContainer.style.display = isExpanded ? 'none' : 'flex';
        if (arrow) {
          arrow.style.transform = isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
        }
    
        const card = document.querySelector(`#header-${selected?.textContent?.trim().replaceAll(' ', '-')}`) as HTMLElement;
        if (card) {
          card.style.flex = isExpanded ? "1 1 0%" : "2 1 0%";
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
          // Update header with new stages
          updatePipelineHeader(updatedStages);

          // Add new stage to UI
          const stagesContainer = document.getElementById('pipeline-stages');
          if (stagesContainer) {
            stagesContainer.appendChild(createStageElement(newStage));
          }

          // Then trigger the refresh as a separate operation

          // Still remove modal even if refresh fails
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

        // Refresh the UI
        await loadSavedEmails();
        // Add this line
    } catch (error) {
        console.error('Error during drop:', error);
    }
}

function handleDragStart(e: DragEvent) {
  if (!e.target || !(e.target instanceof HTMLElement)) return;

  // Add dragging class for visual feedback
  e.target.classList.add('dragging');

  // Set the drag data
  const emailId = e.target.getAttribute('data-email-id');
  const sourceStageId = e.target.getAttribute('data-stage-id');

  if (emailId && sourceStageId && e.dataTransfer) {
      e.dataTransfer.setData('application/json', JSON.stringify({
          emailId,
          sourceStageId
      }));
      // Set drag effect
      e.dataTransfer.effectAllowed = 'move';
  }
}

function handleDragEnd(e: DragEvent) {
  if (!e.target || !(e.target instanceof HTMLElement)) return;
  e.target.classList.remove('dragging');
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
      //   console.log("Existing Email Data: ", existingEmailInUI)
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
      // Add these attributes for drag and drop
      emailDiv.setAttribute('draggable', 'true');
      emailDiv.setAttribute('data-stage-id', stage.id);
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
          <div style="flex: 1 1 100px; overflow: hidden; padding-right: 5px; font-weight: bolder;" class="sender-cell">
              ${emailData.sender}
          </div>
           <div style="flex: 1 1 100px; overflow: hidden; padding-right: 5px;" class="sender-cell">
              ${emailData.senderName}
          </div>
          <div style="flex: 0 0 100px; text-align: right; color: #6B7280;">
              ${timestamp}
          </div>
          <div style="flex: 0 0 120px; text-align: center; padding-left: 10px;" class="delete-lead-cell">
          <button class="delete-lead-btn" style="color: white; background-color: #E53E3E; font-size: 12px; border: none; border-radius: 4px; cursor: pointer; padding: 4px 8px;">
              Delete Lead
          </button>
          </div>
      `;

      // Add "See More" functionality
      emailDiv.querySelectorAll('.see-more-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const cell = (btn as HTMLElement).parentElement;
              if (cell) {
                  if (cell.classList.contains('sender-cell')) {
                      cell.textContent = sender || (sender as any).full;
                  } else if (cell.classList.contains('subject-cell')) {
                      cell.textContent = typeof subjectText === 'object' ? subjectText.full : subjectText;
                  }
              }
          });
      });

      const deleteButton = emailDiv.querySelector('.delete-lead-btn');
      if (deleteButton) {
          deleteButton.addEventListener('click', () => {
              // Show an alert
              const confirmed = confirm(`Are you sure you want to delete the lead for: ${emailData.sender}?`);
              if (confirmed) {
                  deleteOne(emailData.id, stage.id, stageDiv)
              }
          });
      }

      // Add drag handlers
      emailDiv.addEventListener('dragstart', handleDragStart);
      emailDiv.addEventListener('dragend', handleDragEnd);
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
          // console.log("Added Counts for Stages", countElement);

          // Add this section to update header count
          const headerCount = document.querySelector(`.header-count-${stage.id}`);
          if (headerCount) {
              headerCount.textContent = (currentCount + 1).toString();
              console.log("Updated header count for stage", stage.id, "to", currentCount + 1);
          }
      }
  } catch (error) {
      console.error('Error in addEmailToStage:', error);
  }
}

async function deleteOne(emailId: string, stageId: string, stageDiv: HTMLElement): Promise<boolean> {
  try {
      // Delete from storage
      const key = `stage_${stageId}`;
      const result = await chrome.storage.local.get([key]);
      let emails: EmailData[] = result[key] || [];

      // Filter out the email with the given ID
      const updatedEmails = emails.filter(email => email.id !== emailId);

      // Check if any email was removed
      if (updatedEmails.length === emails.length) {
          console.log(`No email with ID ${emailId} found in stage ${stageId}.`);
          return false; // Email not found
      }

      // Save the updated email list back to storage
      await chrome.storage.local.set({ [key]: updatedEmails });
      console.log(`Email with ID ${emailId} deleted from stage ${stageId}.`);

      // Delete from the UI (HTML)
      const emailDiv = stageDiv.querySelector(`[data-email-id="${emailId}"]`);
      if (emailDiv) {
          emailDiv.remove();
          console.log(`Email with ID ${emailId} removed from UI.`);
      }

      // Update the email count in the UI
      const countElement = stageDiv.querySelector('.stage-count');
      if (countElement) {
          const currentCount = parseInt(countElement.textContent || '0');
          countElement.textContent = (currentCount - 1).toString();
          console.log(`Updated email count for stage ${stageId}.`);
      }

      // Update header count as well
      const headerCount = document.querySelector(`.header-count-${stageId}`);
      if (headerCount) {
          const currentHeaderCount = parseInt(headerCount.textContent || '0');
          headerCount.textContent = (currentHeaderCount - 1).toString();
          console.log("Updated header count for stage", stageId, "to", currentHeaderCount - 1);
      }

      return true;
  } catch (error) {
      console.error('Error deleting email:', error);
      return false;
  }
}

  function createPipelineContent() {
    const pipelineContent = document.createElement('div');
    pipelineContent.style.cssText = `
            width: 100%;
            height: calc(100% - 60px); // Account for back button
            display: flex;
            flex-direction: column;
            background: #f8fafc;
        `;

    // Create pipeline overview header
    const pipelineOverview = document.createElement('div');
    pipelineOverview.id = 'pipeline-overview';
    pipelineOverview.style.cssText = `
        display: flex;
        width: 100%;
        height: fit-content;
        color: white;
        font-size: 13px;
    `;

    // Content section
    const contentSection = document.createElement('div');
    contentSection.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            margin: 0 auto;
            max-width: 1200px;
            width: 100%;
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
    const footerSection = document.createElement('div');
    footerSection.style.cssText = `
            padding: 16px;
            border-top: 1px solid #e5e7eb;
            background: white;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        `;

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
            transition: background-color 0.2s;
        `;
    addButton.addEventListener('click', createAddStageForm);
    footerSection.appendChild(addButton);

    pipelineContent.appendChild(pipelineOverview);
    pipelineContent.appendChild(contentSection);
    pipelineContent.appendChild(footerSection);

    return pipelineContent;
  }

  function showPipelinePage() {
    const pipelinePage = document.querySelector('#pipeline-page') as HTMLElement;
    if (!pipelinePage) {
      const pipelinePage = document.createElement('div');
      pipelinePage.id = 'pipeline-page';
      pipelinePage.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: white;
                    z-index: 1000;
                    overflow-y: auto;
                `;


      // Add pipeline content
      const pipelineContent = createPipelineContent();
      pipelinePage.appendChild(pipelineContent);

      document.body.appendChild(pipelinePage);

      // Load stages and emails
      chrome.storage.sync.get(['pipelineStages'], (result) => {
        const stages = result.pipelineStages || defaultStages;
        updatePipelineHeader(stages);
        const stagesContainer = document.getElementById('pipeline-stages');
        if (stagesContainer) {
          stages.forEach((stage) => {
            stagesContainer.appendChild(createStageElement(stage));
          });
        }
      });
    } else {
      pipelinePage.style.display = 'block';
    }

    loadSavedEmails();

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

  async function loadSavedEmails() {
    try {
      const stages = await chrome.storage.sync.get(['pipelineStages']);
      const currentStages = stages.pipelineStages || defaultStages;

      for (const stage of currentStages) {
        //  console.log("stage Called from loadSavedEmails", stage)
        const emails = await StorageUtils.loadStageEmails(stage.id);
        //     console.log("Emails inside LoadSavedEmails:", emails);
        //It grabs the Div for Stages in Sidebar
        const stageElement = document.querySelector(`[data-stage-id="${stage.id}"]`);
        //console.log("Stage Element Called from the Load Saved emails", stageElement)
        if (stageElement) {
          // Clear existing count
          const countElement = stageElement.querySelector('.stage-count');
          //console.log("Count Element Called from Stage Element", countElement)
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
          //console.log("Email Container Called within Stage Element Debug: ", emailsContainer)
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

  addGlobalStyles();
  showPipelinePage();
})();

