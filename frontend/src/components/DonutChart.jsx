import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DonutChart({
  data = [
    { name: 'Completed', value: 3, color: '#22c55e' },
    { name: 'In Progress', value: 5, color: '#e8a838' },
    { name: 'Planning', value: 2, color: '#3b82f6' },
    { name: 'On Hold', value: 1, color: '#ef4444' },
  ],
  totalCount,
}) {
  const total = totalCount !== undefined
    ? totalCount
    : data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  // Safe fallback colors
  const DEFAULT_COLORS = ['#22c55e', '#e8a838', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
      <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width={220} height={220}>
          <PieChart width={220} height={220}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} Projects`, name]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {total}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px' }}>
            Projects
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
        {data.map((item, idx) => {
          const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {item.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.value}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
