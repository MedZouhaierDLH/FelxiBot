import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { simulateDREvent, calculateDRSavings, generateDRRecommendations } from '../utils/simulationEngine';
import DataChart from '../components/DataChart';
import '../styles/dashboard.css';
import '../styles/campaigns.css';

const SimulatorPage = () => {
    const { currentData } = useData();
    const [eventConfig, setEventConfig] = useState({
        startHour: 17,
        endHour: 20,
        reductionPercent: 20,
        participationRate: 75
    });

    const [pricing, setPricing] = useState({
        energyRate: 0.15,
        peakPremium: 0.10,
        demandCharge: 5.0
    });

    const [simulationResult, setSimulationResult] = useState(null);
    const [savings, setSavings] = useState(null);
    const [recommendations, setRecommendations] = useState(null);

    const handleRunSimulation = () => {
        if (!currentData || !currentData.data) {
            alert('Please upload baseline data from the Dashboard first');
            return;
        }

        try {
            const result = simulateDREvent(currentData.data, eventConfig);
            const savingsCalc = calculateDRSavings(result, pricing);
            const recs = generateDRRecommendations(currentData.data);

            setSimulationResult(result);
            setSavings(savingsCalc);
            setRecommendations(recs);
        } catch (error) {
            alert(`Simulation error: ${error.message}`);
        }
    };

    // Prepare comparison chart data
    const comparisonData = simulationResult ?
        simulationResult.simulated.map((point, i) => ({
            timestampFormatted: point.timestampFormatted || `Hour ${i}`,
            baseline: simulationResult.original[i].value,
            simulated: point.reducedValue,
            isEvent: point.isEventHour
        })) : [];

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>DR Event Simulator</h1>
                <p>Simulate demand response events and calculate potential savings</p>
            </div>

            {/* Configuration Panel */}
            <div className="simulator-config">
                <div className="config-section">
                    <h3>Event Configuration</h3>
                    <div className="config-grid">
                        <div className="config-item">
                            <label>Start Hour</label>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={eventConfig.startHour}
                                onChange={(e) => setEventConfig({ ...eventConfig, startHour: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="config-item">
                            <label>End Hour</label>
                            <input
                                type="number"
                                min="0"
                                max="23"
                                value={eventConfig.endHour}
                                onChange={(e) => setEventConfig({ ...eventConfig, endHour: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="config-item">
                            <label>Target Reduction (%)</label>
                            <input
                                type="number"
                                min="5"
                                max="50"
                                value={eventConfig.reductionPercent}
                                onChange={(e) => setEventConfig({ ...eventConfig, reductionPercent: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="config-item">
                            <label>Participation Rate (%)</label>
                            <input
                                type="number"
                                min="10"
                                max="100"
                                value={eventConfig.participationRate}
                                onChange={(e) => setEventConfig({ ...eventConfig, participationRate: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <div className="config-section">
                    <h3>Pricing (€)</h3>
                    <div className="config-grid">
                        <div className="config-item">
                            <label>Energy Rate (€/kWh)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={pricing.energyRate}
                                onChange={(e) => setPricing({ ...pricing, energyRate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="config-item">
                            <label>Peak Premium (€/kWh)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={pricing.peakPremium}
                                onChange={(e) => setPricing({ ...pricing, peakPremium: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="config-item">
                            <label>Demand Charge (€/kW)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={pricing.demandCharge}
                                onChange={(e) => setPricing({ ...pricing, demandCharge: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <button
                    className="action-btn primary simulator-run-btn"
                    onClick={handleRunSimulation}
                    disabled={!currentData}
                >
                    ⚡ Run Simulation
                </button>
            </div>

            {/* Results */}
            {simulationResult && savings && (
                <>
                    {/* Savings Summary */}
                    <div className="simulation-results">
                        <div className="result-card">
                            <h3>Savings Summary</h3>
                            <div className="savings-grid">
                                <div className="savings-item large">
                                    <span className="label">Total Savings</span>
                                    <span className="value">{savings.currency}{savings.totalSavings}</span>
                                </div>
                                <div className="savings-item">
                                    <span className="label">Energy Savings</span>
                                    <span className="value">{savings.currency}{savings.energySavings}</span>
                                </div>
                                <div className="savings-item">
                                    <span className="label">Peak Savings</span>
                                    <span className="value">{savings.currency}{savings.peakSavings}</span>
                                </div>
                                <div className="savings-item">
                                    <span className="label">Demand Savings</span>
                                    <span className="value">{savings.currency}{savings.demandSavings}</span>
                                </div>
                            </div>
                        </div>

                        <div className="result-card">
                            <h3>Reduction Impact</h3>
                            <div className="impact-stats">
                                <div className="stat">
                                    <span className="label">Total Reduction</span>
                                    <span className="value">{simulationResult.totalReductionKWh} kWh</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Peak Reduction</span>
                                    <span className="value">{simulationResult.peakReductionKW} kW</span>
                                </div>
                                <div className="stat">
                                    <span className="label">Event Duration</span>
                                    <span className="value">{simulationResult.eventHours} hours</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Chart */}
                    <div className="simulation-chart">
                        <h3>Baseline vs. Simulated Load</h3>
                        <DataChart
                            data={comparisonData}
                            title="Load Comparison"
                            xKey="timestampFormatted"
                            yKey="baseline"
                            type="line"
                        />
                    </div>

                    {/* Recommendations */}
                    {recommendations && (
                        <div className="recommendations-panel">
                            <h3>DR Recommendations</h3>
                            <div className="recommendations-grid">
                                {recommendations.map((rec, i) => (
                                    <div key={i} className={`recommendation-card priority-${rec.priority}`}>
                                        <div className="rec-header">
                                            <h4>{rec.title}</h4>
                                            <span className="priority-badge">{rec.priority}</span>
                                        </div>
                                        <p>{rec.description}</p>
                                        <div className="rec-impact">
                                            <span>💡 Impact:</span> {rec.estimatedImpact}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {!currentData && (
                <div className="empty-state">
                    <div className="empty-icon">⚡</div>
                    <h3>No Baseline Data</h3>
                    <p>Upload meter data from the Dashboard to run DR simulations</p>
                </div>
            )}
        </div>
    );
};

export default SimulatorPage;
