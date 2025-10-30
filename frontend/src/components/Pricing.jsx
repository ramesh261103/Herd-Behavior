import { useEffect, useState } from "react";

const Pricing = () => {
  const [products, setProducts] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);
  const [selectedRange, setSelectedRange] = useState('All');
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    fetch("http://localhost:5000/api/products/pricing")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        generatePriceRanges(data);
      });
  }, []);

  const generatePriceRanges = (products) => {
    const ranges = [
      { label: 'Under $50', min: 0, max: 50, color: 'from-green-400 to-green-500' },
      { label: '$50 - $100', min: 50, max: 100, color: 'from-blue-400 to-blue-500' },
      { label: '$100 - $200', min: 100, max: 200, color: 'from-purple-400 to-purple-500' },
      { label: '$200 - $500', min: 200, max: 500, color: 'from-orange-400 to-orange-500' },
      { label: '$500 - $1000', min: 500, max: 1000, color: 'from-red-400 to-red-500' },
      { label: 'Over $1000', min: 1000, max: Infinity, color: 'from-indigo-400 to-indigo-500' }
    ];
    setPriceRanges(ranges);
  };

  const filteredProducts = products.filter(product => {
    if (selectedRange === 'All') return true;
    const range = priceRanges.find(r => r.label === selectedRange);
    return range && product.price >= range.min && product.price < range.max;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price;
    if (sortBy === 'sales') return b.sales - a.sales;
    if (sortBy === 'value') return (b.sales / b.price) - (a.sales / a.price);
    return 0;
  });

  const getPriceRange = (price) => {
    const range = priceRanges.find(r => price >= r.min && price < r.max);
    return range || priceRanges[priceRanges.length - 1];
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

  const getValueRating = (sales, price) => {
    const ratio = sales / price;
    if (ratio > 0.5) return { rating: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (ratio > 0.3) return { rating: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (ratio > 0.1) return { rating: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { rating: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            💰 Product Pricing
          </h1>
          <p className="text-gray-600 text-lg">Explore our product catalog with detailed pricing and value analysis</p>
        </div>

        {/* Price Range Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Price Ranges</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedRange('All')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedRange === 'All'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Prices
            </button>
            {priceRanges.map((range, index) => (
              <button
                key={index}
                onClick={() => setSelectedRange(range.label)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedRange === range.label
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priceRanges.map((range, index) => {
            const productsInRange = products.filter(p => p.price >= range.min && p.price < range.max);
            const avgSales = productsInRange.length > 0 ? 
              Math.round(productsInRange.reduce((sum, p) => sum + p.sales, 0) / productsInRange.length) : 0;
            
            return (
              <div 
                key={index}
                className={`bg-gradient-to-br ${range.color} rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300`}
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">{range.label}</h3>
                  <div className="space-y-2">
                    <div className="bg-white/20 rounded-lg p-2">
                      <p className="text-sm opacity-90">Products</p>
                      <p className="text-2xl font-bold">{productsInRange.length}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <p className="text-sm opacity-90">Avg Sales</p>
                      <p className="text-xl font-bold">{avgSales}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Sort Products</h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="price">Price (High to Low)</option>
                <option value="sales">Sales (High to Low)</option>
                <option value="value">Value (Sales/Price)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product, index) => {
            const priceRange = getPriceRange(product.price);
            const valueRating = getValueRating(product.sales, product.price);
            
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">{getCategoryIcon(product.category)}</div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${valueRating.bg} ${valueRating.color}`}>
                    {valueRating.rating}
                  </div>
                </div>
                
                <h4 className="font-bold text-gray-800 mb-2 truncate" title={product.product_name}>
                  {product.product_name}
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="font-bold text-2xl text-green-600">${product.price}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sales</span>
                    <span className="font-bold text-blue-600">{product.sales}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Clicks</span>
                    <span className="font-bold text-purple-600">{product.clicks}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Value Ratio</span>
                    <span className="font-bold text-orange-600">
                      {(product.sales / product.price).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{product.category}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Price Range</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${priceRange.color} text-white`}>
                      {priceRange.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Price vs Performance Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Price vs Performance Analysis</h3>
            <div className="space-y-4">
              {products.slice(0, 5).map((product, index) => {
                const performance = (product.sales / product.price) * 100;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{product.product_name}</h4>
                        <p className="text-sm text-gray-600">${product.price}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{performance.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">Performance Score</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Market Share by Price Range */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Market Share by Price Range</h3>
            <div className="space-y-4">
              {priceRanges.map((range, index) => {
                const productsInRange = products.filter(p => p.price >= range.min && p.price < range.max);
                const marketShare = (productsInRange.length / products.length) * 100;
                const totalSales = productsInRange.reduce((sum, p) => sum + p.sales, 0);
                
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">{range.label}</span>
                      <span className="text-sm text-gray-600">{productsInRange.length} products</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${range.color}`}
                        style={{ width: `${marketShare}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{marketShare.toFixed(1)}% market share</span>
                      <span>{totalSales} total sales</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Recommendations */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">💡 Smart Pricing Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📈</span>
                </div>
                <h4 className="font-bold text-green-800">Price Increase Opportunities</h4>
              </div>
              <p className="text-green-700 text-sm mb-3">Products with high demand but low prices</p>
              <div className="space-y-2">
                {products.filter(p => p.sales > 100 && p.price < 200).slice(0, 3).map((product, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-green-800">{product.product_name}</span>
                    <span className="font-bold text-green-600">+${(product.price * 0.2).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">⚖️</span>
                </div>
                <h4 className="font-bold text-blue-800">Optimal Pricing</h4>
              </div>
              <p className="text-blue-700 text-sm mb-3">Products with balanced price-performance</p>
              <div className="space-y-2">
                {products.filter(p => p.sales / p.price > 0.3 && p.sales / p.price < 0.7).slice(0, 3).map((product, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-blue-800">{product.product_name}</span>
                    <span className="font-bold text-blue-600">${product.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📉</span>
                </div>
                <h4 className="font-bold text-orange-800">Price Reduction Candidates</h4>
              </div>
              <p className="text-orange-700 text-sm mb-3">Products with low sales despite high prices</p>
              <div className="space-y-2">
                {products.filter(p => p.sales < 50 && p.price > 500).slice(0, 3).map((product, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-orange-800">{product.product_name}</span>
                    <span className="font-bold text-orange-600">-${(product.price * 0.15).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Pricing Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Average Price</p>
                <p className="text-2xl font-bold text-green-600">
                  ${(products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Highest Price</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${Math.max(...products.map(p => p.price)).toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Lowest Price</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${Math.min(...products.map(p => p.price)).toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-4">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${products.reduce((sum, p) => sum + (p.price * p.sales), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
