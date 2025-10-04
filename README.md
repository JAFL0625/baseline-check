# 🧠 Baseline Feature Compatibility Checker

**Baseline Feature Compatibility Checker** is a Node.js + Express web app that automatically generates and visualizes browser compatibility reports for modern web features (CSS, HTML, JS, and Web APIs) using [MDN Browser Compat Data](https://github.com/mdn/browser-compat-data).

It was developed as part of the **Baseline Devpost Challenge 2025**.

---

## 🚀 Features
- Auto-generates `baseline-report.json` from the latest MDN dataset.
- Includes compatibility detection for **CSS**, **HTML**, **JavaScript**, and **Web APIs**.
- Search and filter compatibility via a simple web interface.
- Shows results by feature name, compatible browsers, and baseline status.
- Ready to extend with CI (GitHub Actions).

---

## 🛠️ Installation

```bash
git clone https://github.com/JAFL0625/baseline-check.git
cd baseline-check
npm install

## To generate a fresh report and start the server:
npm start

Then open:
👉 http://localhost:3000

---

📂 Project Structure

baseline-check/
├── data/
│   ├── baseline-report.json   # Auto-generated feature compatibility data
│   └── feature-map.json       # Alias map for fuzzy search
├── public/
│   └── index.html             # Frontend UI
├── src/
│   └── routes.js              # Express routes
├── index.js                   # MDN data processing script
├── server.js                  # Express backend
└── package.json

---

## 🧩 Tech Stack

Node.js + Express

MDN Browser Compat Data

JavaScript (ES Modules)

GitHub Actions for CI/CD

---

##🧠 Concept

This project helps developers, QA teams, and educators check which web platform features are fully “Baseline” — meaning safely usable across the most modern browsers — by auto-updating reports directly from MDN’s public dataset.