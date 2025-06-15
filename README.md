# Resume Tailor & Cover Letter Generator - README

This repository contains the **frontend source code** for the Resume Tailor Chrome Extension. This extension provides the user interface and communicates with a secure backend server to handle complex tasks.

![Extension Screenshot](https://i.imgur.com/gQYdZpW.png) 

### User Flow

1.  **Navigate to Job Posting**: The user finds a job they are interested in on any website.
2.  **Open Extension**: The user clicks the extension icon in the Chrome toolbar.
3.  **Automatic Extraction**: The extension's popup opens and automatically extracts the text from the job description on the page.
4.  **Upload Documents**: The user uploads their resume (PDF, DOCX, or text) and optionally their LinkedIn profile.
5.  **Check Tokens**: The UI displays the user's current token balance. If the balance is zero, the "Generate" button is disabled, and a prompt to purchase more tokens appears.
6.  **Generate**: If the user has tokens, they click "Customize & Generate." A loading indicator appears.
7.  **Backend Processing**: The extension securely sends the files and job description text to a backend server for processing.
8.  **Download**: The UI updates to a "Success" view, showing download buttons for the tailored resume and cover letter in both DOCX and PDF formats. One token is deducted from the user's balance.

### Project Structure

```
/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── options.html
├── privacy.html
└── terms.html
```

### How to Set Up and Run Locally

1.  **Download Files**: Place all project files from this repository into a single local folder.
2.  **Add Icons**: Make sure the `icons` subfolder contains `icon16.png`, `icon48.png`, and `icon128.png`.
3.  **Open Chrome Extensions**: In your Chrome browser, navigate to `chrome://extensions`.
4.  **Enable Developer Mode**: Activate the "Developer mode" toggle, usually found in the top-right corner.
5.  **Load Extension**: Click the "Load unpacked" button and select the folder where you saved these project files.
6.  **Pin Extension**: The "Resume Tailor" icon will appear in your Chrome toolbar. You can "pin" it for easy access.

### How to Connect to the Backend

This frontend extension is designed to work with its corresponding [backend server](https://github.com/YOUR_USERNAME/resume-tailor-backend). 

To make the extension fully functional, you must:

1.  **Run the Backend Server**: Follow the instructions in the backend repository's README to get the server running on your local machine (typically at `http://localhost:3000`).
2.  **Update API Endpoint in `popup.js`**:
    * Open the `popup.js` file.
    * Find the `callBackendAPI()` function.
    * Ensure the `fetch` request inside this function points to your running backend's `/generate` endpoint. For local development, this URL will be `http://localhost:3000/generate`.
3.  **Update Payment Logic in `popup.js`**:
    * Find the `purchaseTokensBtn` event listener.
    * Update its `fetch` call to point to your backend's `/create-payment-session` endpoint.

### Publishing to the Chrome Web Store

1.  **Create a Developer Account**: Register on the Chrome Web Store developer dashboard (a one-time $5 fee is required).
2.  **Package Extension**: Create a `.zip` file of this entire project folder.
3.  **Upload & Describe**: Upload the zip file to the developer dashboard. You will need to write a clear description, provide screenshots, and link to your privacy policy.
4.  **Justify Permissions**: You must clearly explain why your extension requires the `activeTab`, `scripting`, and `storage` permissions.
5.  **Submit for Review**: Submit your extension. The review process checks for policy compliance, security, and functionality and can take several days.
# Resume Tailor & Cover Letter Generator - README

This repository contains the **frontend source code** for the Resume Tailor Chrome Extension. This extension provides the user interface and communicates with a secure backend server to handle complex tasks.

![Extension Screenshot](https://) 

### User Flow

1.  **Navigate to Job Posting**: The user finds a job they are interested in on any website.
2.  **Open Extension**: The user clicks the extension icon in the Chrome toolbar.
3.  **Automatic Extraction**: The extension's popup opens and automatically extracts the text from the job description on the page.
4.  **Upload Documents**: The user uploads their resume (PDF, DOCX, or text) and optionally their LinkedIn profile.
5.  **Check Tokens**: The UI displays the user's current token balance. If the balance is zero, the "Generate" button is disabled, and a prompt to purchase more tokens appears.
6.  **Generate**: If the user has tokens, they click "Customize & Generate." A loading indicator appears.
7.  **Backend Processing**: The extension securely sends the files and job description text to a backend server for processing.
8.  **Download**: The UI updates to a "Success" view, showing download buttons for the tailored resume and cover letter in both DOCX and PDF formats. One token is deducted from the user's balance.

### Project Structure

```
/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── options.html
├── privacy.html
└── terms.html
```

### How to Set Up and Run Locally

1.  **Download Files**: Place all project files from this repository into a single local folder.
2.  **Add Icons**: Make sure the `icons` subfolder contains `icon16.png`, `icon48.png`, and `icon128.png`.
3.  **Open Chrome Extensions**: In your Chrome browser, navigate to `chrome://extensions`.
4.  **Enable Developer Mode**: Activate the "Developer mode" toggle, usually found in the top-right corner.
5.  **Load Extension**: Click the "Load unpacked" button and select the folder where you saved these project files.
6.  **Pin Extension**: The "Resume Tailor" icon will appear in your Chrome toolbar. You can "pin" it for easy access.

### How to Connect to the Backend

This frontend extension is designed to work with its corresponding [backend server](https://github.com/YOUR_USERNAME/resume-tailor-backend). 

To make the extension fully functional, you must:

1.  **Run the Backend Server**: Follow the instructions in the backend repository's README to get the server running on your local machine (typically at `http://localhost:3000`).
2.  **Update API Endpoint in `popup.js`**:
    * Open the `popup.js` file.
    * Find the `callBackendAPI()` function.
    * Ensure the `fetch` request inside this function points to your running backend's `/generate` endpoint. For local development, this URL will be `http://localhost:3000/generate`.
3.  **Update Payment Logic in `popup.js`**:
    * Find the `purchaseTokensBtn` event listener.
    * Update its `fetch` call to point to your backend's `/create-payment-session` endpoint.

### Publishing to the Chrome Web Store

1.  **Create a Developer Account**: Register on the Chrome Web Store developer dashboard (a one-time $5 fee is required).
2.  **Package Extension**: Create a `.zip` file of this entire project folder.
3.  **Upload & Describe**: Upload the zip file to the developer dashboard. You will need to write a clear description, provide screenshots, and link to your privacy policy.
4.  **Justify Permissions**: You must clearly explain why your extension requires the `activeTab`, `scripting`, and `storage` permissions.
5.  **Submit for Review**: Submit your extension. The review process checks for policy compliance, security, and functionality and can take several days.
