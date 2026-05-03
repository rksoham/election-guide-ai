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
                "To vote, you generally need to: 1. Register, 2. Find your polling location, 3. Bring a valid ID, and 4. Cast your ballot. See the 'How to Vote' tab for details!",
                "Voting is simple! Ensure you are registered, locate your booth, and carry a valid photo ID.",
                "Make sure you're registered to vote, know your polling station, and have your ID ready for Election Day."
            ],
            eligibility: [
                "Voting eligibility usually requires you to be a citizen and at least 18 years old. Use our Eligibility tab to check!",
                "To be eligible, you must be a citizen of the country and 18 years of age or older.",
                "Generally, any citizen who is 18 or older can vote. Check the Eligibility section for specifics."
            ],
            document: [
                "To vote, you are generally required to carry a valid photo ID, such as a Voter ID card, Aadhar card, or Passport.",
                "Valid IDs typically include your Voter ID, Driving License, Passport, or PAN card.",
                "Make sure to bring an approved photo ID like a Voter ID card when you go to the polling booth."
            ],
            process: [
                "The election process involves registration, primary elections to select party nominees, campaigning, and the general election.",
                "It starts with candidate declarations, moves through primary elections, and concludes with the general election.",
                "Elections involve declaring candidacy, campaigning, holding primaries, and finally the general public vote."
            ],
            timeline: [
                "The election timeline spans several months, typically beginning with candidate declarations early in the year and ending with Election Day in November.",
                "Key dates include early registration, primary votes in spring/summer, and the main Election Day in November.",
                "Check the 'Election Timeline' tab for a detailed month-by-month breakdown of the election cycle."
            ],
            hello: [
                "Hi there! How can I help you understand the election process today?",
                "Hello! Welcome to your Smart Election Assistant. What can I answer for you?",
                "Greetings! Ask me anything about voting, eligibility, or the election process."
            ]
        };

        const getRandomResponse = (arr) => arr[Math.floor(Math.random() * arr.length)];

        if (lowerQuery.includes('vote') || lowerQuery.includes('voting')) return getRandomResponse(responses.vote);
        if (lowerQuery.includes('eligibility') || lowerQuery.includes('eligible') || lowerQuery.includes('age')) return getRandomResponse(responses.eligibility);
        if (lowerQuery.includes('document') || lowerQuery.includes('id')) return getRandomResponse(responses.document);
        if (lowerQuery.includes('process') || lowerQuery.includes('election')) return getRandomResponse(responses.process);
        if (lowerQuery.includes('timeline') || lowerQuery.includes('when')) return getRandomResponse(responses.timeline);
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) return getRandomResponse(responses.hello);

        // Fallback response
        return "I'm your Election Assistant! I might not know the exact answer to that, but try asking me about 'how to vote', 'eligibility', or the 'election timeline'.";
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
            addMessageToChat(getAssistantResponse(safeQuery), 'ai');
        }, 700);
    }

    /**
     * Validates input fields before submission
     */
    function handleChatValidation(inputElement) {
        if (!inputElement.value.trim()) {
            const originalPlaceholder = inputElement.placeholder;
            inputElement.placeholder = "Please enter a message...";
            inputElement.style.borderColor = "var(--error)";
            setTimeout(() => {
                inputElement.style.borderColor = "var(--border)";
                inputElement.placeholder = originalPlaceholder;
            }, 2000);
            return false;
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
        historyList.innerHTML = '';
        
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
        
        queries.unshift(query); // Add to the top of the list
        
        // Keep only top 20 queries to prevent storage bloat
        if (queries.length > 20) queries.pop();
        
        safeSetLocalStorage(STORAGE_KEY, queries);
        loadHistory(); // Refresh UI
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
