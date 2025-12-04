# FlexiBot - Smart Grid Demand Response System

FlexiBot is a modern, AI-powered Demand Response (DR) management system designed to help grid operators and energy managers analyze meter data, forecast demand, and engage customers through intelligent segmentation and conversational interfaces.

Built with React and powered by Google's Gemini AI, FlexiBot provides a "No Wire" alternative for smart grid management, focusing on data-driven insights and user engagement.

![FlexiBot Dashboard](https://via.placeholder.com/800x450?text=FlexiBot+Dashboard+Preview)

## 🚀 Features

### 📊 Interactive Dashboard
- **Real-time Monitoring**: Visualize current load, peak risk levels, and active data sets.
- **KPI Tracking**: Monitor key performance indicators like total consumption, peak load, and load variability.
- **Data Visualization**: Interactive area and line charts using `recharts` to analyze load profiles.

### 🤖 AI-Powered Assistant (GridAssist)
- **Natural Language Interface**: Chat with "GridAssist" to ask questions about your data, generate insights, or get recommendations.
- **Powered by Gemini**: Leverages Google's Gemini API for advanced reasoning and context-aware responses.
- **Context-Aware**: The AI is aware of your currently uploaded datasets and can provide specific analysis.

### 📈 Analytics & Forecasting
- **Load Forecasting**: Generate short-term load forecasts to anticipate peak demand.
- **Customer Segmentation**: Automatically group customers using **K-Means Clustering** based on consumption patterns (e.g., "Morning Peakers", "Steady Users").
- **Statistical Analysis**: Automatic calculation of variance, peak-to-average ratios, and other statistical metrics.

### 📁 Data Management
- **CSV Upload**: Drag-and-drop interface for uploading smart meter data (CSV format).
- **Client-Side Processing**: Fast, secure local processing of data without sending large datasets to a server.
- **Data Persistence**: Uses `localStorage` to persist sessions and data across reloads.

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://react.dev/) (v18)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/)
- **Routing**: [React Router](https://reactrouter.com/) (v6)
- **Visualization**: [Recharts](https://recharts.org/)
- **Machine Learning**: [ml-kmeans](https://github.com/mljs/kmeans) for client-side clustering
- **Data Handling**: [PapaParse](https://www.papaparse.com/) for CSV parsing, [date-fns](https://date-fns.org/) for time manipulation
- **Styling**: Vanilla CSS with CSS Variables for theming (Dark/Light mode support)

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/MedZouhaierDLH/FelxiBot.git
    cd FlexiBot
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Open in Browser**
    Navigate to `http://localhost:5173` to view the application.

## 🔑 Configuration

To use the AI features, you need a Google Gemini API Key.
1.  Get your key from [Google AI Studio](https://aistudio.google.com/).
2.  On the first launch, the app will prompt you to enter your API Key.
3.  The key is stored locally in your browser's `localStorage` for convenience.

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components (Charts, Cards, Modal, etc.)
├── context/          # React Context for global state (Data, Auth)
├── pages/            # Main application pages
│   ├── Dashboard.jsx # Main overview
│   ├── ChatPage.jsx  # AI Chat interface
│   ├── ForecastPage.jsx
│   └── SegmentationPage.jsx # Clustering analysis
├── styles/           # Global and component-specific CSS
├── utils/            # Helper functions
│   ├── clusteringEngine.js # K-Means logic
│   ├── csvParser.js        # Data import logic
│   └── dataProcessor.js    # Statistical calcs
├── App.jsx           # Main App component & Routing
└── main.jsx          # Entry point
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
