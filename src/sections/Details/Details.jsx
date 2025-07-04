import "./Details.css";
import img1 from "../../assets/Home/Layer 1.png";
import img2 from "../../assets/Home/Layer 2.png";
export default function Details() {
  return (
    <>
      <div className="Details container mt-5">
        <div className="row">
          <div className="col-xl-6 col-lg-6 right">
            <h1>Energize Your Performance with THUNDER</h1>
            <p>
              Nestled in the heart of the United Kingdom, THUNDER is dedicated
              to empowering athletes with premium supplements that fuel peak
              performance. Our commitment to quality and innovation is reflected
              in every product we create, tailored to support your training
              goals. We blend science and passion, ensuring that each supplement
              is crafted with precision to meet the unique needs of athletes at
              all levels. Join us on a journey to unleash your full potential
              with THUNDER.
            </p>
          </div>
          <div className="col-xl-6 col-lg-6 left">
            <img src={img1} alt="" />
          </div>
        </div>
        <div className="row mt-5 revers">
          <div className="col-xl-6 col-lg-6 left">
            <img src={img2} alt="" />
          </div>
          <div className=" col-xl-6 col-lg-6 right">
            <h1>Our Mission</h1>
            <p>
              we focus on helping sports professionals achieve their best
              performance through scientifically formulated supplements. We are
              committed to quality and excellence in every product we offer.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
