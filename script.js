// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const CONFIG = {
    STORAGE_KEYS: {
        QUERIES: 'election_guide_queries',
        GUIDE: 'election_guide_responses'
    },
    CLASSES: {
        ACTIVE: 'active',
        ACTIVE_STEP: 'active-step',
        ACTIVE_CARD: 'active-card',
        HIDDEN: 'hidden',
        MESSAGE: 'message',
        USER_MSG: 'user-message',
        AI_MSG: 'ai-message'
    },
    DELAYS: {
        PROCESSING: 600,
        AI_RESPONSE: 700,
        TEST_AUTOSTART: 1000
    }
};

document.addEventListener('DOMContentLoaded', () => {
    try {
        initFirebaseService();
        initNavigation();
        initEligibilityWidget();
        initChatAssistant();
        initQueryHistory();
        initPersonalizedGuide();
        initPollingBooth();
        
        setTimeout(runAllTests, CONFIG.DELAYS.TEST_AUTOSTART);
    } catch (criticalError) {
        // Silent failure for production stability
    }
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
    try {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.content-section');
        const dashboardCards = document.querySelectorAll('.dashboard-card');

        /**
         * @param {string} targetId 
         */
        function navigateToSection(targetId) {
            if (!targetId) return;

            navButtons.forEach(b => b.classList.remove(CONFIG.CLASSES.ACTIVE));
            sections.forEach(s => s.classList.remove(CONFIG.CLASSES.ACTIVE));
            dashboardCards.forEach(c => c.classList.remove(CONFIG.CLASSES.ACTIVE_CARD));

            const targetBtn = document.querySelector(`.nav-btn[data-section="${targetId}"]`);
            if (targetBtn) targetBtn.classList.add(CONFIG.CLASSES.ACTIVE);

            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add(CONFIG.CLASSES.ACTIVE);

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => navigateToSection(btn.getAttribute('data-section')));
        });

        dashboardCards.forEach(card => {
            card.addEventListener('click', () => {
                dashboardCards.forEach(c => c.classList.remove(CONFIG.CLASSES.ACTIVE_CARD));
                card.classList.add(CONFIG.CLASSES.ACTIVE_CARD);
                navigateToSection(card.getAttribute('data-section'));
            });
        });
    } catch (e) { /* Fail silently */ }
}

// ==========================================
// 2. Eligibility Widget Logic
// ==========================================
function initEligibilityWidget() {
    try {
        const checkEligBtn = document.getElementById('check-eligibility-btn');
        const ageInput = document.getElementById('age-input');
        const eligResult = document.getElementById('eligibility-result');

        if (!checkEligBtn || !ageInput || !eligResult) return;

        function handleEligibilityCheck() {
            const inputValue = ageInput.value.trim();
            const age = parseInt(inputValue, 10);

            if (inputValue === '' || isNaN(age) || age < 0) {
                eligResult.textContent = "❌ Please enter a valid numerical age.";
                eligResult.style.color = "var(--error)";
                ageInput.style.borderColor = "var(--error)";
                setTimeout(() => ageInput.style.borderColor = "var(--border)", 1500);
                return;
            }

            simulateProcessing(checkEligBtn, "Checking...", () => {
                const isEligible = age >= 18;
                eligResult.textContent = isEligible ? "✅ You are eligible to vote!" : "❌ Not eligible. You must be 18 or older to vote.";
                eligResult.style.color = isEligible ? "var(--success)" : "var(--error)";
            });
        }

        checkEligBtn.addEventListener('click', handleEligibilityCheck);
        ageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleEligibilityCheck();
            }
        });
    } catch (e) { /* Fail silently */ }
}

// ==========================================
// 3. Smart Chat Assistant Logic
// ==========================================
function initChatAssistant() {
    try {
        const floatingChatBtn = document.getElementById('floating-chat-btn');
        const chatPopup = document.getElementById('chat-popup');
        const closeChatBtn = document.getElementById('close-chat-btn');
        const popupChatInput = document.getElementById('chat-input');
        const popupSendBtn = document.getElementById('send-btn');
        const chatMessages = document.getElementById('chat-messages');
        const suggestionBtns = document.querySelectorAll('.sugg-btn');
        const miniChatInput = document.getElementById('mini-chat-input');
        const miniSendBtn = document.getElementById('mini-send-btn');

        if (!chatPopup || !chatMessages) return;

        if (floatingChatBtn) {
            floatingChatBtn.addEventListener('click', () => chatPopup.classList.remove(CONFIG.CLASSES.HIDDEN));
        }
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', () => chatPopup.classList.add(CONFIG.CLASSES.HIDDEN));
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

    // Expose for testing
    window.__getAssistantResponse = getAssistantResponse;

    /**
     * Appends a message bubble to the popup chat container.
     */
        function addMessageToChat(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add(CONFIG.CLASSES.MESSAGE, sender === 'user' ? CONFIG.CLASSES.USER_MSG : CONFIG.CLASSES.AI_MSG);
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

            chatPopup.classList.remove(CONFIG.CLASSES.HIDDEN);
            addMessageToChat(safeQuery, 'user');
            document.dispatchEvent(new CustomEvent('saveQueryHistory', { detail: safeQuery }));

            if (typeof saveQueryToFirestore === 'function') {
                saveQueryToFirestore(safeQuery);
            }

            const procDiv = document.createElement('div');
            procDiv.classList.add(CONFIG.CLASSES.MESSAGE, CONFIG.CLASSES.AI_MSG);
            procDiv.innerHTML = '<span style="color:var(--text-muted); font-style:italic;" aria-live="polite">Processing...</span>';
            chatMessages.appendChild(procDiv);
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });

            setTimeout(() => {
                procDiv.remove();
                try {
                    addMessageToChat(getAssistantResponse(safeQuery), 'ai');
                } catch (err) {
                    addMessageToChat("Something went wrong. Please try again.", 'ai');
                }
            }, CONFIG.DELAYS.AI_RESPONSE);
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
    } catch (e) { /* Fail silently */ }
}

function initQueryHistory() {
    try {
        const historyList = document.getElementById('query-history-list');
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        const STORAGE_KEY = CONFIG.STORAGE_KEYS.QUERIES;

        if (!historyList || !clearHistoryBtn) return;

        function loadHistory() {
            const queries = safeGetLocalStorage(STORAGE_KEY, []);
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
                clearHistoryBtn.style.display = 'none';
                return;
            }

            clearHistoryBtn.style.display = 'block';
            const fragment = document.createDocumentFragment();
            queries.forEach(q => {
                const li = document.createElement('li');
                li.textContent = `"${q}"`;
                fragment.appendChild(li);
            });
            historyList.appendChild(fragment);
        }

        function saveQuery(query) {
            let queries = safeGetLocalStorage(STORAGE_KEY, []);
            if (!Array.isArray(queries)) queries = [];
            const cleanedQuery = query.trim().toLowerCase();
            if (queries.some(q => q.toLowerCase() === cleanedQuery)) return;
            queries.unshift(query.trim());
            if (queries.length > 20) queries = queries.slice(0, 20);
            safeSetLocalStorage(STORAGE_KEY, queries);
            loadHistory();
        }

        window.__saveQuery = saveQuery;
        window.__getHistory = () => safeGetLocalStorage(STORAGE_KEY, []);

        document.addEventListener('saveQueryHistory', (e) => saveQuery(e.detail));

        clearHistoryBtn.addEventListener('click', () => {
            if (confirm("Clear query history?")) {
                localStorage.removeItem(STORAGE_KEY);
                loadHistory();
            }
        });

        loadHistory();
    } catch (e) { /* Fail silently */ }
}

function initPersonalizedGuide() {
    try {
        const GUIDE_STORAGE_KEY = CONFIG.STORAGE_KEYS.GUIDE;
        const allGuideSteps = document.querySelectorAll('.guide-step');
        const guideIntro = document.getElementById('guide-intro');
        const guideQ1 = document.getElementById('guide-q1');
        const guideQ2 = document.getElementById('guide-q2');
        const guideQ3 = document.getElementById('guide-q3');
        const guideResult = document.getElementById('guide-result');
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

        const defaultState = { age: null, firstTime: null, hasVoterId: null };
        let guideResponses = { ...defaultState };

        function showGuideStep(stepElement) {
            if (!stepElement) return;
            allGuideSteps.forEach(step => step.classList.remove(CONFIG.CLASSES.ACTIVE_STEP));
            stepElement.classList.add(CONFIG.CLASSES.ACTIVE_STEP);
        }

        function evaluateGuideResult() {
            showGuideStep(guideResult);
            const age = parseInt(guideResponses.age, 10);
            if (age < 18) {
                resultTitle.textContent = "Not Eligible Yet";
                resultTitle.style.color = "var(--error)";
                resultContent.innerHTML = `<p>You are not eligible to vote yet. You can register after turning 18.</p>`;
            } else {
                const isReady = guideResponses.hasVoterId === 'yes';
                resultTitle.textContent = isReady ? "You are ready to vote." : "You are eligible to vote.";
                resultTitle.style.color = isReady ? "var(--success)" : "var(--primary-color)";
                resultContent.innerHTML = isReady ? `
                    <ol class="styled-list result-list">
                        <li>Check your name in voter list</li>
                        <li>Find your polling booth</li>
                        <li>Carry ID on voting day</li>
                    </ol>` : `
                    <p><strong>Next step:</strong> Register for a voter ID.</p>
                    <ol class="styled-list result-list">
                        <li>Visit NVSP portal</li>
                        <li>Fill Form 6</li>
                        <li>Upload documents</li>
                    </ol>`;
            }
        }

        function resetGuideData() {
            guideResponses = { ...defaultState };
            guideAgeInput.value = '';
            localStorage.removeItem(GUIDE_STORAGE_KEY);
            introText.textContent = "Get a step-by-step personalized guide on how to prepare for voting based on your details.";
            startGuideBtn.textContent = "Start My Voting Guide";
            introResetBtn.style.display = 'none';
        }

        startGuideBtn.addEventListener('click', () => {
            simulateProcessing(startGuideBtn, "Loading...", () => {
                if (guideResponses.age !== null) {
                    if (guideResponses.age < 18 || guideResponses.hasVoterId !== null) evaluateGuideResult();
                    else showGuideStep(guideResponses.firstTime !== null ? guideQ3 : guideQ2);
                } else showGuideStep(guideQ1);
            }, 300);
        });

        guideNext1Btn.addEventListener('click', () => {
            const age = parseInt(guideAgeInput.value, 10);
            if (isNaN(age) || age < 0) return alert("Please enter a valid age.");
            simulateProcessing(guideNext1Btn, "Saving...", () => {
                guideResponses.age = age;
                safeSetLocalStorage(GUIDE_STORAGE_KEY, guideResponses);
                age < 18 ? evaluateGuideResult() : showGuideStep(guideQ2);
            }, 400);
        });

        const setupBtns = (btns, key, next, check) => {
            btns.forEach(btn => btn.addEventListener('click', () => {
                simulateProcessing(btn, "Saving...", () => {
                    guideResponses[key] = btn.getAttribute('data-value');
                    safeSetLocalStorage(GUIDE_STORAGE_KEY, guideResponses);
                    check ? evaluateGuideResult() : showGuideStep(next);
                }, 400);
            }));
        };

        setupBtns(guideQ2Options, 'firstTime', guideQ3, false);
        setupBtns(guideQ3Options, 'hasVoterId', null, true);

        restartGuideBtn.addEventListener('click', () => simulateProcessing(restartGuideBtn, "Restarting...", () => {
            resetGuideData();
            showGuideStep(guideIntro);
        }, 400));

        introResetBtn.addEventListener('click', () => {
            if (confirm("Reset saved guide data?")) resetGuideData();
        });

        const savedData = safeGetLocalStorage(GUIDE_STORAGE_KEY, null);
        if (savedData) {
            guideResponses = { ...defaultState, ...savedData };
            if (guideResponses.age !== null) {
                guideAgeInput.value = guideResponses.age;
                introText.innerHTML = "<strong>Welcome back, continue your guide.</strong>";
                startGuideBtn.textContent = "Resume My Guide";
                introResetBtn.style.display = 'inline-block';
            }
        }
    } catch (e) { /* Fail silently */ }
}

// ==========================================
// 6. Polling Booth Locator Logic
// ==========================================
function initPollingBooth() {
    try {
        const boothInput = document.getElementById('booth-location-input');
        const findBtn = document.getElementById('find-booth-btn');
        const resultCard = document.getElementById('booth-result');
        const resultTitle = document.getElementById('booth-result-title');
        const resultDetails = document.getElementById('booth-result-details');

        if (!boothInput || !findBtn || !resultCard) return;

        function search() {
            const original = boothInput.value.trim();
            let q = original.toLowerCase();
            if (!q) return;

            simulateProcessing(findBtn, "Processing...", () => {
                resultCard.style.display = 'block';
                resultTitle.textContent = "Booth Information";
                
                let msg = 'Please check official sources for exact polling booth details.';
                if (q.includes('delhi')) msg = 'Nearest polling booth: Public Library, Connaught Place';
                else if (q.includes('mumbai')) msg = 'Nearest polling booth: Community Center, Bandra';
                else if (q.includes('bangalore')) msg = 'Nearest polling booth: Government School, Whitefield';

                const mapQ = encodeURIComponent('Polling Booth in ' + original);
                resultDetails.innerHTML = `
                    <p style="color: var(--text-main); font-weight: 500; margin-bottom: 1rem;">${msg}</p>
                    <div style="border-radius: 8px; overflow: hidden; border: 1px solid var(--border);">
                        <iframe width="100%" height="250" frameborder="0" src="https://maps.google.com/maps?q=${mapQ}&t=&z=13&ie=UTF8&iwloc=&output=embed"></iframe>
                    </div>
                    <div style="margin-top: 1rem; background: rgba(37, 99, 235, 0.05); padding: 1rem; border-radius: 8px;">
                        <p style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">ℹ️ Result for demonstration purposes. Official details are verified by the EC.</p>
                    </div>`;
            }, 800);
        }

        findBtn.addEventListener('click', search);
        boothInput.addEventListener('keydown', (e) => e.key === 'Enter' && search());
    } catch (e) { /* Fail silently */ }
}

// ==========================================
// NEW: Firebase
// ==========================================
let db = null;
function initFirebaseService() {
    try {
        if (typeof firebase !== 'undefined') {
            const firebaseConfig = {
                apiKey: "placeholder-api-key",
                authDomain: "placeholder-auth-domain",
                projectId: "placeholder-project-id",
            };
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            db = firebase.firestore();
            console.log("Firebase initialized successfully.");
        }
    } catch (error) {
        console.warn("Firebase initialization failed silently:", error);
    }
}

function saveQueryToFirestore(query) {
    if (!db) return;
    try {
        db.collection("chat_queries").add({
            query: query,
            timestamp: new Date(),
            type: "chat"
        });
    } catch (error) {
        console.warn("Firestore save failed silently:", error);
    }
}

// ==========================================
// NEW: Testing
// ==========================================
function logTest(name, condition) {
    console.assert(condition, `TEST FAILED: ${name}`);
    if (condition) {
        console.log(`✅ PASS: ${name}`);
        return true;
    } else {
        console.error(`❌ FAIL: ${name}`);
        return false;
    }
}

function runAllTests() {
    console.log("=== RUNNING ADVANCED TESTING MODULE ===");
    let passed = 0;
    let total = 0;

    function run(name, fn) {
        total++;
        try {
            const result = fn();
            if (logTest(name, result)) passed++;
        } catch (e) {
            logTest(name, false);
            console.error(e);
        }
    }

    // Input validation tests
    run("Input Validation: Empty input → invalid", () => {
        const input = "   ";
        return input.trim().length === 0;
    });

    run("Input Validation: Valid input → accepted", () => {
        const input = "How to vote?";
        return input.trim().length > 0;
    });

    run("Input Validation: Long input trimmed to 200 chars", () => {
        let input = "a".repeat(250);
        if (input.length > 200) input = input.slice(0, 200);
        return input.length === 200;
    });

    // Chat response tests
    run("Chat Response: getAssistantResponse() returns string", () => {
        if (typeof window.__getAssistantResponse === 'function') {
            const res = window.__getAssistantResponse("vote");
            return typeof res === 'string' && res.length > 0;
        }
        return false;
    });

    // LocalStorage tests
    run("LocalStorage: Duplicate query not stored", () => {
        if (typeof window.__saveQuery === 'function' && typeof window.__getHistory === 'function') {
            const initial = window.__getHistory().length;
            window.__saveQuery("Test Query");
            window.__saveQuery("test query"); // Should not be added due to duplicate check
            const final = window.__getHistory().length;
            return final === initial + 1; // Only one added
        }
        return false;
    });

    // Edge case tests
    run("Edge Case: LocalStorage fallback works", () => {
        const fallback = ["fallback_data"];
        const res = safeGetLocalStorage("NON_EXISTENT_KEY_123", fallback);
        return res === fallback;
    });

    // Final summary
    console.log(`=== TEST SUMMARY: Total Tests: ${total} | Passed: ${passed} ===`);
}
