# WHOOP Daily Insight Dashboard

This is a web application designed to connect to your WHOOP account and display your personal health and fitness metrics in a dashboard format.

## Features

*   **Secure WHOOP Connection:** Connects to the official WHOOP API using OAuth 2.0 with PKCE for enhanced security.
*   **Dashboard Overview:** Displays key WHOOP metrics, including:
    *   Daily Recovery score
    *   Daily Strain score
    *   Sleep Performance (calculated based on duration vs. need)
    *   Heart Rate Variability (HRV)
    *   7-Day Strain vs. Recovery visualization
    *   HRV timeline for the past week
    *   Weekly overview with averages
*   **Enhanced Sleep Analytics:**
    *   Last Night's Sleep summary with key metrics
    *   Sleep Debt Tracker with color-coded visualization and accurate projections
    *   Sleep Time Tracker showing sleep duration trends
    *   Bedtime Tracker for consistency analysis
    *   Sleep Stage distribution (REM, Deep, Light)
    *   Sleep Efficiency and Respiratory Rate monitoring
    *   Sleep Consistency patterns
    *   Sleep Coaching Tips based on your data
    *   Sleep Education with WHOOP-based insights and recommendations
*   **WHOOP-Inspired UI:** Uses a dark theme and styling inspired by the WHOOP app, built with React, TypeScript, Tailwind CSS, and Shadcn UI.
*   **Data Fetching:** Uses TanStack Query (React Query) for efficient data fetching, caching, and state management.
*   **Robust Error Handling:** Includes comprehensive error checking and fallbacks for data processing and visualization.
*   **Responsive Design:** Optimized for both desktop and mobile viewing experiences.
*   **Developer Tools:** Includes a debug panel for troubleshooting data fetching and display issues.

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

## Key Components

The application features several specialized components for data visualization:

### Dashboard Components
- **Recovery Card:** Shows your daily recovery score with color-coded indicators
- **Strain Card:** Displays your daily strain level with activity breakdown
- **Sleep Card:** Summarizes your sleep performance with duration and quality metrics

### Sleep Analysis Components
- **Last Night Sleep:** Provides a quick overview of your most recent sleep session
- **Sleep Stage Chart:** Visualizes your sleep cycle distribution (REM, Deep, Light, Awake)
- **Sleep Debt Tracker:** Color-coded visualization of your sleep debt/surplus over time with smart projection for missing data
- **Sleep Cycles Info:** Analyzes your sleep cycles with estimates of cycle count and quality metrics
- **Sleep Time Tracker:** Tracks your total sleep duration compared to your sleep needs
- **Bedtime Tracker:** Analyzes your sleep schedule consistency
- **Sleep Efficiency:** Monitors how efficiently you sleep while in bed
- **Respiratory Rate Chart:** Tracks breathing patterns during sleep
- **Recovery Impact:** Shows how sleep quality affects recovery potential
- **Sleep Consistency Guide:** Provides personalized recommendations for maintaining consistent sleep schedules
- **Sleep Consistency:** Visualizes sleep and wake time patterns
- **WHOOP Sleep Insights:** Educational component explaining the science behind WHOOP's sleep tracking methodology

### Developer Components
- **Data Debug Panel:** Utility component for troubleshooting data issues, including date gap analysis and forced data refresh functionality

## API Integration Notes

This application uses the following WHOOP API endpoints:

- User profile: `/v1/user/profile/basic`
- Recovery data: `/v1/recovery`
- Strain/cycle data: `/v1/cycle`
- Sleep data: `/v1/activity/sleep`

The application implements proper error handling for API requests and data processing to ensure reliability.

## Troubleshooting

### Data Issues

If you notice missing or incomplete data in your dashboard, you can use the built-in debug panel:

1. Look for the small "Debug" button in the bottom right corner of any page
2. Click it to open the debug panel
3. Use the "Analyze Date Gaps" button to identify missing dates in your data
4. Use the "Force Data Refresh" button to trigger a complete refresh of all data from the WHOOP API

Common issues and solutions:

- **Missing recent days in Sleep Debt Tracker**: The application intelligently fills in missing days with estimated values. For today and future dates, it will display "projected" data until actual sleep data is available.
- **Data not updating automatically**: Click the "Refresh Data" button in the header to manually refresh all data.
- **Authentication errors**: If you see authentication errors, try reconnecting your WHOOP account by navigating to the `/connect` page.

### Sleep Debt Calculations

Sleep debt is calculated using WHOOP's methodology which considers:
1. Your baseline sleep need (demographic average)
2. Accumulated sleep debt from previous nights
3. Added sleep need from recent physical strain
4. Reductions from recent naps

The Sleep Debt Tracker visualizes this as a color-coded bar chart:
- Green bars indicate a sleep surplus
- Amber/orange/red bars indicate increasing levels of sleep deficit
- Dashed bars represent projected or estimated data (including today until sleep is recorded)

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
