# Suren Server

This project is the backend server for the Suren application. It is built with Node.js and structured for scalability and maintainability.

---

## 🚀 Development Server

Start the development server:

```bash
yarn dev
```

This will run the application in development mode. The server will automatically reload if you make changes to the source files.

---

## 🏗 Production Server

Start the production server:

```bash
yarn start
```

This will run the server in production mode. Like development mode, the application will automatically reload on changes.

---

## 🧹 Code Style Guide

* All code must follow the formatting rules defined in `.prettierrc`.
* Do **not** use any other format or override the configuration.
* Ensure your **Visual Studio Code** is configured to auto-format code using Prettier with the settings in this file.

---

## 📁 Project Structure

```
project-root/
├── node_modules/           # Installed npm packages
├── src/                    # Application source code
│   ├── controllers/        # Request-response logic
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic and integrations
│   ├── validation/         # Input validation logic
│   └── ...                 # Additional modules (e.g., models, utils)
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore              # Files and folders to ignore in Git
├── .prettierrc             # Prettier code formatter rules
├── debug.log               # Debug log file (should be Git ignored)
├── ecosystem.config.json   # PM2 process management configuration
├── package-lock.json       # Dependency lock file
├── package.json            # Project scripts and metadata
└── README.md               # Project documentation
```

---

## ✅ Requirements

* **Node.js**: v12.x or higher
* **Yarn**: Package manager

---

## 📦 Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd project-root
```

2. Install dependencies:

```bash
yarn install
```

3. Start the server:

```bash
yarn dev
```

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE).
