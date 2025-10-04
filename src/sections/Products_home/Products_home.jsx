import axios from "axios";
import "./Products_home.css";
import { useState, useEffect } from "react";

export default function Products_home() {
  const [products, setProducts] = useState([]);
  const [sections, setSections] = useState([]); // الأقسام: array of strings
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("ALL");
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // عند تحميل الصفحة
  useEffect(() => {
    fetchAllProducts();
    fetchSections();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "https://thunder-nutrition.com/api/get_all_products.php"
      );
      const productData = response.data.data || response.data;
      setProducts(productData);
      setActiveSection("ALL");
    } catch (err) {
      console.error("Error fetching all products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await axios.get(
        "https://thunder-nutrition.com/api/get_sections.php"
      );
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        setSections(data);
      }
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };

  // جلب المنتجات حسب القسم
  const fetchProductsBySection = async (sectionValue) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "https://thunder-nutrition.com/api/get_products_by_section.php",
        { name: sectionValue },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const productData = response.data.data || response.data;
      setProducts(productData);
      setActiveSection(sectionValue);
    } catch (err) {
      console.error("Error fetching products by section:", err);
      setError(`Failed to load ${sectionValue} products`);
    } finally {
      setLoading(false);
    }
  };

  // التعامل مع ضغط المستخدم على قسم معين
  const handleSectionClick = (sectionValue) => {
    if (sectionValue === "ALL") {
      fetchAllProducts();
    } else {
      fetchProductsBySection(sectionValue);
    }
  };

  return (
    <div className="Products_home container">
      <h1>All Products</h1>

      <ul className="sections-nav mt-4 mb-5">
        <li
          className={activeSection === "ALL" ? "active" : ""}
          onClick={() => handleSectionClick("ALL")}
        >
          ALL
        </li>

        {/* الأقسام من API */}
        {sections.map((sec, index) => (
          <li
            key={index}
            className={activeSection === sec ? "active" : ""}
            onClick={() => handleSectionClick(sec)}
          >
            {sec.toUpperCase()}
          </li>
        ))}
      </ul>

      {/* حالة الخطأ */}
      {error && (
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchAllProducts}>Try Again</button>
        </div>
      )}

      {/* المنتجات */}
      {!loading && !error && (
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product.p_id || index}
                className={`product-card back top ${
                  index === 0 &&
                  (activeSection === "ALL" ||
                    activeSection.toLowerCase() === "protein")
                    ? "first-product"
                    : ""
                }`}
              >
                <div className="product-image">
                  {product.img_url ? (
                    <video
                      src={product.vid_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        maxWidth: "30rem",
                        maxHeight: "500px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-name">
                    {product.pname || "Product Name"}
                  </h3>

                  {product.weight && (
                    <div className="product-price">
                      <span className="price">
                        <span className="impact">Weight:</span> {product.weight}
                      </span>
                    </div>
                  )}

                  {product.digit &&
                    Object.entries(product.digit).map(([key, value]) => (
                      <div key={key} className="product-price">
                        <span className="price">
                          <span className="impact">{capitalize(key)}:</span>{" "}
                          {!isNaN(parseFloat(value))
                            ? Math.trunc(parseFloat(value))
                            : value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">
              <p>No products found in this section.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
