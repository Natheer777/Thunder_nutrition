import { useLocation } from "react-router-dom";
import {
  Footer,
  Verfiy_product,
  Details_Product,
  Navbar
} from "../../sections";
import Logo from "../../assets/logo th-DbHWZ0Te.webp";
import { Thunder } from "../../../components";

export default function Products() {
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fromInternal = queryParams.get("from") === "internal";

  return (
    <>
      <Thunder />

      {fromInternal && <Navbar />}

      {!fromInternal ? (
        <div className="content-overlay">
          <nav className="navbar navbar-expand-lg">
            <div className="container container-fluid">
              <a className="navbar-brand hidden" href="#">
                <img src={Logo} alt="Logo" />
              </a>
            </div>
          </nav>

          <Details_Product />
          <Verfiy_product />
          <Footer />
        </div>
      ) : (
        <>
          <Details_Product />
          <Verfiy_product />
          <Footer />
        </>
      )}
    </>
  );
}
