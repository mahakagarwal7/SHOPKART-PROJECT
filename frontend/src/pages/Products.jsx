import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial query params from URL
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('');
  const [categories, setCategories] = useState(['Electronics', 'Fashion', 'Books', 'Home']);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Synchronize category or search change from URL params
  useEffect(() => {
    const urlCat = searchParams.get('category') || '';
    const urlSearch = searchParams.get('search') || '';
    if (urlCat !== category) setCategory(urlCat);
    if (urlSearch !== search) setSearch(urlSearch);
  }, [searchParams]);

  // Fetch user wishlist to identify saved products
  useEffect(() => {
    let mounted = true;
    api
      .get('/wishlist')
      .then((res) => {
        if (mounted && res.data?.wishlist) {
          setWishlistIds(new Set(res.data.wishlist.map((item) => item._id)));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch available distinct categories from API
  useEffect(() => {
    let mounted = true;
    api
      .get('/products/categories')
      .then((res) => {
        if (mounted && res.data?.categories && res.data.categories.length > 0) {
          const combined = Array.from(new Set([...categories, ...res.data.categories]));
          setCategories(combined);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch products
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
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, category, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    setSearchParams({});
  };

  return (
    <div className="storefront-catalog-page">
      <div className="storefront-container">
        {/* Breadcrumb & Header */}
        <div className="catalog-header-block">
          <div className="catalog-breadcrumbs">
            <Link to="/home">Home</Link>
            <span>/</span>
            <span>Catalog</span>
            {category && (
              <>
                <span>/</span>
                <span className="current-crumb">{category}</span>
              </>
            )}
          </div>

          <div className="catalog-title-row">
            <div>
              <h1 className="catalog-title">
                {category ? `${category} Collection` : 'All Products Catalog'}
              </h1>
              <p className="catalog-subtitle">
                Discover exceptional quality essentials with fast delivery and easy returns.
              </p>
            </div>
            {!loading && (
              <div className="catalog-count-pill">
                {products.length} {products.length === 1 ? 'Product' : 'Products'} available
              </div>
            )}
          </div>
        </div>

        {/* Toolbar: Search, Category Pills, and Sort */}
        <SearchBar
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            if (val) setSearchParams({ search: val, ...(category ? { category } : {}) });
            else setSearchParams(category ? { category } : {});
          }}
          category={category}
          onCategoryChange={(cat) => {
            setCategory(cat);
            if (cat) setSearchParams({ category: cat, ...(search ? { search } : {}) });
            else setSearchParams(search ? { search } : {});
          }}
          sort={sort}
          onSortChange={setSort}
          categories={categories}
        />

        {/* Catalog Grid & UI States */}
        {loading ? (
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p>Loading catalog items...</p>
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
            <p>We couldn't find any products matching your current filters.</p>
            {(search || category || sort) && (
              <button type="button" onClick={handleResetFilters} className="btn-reset">
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="storefront-products-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialWishlisted={wishlistIds.has(product._id)}
                onWishlistChange={(id, isSaved) => {
                  setWishlistIds((prev) => {
                    const updated = new Set(prev);
                    if (isSaved) updated.add(id);
                    else updated.delete(id);
                    return updated;
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
