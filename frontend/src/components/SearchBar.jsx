import React from 'react';

export default function SearchBar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories = ['Electronics', 'Fashion', 'Books', 'Home']
}) {
  return (
    <div className="search-filter-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {search && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      <div className="filter-dropdowns">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="filter-select"
          title="Sort Products"
        >
          <option value="">Sort by: Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
