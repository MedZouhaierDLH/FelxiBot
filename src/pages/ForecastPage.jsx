import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { forecastLinear, identifyPeakHours } from '../utils/forecastEngine';
import DataChart from '../components/DataChart';
import '../styles/dashboard.css';

const ForecastPage = () => {
    const { currentData } = useData();
    const [horizon, setHorizon] = useState(24);
    const [forecastResult, setForecastResult] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateForecast = () => {
        if (!currentData || !currentData.data) {
            alert('Please upload data first from the Dashboard');
            return;
        }

        setIsGenerating(true);

        try {
            const result = forecastLinear(currentData.data, horizon);
            const peaks = identifyPeakHours(currentData.data);

            setForecastResult({
                ...result,
                peaks
            });
        } catch (error) {
            alert(`Forecast error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Prepare chart data
    const chartData = forecastResult ? [
        ...currentData.data.slice(-48), // Last 48h of historical
        ...forecastResult.forecast.map((f, i) => ({
            timestamp: currentData.data.length + i,
            timestampFormatted: `+${i}h`,
            value: f.value,
            lower: f.lower,
            upper: f.upper,
            isForecast: true
        }))
    ] : currentData?.data || [];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Load Forecasting</h1>
                <p>Predict future load patterns with AI-powered forecasting</p>
            </div>

            {/* Controls */}
            <div className="forecast-controls">
                <div className="control-group">
                    <label>Forecast Horizon (hours)</label>
                    <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))}>
                        <option value={12}>12 hours</option>
                        <option value={24}>24 hours</option>
                        <option value={48}>48 hours</option>
                        <option value={72}>72 hours</option>
                    </select>
                </div>

                <button
                    className="action-btn primary"
                    onClick={handleGenerateForecast}
                    disabled={!currentData || isGenerating}
                >
                    {isGenerating ? 'Generating...' : '🔮 Generate Forecast'}
                </button>
            </div>

            {/* Results */}
            {forecastResult && (
                <>
                    <div className="forecast-summary">
                        <div className="summary-card">
                            <h3>Forecast Quality</h3>
                            <div className="metric">
                                <span className="label">Confidence Level</span>
                                <span className="value">95%</span>
                            </div>
                            <div className="metric">
                                <span className="label">Std Error</span>
                                <span className="value">{forecastResult.confidence.toFixed(2)} kW</span>
                            </div>
                            <div className="metric">
                                <span className="label">Trend</span>
                                <span className="value">
                                    {forecastResult.trend.slope > 0 ? '📈 Increasing' : '📉 Decreasing'}
                                </span>
                            </div>
                        </div>

                        <div className="summary-card">
                            <h3>Peak Hours Detected</h3>
                            {forecastResult.peaks.map((peak, i) => (
                                <div key={i} className="metric">
                                    <span className="label">{peak.hour}:00</span>
                                    <span className="value">{peak.average.toFixed(1)} kW</span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-card">
                            <h3>Recommendations</h3>
                            <ul className="recommendations-list">
                                <li>💡 Schedule DR events during peak hours ({forecastResult.peaks[0].hour}:00)</li>
                                <li>⚡ Expected peak load: {Math.max(...forecastResult.forecast.map(f => f.value)).toFixed(1)} kW</li>
                                <li>🎯 Target reduction: 15-20% during peaks</li>
                            </ul>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="forecast-chart-container">
                        <DataChart
                            data={chartData}
                            title="Historical + Forecasted Load"
                            type="line"
                        />
                    </div>
                </>
            )}

            {!currentData && (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>No Data Available</h3>
                    <p>Upload meter data from the Dashboard to generate forecasts</p>
                </div>
            )}
        </div>
    );
};

export default ForecastPage;
