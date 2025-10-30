import { useEffect, useState } from "react";

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [sentAlerts, setSentAlerts] = useState(new Set());

  useEffect(() => {
    fetch("http://localhost:5000/api/products/pricing")
      .then((res) => res.json())
      .then((data) => setProducts(data));
    
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'sales') return b.sales - a.sales;
    if (sortBy === 'clicks') return b.clicks - a.clicks;
    if (sortBy === 'price') return b.price - a.price;
    if (sortBy === 'views') return b.views - a.views;
    return 0;
  });

  const sendProductAlert = async (productId) => {
    try {
      const response = await fetch("http://localhost:5000/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId })
      });
      
      if (response.ok) {
        setSentAlerts(prev => new Set([...prev, productId]));
        setTimeout(() => {
          setSentAlerts(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Hot': 'border-orange-300 bg-orange-50',
      'Trending': 'border-blue-300 bg-blue-50', 
      'Regular': 'border-gray-300 bg-gray-50'
    };
    return colors[status] || 'border-gray-300 bg-gray-50';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Hot': '🔥',
      'Trending': '📈',
      'Regular': '📊'
    };
    return icons[status] || '📊';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Electronics': '📱',
      'Audio': '🎵',
      'Computers': '💻',
      'Wearables': '⌚',
      'Photography': '📸',
      'Accessories': '🔧',
      'Gaming': '🎮',
      'Networking': '🌐',
      'Storage': '💾',
      'Smart Home': '🏠',
      'Displays': '🖥️',
      'Appliances': '🏠'
    };
    return icons[category] || '📦';
  };

  const trendingCount = products.filter(p => p.status === 'Hot' || p.status === 'Trending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🏆 E-commerce Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Real-time herd behavior detection</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-yellow-50"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category.category} value={category.category}>
                    {category.category}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="sales">Sort by Sales</option>
                <option value="views">Sort by Views</option>
                <option value="clicks">Sort by Clicks</option>
                <option value="price">Sort by Price</option>
              </select>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">Showing {sortedProducts.length} of {products.length} products</p>
            <div className="flex items-center space-x-2 text-orange-600">
              <span className="text-lg">🔥</span>
              <span className="font-medium">{trendingCount} trending now</span>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product, index) => (
            <div 
              key={index}
              className={`bg-white rounded-2xl p-6 shadow-xl border-2 ${getStatusColor(product.status)} hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}
            >
              {/* Product Image Placeholder */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-48 mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">{getCategoryIcon(product.category)}</div>
                  <p className="text-gray-500 text-sm">Product Image</p>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-800 truncate" title={product.product_name}>
                  {product.product_name}
                </h3>
                
                <p className="text-sm text-gray-600">{product.category}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-medium">{product.views.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    <span className="font-medium">{product.sales.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">${product.price}</span>
                  
                  <div className="flex items-center space-x-2">
                    {product.status === 'Hot' && (
                      <span className="flex items-center space-x-1 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">
                        <span>🔥</span>
                        <span>Hot</span>
                      </span>
                    )}
                    {product.status === 'Trending' && (
                      <span className="flex items-center space-x-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        <span>📈</span>
                        <span>Trending</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {product.click_increase_percent > 80 ? (
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm font-medium">{product.click_increase_percent}%</span>
                  </div>
                </div>
                
                {/* Send Promotion Button */}
                <button
                  onClick={() => sendProductAlert(product.product_id)}
                  disabled={sentAlerts.has(product.product_id)}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    sentAlerts.has(product.product_id)
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                  }`}
                >
                  {sentAlerts.has(product.product_id) ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span>✅</span>
                      <span>Sent!</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Send Promotion</span>
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopProducts;
