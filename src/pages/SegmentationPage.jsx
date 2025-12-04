import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { prepareCustomerFeatures, runKMeansClustering } from '../utils/clusteringEngine';
import '../styles/dashboard.css';

const SegmentationPage = () => {
    const { currentData } = useData();
    const [numClusters, setNumClusters] = useState(3);
    const [segmentResult, setSegmentResult] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const handleRunSegmentation = () => {
        if (!currentData || !currentData.data) {
            alert('Please upload data first from the Dashboard');
            return;
        }

        setIsRunning(true);

        try {
            // Prepare features
            const customers = prepareCustomerFeatures(currentData.data);

            if (customers.length === 0) {
                alert('No customer data found. Ensure your CSV has customer_id column.');
                setIsRunning(false);
                return;
            }

            // Run clustering
            const result = runKMeansClustering(customers, numClusters);
            setSegmentResult(result);
        } catch (error) {
            alert(`Segmentation error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const getClusterColor = (clusterId) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        return colors[clusterId % colors.length];
    };

    const getClusterLabel = (cluster) => {
        const avgLoad = parseFloat(cluster.avgLoad);
        if (avgLoad > 200) return '⚡ High Consumption';
        if (avgLoad > 100) return '📊 Medium Consumption';
        return '💡 Low Consumption';
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Customer Segmentation</h1>
                <p>Cluster customers by consumption patterns for targeted DR campaigns</p>
            </div>

            {/* Controls */}
            <div className="forecast-controls">
                <div className="control-group">
                    <label>Number of Clusters</label>
                    <select value={numClusters} onChange={(e) => setNumClusters(Number(e.target.value))}>
                        <option value={2}>2 clusters</option>
                        <option value={3}>3 clusters</option>
                        <option value={4}>4 clusters</option>
                        <option value={5}>5 clusters</option>
                    </select>
                </div>

                <button
                    className="action-btn primary"
                    onClick={handleRunSegmentation}
                    disabled={!currentData || isRunning}
                >
                    {isRunning ? 'Running...' : '🎯 Run Segmentation'}
                </button>
            </div>

            {/* Results */}
            {segmentResult && (
                <div className="segmentation-results">
                    <h2>Customer Segments</h2>

                    <div className="clusters-grid">
                        {segmentResult.clusters.map((cluster) => (
                            <div
                                key={cluster.id}
                                className="cluster-card"
                                style={{ borderLeft: `4px solid ${getClusterColor(cluster.id)}` }}
                            >
                                <div className="cluster-header">
                                    <h3>
                                        <span style={{ color: getClusterColor(cluster.id) }}>●</span>
                                        {' '}Cluster {cluster.id + 1}
                                    </h3>
                                    <span className="cluster-badge">{getClusterLabel(cluster)}</span>
                                </div>

                                <div className="cluster-stats">
                                    <div className="stat">
                                        <span className="stat-label">Customers</span>
                                        <span className="stat-value">{cluster.size}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Avg Load</span>
                                        <span className="stat-value">{cluster.avgLoad} kW</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Peak Load</span>
                                        <span className="stat-value">{cluster.peakLoad} kW</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Peak Hour</span>
                                        <span className="stat-value">{cluster.commonPeakHour}:00</span>
                                    </div>
                                </div>

                                <div className="cluster-actions">
                                    <button className="action-btn" disabled>
                                        📢 Create Campaign
                                    </button>
                                    <button
                                        className="action-btn"
                                        onClick={() => {
                                            const csv = cluster.members.join('\n');
                                            const blob = new Blob([csv], { type: 'text/csv' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `cluster-${cluster.id + 1}-customers.csv`;
                                            a.click();
                                        }}
                                    >
                                        📥 Export List
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="segmentation-summary">
                        <h3>Segmentation Insights</h3>
                        <ul>
                            <li>
                                <strong>Total Customers Analyzed:</strong> {segmentResult.customers.length}
                            </li>
                            <li>
                                <strong>Largest Segment:</strong> Cluster {segmentResult.clusters.reduce((max, c) => c.size > max.size ? c : max, segmentResult.clusters[0]).id + 1}
                                ({segmentResult.clusters.reduce((max, c) => Math.max(max, c.size), 0)} customers)
                            </li>
                            <li>
                                <strong>High-Value Targets:</strong> Clusters with avg load &gt; 100 kW are prime for DR programs
                            </li>
                            <li>
                                <strong>Next Step:</strong> Create targeted campaigns for each segment (Coming in Phase 3)
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {!currentData && (
                <div className="empty-state">
                    <div className="empty-icon">🎯</div>
                    <h3>No Data Available</h3>
                    <p>Upload customer meter data from the Dashboard to run segmentation</p>
                </div>
            )}
        </div>
    );
};

export default SegmentationPage;
