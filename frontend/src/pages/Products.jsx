import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [categories, setCategories] = useState(['Electronics', 'Fashion', 'Books', 'Home']);

  // Fetch available distinct categories from API if available
  useEffect(() => {
    api
      .get('/products/categories')
      .then((res) => {
        if (res.data?.categories && res.data.categories.length > 0) {
          // Merge unique categories with default list
          const combined = Array.from(new Set([...categories, ...res.data.categories]));
          setCategories(combined);
        }
      })
      .catch(() => {
        // Fallback to default categories
      });
  }, []);

  // Fetch products whenever search, category, or sort changes
  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (sort) params.sort = sort;

      const res = await api.get('/products', { params });
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add debounce for search input
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Discover Products</h1>
        <p>Explore top products at the best prices on ShopKart</p>
      </div>

      {/* Search & Filter Component */}
      <SearchBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
        categories={categories}
      />

      {/* State Handling: Loading, Error, Empty, and List */}
      {loading ? (
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <p>{error}</p>
          <button type="button" onClick={fetchProducts} className="btn-retry">
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="state-container empty-state">
          <div className="state-icon">🛍️</div>
          <h2>No products found</h2>
          <p>We couldn't find any products matching your search criteria.</p>
          {(search || category || sort) && (
            <button type="button" onClick={handleResetFilters} className="btn-reset">
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
