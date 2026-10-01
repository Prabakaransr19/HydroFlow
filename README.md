# 💧 HydroFlow
### Web-Based Water Consumption & Billing Management Platform
### *"Because nobody should still be tracking water usage in a notebook in 2026."*

> Built during the **Infosys Springboard Java Full Stack Internship** (Jul. 2026 – Sept. 2026)  
> Where I learned that Spring Boot has more configuration files than I have patience.

---

## 📖 Overview

**HydroFlow** is a full-stack web platform that helps residents and utility administrators track **water consumption** and manage **billing** in one place. It replaces manual, paper-based tracking with a connected system — residents can monitor their usage, and administrators can manage billing cycles and resident records, all backed by a relational database that doesn't forget things the way a clipboard does.

Built as part of a structured Agile internship, with features delivered incrementally across sprints rather than in one heroic, sleep-deprived release.

---

## 🛠️ Tech Stack

*"The enterprise-grade trio that every Java internship eventually leads you to."*

| Layer | Technology | Honest Take |
|---|---|---|
| **Backend** | Java, Spring Boot | Annotations doing more heavy lifting than I expected |
| **Frontend** | React | Components, props, and the eternal question "why isn't it re-rendering" |
| **Database** | PostgreSQL | Rock solid. Never once blamed the user for a syntax error. |
| **Methodology** | Agile (sprint-based) | Stand-ups, sprint boards, and the gentle lie that is "this should only take 2 story points" |

---

## 📂 Project Structure

```
HydroFlow/
├── backend/     # Spring Boot application — APIs, business logic, the data layer
│                # (and an unreasonable number of @Annotation decorations)
├── frontend/    # React application — resident & admin interfaces
├── docs/        # Project documentation (yes, I actually wrote some)
└── .idea/       # IDE configuration (IntelliJ knows all my secrets)
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+ and Maven
- Node.js and npm
- PostgreSQL
- Patience (optional but recommended for Spring Boot projects)

### Backend Setup

```bash
cd backend
# Configure your PostgreSQL connection in application.properties
# (Please don't commit your actual credentials. We've all seen that GitHub post.)
mvn spring-boot:run
```

### Frontend Setup

```bash
cd frontend
npm install
# Watch node_modules grow to a size visible from orbit
npm start
```

---

## 🧭 Development Approach

This project is being built in Agile sprints as part of the Infosys Springboard internship program — requirements, backend APIs, and frontend features are being developed and refined iteratively rather than all at once, with each sprint building on validated groundwork from the last.

Translation: no big-bang releases, no "it'll definitely work in production" moments, just steady, sprint-by-sprint progress and the occasional retrospective where someone politely points out the scope crept again.

---

## 🎓 What This Project Is Teaching Me

- Spring Boot's dependency injection is magic until it isn't, and then it's 45 minutes of staring at a stack trace
- REST API design is 20% logic and 80% deciding what to name the endpoint
- PostgreSQL doesn't judge you for a bad query. It just returns zero rows and lets you sit with that.
- Agile sprints work great right up until "just one more feature" sneaks into sprint planning

---

## 📬 Contact

- **GitHub:** [@Prabakaransr19](https://github.com/Prabakaransr19)
- **Portfolio:** [prabakaran-sr-me](#placeholder)

---

## 📄 License

This project was developed for internship and educational purposes under the Infosys Springboard program.

---

<p align="center">
  <i>Because tracking water usage shouldn't still run on paper registers and guesswork.</i><br><br>
  Built with ☕, too many cups of coffee, 🧾 a healthy respect for billing edge cases, and Spring Boot's endless config files<br><br>
  — Prabakaran, somewhere between a sprint review and a PostgreSQL query that finally worked
</p>
