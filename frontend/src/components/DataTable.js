// src/components/DataTable.js
import React from 'react';
import './DataTable.css';

export default function DataTable({ columns, data, emptyMessage = 'No data found.', onRowClick }) {
    if (!data || data.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-text">{emptyMessage}</div>
            </div>
        );
    }

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    {columns.map(col => (
                        <th key={col.key}>{col.label}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, i) => (
                    <tr
                        key={i}
                        onClick={() => onRowClick && onRowClick(row)}
                        style={onRowClick ? { cursor: 'pointer' } : {}}
                    >
                        {columns.map(col => (
                            <td key={col.key}>
                                {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}