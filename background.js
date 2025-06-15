// background.js

// This script runs in the background.
// It's useful for managing state, listening for browser events,
// or handling long-running tasks.

// Listen for the extension being installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed or updated:', details);

    // Set a default token balance for new users on first install
    if (details.reason === 'install') {
        chrome.storage.local.set({ tokenBalance: 5 });
        console.log('Set initial token balance to 5.');

        // Open the options page on first install to guide the user
        // chrome.runtime.openOptionsPage();
    }
});

// A listener for messages from other parts of the extension,
// e.g., the popup or content scripts.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);

    if (request.action === "processPayment") {
        // This is where you would handle the logic for opening a payment
        // portal and listening for a successful transaction.
        console.log("Simulating opening payment page for user:", request.userId);
        
        // This would typically involve opening a new tab to your web app's
        // payment page, e.g., https://yourapp.com/purchase?userId=...
        
        // After payment, your server would confirm and you'd update storage.
        // For now, we'll just send a success response.
        sendResponse({ success: true, newBalance: 15 });
    }
    
    // Return true to indicate you wish to send a response asynchronously
    return true; 
});

console.log("Background service worker started.");
 
