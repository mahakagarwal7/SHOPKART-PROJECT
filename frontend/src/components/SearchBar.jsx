import React from 'react';
import { SearchIcon, CloseIcon } from './Icons';

export default function SearchBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories = ['Electronics', 'Audio', 'Fashion', 'Books', 'Home']
}) {
  return (
    <div className="storefront-toolbar">
      {/* Search Input Box */}
      <div className="toolbar-search-box">
        <SearchIcon size={18} className="search-icon-symbol" />
        <input
          type="text"
          placeholder="Search by product name, category, brand..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="toolbar-search-input"
        />
        {search && (
          <button
            type="button"
            className="btn-clear-search"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* Category Pills Strip */}
      <div className="toolbar-category-pills">
        <button
          type="button"
          onClick={() => onCategoryChange('')}
          className={`category-filter-pill ${category === '' ? 'pill-active' : ''}`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`category-filter-pill ${category === cat ? 'pill-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sorting Dropdown */}
      <div className="toolbar-sort-box">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="toolbar-sort-select"
          title="Sort catalog"
        >
          <option value="">Featured / Relevance</option>
          <option value="price_asc">Price: Low to High (₹ ↑)</option>
          <option value="price_desc">Price: High to Low (₹ ↓)</option>
        </select>
      </div>
    </div>
  );
}
