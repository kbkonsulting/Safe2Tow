# Safe2Tow: AI Towing Guide

Built by tow operators for tow operators, Safe2Tow is an expert AI co-pilot trained by towing professionals. This app provides instant, professional-grade towing procedures by synthesizing manufacturer data with field-tested knowledge, ensuring safe and accurate guidance for any vehicle.

## Key Features

- **AI-Powered Search**: Get detailed towing procedures by searching Year/Make/Model or VIN.
- **Image Recognition (Pro)**: Identify vehicles and extract VINs by snapping a photo.
- **Drivetrain-Specific Logic**: Expert guidance for FWD, RWD, AWD/4WD, and modern EV/Hybrid systems.
- **"What the Guys Say" (Pro)**: Access a knowledge base of anecdotal, field-tested advice from veteran operators.
- **Responsive Design**: A clean, accessible UI with light/dark modes.

## Tech Stack

| Category      | Technology                                    | Purpose                                                 |
|---------------|-----------------------------------------------|---------------------------------------------------------|
| **Frontend**  | React, TypeScript, Tailwind CSS               | For a modern, type-safe, and rapidly-styled UI.         |
| **AI**        | Google Gemini API (`gemini-2.5-flash`)        | Core intelligence for vehicle and towing analysis.      |

---

## Developer Mode

This application runs in a self-contained "Test Mode," which does not require any backend services like Firebase or Stripe. 

- **Account Switching**: Use the "Change" button in the header to open a modal that lets you instantly switch between "Free" and "Pro" account modes.
- **Pro Features**: When in "Pro" mode, all features like Image Recognition and "What the Guys Say" are unlocked for testing and development.
- **Offline Capability**: The core UI and functionality can run without an active internet connection, though AI-powered searches will require a connection to the Gemini API.

---

## Getting Started

Follow these instructions to set up and run the project locally.

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Gemini API Key

This project requires a Google Gemini API key to function. The key is provided to the application via the `process.env.API_KEY` environment variable. This is typically configured directly in the deployment environment (like Google AI Studio's development environment).

### 3. Running the Project

Once the dependencies are installed and the API key is configured in your environment, you can run the application:

```bash
npm start
```

The application should now be running on `http://localhost:3000`.

---

## Project Structure

```
/
├── components/          # Reusable React components for UI elements.
│   ├── ResultCard.tsx     # Displays the final towing information.
│   ├── SearchBar.tsx      # The main user input for vehicle search.
│   └── ...
├── services/            # Logic for communicating with external APIs.
│   └── geminiService.ts   # Client for making calls to the Google Gemini API.
├── App.tsx              # Main application component, manages state and modals.
├── index.tsx            # React application entry point.
├── types.ts             # Core TypeScript type definitions used across the app.
└── README.md            # This file.
```

---

## Legal Disclaimer

> **IMPORTANT:** This application includes template legal documents (`TermsOfServiceModal.tsx` and `PrivacyPolicyModal.tsx`). These are provided for demonstration purposes only and are **NOT legal advice**.
>
> Before deploying this application in a production environment, you **must**:
> 1.  **Consult with a qualified lawyer** to draft your Terms of Service, Privacy Policy, and any other necessary legal disclaimers.
> 2.  Tailor these documents to your specific business operations, data handling practices, and legal jurisdiction.
>
> Failure to obtain proper legal counsel can expose you and your business to significant liability.