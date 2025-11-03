# Safe2Tow - AI-Powered Towing Guide

Safe2Tow is an expert AI co-pilot for tow operators. This app provides instant, professional-grade towing procedures by synthesizing manufacturer data with field-tested knowledge. It features distinct, expert-level logic for FWD, RWD, AWD/4WD, and modern EV/Hybrid drivetrains, ensuring safe and accurate guidance.

## Features

- **AI-Powered Search**: Get vehicle-specific towing procedures by searching with vehicle details or VIN.
- **Image Recognition**: Use your device's camera to identify a vehicle or scan a VIN (Pro feature).
- **Detailed Procedures**: Clear instructions for front-towing, rear-towing, and special cases.
- **Drivetrain Analysis**: In-depth information about AWD systems, whether the drivetrain is engaged when off, and if the steering locks.
- **Pro Membership**: Unlock advanced features like VIN search, anecdotal "what the guys say" advice, and an ad-free experience.
- **Stripe Integration**: Secure payment processing for Pro membership upgrades.
- **Firestore Backend**: Persists user data, search logs, and feedback for analytics and future outreach using Google Cloud Firestore.
- **Light/Dark Mode**: A theme toggle for user preference.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Payments**: Stripe
- **Database**: Google Cloud Firestore

---

## Getting Started & Configuration

This project uses an `index.html` with an import map for dependencies, so no local installation or build step is required to run it. However, you must configure several services for the app to be fully functional.

### 1. Google Gemini API Key

The application uses the Google Gemini API to generate towing information.

- The API key is accessed via `process.env.API_KEY`.
- You must have this environment variable configured in your hosting environment for the AI features to work.

### 2. Stripe Payments Setup

To process real payments, you need a Stripe account and a simple backend server to handle secure API calls.

- **Get your keys**: Sign up for Stripe and find your **Publishable Key** and **Secret Key** in the developer dashboard.
- **Update the frontend**: Open `components/PaymentModal.tsx` and replace the placeholder `STRIPE_PUBLISHABLE_KEY` with your actual publishable key.
- **Create a backend server**: The frontend is configured to talk to a backend server running on `http://localhost:4242`. Below is a minimal Node.js server to handle payment intent creation. Save this in a `backend` directory, run `npm install express stripe cors`, and then `node server.js`.

**Example `backend/server.js`:**
```javascript
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

// IMPORTANT: Replace with your REAL Stripe Secret Key.
// In production, load this from an environment variable.
const stripe = Stripe('sk_test_YOUR_SECRET_KEY_HERE');

const app = express();

// Use CORS to allow requests from your frontend
app.use(cors({ origin: '*' })); 
app.use(express.json());

app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, name, email } = req.body;

  if (!amount || amount <= 0 || !email) {
    return res.status(400).send({ error: 'Invalid amount or missing email' });
  }

  try {
    // Find or create a customer in Stripe
    let customer = await stripe.customers.list({ email: email, limit: 1 });
    let customerId;

    if (customer.data.length > 0) {
      customerId = customer.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({ name, email });
      customerId = newCustomer.id;
    }

    // Create a PaymentIntent with the amount and customer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      // Return the Stripe Customer ID in the response metadata
      metadata: { customer_id: customerId }
    });

    // Send the client secret and customer ID back to the frontend
    res.send({
      clientSecret: paymentIntent.client_secret,
      stripeCustomerId: customerId,
    });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).send({ error: error.message });
  }
});

const PORT = 4242;
app.listen(PORT, () => console.log(`Node server listening on http://localhost:${PORT}`));

```

### 3. Google Cloud Firestore Setup

The application uses Firestore to store user data, search logs, and feedback.

- **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/), click "Add project", and follow the setup steps.
- **Create a Web App**: In your new project's dashboard, click the Web icon (`</>`) to create a new web application. Give it a nickname and click "Register app".
- **Get Config Credentials**: After registering, Firebase will show you a configuration object. Copy these credentials.
- **Connect the App**: Open `services/firebase.ts` and paste your copied configuration object into the `firebaseConfig` constant, replacing the placeholder values.
- **Enable Firestore**: In the Firebase Console, go to the "Firestore Database" section and click "Create database". Start in **production mode** and choose a location.
- **Set Security Rules**: After the database is created, go to the **Rules** tab. Replace the default rules with the following to allow public access for this demo. **WARNING**: For a real production application, you must implement more secure rules.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read and write to all collections.
    // Lock this down with authentication in a real app.
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Your application is now configured to use Firestore as its database. The collections (`users`, `searches`, `feedback`) will be created automatically when the first document is written to them.