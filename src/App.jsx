import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import "./App.css";
import HashLoader from "react-spinners/HashLoader";
import { useEffect, useState } from "react";
import { All_Products, Home, Products , Contacts} from "./pages/index";
import { FaTurnUp } from "react-icons/fa6";
function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setInterval(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          } else {
            entry.target.classList.remove("show");
                  observer.unobserve(entry.target); // نوقف المراقبة بعد الظهور

          }
        });
      });

      const Elements = document.querySelectorAll(
        ".left ,.right ,.top ,.hidden"
      );
      Elements.forEach((el) => observer.observe(el));

      return () => {
        Elements.forEach((el) => observer.unobserve(el));
      };
    });
  }, []);

  /////////////

  
  useEffect(() => {
    const up = document.querySelectorAll(".up");

    const handleScroll = () => {
      window.scrollY >= 120
        ? up.forEach((item) => item.classList.add("look"))
        : up.forEach((item) => item.classList.remove("look"));
    };

    const handleScrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    window.addEventListener("scroll", handleScroll);
    up.forEach((item) => item.addEventListener("click", handleScrollToTop));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      up.forEach((item) =>
        item.removeEventListener("click", handleScrollToTop)
      );
    };
  }, []);


  return (
    <>
        <button className='up'><FaTurnUp /></button>

      {loading ? (
        <HashLoader
          style={{}}
          className="loading"
          color={"#3b84a9"}
          loading={loading}
          size={30}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      ) : (
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product-info/:identifier" element={<Products />} />
            <Route path="/Products" element={<All_Products />} />
            <Route path="/Contact" element={<Contacts />} />
          </Routes>
        </Router>
      )}
    </>
  );
}

export default App;
