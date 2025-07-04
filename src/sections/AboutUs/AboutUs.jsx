import "./AboutUs.css";
import Thunder from "../../assets/Asset 7@4x.png";
export default function AboutUs() {
  return (
    <>
      <div className="AboutUS mt-5">
        <div className="container">

        <h1 className="left">About Us</h1>
        <p className="right">
          Thunder is not just a supplement company it is a complete lifestyle
          for ambitious athletes striving to achieve peak performance and push
          their limits
        </p>
        </div>
        <div className="marquee-container mt-5">
          <div className="marquee-text">
            <ul>
              <li>
                <span>
                  <img src={Thunder} alt="" />
                </span>{" "}
                Feel The Thunder
              </li>
              <li>
                <span>
                  <img src={Thunder} alt="" />
                </span>{" "}
                Feel The Thunder
              </li>
              <li>
                <span>
                  <img src={Thunder} alt="" />
                </span>{" "}
                Feel The Thunder
              </li>
              <li>
                <span>
                  <img src={Thunder} alt="" />
                </span>{" "}
                Feel The Thunder
              </li>
              <li>
                <span>
                  <img src={Thunder} alt="" />
                </span>{" "}
                Feel The Thunder
              </li>
              <li>
                <span>
                  <img src={Thunder} alt="" />
                </span>{" "}
                Feel The Thunder
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
