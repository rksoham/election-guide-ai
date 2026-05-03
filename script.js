/**
 * Election Guide AI - Main Script
 * Refactored for modularity, accessibility, and performance.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initNavigation();
    initEligibilityWidget();
    initChatAssistant();
    initQueryHistory();
    initPersonalizedGuide();
    initPollingBooth();
});

// ==========================================
// Utility Functions
// ==========================================

/**
 * Safely parses JSON from LocalStorage
 * @param {string} key - The localStorage key
 * @param {any} fallback - The fallback value if parsing fails or data is missing
 * @returns {any}
 */
function safeGetLocalStorage(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (error) {
        console.error(`Error parsing LocalStorage for key "${key}":`, error);
        return fallback;
    }
}

/**
 * Safely saves data to LocalStorage
 * @param {string} key - The localStorage key
 * @param {any} value - The value to store
 */
function safeSetLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to LocalStorage for key "${key}":`, error);
    }
}

/**
 * Temporarily sets a button to a processing state
 * @param {HTMLButtonElement} btn - The button element
 * @param {string} processingText - Text to show during processing
 * @param {Function} callback - Function to execute after delay
 * @param {number} delay - Delay in milliseconds
 */
function simulateProcessing(btn, processingText, callback, delay = 600) {
    if (!btn) return;
    const originalText = btn.textContent;
    btn.textContent = processingText;
    btn.disabled = true;

    setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        if (callback) callback();
    }, delay);
}

// ==========================================
// 1. Navigation Logic
// ==========================================
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    const dashboardCards = document.querySelectorAll('.dashboard-card');

    function navigateToSection(targetId) {
        if (!targetId) return;

        // Remove active states efficiently
        navButtons.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        dashboardCards.forEach(c => c.classList.remove('active-card'));

        // Add active state to target top navigation tab
        const targetBtn = document.querySelector(`.nav-btn[data-section="${targetId}"]`);
        if (targetBtn) targetBtn.classList.add('active');

        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');

        // Scroll screen to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Attach click to top navs
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navigateToSection(btn.getAttribute('data-section'));
        });
    });

    // Handle Dashboard card interactions
    function handleDashboardCardInteraction(card) {
        dashboardCards.forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');
        navigateToSection(card.getAttribute('data-section'));
    }

    // Attach click & keyboard events to dashboard cards for accessibility
    dashboardCards.forEach(card => {
        card.addEventListener('click', () => handleDashboardCardInteraction(card));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDashboardCardInteraction(card);
            }
        });
    });
}

// ==========================================
// 2. Eligibility Widget Logic
// ==========================================
function initEligibilityWidget() {
    const checkEligBtn = document.getElementById('check-eligibility-btn');
    const ageInput = document.getElementById('age-input');
    const eligResult = document.getElementById('eligibility-result');

    if (!checkEligBtn || !ageInput || !eligResult) return;

    function handleEligibilityCheck() {
        const inputValue = ageInput.value.trim();
        const age = parseInt(inputValue, 10);

        // Input validation
        if (inputValue === '' || isNaN(age) || age < 0) {
            eligResult.textContent = "❌ Please enter a valid numerical age.";
            eligResult.style.color = "var(--error)";
            ageInput.style.borderColor = "var(--error)";
            setTimeout(() => ageInput.style.borderColor = "var(--border)", 1500);
            return;
        }

        simulateProcessing(checkEligBtn, "Checking...", () => {
            if (age >= 18) {
                eligResult.textContent = "✅ You are eligible to vote!";
                eligResult.style.color = "var(--success)";
            } else {
                eligResult.textContent = "❌ Not eligible. You must be 18 or older to vote.";
                eligResult.style.color = "var(--error)";
            }
        });
    }

    checkEligBtn.addEventListener('click', handleEligibilityCheck);
    ageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEligibilityCheck();
        }
    });
}

// ==========================================
// 3. Smart Chat Assistant Logic
// ==========================================
function initChatAssistant() {
    // Popup Elements
    const floatingChatBtn = document.getElementById('floating-chat-btn');
    const chatPopup = document.getElementById('chat-popup');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const popupChatInput = document.getElementById('chat-input');
    const popupSendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionBtns = document.querySelectorAll('.sugg-btn');

    // Mini Panel Elements
    const miniChatInput = document.getElementById('mini-chat-input');
    const miniSendBtn = document.getElementById('mini-send-btn');

    if (!chatPopup || !chatMessages) return;

    // Toggle Floating Chat Popup
    if (floatingChatBtn) {
        floatingChatBtn.addEventListener('click', () => chatPopup.classList.remove('hidden'));
    }
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => chatPopup.classList.add('hidden'));
    }

    /**
     * Determines the AI response based on keywords with multiple variations.
     */
    function getAssistantResponse(query) {
        const lowerQuery = query.toLowerCase();

        const responses = {
            vote: [
                "To vote, you need to be registered, carry a valid ID, and visit your assigned polling booth.",
                "Voting requires registration, identity verification, and visiting your polling station.",
                "Ensure you are registered and bring valid ID when you go to vote."
            ],
            eligibility: [
                "You must be at least 18 years old and a citizen to be eligible to vote.",
                "Eligibility generally requires age above 18 and citizenship.",
                "Use the eligibility section to verify your voting status."
            ],
            document: [
                "Carry a valid ID such as Voter ID, Aadhaar, Passport, or Driving License.",
                "Accepted IDs include Voter ID, Passport, PAN, or Driving License.",
                "Make sure to bring an official government ID for voting."
            ],
            process: [
                "The election process includes registration, campaigning, and voting.",
                "Elections involve candidate nomination, campaigning, and final voting.",
                "It starts with registration and ends with casting your vote."
            ],
            timeline: [
                "Election timelines include registration, campaigning, and voting phases.",
                "Key phases include nomination, campaigning, and final election day.",
                "Refer to the timeline section for detailed stages."
            ],
            hello: [
                "Hello! How can I assist you with election information?",
                "Hi! Ask me anything about voting or eligibility.",
                "Welcome! I’m here to help you understand elections."
            ]
        };

        const synonyms = {
            vote: ['vote', 'voting', 'cast vote'],
            eligibility: ['eligible', 'eligibility', 'age'],
            document: ['document', 'id', 'proof'],
            process: ['process', 'procedure'],
            timeline: ['timeline', 'when', 'date'],
            hello: ['hello', 'hi', 'hey']
        };

        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        for (let key in synonyms) {
            if (synonyms[key].some(word => lowerQuery.includes(word))) {
                return getRandom(responses[key]);
            }
        }

        return "I’m not sure about that. Try asking about voting, eligibility, documents, or election timeline.";
    }

    /**
     * Appends a message bubble to the popup chat container.
     */
    function addMessageToChat(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
    }

    /**
     * Generic handler for processing queries from either input source.
     */
    function processChatQuery(query) {
        const safeQuery = query.trim();
        if (!safeQuery) return;

        // Force popup open if a query comes from the mini panel
        chatPopup.classList.remove('hidden');

        // Add user message & save to history
        addMessageToChat(safeQuery, 'user');

        // Dispatch custom event to notify history module (loose coupling)
        document.dispatchEvent(new CustomEvent('saveQueryHistory', { detail: safeQuery }));

        // Add temporary 'Processing...' UX state
        const procDiv = document.createElement('div');
        procDiv.classList.add('message', 'ai-message');
        procDiv.innerHTML = '<span style="color:var(--text-muted); font-style:italic;" aria-live="polite">Processing...</span>';
        chatMessages.appendChild(procDiv);
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });

        // Delayed AI Response for better UX
        setTimeout(() => {
            procDiv.remove();

            try {
                const response = getAssistantResponse(safeQuery);
                addMessageToChat(response, 'ai');
            } catch (err) {
                console.error(err);
                addMessageToChat("Something went wrong. Please try again.", 'ai');
            }

        }, 700);
    }

    /**
     * Validates input fields before submission
     */
    function handleChatValidation(inputElement) {
        const value = inputElement.value.trim();

        // Empty validation
        if (!value) {
            const originalPlaceholder = inputElement.placeholder;
            inputElement.placeholder = "Please enter a message...";
            inputElement.style.borderColor = "var(--error)";
            setTimeout(() => {
                inputElement.style.borderColor = "var(--border)";
                inputElement.placeholder = originalPlaceholder;
            }, 2000);
            return false;
        }

        // 🔥 ADD THIS (length validation)
        if (value.length > 200) {
            inputElement.value = value.slice(0, 200);
        }

        return true;
    }

    // Connect inputs
    function setupChatInput(inputEl, btnEl) {
        if (!inputEl || !btnEl) return;

        btnEl.addEventListener('click', () => {
            if (handleChatValidation(inputEl)) {
                processChatQuery(inputEl.value);
                inputEl.value = '';
            }
        });

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (handleChatValidation(inputEl)) {
                    processChatQuery(inputEl.value);
                    inputEl.value = '';
                }
            }
        });
    }

    setupChatInput(popupChatInput, popupSendBtn);
    setupChatInput(miniChatInput, miniSendBtn);

    // Connect Suggestion Pills
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => processChatQuery(btn.textContent));
    });
    // Accessibility: close popup with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const popup = document.getElementById('chat-popup');
            if (popup) popup.classList.add('hidden');
        }
    });
}

// ==========================================
// 4. Simulated Google Service (LocalStorage)
// ==========================================
function initQueryHistory() {
    const historyList = document.getElementById('query-history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const STORAGE_KEY = 'election_guide_queries';

    if (!historyList || !clearHistoryBtn) return;

    /**
     * Loads previous queries from LocalStorage and renders them.
     */
    function loadHistory() {
        // Use safe parsing to prevent crashes
        const queries = safeGetLocalStorage(STORAGE_KEY, []);

        // Prevent unnecessary DOM manipulation if we can
        while (historyList.firstChild) {
            historyList.removeChild(historyList.firstChild);
        }

        if (!Array.isArray(queries) || queries.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'Ready to assist! Ask a question to see your history logged here.';
            li.style.color = 'var(--text-muted)';
            li.style.fontStyle = 'italic';
            li.style.padding = '1rem 0';
            historyList.appendChild(li);
            clearHistoryBtn.style.display = 'none'; // Hide when history is empty
            return;
        }

        clearHistoryBtn.style.display = 'block'; // Ensure it's visible when active

        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        queries.forEach(q => {
            const li = document.createElement('li');
            li.textContent = `"${q}"`;
            fragment.appendChild(li);
        });
        historyList.appendChild(fragment);
    }

    /**
     * Saves a new query to LocalStorage.
     */
    function saveQuery(query) {
    let queries = safeGetLocalStorage(STORAGE_KEY, []);
    if (!Array.isArray(queries)) queries = [];

    const cleanedQuery = query.trim().toLowerCase();
    if (queries.some(q => q.toLowerCase() === cleanedQuery)) return;

    queries.unshift(query.trim());

    if (queries.length > 20) {
        queries = queries.slice(0, 20);
    }

    safeSetLocalStorage(STORAGE_KEY, queries);
    loadHistory();
}

    // Listen for custom event from chat module
    document.addEventListener('saveQueryHistory', (e) => {
        saveQuery(e.detail);
    });

    // Clear history feature
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear your query history?")) {
            localStorage.removeItem(STORAGE_KEY);
            loadHistory();
        }
    });

    // Initial load
    loadHistory();
}

// ==========================================
// 5. Personalized Voting Guide Logic
// ==========================================
function initPersonalizedGuide() {
    const GUIDE_STORAGE_KEY = 'election_guide_responses';

    // Guide DOM Elements
    const allGuideSteps = document.querySelectorAll('.guide-step');
    const guideIntro = document.getElementById('guide-intro');
    const guideQ1 = document.getElementById('guide-q1');
    const guideQ2 = document.getElementById('guide-q2');
    const guideQ3 = document.getElementById('guide-q3');
    const guideResult = document.getElementById('guide-result');

    // Inputs & Buttons
    const startGuideBtn = document.getElementById('start-guide-btn');
    const introResetBtn = document.getElementById('intro-reset-btn');
    const guideAgeInput = document.getElementById('guide-age');
    const guideNext1Btn = document.getElementById('guide-next-1');
    const guideQ2Options = document.querySelectorAll('#guide-q2 .option-btn');
    const guideQ3Options = document.querySelectorAll('#guide-q3 .option-btn');
    const restartGuideBtn = document.getElementById('restart-guide-btn');

    const resultTitle = document.getElementById('result-title');
    const resultContent = document.getElementById('result-content');
    const introText = document.getElementById('guide-intro-text');

    if (!guideIntro || !startGuideBtn) return;

    // Default State
    const defaultState = { age: null, firstTime: null, hasVoterId: null };
    let guideResponses = { ...defaultState };

    /**
     * Show only the target step element.
     */
    function showGuideStep(stepElement) {
        if (!stepElement) return;
        allGuideSteps.forEach(step => step.classList.remove('active-step'));
        stepElement.classList.add('active-step');
    }

    /**
     * Main logic execution for displaying the guide outcome.
     */
    function evaluateGuideResult() {
        showGuideStep(guideResult);

        const age = parseInt(guideResponses.age, 10);

        if (age < 18) {
            resultTitle.textContent = "Not Eligible Yet";
            resultTitle.style.color = "var(--error)";
            resultContent.innerHTML = `<p>You are not eligible to vote yet. You can register after turning 18.</p>`;
        } else if (age >= 18 && guideResponses.hasVoterId === 'no') {
            resultTitle.textContent = "You are eligible to vote.";
            resultTitle.style.color = "var(--primary-color)";
            resultContent.innerHTML = `
                <p><strong>Next step:</strong> Register for a voter ID.</p>
                <ol class="styled-list result-list">
                    <li>Visit NVSP portal</li>
                    <li>Fill Form 6</li>
                    <li>Upload documents</li>
                </ol>
            `;
        } else if (age >= 18 && guideResponses.hasVoterId === 'yes') {
            resultTitle.textContent = "You are ready to vote.";
            resultTitle.style.color = "var(--success)";
            resultContent.innerHTML = `
                <ol class="styled-list result-list">
                    <li>Check your name in voter list</li>
                    <li>Find your polling booth</li>
                    <li>Carry ID on voting day</li>
                </ol>
            `;
        }
    }

    /**
     * Resets guide data and UI
     */
    function resetGuideData() {
        guideResponses = { ...defaultState };
        guideAgeInput.value = '';
        localStorage.removeItem(GUIDE_STORAGE_KEY);

        // Reset intro UI
        introText.textContent = "Get a step-by-step personalized guide on how to prepare for voting based on your details.";
        startGuideBtn.textContent = "Start My Voting Guide";
        introResetBtn.style.display = 'none';
    }

    // Start / Resume clicking logic
    startGuideBtn.addEventListener('click', () => {
        simulateProcessing(startGuideBtn, "Loading...", () => {
            if (guideResponses.age !== null) {
                // Resume logic
                if (guideResponses.age < 18 || guideResponses.hasVoterId !== null) {
                    evaluateGuideResult();
                } else if (guideResponses.firstTime !== null) {
                    showGuideStep(guideQ3);
                } else {
                    showGuideStep(guideQ2);
                }
            } else {
                // Start fresh
                showGuideStep(guideQ1);
            }
        }, 300);
    });

    // Step 1: Age Submission
    function handleAgeSubmission() {
        const age = parseInt(guideAgeInput.value, 10);
        if (isNaN(age) || age < 0) {
            alert("Please enter a valid age.");
            return;
        }

        simulateProcessing(guideNext1Btn, "Saving...", () => {
            guideResponses.age = age;
            safeSetLocalStorage(GUIDE_STORAGE_KEY, guideResponses);

            // Direct result if minor, skip Q2/Q3
            if (age < 18) {
                evaluateGuideResult();
            } else {
                showGuideStep(guideQ2);
            }
        }, 400);
    }

    guideNext1Btn.addEventListener('click', handleAgeSubmission);
    guideAgeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAgeSubmission();
        }
    });

    // Step 2 & 3 Selection Logic Generator (DRY)
    function setupOptionButtons(buttons, stepKey, nextStepElement, checkResult = false) {
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                simulateProcessing(btn, "Saving...", () => {
                    guideResponses[stepKey] = btn.getAttribute('data-value');
                    safeSetLocalStorage(GUIDE_STORAGE_KEY, guideResponses);

                    if (checkResult) {
                        evaluateGuideResult();
                    } else if (nextStepElement) {
                        showGuideStep(nextStepElement);
                    }
                }, 400);
            });
        });
    }

    setupOptionButtons(guideQ2Options, 'firstTime', guideQ3, false);
    setupOptionButtons(guideQ3Options, 'hasVoterId', null, true);

    // Restart Guide
    restartGuideBtn.addEventListener('click', () => {
        simulateProcessing(restartGuideBtn, "Restarting...", () => {
            resetGuideData();
            showGuideStep(guideIntro);
        }, 400);
    });

    // Reset Data Button in Intro
    introResetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset your saved guide data?")) {
            resetGuideData();
        }
    });

    // Init: Load saved state
    const savedData = safeGetLocalStorage(GUIDE_STORAGE_KEY, null);
    if (savedData && typeof savedData === 'object') {
        guideResponses = { ...defaultState, ...savedData };

        if (guideResponses.age !== null) {
            guideAgeInput.value = guideResponses.age;

            // Activate the Welcome Back message
            introText.innerHTML = "<strong>Welcome back, continue your guide.</strong>";
            startGuideBtn.textContent = "Resume My Guide";
            introResetBtn.style.display = 'inline-block';
        }
    }
}

// ==========================================
// 6. Polling Booth Locator Logic
// ==========================================
function initPollingBooth() {
    const boothLocationInput = document.getElementById('booth-location-input');
    const findBoothBtn = document.getElementById('find-booth-btn');
    const boothResultCard = document.getElementById('booth-result');
    const boothResultTitle = document.getElementById('booth-result-title');
    const boothResultDetails = document.getElementById('booth-result-details');

    if (!boothLocationInput || !findBoothBtn || !boothResultCard) return;

    /**
     * Enhanced Simulation Logic for finding polling booths based on intelligent matching.
     */
    function searchPollingBooth() {
        const originalQuery = boothLocationInput.value.trim();
        let query = originalQuery.toLowerCase();

        // Normalize specific inputs
        const stateMappings = {
            'wb': 'west bengal',
            'mh': 'maharashtra',
            'ka': 'karnataka'
        };
        if (stateMappings[query]) {
            query = stateMappings[query];
        }

        // Validating Input
        if (!query) {
            boothLocationInput.placeholder = "Please enter a valid city or area...";
            boothLocationInput.style.borderColor = "var(--error)";
            setTimeout(() => {
                boothLocationInput.style.borderColor = "var(--border)";
                boothLocationInput.placeholder = "e.g. Bangalore, Maharashtra, or Khera village...";
            }, 2000);
            return;
        }

        // UX: Processing State
        simulateProcessing(findBoothBtn, "Processing...", () => {
            boothResultCard.style.display = 'block';
            boothResultCard.style.animation = 'none'; // reset animation
            // Trigger reflow
            void boothResultCard.offsetWidth;
            boothResultCard.style.animation = 'fadeIn 0.4s ease';

            let resultMessage = '';

            // 1. Known City Matching
            if (query.includes('delhi')) {
                resultMessage = 'Nearest polling booth: Public Library, Connaught Place';
            } else if (query.includes('mumbai')) {
                resultMessage = 'Nearest polling booth: Community Center, Bandra';
            } else if (query.includes('bangalore') || query.includes('bengaluru')) {
                resultMessage = 'Nearest polling booth: Government School, Whitefield';
            } else if (query.includes('kolkata')) {
                resultMessage = 'Nearest polling booth: Town Hall, Park Street';
            }
            // 2. State-Level Matching
            else if (query.includes('west bengal') || query.includes('karnataka') || query.includes('maharashtra')) {
                resultMessage = 'Polling booths are assigned based on constituency. Please check official sources for exact location.';
            }
            // 3. Rural/Village Matching
            else if (query.includes('village') || query.includes('rural') || query.includes('panchayat')) {
                resultMessage = 'Visit your nearest government school or panchayat office for voting.';
            }
            // 4. Fallback for unrecognized inputs
            else {
                resultMessage = 'Please check the official Election Commission website for accurate polling booth details.';
            }

            // Output Result
            boothResultTitle.textContent = "Booth Information";
            boothResultTitle.style.color = "var(--primary-color)";

            boothResultDetails.innerHTML = `
                <p style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-main); font-weight: 500;">
                    ${resultMessage}
                </p>
                <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem; background-color: rgba(37, 99, 235, 0.05); padding: 1rem; border-radius: 8px;">
                    <p style="font-size: 0.95rem; color: var(--text-muted); font-style: italic; font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                        <span aria-hidden="true">ℹ️</span> This is a simulated result for demonstration purposes. Exact polling booth details are determined by the Election Commission.
                    </p>
                </div>
            `;
        }, 800); // 800ms delay to feel like a real search
    }

    findBoothBtn.addEventListener('click', searchPollingBooth);
    boothLocationInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchPollingBooth();
        }
    });
}
