document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Navigation Logic
    // ==========================================
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    const dashboardCards = document.querySelectorAll('.dashboard-card'); // New dashboard clicks

    function navigateToSection(targetId) {
        // Remove active states from Nav tabs
        navButtons.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        // Explicitly clear ANY rogue active-card states upon navigation so Home always resets accurately
        dashboardCards.forEach(c => c.classList.remove('active-card'));
        
        // Add active state to target top navigation tab
        const targetBtn = document.querySelector(`.nav-btn[data-section="${targetId}"]`);
        if(targetBtn) targetBtn.classList.add('active');
        
        const targetSection = document.getElementById(targetId);
        if(targetSection) targetSection.classList.add('active');
        
        // Scroll screen to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Attach click to top navs
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navigateToSection(btn.getAttribute('data-section'));
        });
    });

    // Attach click to dashboard cards
    dashboardCards.forEach(card => {
        card.addEventListener('click', () => {
            // Apply transient state for click feedback
            dashboardCards.forEach(c => c.classList.remove('active-card'));
            card.classList.add('active-card');
            
            // Navigate (which immediately handles final resets and visibility)
            navigateToSection(card.getAttribute('data-section'));
        });
    });

    // ==========================================
    // 2. Eligibility Widget Logic
    // ==========================================
    const checkEligBtn = document.getElementById('check-eligibility-btn');
    const ageInput = document.getElementById('age-input');
    const eligResult = document.getElementById('eligibility-result');

    checkEligBtn.addEventListener('click', () => {
        const age = parseInt(ageInput.value, 10);
        if (isNaN(age) || age < 0 || ageInput.value.trim() === '') {
            eligResult.textContent = "❌ Please enter a valid numerical age.";
            eligResult.style.color = "var(--error)";
            ageInput.style.borderColor = "var(--error)";
            setTimeout(() => ageInput.style.borderColor = "var(--border)", 1500);
            return;
        }
        if (age >= 18) {
            eligResult.textContent = "✅ You are eligible to vote!";
            eligResult.style.color = "var(--success)";
        } else {
            eligResult.textContent = "❌ Not eligible. You must be 18 or older to vote.";
            eligResult.style.color = "var(--error)";
        }
    });

    // ==========================================
    // 3. Smart Chat Assistant Logic (Hybrid Version)
    // ==========================================
    
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

    // Toggle Floating Chat Popup
    floatingChatBtn.addEventListener('click', () => {
        chatPopup.classList.remove('hidden');
    });

    closeChatBtn.addEventListener('click', () => {
        chatPopup.classList.add('hidden');
    });

    /**
     * Determines the AI response based on keywords.
     */
    function getAssistantResponse(query) {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('vote') || lowerQuery.includes('voting')) {
            return "To vote, you generally need to: 1. Register, 2. Find your polling location, 3. Bring a valid ID, and 4. Cast your ballot. See the 'How to Vote' tab for details!";
        } 
        else if (lowerQuery.includes('eligibility') || lowerQuery.includes('eligible') || lowerQuery.includes('age')) {
            return "Voting eligibility usually requires you to be a citizen and at least 18 years old. You can use the Eligibility tab to enter your age and check.";
        }
        else if (lowerQuery.includes('document')) {
             return "To vote, you are generally required to carry a valid photo ID, such as a Voter ID card, Aadhar card, or Passport.";
        }
        else if (lowerQuery.includes('process') || lowerQuery.includes('election')) {
            return "The election process involves registration, primary elections to select party nominees, campaigning, and the general election.";
        }
        else if (lowerQuery.includes('timeline') || lowerQuery.includes('when')) {
            return "The election timeline spans several months, typically beginning with candidate declarations early in the year and ending with Election Day in November.";
        }
        else if (lowerQuery.includes('hello') || lowerQuery.includes('hi')) {
            return "Hi there! How can I help you understand the election process today?";
        }
        else {
            return "I'm your Election Assistant! I might not know the exact answer to that, but try asking me about 'how to vote', 'eligibility', or the 'election timeline'.";
        }
    }

    /**
     * Appends a message bubble to the popup chat container.
     */
    function addMessageToChat(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
    }

    /**
     * Generic handler for processing queries from either input source.
     */
    function processChatQuery(query) {
        if (!query.trim()) return;

        // Force popup open if a query comes from the mini panel
        chatPopup.classList.remove('hidden');

        // Add user message
        addMessageToChat(query, 'user');
        
        // Save to Google Service Mock
        saveQuery(query);

        // Add temporary 'Processing...' UX state
        const procDiv = document.createElement('div');
        procDiv.classList.add('message', 'ai-message');
        procDiv.innerHTML = '<span style="color:var(--text-muted); font-style:italic;">Processing...</span>';
        chatMessages.appendChild(procDiv);
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });

        // Delayed AI Response
        setTimeout(() => {
            procDiv.remove();
            addMessageToChat(getAssistantResponse(query), 'ai');
        }, 700);
    }

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

    // Connect Popup Controls
    popupSendBtn.addEventListener('click', () => {
        if(handleChatValidation(popupChatInput)) {
            processChatQuery(popupChatInput.value);
            popupChatInput.value = '';
        }
    });
    popupChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if(handleChatValidation(popupChatInput)) {
                processChatQuery(popupChatInput.value);
                popupChatInput.value = '';
            }
        }
    });

    // Connect Mini Panel Controls
    miniSendBtn.addEventListener('click', () => {
        if(handleChatValidation(miniChatInput)) {
            processChatQuery(miniChatInput.value);
            miniChatInput.value = '';
        }
    });
    miniChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if(handleChatValidation(miniChatInput)) {
                processChatQuery(miniChatInput.value);
                miniChatInput.value = '';
            }
        }
    });

    // Connect Suggestion Pills
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            processChatQuery(btn.textContent);
        });
    });

    // ==========================================
    // 4. Simulated Google Service (LocalStorage)
    // ==========================================
    const historyList = document.getElementById('query-history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const STORAGE_KEY = 'election_guide_queries';

    /**
     * Loads previous queries from LocalStorage and renders them.
     */
    function loadHistory() {
        const queries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        historyList.innerHTML = '';
        
        if (queries.length === 0) {
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
        queries.forEach(q => {
            const li = document.createElement('li');
            li.textContent = `"${q}"`;
            historyList.appendChild(li);
        });
    }

    /**
     * Saves a new query to LocalStorage.
     */
    function saveQuery(query) {
        const queries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        queries.unshift(query); // Add to the top of the list
        
        // Keep only top 20 queries to prevent storage bloat
        if (queries.length > 20) queries.pop();
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
        loadHistory(); // Refresh UI
    }

    // Clear history feature
    clearHistoryBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear your query history?")) {
            localStorage.removeItem(STORAGE_KEY);
            loadHistory();
        }
    });

    // Initial load of history on startup
    loadHistory();

    // ==========================================
    // 5. Personalized Voting Guide Logic
    // ==========================================
    const GUIDE_STORAGE_KEY = 'election_guide_responses';

    // Guide DOM Elements
    const guideIntro = document.getElementById('guide-intro');
    const guideQ1 = document.getElementById('guide-q1');
    const guideQ2 = document.getElementById('guide-q2');
    const guideQ3 = document.getElementById('guide-q3');
    const guideResult = document.getElementById('guide-result');
    const allGuideSteps = [guideIntro, guideQ1, guideQ2, guideQ3, guideResult];

    // Inputs & Buttons
    const startGuideBtn = document.getElementById('start-guide-btn');
    const guideAgeInput = document.getElementById('guide-age');
    const guideNext1Btn = document.getElementById('guide-next-1');
    const guideQ2Options = document.querySelectorAll('#guide-q2 .option-btn');
    const guideQ3Options = document.querySelectorAll('#guide-q3 .option-btn');
    const restartGuideBtn = document.getElementById('restart-guide-btn');
    
    const resultTitle = document.getElementById('result-title');
    const resultContent = document.getElementById('result-content');

    // Guide State
    let guideResponses = {
        age: null,
        firstTime: null,
        hasVoterId: null
    };

    /**
     * Show only the target step element.
     */
    function showGuideStep(stepElement) {
        allGuideSteps.forEach(step => step.classList.remove('active-step'));
        stepElement.classList.add('active-step');
    }

    /**
     * Persist to LocalStorage.
     */
    function saveGuideState() {
        localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify(guideResponses));
    }

    /**
     * Load from LocalStorage if present.
     */
    function loadGuideState() {
        const saved = localStorage.getItem(GUIDE_STORAGE_KEY);
        if (saved) {
            guideResponses = JSON.parse(saved);
        }
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
     * Set up listeners for the Interactive Guide.
     */
    function initGuide() {
        const introText = document.getElementById('guide-intro-text');
        const introResetBtn = document.getElementById('intro-reset-btn');

        // Start / Resume clicking logic
        startGuideBtn.addEventListener('click', () => {
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
        });

        // Step 1: Age Submission
        guideNext1Btn.addEventListener('click', () => {
            const age = parseInt(guideAgeInput.value, 10);
            if (isNaN(age) || age < 0) {
                alert("Please enter a valid age.");
                return;
            }
            
            guideResponses.age = age;
            saveGuideState();

            // Direct result if minor, don't ask Q2/Q3 to save their time
            if (age < 18) {
                evaluateGuideResult();
            } else {
                showGuideStep(guideQ2);
            }
        });

        // Step 2: First-Time Selection
        guideQ2Options.forEach(btn => {
            btn.addEventListener('click', () => {
                guideResponses.firstTime = btn.getAttribute('data-value');
                saveGuideState();
                showGuideStep(guideQ3);
            });
        });

        // Step 3: Voter ID Selection
        guideQ3Options.forEach(btn => {
            btn.addEventListener('click', () => {
                guideResponses.hasVoterId = btn.getAttribute('data-value');
                saveGuideState();
                evaluateGuideResult();
            });
        });

        function resetGuideData() {
            guideResponses = { age: null, firstTime: null, hasVoterId: null };
            guideAgeInput.value = '';
            localStorage.removeItem(GUIDE_STORAGE_KEY);
            
            // Reset intro UI
            introText.textContent = "Get a step-by-step personalized guide on how to prepare for voting based on your details.";
            startGuideBtn.textContent = "Start My Voting Guide";
            introResetBtn.style.display = 'none';
        }

        // Restart Guide
        restartGuideBtn.addEventListener('click', () => {
            resetGuideData();
            showGuideStep(guideIntro);
        });

        // Reset Data Button in Intro
        introResetBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset your saved guide data?")) {
                resetGuideData();
            }
        });

        // Welcome back functionality on reload:
        loadGuideState();
        if (guideResponses.age !== null) {
            guideAgeInput.value = guideResponses.age;
            
            // Activate the Welcome Back message instead of auto-skipping
            introText.innerHTML = "<strong>Welcome back, continue your guide.</strong>";
            startGuideBtn.textContent = "Resume My Guide";
            introResetBtn.style.display = 'inline-block';
        }
    }

    initGuide();

    // ==========================================
    // 6. Polling Booth Locator Logic
    // ==========================================
    const boothLocationInput = document.getElementById('booth-location-input');
    const findBoothBtn = document.getElementById('find-booth-btn');
    const boothResultCard = document.getElementById('booth-result');
    const boothResultTitle = document.getElementById('booth-result-title');
    const boothResultDetails = document.getElementById('booth-result-details');

    /**
     * Enhanced Simulation Logic for finding polling booths based on intelligent matching.
     */
    function searchPollingBooth() {
        let originalQuery = boothLocationInput.value.trim();
        let query = originalQuery.toLowerCase();
        
        // Normalize specific inputs
        if (query === 'wb') query = 'west bengal';
        else if (query === 'mh') query = 'maharashtra';
        else if (query === 'ka') query = 'karnataka';

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
        findBoothBtn.textContent = "Processing...";
        findBoothBtn.disabled = true;

        setTimeout(() => {
            findBoothBtn.textContent = "Search";
            findBoothBtn.disabled = false;
            
            boothResultCard.style.display = 'block';
            boothResultCard.style.animation = 'none'; // reset
            setTimeout(() => boothResultCard.style.animation = 'fadeIn 0.4s ease', 10);

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
                <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1rem;">
                    <p style="font-size: 0.9rem; color: var(--text-muted); font-style: italic;">
                        * Note: Exact polling booth details are determined by the Election Commission of India.
                    </p>
                </div>
            `;
        }, 600); // end of processing delay
    }

    findBoothBtn.addEventListener('click', searchPollingBooth);
    boothLocationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPollingBooth();
    });
});
