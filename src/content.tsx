// src/content.tsx
console.log('Content script loaded initially');

const GMAIL_URL_PATTERN = 'https://mail.google.com';

const init = () => {
  console.log('Init function called');
  
  if (!window.location.origin.includes(GMAIL_URL_PATTERN)) {
    console.log('Not on Gmail');
    return;
  }
  
  console.log('Gmail detected!');
  
  // Add a visible element to confirm injection
  const div = document.createElement('div');
  div.style.padding = '10px';
  div.style.backgroundColor = 'red';
  div.textContent = 'Gmail CRM Extension Loaded!';
  document.body.prepend(div);
};

// Start the extension
init();