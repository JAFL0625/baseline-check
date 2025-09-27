\# Baseline-Check API



!\[Baseline Check](https://github.com/JAFL0625/baseline-check/actions/workflows/baseline.yml/badge.svg)



A simple Node.js + Express + SQLite application created as part of the Baseline Check project.  

It demonstrates how to build a small REST API with automated GitHub Actions and a browser-compatibility baseline report.



\## Quick links

\- Latest report: `data/baseline-report.md`



\## 🚀 Features

\- REST API with `GET` and `POST` endpoints for user management.

\- SQLite database for lightweight local storage.

\- GitHub Actions workflow to generate a \*\*baseline-report.json\*\* using MDN browser-compat-data.

\- Automatic commits of the generated report.



---



\## 🛠️ Requirements

\- \[Node.js](https://nodejs.org/) ≥ 18  

\- npm (comes with Node)  

\- SQLite (already included in Node’s sqlite3 package)



---



\## 💻 Installation



```bash

git clone https://github.com/JAFL0625/baseline-check.git

cd baseline-check

npm install



\##▶️ Run the API server

node server.js







Server runs at: http://localhost:3000



API Endpoints

Method	Endpoint	Description	Body (JSON)

GET	/api/users	List all users	—

POST	/api/users	Create a user	{ "name": "Johana", "email": "j@example.com" }



🧪 Quick Test



Using Postman or curl

Create a user:



curl -X POST http://localhost:3000/api/users \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{"name":"Johana","email":"johana@example.com"}'



List all users:



curl http://localhost:3000/api/users



⚙️ GitHub Actions



The workflow .github/workflows/baseline.yml:



Installs dependencies,



Generates data/baseline-report.json (MDN data),



Creates data/baseline-report.md (markdown table),



Commits the outputs back to the repository.



📂 Project Structure



baseline-check/

├─ data/                  # baseline-report.json output

├─ src/

│  ├─ db.js               # SQLite connection

│  └─ routes.js           # API routes

├─ server.js              # Express entry point

├─ index.js               # Baseline report generator

├─ README.md

└─ .github/workflows/     # GitHub Actions workflow









