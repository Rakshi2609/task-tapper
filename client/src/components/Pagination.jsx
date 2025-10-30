import React from "react";

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Compute a compact page range (1 ... prev curr next ... last)
  const neighbors = 1;
  const start = Math.max(1, page - neighbors);
  const end = Math.min(totalPages, page + neighbors);
  const pages = [];
  if (start > 1) pages.push(1);
  if (start > 2) pages.push('…');
  range(start, end).forEach((p) => pages.push(p));
  if (end < totalPages - 1) pages.push('…');
  if (end < totalPages) pages.push(totalPages);

  if (total <= pageSize) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        className={`px-3 py-1 rounded border text-sm ${canPrev ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
        onClick={() => canPrev && onPageChange(page - 1)}
        disabled={!canPrev}
      >
        Prev
      </button>
      {pages.map((p, idx) => (
        <button
          key={`${p}-${idx}`}
          className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-blue-600 border-blue-600 text-white' : p === '…' ? 'bg-transparent border-transparent cursor-default' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          disabled={p === '…'}
        >
          {p}
        </button>
      ))}
      <button
        className={`px-3 py-1 rounded border text-sm ${canNext ? 'bg-white border-gray-300 hover:bg-gray-50' : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'}`}
        onClick={() => canNext && onPageChange(page + 1)}
        disabled={!canNext}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
