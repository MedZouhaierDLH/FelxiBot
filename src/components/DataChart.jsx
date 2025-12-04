import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import '../styles/dashboard.css';

const DataChart = ({ data, title, xKey = 'timestampFormatted', yKey = 'value', type = 'area' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="data-chart-empty">
                <p>No data to display</p>
            </div>
        );
    }

    const Chart = type === 'area' ? AreaChart : LineChart;

    return (
        <div className="data-chart-container">
            {title && <h3 className="chart-title">{title}</h3>}
            <ResponsiveContainer width="100%" height={400}>
                <Chart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey={xKey}
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => {
                            // Show fewer ticks for readability
                            return value.split(' ')[1] || value;
                        }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        label={{ value: 'kWh', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#f8fafc'
                        }}
                    />
                    {type === 'area' ? (
                        <Area
                            type="monotone"
                            dataKey={yKey}
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    ) : (
                        <Line
                            type="monotone"
                            dataKey={yKey}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                        />
                    )}
                </Chart>
            </ResponsiveContainer>
        </div>
    );
};

export default DataChart;
