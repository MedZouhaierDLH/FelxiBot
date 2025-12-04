import React, { useState } from 'react';
import { calculateBusinessCase, generateBusinessCaseBreakdown, assessBusinessCaseViability } from '../utils/businessCaseCalc';
import { exportDataReportToPDF } from '../utils/pdfExport';
import '../styles/campaigns.css';

const BusinessCaseCalculator = () => {
    const [inputs, setInputs] = useState({
        annualBaselineKWh: 1000000,
        peakLoadKW: 250,
        avgReductionPercent: 15,
        eventsPerYear: 20,
        energyCostPerKWh: 0.15,
        peakTariffPremium: 0.30,
        demandChargePerKW: 5.0,
        implementationCost: 50000,
        discountRate: 0.05
    });

    const [businessCase, setBusinessCase] = useState(null);
    const [breakdown, setBreakdown] = useState(null);
    const [assessment, setAssessment] = useState(null);

    const handleCalculate = () => {
        const result = calculateBusinessCase(inputs);
        const yearlyBreakdown = generateBusinessCaseBreakdown(result);
        const viability = assessBusinessCaseViability(result);

        setBusinessCase(result);
        setBreakdown(yearlyBreakdown);
        setAssessment(viability);
    };

    const handleExportPDF = () => {
        if (!businessCase) return;

        const reportData = {
            title: 'DR Business Case Analysis',
            businessCase,
            assessment,
            breakdown
        };

        // TODO: Enhance PDF export for business case
        alert('PDF export coming soon! Use the summary below for now.');
    };

    const handleInputChange = (field, value) => {
        setInputs({ ...inputs, [field]: parseFloat(value) || 0 });
    };

    const getViabilityClass = (viability) => {
        const classes = {
            excellent: 'viability-excellent',
            good: 'viability-good',
            moderate: 'viability-moderate',
            poor: 'viability-poor'
        };
        return classes[viability] || '';
    };

    return (
        <div className="business-case-calculator">
            <div className="calculator-header">
                <h2>💰 Business Case Calculator</h2>
                <p>Calculate ROI and financial viability for your DR program</p>
            </div>

            {/* Input Form */}
            <div className="calculator-inputs">
                <div className="input-section">
                    <h3>Load Profile</h3>
                    <div className="input-grid">
                        <div className="input-item">
                            <label>Annual Baseline (kWh)</label>
                            <input
                                type="number"
                                value={inputs.annualBaselineKWh}
                                onChange={(e) => handleInputChange('annualBaselineKWh', e.target.value)}
                            />
                        </div>
                        <div className="input-item">
                            <label>Peak Load (kW)</label>
                            <input
                                type="number"
                                value={inputs.peakLoadKW}
                                onChange={(e) => handleInputChange('peakLoadKW', e.target.value)}
                            />
                        </div>
                        <div className="input-item">
                            <label>Avg Reduction (%)</label>
                            <input
                                type="number"
                                value={inputs.avgReductionPercent}
                                onChange={(e) => handleInputChange('avgReductionPercent', e.target.value)}
                            />
                        </div>
                        <div className="input-item">
                            <label>Events per Year</label>
                            <input
                                type="number"
                                value={inputs.eventsPerYear}
                                onChange={(e) => handleInputChange('eventsPerYear', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="input-section">
                    <h3>Pricing (€)</h3>
                    <div className="input-grid">
                        <div className="input-item">
                            <label>Energy Cost (€/kWh)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={inputs.energyCostPerKWh}
                                onChange={(e) => handleInputChange('energyCostPerKWh', e.target.value)}
                            />
                        </div>
                        <div className="input-item">
                            <label>Peak Premium (€/kWh)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={inputs.peakTariffPremium}
                                onChange={(e) => handleInputChange('peakTariffPremium', e.target.value)}
                            />
                        </div>
                        <div className="input-item">
                            <label>Demand Charge (€/kW)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={inputs.demandChargePerKW}
                                onChange={(e) => handleInputChange('demandChargePerKW', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="input-section">
                    <h3>Investment</h3>
                    <div className="input-grid">
                        <div className="input-item">
                            <label>Implementation Cost (€)</label>
                            <input
                                type="number"
                                value={inputs.implementationCost}
                                onChange={(e) => handleInputChange('implementationCost', e.target.value)}
                            />
                        </div>
                        <div className="input-item">
                            <label>Discount Rate (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={inputs.discountRate * 100}
                                onChange={(e) => handleInputChange('discountRate', e.target.value / 100)}
                            />
                        </div>
                    </div>
                </div>

                <button className="action-btn primary calc-btn" onClick={handleCalculate}>
                    📊 Calculate Business Case
                </button>
            </div>

            {/* Results */}
            {businessCase && assessment && (
                <>
                    {/* Financial Summary */}
                    <div className={`business-case-results ${getViabilityClass(assessment.viability)}`}>
                        <div className="viability-banner">
                            <h3>Assessment: {assessment.viability.toUpperCase()}</h3>
                            <p>{assessment.recommendation}</p>
                        </div>

                        <div className="metrics-grid">
                            <div className="metric-card highlight">
                                <span className="metric-label">Annual Savings</span>
                                <span className="metric-value">€{businessCase.annualSavings}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Payback Period</span>
                                <span className="metric-value">{businessCase.paybackYears} years</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">5-Year NPV</span>
                                <span className="metric-value">€{businessCase.fiveYearNPV}</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">ROI</span>
                                <span className="metric-value">{businessCase.roi}%</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">Benefit/Cost Ratio</span>
                                <span className="metric-value">{businessCase.benefitCostRatio}x</span>
                            </div>
                            <div className="metric-card">
                                <span className="metric-label">5-Year Savings</span>
                                <span className="metric-value">€{businessCase.totalFiveYearSavings}</span>
                            </div>
                        </div>
                    </div>

                    {/* Yearly Breakdown */}
                    {breakdown && (
                        <div className="yearly-breakdown">
                            <h3>Cash Flow Analysis</h3>
                            <table className="breakdown-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Savings (€)</th>
                                        <th>Costs (€)</th>
                                        <th>Net Cash Flow (€)</th>
                                        <th>Cumulative (€)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdown.map((year) => (
                                        <tr key={year.year} className={year.cumulative >= 0 ? 'positive' : 'negative'}>
                                            <td>{year.year}</td>
                                            <td>{year.savings.toFixed(2)}</td>
                                            <td>{year.costs.toFixed(2)}</td>
                                            <td>{year.netCashFlow.toFixed(2)}</td>
                                            <td><strong>{year.cumulative.toFixed(2)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="export-actions">
                        <button className="action-btn" onClick={handleExportPDF}>
                            📄 Export PDF Report
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default BusinessCaseCalculator;
