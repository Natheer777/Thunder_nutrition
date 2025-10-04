import "./All_Product.css";
import { useState, useEffect } from "react";
import axios from "axios";

export default function All_Product() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("https://thunder-nutrition.com/api/get_all_products.php")
      .then((res) => setData(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="container">
      <h1 className="Our mb-5 mt-5 wave-text">OUR PRODUCTS</h1>
      <div className="All_Product">
        {data.map((item) => (
          <div key={item.id} className="All_Product_items hidden">
            <div className="product-card p-4 shadow-sm ">
              <img loading="lazy" src={item.img_url} alt="" />
              <h2>{item.pname}</h2>
              <p className="mb-4">
                <strong>Price:</strong> {item.price}$
              </p>
              <a
                className="Link_Product"
                href={`${item.const_QrCode}?from=internal`}
                target="_blank"
              >
                read more
              </a>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
