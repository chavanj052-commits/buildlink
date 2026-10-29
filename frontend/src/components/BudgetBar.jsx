import React from 'react';
import { formatINR } from '../utils/format';

export default function BudgetBar({
  totalBudget = 0,
  spentAmount = 0,
  remainingAmount,
}) {
  const total = Number(totalBudget) || 0;
  const spent = Number(spentAmount) || 0;
  const remaining = remainingAmount !== undefined ? Number(remainingAmount) : Math.max(0, total - spent);
  const spentPercent = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;

  return (
    <div className="budget-bar">
      <div>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
          Total Project Valuation
        </span>
        <div className="budget-bar__hero">{formatINR(total)}</div>
      </div>

      <div className="budget-bar__track">
        <div
          className="budget-bar__fill"
          style={{ width: `${spentPercent}%` }}
          title={`Spent: ${spentPercent}%`}
        />
      </div>

      <div className="budget-bar__legend">
        <div className="budget-bar__legend-item">
          <div className="budget-bar__dot" style={{ background: '#e8a838' }} />
          <div>
            <div className="budget-bar__legend-label">Spent ({spentPercent}%)</div>
            <div className="budget-bar__legend-amount">{formatINR(spent)}</div>
          </div>
        </div>

        <div className="budget-bar__legend-item" style={{ textAlign: 'right' }}>
          <div>
            <div className="budget-bar__legend-label">Remaining ({100 - spentPercent}%)</div>
            <div className="budget-bar__legend-amount" style={{ color: 'var(--success)' }}>
              {formatINR(remaining)}
            </div>
          </div>
          <div className="budget-bar__dot" style={{ background: '#e2e8f0' }} />
        </div>
      </div>
    </div>
  );
}
