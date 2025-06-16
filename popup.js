 document.addEventListener('DOMContentLoaded', function () {
    // UI Elements
    const generateBtn = document.getElementById('generate-btn');
    const resumeUpload = document.getElementById('resume-upload');
    const profileUpload = document.getElementById('profile-upload');
    const resumeFileNameEl = document.getElementById('resume-file-name');
    const profileFileNameEl = document.getElementById('profile-file-name');
    const jobDescriptionText = document.getElementById('job-description');
    const tokenBalanceEl = document.getElementById('token-balance');
    const purchasePrompt = document.getElementById('purchase-prompt');
    const purchaseTokensBtn = document.getElementById('purchase-tokens-btn');
    const errorMessageEl = document.getElementById('error-message');
    const errorTextEl = document.getElementById('error-text');
    
    // Views
    const mainUI = document.getElementById('main-ui');
    const loadingView = document.getElementById('loading-view');
    const resultsView = document.getElementById('results-view');

    // Result buttons
    const downloadResumeDocxBtn = document.getElementById('download-resume-docx-btn');
    const downloadResumePdfBtn = document.getElementById('download-resume-pdf-btn');
    const downloadCoverLetterDocxBtn = document.getElementById('download-cover-letter-docx-btn');
    const downloadCoverLetterPdfBtn = document.getElementById('download-cover-letter-pdf-btn');
    const startOverBtn = document.getElementById('start-over-btn');

    // State
    let tokenBalance = 0;
    let resumeFile = null;
    let profileFile = null;

    // --- Initialization ---

    function initialize() {
        // Load token balance from backend
        fetchTokenBalance();

        // Attempt to extract job description from the current page
        extractJobDescription();
        hideError();
    }

    async function fetchTokenBalance() {
        try {
            const response = await fetch('http://localhost:3000/get-token-balance');
            if (response.ok) {
                const data = await response.json();
                tokenBalance = data.tokens;
                updateTokenUI();
            } else {
                console.error('Failed to fetch token balance');
                tokenBalance = 0;
                updateTokenUI();
            }
        } catch (error) {
            console.error('Error fetching token balance:', error);
            tokenBalance = 0;
            updateTokenUI();
        }
    }

    function updateTokenUI() {
        tokenBalanceEl.textContent = tokenBalance;
        if (tokenBalance <= 0) {
            purchasePrompt.classList.remove('hidden');
            generateBtn.disabled = true;
            generateBtn.title = "You need tokens to proceed.";
        } else {
            purchasePrompt.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.title = "";
        }
    }

    // --- Core Logic ---

    /**
     * Injects a content script to extract text from the page.
     * A more robust solution would involve more sophisticated DOM analysis 
     * to find the main content area containing the job description.
     */
    function extractJobDescription() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            // Ensure we have a valid tab to inject into
            if (!tabs[0] || !tabs[0].id) {
                showError("Cannot access the current tab.");
                return;
            }
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => document.body.innerText
            }, (injectionResults) => {
                if (chrome.runtime.lastError || !injectionResults || !injectionResults[0]) {
                    showError("Could not access page content. Try refreshing the page.");
                    jobDescriptionText.value = "Could not automatically detect the job description. Please paste it here manually.";
                    return;
                }
                // This is a very basic extraction. A real implementation would need
                // heuristics to find the relevant job description text.
                // We also limit the length to avoid sending huge amounts of text.
                const pageText = injectionResults[0].result;
                jobDescriptionText.value = pageText.slice(0, 5000); 
            });
        });
    }

    async function handleGeneration() {
        // 1. Validate inputs
        if (!resumeFile) {
            showError("Please upload your resume.");
            return;
        }
        if (jobDescriptionText.value.trim().length < 50) {
            showError("Job description seems too short. Please make sure it was detected correctly or paste it in.");
            return;
        }
        if (tokenBalance <= 0) {
            showError("You are out of tokens. Please purchase more.");
            return;
        }

        // 2. Switch to loading view
        showView('loading');
        hideError();

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            if (profileFile) {
                formData.append('profile', profileFile);
            }
            formData.append('jobDescription', jobDescriptionText.value);

            // 3. Call backend API
            // This endpoint handles parsing, AI generation, and file creation
            const response = await callBackendAPI(formData);

            // 4. Set up download links from the response
            setupDownloadLinks(response);

            // 5. Update token balance from response
            tokenBalance = response.newTokenBalance;
            updateTokenUI();

            // 6. Show results view
            showView('results');

        } catch (error) {
            showError(error.message);
            showView('main'); // Go back to main view on error
        }
    }
    
    // --- API & Backend Placeholders ---

    /**
     * Calls the secure backend API to generate tailored documents.
     * @param {FormData} formData - The form data containing files and text.
     * @returns {Promise<object>} - An object with base64 encoded files.
     */
    async function callBackendAPI(formData) {
        console.log("Sending data to backend...");

        try {
            const response = await fetch('http://localhost:3000/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate documents');
            }

            const data = await response.json();
            console.log("Backend processing complete.");
            return data;
        } catch (error) {
            console.error('Backend API Error:', error);
            throw error;
        }
    }

    // --- Event Listeners & UI ---

    resumeUpload.addEventListener('change', (e) => handleFileUpload(e, resumeFileNameEl, 'resume'));
    profileUpload.addEventListener('change', (e) => handleFileUpload(e, profileFileNameEl, 'profile'));

    function handleFileUpload(event, fileNameEl, type) {
        const file = event.target.files[0];
        if (!file) return;

        fileNameEl.textContent = file.name;
        if (type === 'resume') {
            resumeFile = file;
        } else if (type === 'profile') {
            profileFile = file;
        }
        hideError();
    }

    generateBtn.addEventListener('click', handleGeneration);
    
    purchaseTokensBtn.addEventListener('click', async () => {
        try {
            // Create payment session with backend
            const response = await fetch('http://localhost:3000/create-payment-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to create payment session');
            }

            const data = await response.json();

            // Redirect to Stripe Checkout
            if (window.Stripe) {
                const stripe = window.Stripe('pk_test_your_publishable_key_here'); // You'll need to replace this with your actual publishable key
                await stripe.redirectToCheckout({ sessionId: data.id });
            } else {
                // Fallback: open payment URL in new tab
                chrome.tabs.create({ url: `https://checkout.stripe.com/pay/${data.id}` });
            }
        } catch (error) {
            console.error('Payment error:', error);
            showError('Failed to initiate payment. Please try again.');
        }
    });

    startOverBtn.addEventListener('click', () => {
        // Reset state
        resumeFile = null;
        profileFile = null;
        resumeFileNameEl.textContent = '';
        profileFileNameEl.textContent = '';
        resumeUpload.value = '';
        profileUpload.value = '';
        // Do not reset job description, user might want to reuse it.
        showView('main');
        hideError();
    });

    function setupDownloadLinks({ resumeDocx, resumePdf, coverLetterDocx, coverLetterPdf }) {
        // Set up download links with proper filenames
        downloadResumeDocxBtn.onclick = () => downloadFile(resumeDocx, 'tailored-resume.docx');
        downloadResumePdfBtn.onclick = () => downloadFile(resumePdf, 'tailored-resume.pdf');
        downloadCoverLetterDocxBtn.onclick = () => downloadFile(coverLetterDocx, 'cover-letter.docx');
        downloadCoverLetterPdfBtn.onclick = () => downloadFile(coverLetterPdf, 'cover-letter.pdf');
    }

    function downloadFile(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showView(viewName) {
        mainUI.classList.add('hidden');
        loadingView.classList.add('hidden');
        resultsView.classList.add('hidden');

        const viewMap = {
            main: mainUI,
            loading: loadingView,
            results: resultsView,
        };
        if (viewMap[viewName]) {
            viewMap[viewName].classList.remove('hidden');
        }
    }

    function showError(message) {
        errorTextEl.textContent = message;
        errorMessageEl.classList.remove('hidden');
    }

    function hideError() {
        errorMessageEl.classList.add('hidden');
    }
    
    // Initialize the popup
    initialize();
});

