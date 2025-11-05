import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommingSoon.css';

export default function ComingSoon() {
  const [comingSoonProducts, setComingSoonProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // List of product names to show in the Coming Soon section
  const targetProducts = [
    'CREATINE-PURE250G',
    'CREA-CHEWS',
    'VIGOR-PRE',
    'RAIDEN-PAK'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          'https://thunder-nutrition.com/api/get_all_products.php'
        );
        
        const allProducts = response.data.data || response.data;
        
        // Filter products to only include the target products
        const filteredProducts = allProducts.filter(product => 
          targetProducts.includes(product.pname)
        );
        
        setComingSoonProducts(filteredProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Function to format product name for display
  const formatProductName = (name) => {
    return name
      .replace(/-/g, ' ')  // Replace hyphens with spaces
      .replace(/\b\w/g, char => char.toUpperCase()) // Capitalize first letter of each word
      .trim();
  };

  if (loading) {
    return (
      <div className="coming-soon-container">
        <h1>Coming Soon</h1>
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coming-soon-container">
        <h1>Coming Soon</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="comm container coming-soon-container Details mt-5 mb-5">
      <h1>Coming Soon</h1>
      <p className="subtitle">Exciting new products launching soon!</p>
      
      <div className="products-grid">
        {comingSoonProducts.length > 0 ? (
          comingSoonProducts.map((product, index) => (
            <div key={product.p_id || index} className="product-card">
              <div className="product-image">
                {product.img_url ? (
                  <img 
                    src={product.img_url} 
                    alt={product.pname} 
                    className="product-img"
                  />
                ) : (
                  <div className="no-image">No Image Available</div>
                )}
                <div className="coming-soon-badge">Coming Soon</div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">
                  {formatProductName(product.pname) || 'New Product'}
                </h3>
                
                {product.weight && (
                  <div className="product-detail">
                    <span className="detail-label">Weight:</span>{' '}
                    <span className="detail-value">{product.weight}</span>
                  </div>
                )}
                
            
                
           
                
            
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            No upcoming products found. Check back soon for updates!
          </div>
        )}
      </div>
    </div>
  );
}
