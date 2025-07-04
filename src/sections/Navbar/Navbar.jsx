import "./Navbar.css";
import Logo from "../../assets/logo th-DbHWZ0Te.webp";
import { Link } from "react-router-dom";
export default function Navbar() {
  return (
    <>
      <div>
        <nav className="navbar navbar-expand-lg">
          <div className="container container-fluid">
            <a className="navbar-brand hidden" href="#">
              <img src={Logo} alt="" />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item left">
                  <Link className="nav-link active" aria-current="page" to="/">
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item hidden">
                  <Link className="nav-link" to="/Products">
                    <span>Products</span>
                  </Link>
                </li>
                <li className="nav-item right">
                  <Link className="nav-link" to="/Contact">
                    <span>Contact</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
