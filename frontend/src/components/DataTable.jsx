import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, FolderKanban } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchPlaceholder = 'Filter records...',
  searchKeys = [],
  emptyMessage = 'No records found',
  emptySub = 'Try adjusting your search criteria',
  pageSize = 10,
  onRowClick,
}) {
  const [query, setQuery] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on query
  const filteredData = useMemo(() => {
    if (!query.trim()) return data;
    const lower = query.toLowerCase();

    return data.filter((item) => {
      if (searchKeys.length > 0) {
        return searchKeys.some((k) =>
          String(item[k] || '').toLowerCase().includes(lower)
        );
      }
      return Object.values(item).some((val) =>
        String(val || '').toLowerCase().includes(lower)
      );
    });
  }, [data, query, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortCol];
      const bVal = b[sortCol];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const compare = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDir === 'asc' ? compare : -compare;
    });
  }, [filteredData, sortCol, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (colKey) => {
    if (sortCol === colKey) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(colKey);
      setSortDir('asc');
    }
  };

  return (
    <div className="data-table-container">
      {searchable && (
        <div className="data-table__toolbar">
          <div className="data-table__search-wrapper">
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="data-table__search-input"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
            />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Showing <strong>{sortedData.length}</strong> items
          </div>
        </div>
      )}

      <div className="data-table__table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  onClick={() => col.sortable !== false && col.key && handleSort(col.key)}
                  style={{
                    cursor: col.sortable !== false && col.key ? 'pointer' : 'default',
                    width: col.width,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{col.label}</span>
                    {col.sortable !== false && col.key && sortCol === col.key && (
                      <span style={{ fontSize: '10px' }}>
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td key={col.key || col.label} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  <div className="data-table__empty-icon">
                    <FolderKanban size={36} />
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {emptyMessage}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>{emptySub}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn--outline btn--sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              className="btn btn--outline btn--sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
