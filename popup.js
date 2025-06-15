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
        // Load token balance from storage
        chrome.storage.local.get(['tokenBalance'], function(result) {
            tokenBalance = result.tokenBalance || 0; // Default to 0 if not set
            updateTokenUI();
        });

        // Attempt to extract job description from the current page
        extractJobDescription();
        hideError();
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
            // This endpoint would handle parsing, AI generation, and file creation
            const response = await callBackendAPI(formData);

            // 4. Set up download links from the response
            setupDownloadLinks(response.downloads);

            // 5. Deduct token and update storage
            tokenBalance--;
            chrome.storage.local.set({ tokenBalance: tokenBalance });
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
     * Placeholder for calling your secure backend API.
     * Your backend will handle the calls to PDF.co and OpenAI.
     * @param {FormData} formData - The form data containing files and text.
     * @returns {Promise<object>} - An object with download URLs/blobs.
     */
    function callBackendAPI(formData) {
        console.log("Sending data to backend...");
        // In a real extension, you would use fetch() to send the formData
        // to your secure backend endpoint, e.g., `https://your-api.com/generate`.
        // The backend would return URLs or data for the generated files.

        // NEVER expose your API keys on the client-side.
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log("Backend processing complete.");
                 if (jobDescriptionText.value.includes("ERROR")) {
                    return reject(new Error("The AI model failed to generate a response. Please try again."));
                 }

                // This is mock data. A real backend would return file blobs or secure download links.
                const mockResumeDocx = new Blob(["This is a mock DOCX resume."], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                const mockResumePdf = new Blob(["This is a mock PDF resume."], { type: 'application/pdf' });
                const mockCoverLetterDocx = new Blob(["This is a mock DOCX cover letter."], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                const mockCoverLetterPdf = new Blob(["This is a mock PDF cover letter."], { type: 'application/pdf' });

                resolve({
                    downloads: {
                        resumeDocx: URL.createObjectURL(mockResumeDocx),
                        resumePdf: URL.createObjectURL(mockResumePdf),
                        coverLetterDocx: URL.createObjectURL(mockCoverLetterDocx),
                        coverLetterPdf: URL.createObjectURL(mockCoverLetterPdf),
                    }
                });
            }, 3000); // Simulate network and processing delay
        });
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
    
    purchaseTokensBtn.addEventListener('click', () => {
        // In a real extension, this would open a new tab to your Stripe/Paddle checkout page.
        alert("This would redirect to a payment page. Simulating successful purchase by adding 5 tokens.");
        tokenBalance += 5;
        chrome.storage.local.set({ tokenBalance: tokenBalance }, () => {
            updateTokenUI();
        });
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
        downloadResumeDocxBtn.onclick = () => window.open(resumeDocx, '_blank');
        downloadResumePdfBtn.onclick = () => window.open(resumePdf, '_blank');
        downloadCoverLetterDocxBtn.onclick = () => window.open(coverLetterDocx, '_blank');
        downloadCoverLetterPdfBtn.onclick = () => window.open(coverLetterPdf, '_blank');
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

