# Safe2Tow: AI Towing Guide

Built by tow operators for tow operators, Safe2Tow is an expert AI co-pilot trained by towing professionals. This app provides instant, professional-grade towing procedures by synthesizing manufacturer data with field-tested knowledge, ensuring safe and accurate guidance for any vehicle.

This project is architected to be resilient and developer-friendly, featuring graceful degradation that allows the UI to function even without full backend configuration.

## Key Features

- **AI-Powered Search**: Get detailed towing procedures by searching Year/Make/Model or VIN.
- **Image Recognition (Pro)**: Identify vehicles and extract VINs by snapping a photo.
- **Drivetrain-Specific Logic**: Expert guidance for FWD, RWD, AWD/4WD, and modern EV/Hybrid systems.
- **"What the Guys Say" (Pro)**: Access a knowledge base of anecdotal, field-tested advice from veteran operators.
- **Pro Membership**: Unlock advanced features via Stripe integration.
- **Firebase Integration**: Secure user authentication (Email/Password) and data storage with Firestore.
- **Resilient & Responsive Design**: A clean, accessible UI with light/dark modes that functions gracefully even if backend services are not configured.

## Tech Stack

| Category      | Technology                                    | Purpose                                                 |
|---------------|-----------------------------------------------|---------------------------------------------------------|
| **Frontend**  | React, TypeScript, Tailwind CSS               | For a modern, type-safe, and rapidly-styled UI.         |
| **AI**        | Google Gemini API (`gemini-2.5-flash`)        | Core intelligence for vehicle and towing analysis.      |
| **Backend**   | Firebase (Authentication & Firestore)         | Secure user management and data storage.                |
| **Payments**  | Stripe                                        | Securely handling Pro membership subscriptions.         |
| **Architecture**| Graceful Degradation                          | Ensures app remains usable during development/setup.    |

---

## Key Architectural Concepts

### Graceful Degradation & Limited Mode

This application is designed to be resilient. If the necessary environment variables for Firebase or Stripe are not provided, **the app will not crash**. Instead, it enters a "Limited Mode":
- A persistent warning banner is displayed at the top, informing the developer which services are not configured.
- UI elements that depend on the missing services (e.g., "Sign In", "Upgrade to Pro", payment forms) are disabled.
- This allows for focused development on UI components or AI features without requiring a full backend and payment setup, significantly improving the developer experience.

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Setup Checklist

1.  [ ] Clone the repository and install dependencies.
2.  [ ] Create a Firebase project and enable Authentication & Firestore.
3.  [ ] Create a Stripe account to get API keys.
4.  [ ] Set up a simple Node.js backend for Stripe payments.
5.  [ ] Create and populate the `.env` file with your keys.
6.  [ ] Run the Stripe backend server.
7.  [ ] Run the React frontend application.

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root. This file is used to store sensitive keys and configuration settings. Copy the template below into your new `.env` file.

**`.env` file template:**
```
# Your Stripe publishable key (e.g., pk_test_xxxxxxxx)
REACT_APP_STRIPE_PUBLISHABLE_KEY=

# URL for your Stripe backend server (see Step 4)
REACT_APP_STRIPE_BACKEND_URL=http://localhost:4242/api/create-payment-intent

# Your web app's Firebase configuration (see Step 3)
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```
> **Note on Gemini API Key:** The Gemini API key is provided via `process.env.API_KEY`. This is typically configured directly in the deployment environment (like Google AI Studio's development environment) and **does not need to be added to the `.env` file**.

### 3. Firebase Project Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In **Project Settings**, create a new web app (`</>`) to get your `firebaseConfig` object.
3.  Use these values to populate the `REACT_APP_FIREBASE_*` variables in your `.env` file.
4.  **Enable Authentication**: In the Firebase Console, go to **Build** > **Authentication** > **Sign-in method** and enable the **Email/Password** provider.
5.  **Set Up Firestore**: Go to **Build** > **Firestore Database**. Create a new database in **Production mode**.
6.  **Update Security Rules**: Go to the **Rules** tab in Firestore and replace the default rules with the following to secure user data and allow app functionality:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow a logged-in user to create, read, and update their own document.
      allow create, read, update: if request.auth != null && request.auth.uid == userId;
    }
    match /searches/{searchId} {
      allow create; // Allow any user (signed in or not) to log searches
      allow read: if false; // Disallow reading search logs
    }
    match /feedback/{feedbackId} {
      allow create; // Allow any user (signed in or not) to submit feedback
      allow read: if false; // Disallow reading feedback
    }
  }
}
```

### 4. Stripe Payments Backend Setup

Stripe requires a secure backend to create a `PaymentIntent` and prevent fraud. An example Node.js/Express server is provided in this guide.

1.  Sign up for a [Stripe Account](https://dashboard.stripe.com/register) and get your **Publishable Key** and **Secret Key** from the developer dashboard.
2.  Set the `REACT_APP_STRIPE_PUBLISHABLE_KEY` in your `.env` file with your **Publishable Key**.
3.  Create a new directory named `backend` in your project root. Inside `backend`, create a `server.js` file and a `package.json` file.
    - **`backend/package.json`**:
      ```json
      {
        "name": "safe2tow-backend",
        "version": "1.0.0",
        "main": "server.js",
        "scripts": { "start": "node server.js" },
        "dependencies": { "cors": "^2.8.5", "express": "^4.19.2", "stripe": "^15.12.0" }
      }
      ```
    - **`backend/server.js`**:
      ```javascript
      const express = require('express');
      const Stripe = require('stripe');
      const cors = require('cors');

      // IMPORTANT: Use your Stripe Secret Key. Load from environment variables for security.
      const stripe = Stripe(process.env.STRIPE_SECRET_KEY); 

      const app = express();
      // In production, restrict origin to your app's domain
      app.use(cors());
      app.use(express.json());

      app.post('/api/create-payment-intent', async (req, res) => {
        const { name, email } = req.body;
        try {
          let customer = (await stripe.customers.list({ email: email, limit: 1 })).data[0];
          if (!customer) {
            customer = await stripe.customers.create({ name, email });
          }

          const paymentIntent = await stripe.paymentIntents.create({
            customer: customer.id,
            amount: 999, // $9.99 in cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
          });
          res.send({ clientSecret: paymentIntent.client_secret, stripeCustomerId: customer.id });
        } catch (error) {
          res.status(500).send({ error: error.message });
        }
      });

      const PORT = 4242;
      app.listen(PORT, () => console.log(`Node server listening on http://localhost:${PORT}`));
      ```
4.  Install backend dependencies:
    ```bash
    cd backend
    npm install
    cd ..
    ```

### 5. Running the Project

You need to run two processes in separate terminal windows: the backend server and the frontend app.

1.  **Start the Backend Server**:
    ```bash
    # Make sure you are in the 'backend' directory
    cd backend
    # Set your Stripe Secret Key and run the server
    STRIPE_SECRET_KEY=your_stripe_secret_key_here npm start
    ```

2.  **Start the Frontend Application** (in a new terminal):
    ```bash
    # Make sure you are in the project's root directory
    npm start
    ```

The application should now be running on `http://localhost:3000`.

---

## Project Structure

```
/
├── components/          # Reusable React components for UI elements.
│   ├── Accordion.tsx      # A collapsible content panel.
│   ├── AuthModal.tsx      # User sign-in/sign-up form.
│   ├── PaymentModal.tsx   # Stripe payment processing modal.
│   ├── ResultCard.tsx     # Displays the final towing information.
│   ├── SearchBar.tsx      # The main user input for vehicle search.
│   └── ...
├── services/            # Logic for communicating with external APIs and services.
│   ├── authService.ts     # Handles Firebase Authentication (sign-up, sign-in, etc.).
│   ├── databaseService.ts # Manages Firestore database interactions (user profiles, logs).
│   ├── firebase.ts        # Initializes the Firebase app and centralizes configuration.
│   ├── geminiService.ts   # Client for making calls to the Google Gemini API.
│   └── stripeService.ts   # Helper to call the Stripe backend for payment intents.
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
