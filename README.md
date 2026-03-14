# CodeGuard AI – AI Based Code Detection System

CodeGuard AI is a web-based application developed to analyze programming code and estimate whether the code is **AI-generated or written manually**. The project was created as a mini project to explore how artificial intelligence can be used to support **fair programming assessments** in educational environments.

The system allows users to submit code through a simple interface. The submitted code is processed by the backend and analyzed using an AI model to identify patterns commonly found in AI-generated code. The result is then displayed to the user in an easy-to-understand format.

The project demonstrates the integration of **modern web technologies, backend APIs, and AI services** to build a practical application.

---

## Live Application

The project has been deployed and can be accessed here:

https://codeguard-ai-pvls.onrender.com

---

## GitHub Repository

https://github.com/Wi-Fighter2006/AI-Based-Code-Detector-Mini-Project-

---

## Problem Statement

With the increasing availability of AI tools capable of generating programming solutions, it has become challenging for educators to determine whether a submitted program was written by a student or generated using AI assistance.

This project attempts to address this issue by providing a system that analyzes coding patterns and structure to estimate the likelihood of AI-generated code.

---

## Objectives of the Project

• Develop a web application capable of analyzing code submissions  
• Explore how AI models can help identify AI-generated programming patterns  
• Create a simple and user-friendly interface for submitting code  
• Build a complete system including frontend, backend, and deployment  
• Demonstrate the practical use of modern web development technologies  

---

## Key Features

• Web interface for submitting code  
• AI-based analysis of code patterns  
• Quick response with detection results  
• Clean and simple user interface  
• Cloud deployment for online accessibility  

---

## Technologies Used

### Frontend
React  
Vite  
TypeScript  
Tailwind CSS  

### Backend
Node.js  
Express.js  

### Database
SQLite (better-sqlite3)

### AI Integration
Google Generative AI API

### Deployment
Render Cloud Platform

---

## System Workflow

1. The user enters or pastes code into the application interface.  
2. The frontend sends the code to the backend server.  
3. The backend processes the input and sends it to the AI analysis service.  
4. The AI model evaluates the structure and patterns of the code.  
5. The system returns a result indicating the likelihood of AI-generated code.

---

## Project Structure

AI-Based-Code-Detector-Mini-Project  
│  
├── components        Frontend UI components  
├── src               Main React application files  
├── server.ts         Backend server implementation  
├── index.html        Application entry page  
├── package.json      Project dependencies and scripts  
├── tsconfig.json     TypeScript configuration  
├── vite.config.ts    Vite build configuration  
└── README.md  

---

## Installation and Setup

### Clone the repository

git clone https://github.com/Wi-Fighter2006/AI-Based-Code-Detector-Mini-Project-.git

### Navigate to the project directory

cd AI-Based-Code-Detector-Mini-Project-

### Install dependencies

npm install

### Create environment variables

Create a `.env` file and add your API key:

GOOGLE_API_KEY=your_api_key_here

### Run the application

npm run dev

The application will start on:

http://localhost:3000

---

## Deployment

The project has been deployed using **Render**, which allows the application to run online without requiring local setup.

Deployment steps included:

1. Uploading the project to GitHub  
2. Connecting the repository to Render  
3. Configuring environment variables  
4. Deploying the Node.js service  

---

## Future Improvements

• Support for additional programming languages  
• More advanced AI detection techniques  
• Code similarity comparison between submissions  
• Instructor dashboard for monitoring multiple submissions  
• Improved analytics and reporting  

---

## Project Team

This project was developed by a team of three members:

**Piyush Choudhary**  
Project Leader – Frontend Development  
Responsible for designing and implementing the user interface.

**Prasant Singh**  
Backend Development  
Worked on server logic, API integration, and code processing.

**Dhananjay Chaudhary**  
Deployment and Integration  
Handled project deployment, system integration, and configuration.

---

## Conclusion

CodeGuard AI demonstrates how modern web development technologies and AI services can be combined to build practical tools for academic environments. The project provided hands-on experience with full-stack development, API integration, and cloud deployment.

---

If you are reviewing this project, we appreciate your time and feedback.
