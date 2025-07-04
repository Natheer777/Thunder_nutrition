import "./Verfiy_product.css";
import { FiInstagram } from "react-icons/fi";
import { FiFacebook } from "react-icons/fi";

import scan from '../../assets/scan-qr-C9SOJXD7.webp'
import Logo from '../../assets/logo th-DbHWZ0Te.webp'
export default function Verfiy_product() {
  return (
    <>
      <div className="Verfiy_product">
        <div className="container">
          <div className="row">
            <div className="scan col-xl-4 col-lg-4 left">
              <img src={scan}  alt="" />
            </div>
            <div className="col-xl-4 col-lg-4 top">
              <ul>
                <h2>Verify Your Product</h2>
                <li>1. Scratch the QR code on the back of the package. </li>
                <li>2. Use your smartphone camera to scan the QR code. </li>
                <li> 3. Follow the link that the QR code refers to. </li>
                <li>
                  Note: The QR code can only be scanned once, After scanning the
                  QR code it will be destroyed automatically..
                </li>
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
