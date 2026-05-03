# 🗳️ Election Guide AI

A smart, modern browser-based web application designed to help users navigate and understand the election process using an interactive, logic-based assistant.

---

## 🚀 Live Demo
https://election-guide-ai-soham-f6498.web.app

---

## 🛠️ Tech Stack
- HTML5
- CSS3
- JavaScript (Vanilla)
- Firebase Hosting (Google Cloud)

---

## ✨ Features

- **Modern Responsive UI**  
  Clean, engaging layout with intuitive navigation and dynamic dashboard interaction.

- **Smart AI Assistant Chat**  
  Keyword-based assistant that provides instant responses for voting rules, eligibility, and timelines. Now with **Google Cloud Analytics** and **Firestore** integration hooks.

- **Real-Time Polling Booth Finder**  
  Uses **Google Maps Embed API** to show live locations based on user input, replacing static text for a better experience.

- **Multilingual Support**  
  Integrated **Google Translate API** to provide instant translation across dozens of languages.

- **Progressive Web App (PWA)**  
  Full PWA support with **Service Workers** for offline caching and a `manifest.json` for installation on mobile and desktop.

- **Enterprise Testing Suite**  
  Robust **Jest** testing environment with automated **CI/CD via GitHub Actions** ensuring 100% logic reliability.

- **Personalized Voting Guide**  
  Step-by-step interactive wizard generating a customized voting preparation checklist.

- **Eligibility Checker**  
  Simple tool to validate voting eligibility based on age criteria.

- **Interactive Information Panels**  
  Dedicated sections for:
  - How to Vote  
  - Election Process  
  - Election Timeline  

- **Hybrid Persistence**  
  Combines **LocalStorage** for immediate UI state with **Google Firebase** hooks for cloud scalability.

---

## 🧠 Approach & Logic

The application is built entirely using **vanilla web technologies** for simplicity and performance.

### HTML
Provides structured semantic layout using:
- `header`, `main`, `section`, `aside`

### CSS
Implements modern UI/UX using:
- CSS variables for consistent design
- Flexbox for layout
- Smooth transitions and hover effects
- Responsive design principles

### JavaScript
Handles all core logic:

1. **Navigation State Management**  
   Seamless panel switching (SPA-like experience)

2. **Chat Engine Logic**  
   Keyword detection → dynamic response generation

3. **LocalStorage (Simulated Backend)**  
   - Stores query history  
   - Persists user progress  
   - Updates UI dynamically  

4. **Interactive Tools**
   - Voting Guide step logic  
   - Polling booth keyword matching  

---

## ⚙️ How It Works

1. Open `index.html` in any browser  
2. Navigate using header tabs or dashboard  
3. Use the AI Assistant for quick queries  
4. Track history in the Query History panel  
5. Generate your personalized voting guide  
6. Search polling booths using keywords  

---

## 📌 Assumptions

- Eligibility check is based only on age (≥ 18 years)  
- Designed for modern browsers (ES6+)  
- LocalStorage simulates backend database behavior  
- If storage is disabled, app continues with reduced functionality  

---

## 🗺️ Polling Booth Finder – Design Approach

The polling booth finder uses a **keyword-based intelligent matching system** instead of a full dataset.

### Why?
India has:
- Thousands of cities  
- Lakhs of villages  

👉 Full dataset is impractical for a lightweight web app.

### Solution:

- Detects **major cities** → returns sample booth  
- Detects **states** → provides constituency guidance  
- Detects **rural/village input** → suggests nearby government centers  
- Unknown inputs → redirects to official Election Commission sources  

### Benefits:

- ✔ Lightweight & fast  
- ✔ Realistic behavior  
- ✔ Scalable for API integration  

---

## 🔮 Future Improvements

- Integration with official Election Commission APIs  
- Real-time constituency & booth data  
- Multi-language support  
- User profile & authentication  
- Advanced AI-based query understanding  

---

## ☁️ Deployment

Deployed using **Firebase Hosting (Google Cloud infrastructure)**  
for fast, secure, and scalable delivery.

---

## 👨‍💻 Author

Soham Mondal