# WHOOP Daily Insight Dashboard

This is a web application designed to connect to your WHOOP account and display your personal health and fitness metrics in a dashboard format.

## Features

*   **Secure WHOOP Connection:** Connects to the official WHOOP API using OAuth 2.0 with PKCE for enhanced security.
*   **Data Visualization:** Displays key WHOOP metrics, including:
    *   Daily Recovery score
    *   Daily Strain score
    *   Sleep Performance (calculated based on duration vs. need)
    *   Heart Rate Variability (HRV)
    *   Historical trends for Strain, Recovery, and HRV.
*   **WHOOP-Inspired UI:** Uses a dark theme and styling inspired by the WHOOP app, built with React, TypeScript, Tailwind CSS, and Shadcn UI.
*   **Data Fetching:** Uses TanStack Query (React Query) for efficient data fetching, caching, and state management.

## Getting Started

### Prerequisites

*   Node.js and npm (or Bun)
*   A WHOOP account
*   Access to the [WHOOP Developer Portal](https://developer.whoop.com/) to create an application.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd whoop-daily-insight
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # bun install 
    ```

### Configuration (WHOOP Developer App Setup)

Before running the application, you need to configure it with your WHOOP Developer application details:

1.  **Run the app locally:**
    ```bash
    npm run dev
    # or
    # bun dev
    ```
    The application should open at `http://localhost:8080` (or the configured port).

2.  **Navigate to the Connect Page:** Go to the `/connect` route in the application (e.g., `http://localhost:8080/connect`).

3.  **Follow Setup Instructions:** The Connect page includes a detailed guide on how to:
    *   Go to the [WHOOP Developer Portal](https://developer.whoop.com/).
    *   Create a new application.
    *   **Crucially**, configure the **Redirect URL** in the WHOOP Developer Portal to **exactly match** the one shown on the Connect page (it will be based on your localhost address, e.g., `http://localhost:8080/connect`).
    *   Select the required **scopes** (e.g., `read:profile`, `read:recovery`, `read:cycles`, `read:sleep`).
    *   Obtain your **Client ID** after creating the app.

4.  **Enter Client ID:** Paste the **Client ID** obtained from the WHOOP Developer Portal into the configuration input field on the `/connect` page within this application and save it.

5.  **Connect Your Account:** Click the "Connect WHOOP" button and authorize the application via the WHOOP login page.

### Running the App

Once configured, run the development server:

```bash
npm run dev
# or
# bun dev
```

Navigate to `http://localhost:8080` to view your dashboard.

## Technology Stack

*   **Framework:** React (with Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn UI
*   **Data Fetching/State Management:** TanStack Query (React Query) v5
*   **Routing:** React Router DOM v6
*   **Charting:** Recharts
*   **API Interaction:** Axios

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source (consider adding a LICENSE file, e.g., MIT).
