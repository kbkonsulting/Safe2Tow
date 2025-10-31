# TowSafe AWD Checker

An AI-powered, mobile-first web application designed to be the essential co-pilot for modern tow truck operators. It provides instant, accurate, and field-tested towing procedures by leveraging the Google Gemini API, augmented with data from professional towing communities.

## Key Features

*   **Expert Drivetrain Logic**: Utilizes a deeply trained AI with distinct, expert-level protocols for **FWD, RWD, Part-Time 4WD, Full-Time AWD, and EV/Hybrid** vehicles.
*   **Field-Tested Data Sources**: The AI is prompted to prioritize real-world information from professional sources like Tow Times Magazine and online forums over standard manufacturer guidelines.
*   **"Vehicle Off" Assumption**: All analysis is performed under the critical real-world assumption that the vehicle is **completely off with no key in the ignition**, ensuring the advice is practical and safe.
*   **Dynamic Search Form**: An intuitive, multi-step form with autocomplete and auto-correct functionality for vehicle makes and models to ensure accurate searches.
*   **Nuanced Safety Recommendations**: Goes beyond simple "safe/unsafe" by providing a `SAFE_WITH_CAUTION` category for field-tested "tricks" (e.g., disengaging a transfer case) and includes necessary disclaimers.
*   **Dedicated AWD/4WD Variant Information**: The primary result is for a vehicle's most common drivetrain, with a separate, clearly marked section for AWD/4WD variants if their towing procedures differ.
*   **Clear, Actionable UI**: Results are displayed in a responsive, color-coded card format that makes safety levels and instructions easy to understand at a glance.

## Tech Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS
*   **AI Engine**: Google Gemini API (`@google/genai`)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later)
*   `npm` or another package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd towsafe-awd-checker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a new file named `.env` in the root of your project directory and add your Google Gemini API key:

    ```
    API_KEY=your_gemini_api_key_here
    ```
    *Note: The application expects the key to be available via `process.env.API_KEY`.*

4.  **Run the Development Server:**
    ```bash
    npm run dev 
    ```
    *(Assuming a Vite-based setup. If using Create React App, this would be `npm start`)*

    Open [http://localhost:3000](http://localhost:3000) (or the port specified by your dev server) to view it in the browser.

## Project Structure

```
/src
├── components/         # Reusable React components
│   ├── icons.tsx
│   ├── Loader.tsx
│   ├── ResultCard.tsx
│   └── SearchBar.tsx
├── services/           # API interaction logic
│   └── geminiService.ts
├── types.ts            # Core TypeScript type definitions
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## Disclaimer

This tool is AI-powered and intended for use as a supplementary guide. Users should always adhere to their company's official safety protocols and procedures. The developers are not liable for any damage or incidents that may occur from the use of this application.
