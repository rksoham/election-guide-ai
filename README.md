# Election Guide AI

A smart, modern browser-based web application designed to help users navigate and understand the election process using an interactive, logic-based assistant. 

## Features
- **Modern Responsive UI**: Clean, engaging layout with an intuitive tab-based navigation menu and a dynamic home dashboard.
- **Smart Assistant Chat**: A built-in chat system that processes user inputs and provides dynamic help related to voting rules, eligibility, and the election timeline.
- **Personalized Voting Guide**: An interactive, step-by-step wizard that creates a tailored voting preparation plan based on user details (age, voter history, ID status).
- **Polling Booth Finder**: A keyword-based simulation tool to help users locate example polling booths based on their city, state, or area.
- **Eligibility Checker Widget**: A direct input tool to check if the user meets the primary age criteria to vote.
- **Interactive Information Panels**: Dedicated sections for 'How to Vote', the 'Election Process', and the 'Election Timeline'.
- **Simulated Cloud Service (Local Storage)**: Fulfills the requirement to store the user’s queries and guide progress by utilizing browser LocalStorage. This simulates a backend database service and allows viewing and clearing of past interactions.

## Approach & Logic
The application uses vanilla web technologies exclusively:

- **HTML (index.html)**: Provides the semantic structural foundation. Distinct informative sections are separated using semantic tags (`header`, `main`, `section`, `aside`).
- **CSS (style.css)**: Implements modern web design principles. It uses CSS Variables for a reliable color scheme, flexbox for structural layout management, dynamic natural content flow, and smooth animations to improve the UX (hover states, fading transitions, anchored sidebars).
- **JavaScript (script.js)**: Modularly handles the core application features:
  1. *Navigation State*: Hides and shows panels as users click navigation tabs or dashboard cards, providing a SPA-like app experience.
  2. *Chat Logic*: Analyzes keywords in user input to resolve a logical text response from the assistant. Supports both a mini chat panel and a floating chat popup.
  3. *Local Storage (Simulated Google Service)*: Intercepts user queries and saves them into a local JSON array. It renders the history live to the DOM. Also persists the state of the Personalized Voting Guide.
  4. *Interactive Tools*: Manages the step-by-step logic of the Voting Guide and the keyword matching for the Polling Booth Finder.

## How it works
1. **Run Locally**: Since it uses vanilla client-side technologies, simply open `index.html` in any web browser. No compilation or local dev server is required.
2. **Navigating**: Click the top header tabs or the home dashboard cards to seamlessly swap between static information panels and interactive tools.
3. **Conversing**: On the right side panel or via the floating chat widget, interact with the Election Guide AI. Ask simple questions like "How do I vote?" and receive keyword-matched responses.
4. **History Tracking**: Observe your past queries updating in real-time below the chat box under "Query History".
5. **My Guide**: Answer a few quick questions to generate a personalized voting checklist.
6. **Polling Booth**: Search for your city or area to find simulated polling booth information.

## Assumptions
- For the Eligibility Check logic, it is assumed that the only criteria being verified is the user's age (>= 18 years old), and external factors like locale rules, citizenship, or registration status are intentionally bypassed for simplicity.
- The platform presumes a modern ES6+ browser environment.
- The use of browser `localStorage` acts as a stand-in for the requested database/service layer. If the browser blocks local storage data, the history feature and guide persistence will fail gracefully without disrupting core logic.

## Polling Booth Finder – Design Approach

The polling booth finder uses a keyword-based intelligent matching system instead of a full location database.

Due to the vast number of locations across India (states, cities, and villages), it is not practical to include a complete dataset in a lightweight web application.

Instead, the system:

* Identifies major cities and provides sample booth locations.
* Handles state-level queries with constituency-based guidance.
* Supports rural inputs by directing users to nearby government centers.
* Provides fallback responses directing users to official Election Commission resources.

This approach ensures:

* Simplicity and performance.
* Realistic behavior.
* Scalability for future integration with official APIs.
