import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Details_Product.css";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { GiPineapple, GiFruitBowl, GiBanana } from "react-icons/gi";
import { FaCookie, FaWineBottle, FaAppleAlt, FaWater } from "react-icons/fa";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// import required modules
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import orang_lemon from "../../assets/Flavors/orange.png";
import strawberry_kiwi from "../../assets/Flavors/kiwi.png";
import grap_blueberries from "../../assets/Flavors/blueberries.png";
import chocolate from "../../assets/Flavors/chocolate.png";
import chocolate_benutbutter from "../../assets/Flavors/chocolate-bar.png";
import chocolate_banana from "../../assets/Flavors/energy-bar (1).png";
import vanilla_bounty from "../../assets/Flavors/vanilla.png";
import strwberry_banana from "../../assets/Flavors/fruit.png";

export default function Details_product() {
  const { identifier } = useParams();

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("Fetching product using:", identifier);
        let res;

        if (!identifier) {
          setError("No product identifier provided");
          setLoading(false);
          return;
        }

        // Check if identifier is a number (ID) or string (name)
        const isId = /^\d+$/.test(identifier);

        if (isId) {
          res = await axios.post(
            "https://thunder-nutrition.com/api/get_product_by_id.php",
            {
              id: identifier,
            }
          );
        } else {
          res = await axios.post(
            "https://thunder-nutrition.com/api/get_product_by_name.php",
            {
              name: identifier,
            }
          );
        }

        if (res.data.status === "success" && res.data.data.length > 0) {
          setProductData(res.data.data[0]);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [identifier]);

  if (loading) return <p></p>;
  if (error) return <p>{error}</p>;
  if (!productData) return <p>No product data available.</p>;

  const {
    pname,
    description,
    how_to_use,
    warnings,
    // img_background,
    weight,
    price,
    num_of_serving,
    num_of_scope,
    // flavors,
    // const_QrCode,
    // images,
    img_url,
    img_url2,
    img_url3,
    // protein,
    // calories,
    // carbs,
  } = productData;

  const productImages = [img_url, img_url2, img_url3].filter(
    (url) => url && url.trim() !== ""
  );

  const descriptionLines = description
    ?.split(/[.;،]\s*/)
    .filter((line) => line.trim() !== "");

  // Show first 3 lines for short description
  const shortDescription = descriptionLines.slice(0, 3);
  const fullDescription = descriptionLines;

  return (
    <>
      <div className="swiper_product mb-5 ">
        <div
          className="BackgroundImage"
          style={{
            backgroundImage: `url(${productData.img_background})`,
          }}
        ></div>
        <div className="container">
          <div className="Swiper_Conent">
            <div className="container">
              <div className="row">
                <div className="Swiper left col-xl-6 col-lg-6">
                  <Swiper
                    spaceBetween={30}
                    centeredSlides={true}
                    autoplay={{
                      delay: 2500,
                      disableOnInteraction: false,
                    }}
                    pagination={{
                      clickable: true,
                    }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="mySwiper"
                  >
                    {productImages.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={`${img}?w=800&h=600&c_fit&f_auto,q_auto`}
                          alt="product"
                          loading="lazy"
                          width={800}
                          height={600}
                          style={{
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                          className="swiper-product-image"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                <div className="col-xl-6 col-lg-6">
                  <div className="details_product">
                    <h1 className="text-xl font-bold mb-2">
                      {pname.replace(/-/g, " ")}
                    </h1>
                    <div className="product-description">
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        <span className="how_use">Description :</span>{" "}
                        {showFullDescription
                          ? fullDescription.join("\n")
                          : shortDescription.join("\n")}
                      </div>

                      {descriptionLines.length > 3 && (
                        <span
                          className="spanShowMore"
                          onClick={() =>
                            setShowFullDescription((prev) => !prev)
                          }
                        >
                          {showFullDescription ? "Show Less" : "Show More"}
                        </span>
                      )}
                    </div>

                    <p className="right">
                      <span className="how_use">How to use :</span> {how_to_use}
                    </p>
                    <p className="right">
                      <span className="warning">Warnings :</span> {warnings}
                    </p>

                    <div className="product-properties">
                      <ul>
                        <li className="left">
                          <strong>{weight}</strong>
                        </li>
                        <li className="right">
                          <strong>{num_of_serving}</strong>
                        </li>
                        <li className="left">
                          <strong>{num_of_scope}</strong>
                        </li>
                        <li className="left">
                          <strong>{price}$</strong>
                        </li>
                      </ul>
                    </div>

                    <div className="product-flavors">
                      <div className="flavor-list">
                        {[...new Set(productData.flavors)]
                          .filter((flavor) => flavor && flavor.trim() !== "")
                          .map((flavor, index) => {
                            const normalized = flavor.toLowerCase().trim();

                            const flavorAssets = [
                              {
                                keywords: [
                                  "chocolate peanut butter",
                                  "choclate & penut",
                                  "chocolate & penut",
                                  "choclate & peanut",
                                  "chocolate & peanut",
                                ],
                                name: "Chocolate & Peanut Butter",
                                image: chocolate_benutbutter,
                              },
                              {
                                keywords: ["chocolate", "choclate"],
                                name: "Chocolate",
                                image: chocolate,
                              },
                              {
                                keywords: ["chocolate & banana"],
                                name: "Chocolate & Banana",
                                image: chocolate_banana,
                              },
                              {
                                keywords: ["vanilla", "vanilla & bounty"],
                                name: "Vanilla & Bounty",
                                image: vanilla_bounty,
                              },
                              {
                                keywords: [
                                  "strawberry banana",
                                  "strawberry & banana",
                                  "strawberry and banana",
                                ],
                                name: "Strawberry & Banana",
                                image: strwberry_banana,
                              },
                              {
                                keywords: ["orange lemon", "orange & lemon"],
                                name: "Orange & Lemon",
                                image: orang_lemon,
                              },
                              {
                                keywords: [
                                  "strawberry kiwi",
                                  "strawberry & kiwi",
                                ],
                                name: "Strawberry & Kiwi",
                                image: strawberry_kiwi,
                              },
                              {
                                keywords: [
                                  "grape blueberry",
                                  "grape & blueberry",
                                ],
                                name: "Grape & Blueberry",
                                image: grap_blueberries,
                              },
                            ];

                            const match = flavorAssets.find((f) =>
                              f.keywords.some((k) => normalized === k)
                            );

                            if (match) {
                              return (
                                <div
                                  key={index}
                                  className="flavor-item flavor-with-image"
                                >
                                  <img
                                    src={match.image}
                                    alt={match.name}
                                    title={match.name}
                                    width={60}
                                    height={60}
                                    style={{
                                      borderRadius: "10px",
                                      objectFit: "cover",
                                      marginBottom: "5px",
                                      marginRight: "10px",
                                    }}
                                  />
                                  <span className="flavor-name">
                                    {match.name}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <div
                                  key={index}
                                  className="flavor-item flavor-default"
                                >
                                  <FaAppleAlt
                                    size={24}
                                    style={{ marginBottom: "5px" }}
                                  />
                                  <span className="flavor-name">{flavor}</span>
                                </div>
                              );
                            }
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="proprties_product mt-5 mb-5">
          <div className="container">
            <div className="row align-items-center">
              <ul className="col-xl-6 col-l-6">
             {productData.digit &&
  Object.entries(productData.digit).map(([key, value]) => {
    // إزالة الشرطة السفلية وتكبير أول حرف من كل كلمة
    const formattedKey = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // تحويل القيمة إلى عدد صحيح إذا كانت رقمًا
    const formattedValue = !isNaN(parseFloat(value))
      ? Math.trunc(parseFloat(value))
      : value;

    return (
      <li key={key}>
        {formattedKey}: {formattedValue}
      </li>
    );
  })}

              </ul>

              <div className="col-xl-6 col-l-6 d-flex justify-content-center align-items-center">
                {productData.vid_url ? (
                  <video
                    src={productData.vid_url}
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
                  <p>No product video available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
