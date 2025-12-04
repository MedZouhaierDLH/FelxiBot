import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import BusinessCaseCalculator from '../components/BusinessCaseCalculator';
import '../styles/dashboard.css';
import '../styles/campaigns.css';

const CampaignsPage = () => {
    const { currentData } = useData();
    const [campaigns, setCampaigns] = useState(() => {
        const saved = localStorage.getItem('dr_campaigns');
        return saved ? JSON.parse(saved) : [];
    });

    const [showNewCampaign, setShowNewCampaign] = useState(false);
    const [showBusinessCase, setShowBusinessCase] = useState(false);

    const [newCampaign, setNewCampaign] = useState({
        name: '',
        targetSegment: 'All Customers',
        eventDate: '',
        eventTime: '17:00',
        duration: 3,
        targetReduction: 20,
        message: 'Reduce your energy consumption during peak hours and earn rewards!',
        incentive: 0.05,
        status: 'draft'
    });

    useEffect(() => {
        localStorage.setItem('dr_campaigns', JSON.stringify(campaigns));
    }, [campaigns]);

    const handleCreateCampaign = () => {
        const campaign = {
            ...newCampaign,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            customers: [] // TODO: Link with segmentation
        };

        setCampaigns([campaign, ...campaigns]);
        setShowNewCampaign(false);
        setNewCampaign({
            name: '',
            targetSegment: 'All Customers',
            eventDate: '',
            eventTime: '17:00',
            duration: 3,
            targetReduction: 20,
            message: 'Reduce your energy consumption during peak hours and earn rewards!',
            incentive: 0.05,
            status: 'draft'
        });
    };

    const handleDeleteCampaign = (id) => {
        if (confirm('Delete this campaign?')) {
            setCampaigns(campaigns.filter(c => c.id !== id));
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            draft: '#6b7280',
            scheduled: '#3b82f6',
            active: '#10b981',
            completed: '#8b5cf6'
        };
        return colors[status] || colors.draft;
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>📢 DR Campaigns</h1>
                <p>Create and manage demand response campaigns</p>
            </div>

            {/* Action Buttons */}
            <div className="campaign-actions">
                <button
                    className="action-btn primary"
                    onClick={() => setShowNewCampaign(!showNewCampaign)}
                >
                    ➕ New Campaign
                </button>
                <button
                    className="action-btn"
                    onClick={() => setShowBusinessCase(!showBusinessCase)}
                >
                    💰 Business Case
                </button>
            </div>

            {/* Business Case Calculator */}
            {showBusinessCase && (
                <div className="campaign-section">
                    <BusinessCaseCalculator />
                </div>
            )}

            {/* New Campaign Form */}
            {showNewCampaign && (
                <div className="campaign-form">
                    <h3>Create New Campaign</h3>
                    <div className="form-grid">
                        <div className="form-item">
                            <label>Campaign Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Summer Peak Reduction 2025"
                                value={newCampaign.name}
                                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                            />
                        </div>

                        <div className="form-item">
                            <label>Target Segment</label>
                            <select
                                value={newCampaign.targetSegment}
                                onChange={(e) => setNewCampaign({ ...newCampaign, targetSegment: e.target.value })}
                            >
                                <option>All Customers</option>
                                <option>High Consumption</option>
                                <option>Medium Consumption</option>
                                <option>Low Consumption</option>
                            </select>
                        </div>

                        <div className="form-item">
                            <label>Event Date</label>
                            <input
                                type="date"
                                value={newCampaign.eventDate}
                                onChange={(e) => setNewCampaign({ ...newCampaign, eventDate: e.target.value })}
                            />
                        </div>

                        <div className="form-item">
                            <label>Event Time</label>
                            <input
                                type="time"
                                value={newCampaign.eventTime}
                                onChange={(e) => setNewCampaign({ ...newCampaign, eventTime: e.target.value })}
                            />
                        </div>

                        <div className="form-item">
                            <label>Duration (hours)</label>
                            <input
                                type="number"
                                min="1"
                                max="8"
                                value={newCampaign.duration}
                                onChange={(e) => setNewCampaign({ ...newCampaign, duration: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="form-item">
                            <label>Target Reduction (%)</label>
                            <input
                                type="number"
                                min="5"
                                max="50"
                                value={newCampaign.targetReduction}
                                onChange={(e) => setNewCampaign({ ...newCampaign, targetReduction: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="form-item full-width">
                            <label>Message to Customers</label>
                            <textarea
                                rows="3"
                                value={newCampaign.message}
                                onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })}
                            />
                        </div>

                        <div className="form-item">
                            <label>Incentive (€/kWh reduced)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={newCampaign.incentive}
                                onChange={(e) => setNewCampaign({ ...newCampaign, incentive: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="action-btn primary" onClick={handleCreateCampaign}>
                            ✓ Create Campaign
                        </button>
                        <button className="action-btn" onClick={() => setShowNewCampaign(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Campaigns List */}
            <div className="campaigns-list">
                <h3>Campaign History</h3>
                {campaigns.length === 0 ? (
                    <div className="empty-state">
                        <p>No campaigns yet. Create your first DR campaign above!</p>
                    </div>
                ) : (
                    <div className="campaigns-grid">
                        {campaigns.map((campaign) => (
                            <div key={campaign.id} className="campaign-card">
                                <div className="campaign-header">
                                    <h4>{campaign.name || 'Untitled Campaign'}</h4>
                                    <span
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(campaign.status) }}
                                    >
                                        {campaign.status}
                                    </span>
                                </div>

                                <div className="campaign-details">
                                    <div className="detail-row">
                                        <span className="label">Target:</span>
                                        <span>{campaign.targetSegment}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Date:</span>
                                        <span>{campaign.eventDate} at {campaign.eventTime}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Duration:</span>
                                        <span>{campaign.duration}h</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Reduction Target:</span>
                                        <span>{campaign.targetReduction}%</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="label">Incentive:</span>
                                        <span>€{campaign.incentive}/kWh</span>
                                    </div>
                                </div>

                                <div className="campaign-message">
                                    <p>{campaign.message}</p>
                                </div>

                                <div className="campaign-actions">
                                    <button className="action-btn-small" disabled>
                                        📊 View Results
                                    </button>
                                    <button
                                        className="action-btn-small danger"
                                        onClick={() => handleDeleteCampaign(campaign.id)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampaignsPage;
