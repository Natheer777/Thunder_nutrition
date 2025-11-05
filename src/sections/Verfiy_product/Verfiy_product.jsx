import "./Verfiy_product.css";
import { FiInstagram } from "react-icons/fi";
import { FiFacebook } from "react-icons/fi";

import scan from '../../assets/qr scan.png'
import Logo from '../../assets/logo th-DbHWZ0Te.webp'
export default function Verfiy_product() {
  return (
    <>
      <div className="Verfiy_product">
        <div className="container">
          <div className="row">
            <div className="scan col-xl-4 col-lg-4 left">
              <img src={scan} alt="" />
            </div>
            <div className="col-xl-4 col-lg-4 top">
              <ul>
                <h2>How to View Product Information</h2>
                <li>1️⃣ Scan the QR Code
                  Find the QR code on the product sticker and scan it with your smartphone camera.</li>
                <li>2️⃣ Open the Product Page
                  Follow the link that appears to visit the official webpage for this product.</li>
                <li>3️⃣ Explore the Details
                  On the webpage, you can view detailed information about the product’s ingredients, usage, and nutritional facts</li>
          
              </ul>
            </div>
            <div className="verfiyLogo container col-xl-4 col-lg-4 right">
              <img src={Logo} alt="" />
              <div className="social">
                <FiFacebook />
                <FiInstagram />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
