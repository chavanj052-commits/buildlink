import React from 'react';

// Resilient Recharts fallback shim when recharts package is not in node_modules
export const ResponsiveContainer = ({ width = '100%', height = 240, children }) => {
  return (
    <div style={{ width, height, position: 'relative' }}>
      {typeof children === 'function' ? children({ width: 300, height: 240 }) : children}
    </div>
  );
};

export const PieChart = ({ width = 240, height = 240, children }) => {
  return (
    <div className="recharts-wrapper" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {children}
      </svg>
    </div>
  );
};

export const Cell = () => null;

export const Pie = ({
  data = [],
  cx = '50%',
  cy = '50%',
  innerRadius = 60,
  outerRadius = 90,
  dataKey = 'value',
  children,
}) => {
  const total = data.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0) || 1;
  const cells = React.Children.toArray(children);

  let currentAngle = -Math.PI / 2;
  const centerCoord = 120; // 240/2

  return (
    <g transform={`translate(${centerCoord}, ${centerCoord})`}>
      {data.map((entry, index) => {
        const val = Number(entry[dataKey]) || 0;
        const sliceAngle = (val / total) * 2 * Math.PI;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        currentAngle = endAngle;

        const cell = cells[index];
        const color = cell?.props?.fill || '#e8a838';

        if (sliceAngle <= 0.001) return null;

        const x1 = Math.cos(startAngle) * outerRadius;
        const y1 = Math.sin(startAngle) * outerRadius;
        const x2 = Math.cos(endAngle) * outerRadius;
        const y2 = Math.sin(endAngle) * outerRadius;

        const ix1 = Math.cos(endAngle) * innerRadius;
        const iy1 = Math.sin(endAngle) * innerRadius;
        const ix2 = Math.cos(startAngle) * innerRadius;
        const iy2 = Math.sin(startAngle) * innerRadius;

        const largeArc = sliceAngle > Math.PI ? 1 : 0;

        const pathData = `
          M ${x1} ${y1}
          A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
          L ${ix1} ${iy1}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}
          Z
        `;

        return (
          <path
            key={index}
            d={pathData}
            fill={color}
            stroke="#ffffff"
            strokeWidth="3"
            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
          >
            <title>{`${entry.name}: ${entry[dataKey]}`}</title>
          </path>
        );
      })}
    </g>
  );
};

export const Tooltip = () => null;
export const Legend = () => null;

export default {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
};
