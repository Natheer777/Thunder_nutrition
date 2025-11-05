import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import {
  getProductsBySection,
  createProduct,
  updateProduct,
  deleteProduct,
  logout,
} from "../../api";
import ShinyText from "../../components/ShinyText/ShinyText";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Dashbord.css";

function ProductForm({ initial, onSave, onClose, isLoading }) {
  const [form, setForm] = useState(initial);
  const [formError, setFormError] = useState("");

  function handleChange(e) {
    const { name, files } = e.target;
    let { value } = e.target;

    if (name === "images" || name === "videos") {
      const list = files ? Array.from(files) : [];
      setForm((f) => ({ ...f, [name]: list }));
      return;
    }

    const numericFields = ["price"];

    if (numericFields.includes(name)) {
      setForm((f) => ({ ...f, [name]: value }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  }

  return (
    <div className="dashboard-modal-bg">
      <form
        className="dashboard-modal"
        onSubmit={(e) => {
          e.preventDefault();
          setFormError("");
          onSave(form);
        }}
      >
        <h3 className="dashboard-title mb-4">
          {initial.p_id ? "Edit" : "Add"} Product
        </h3>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="pname" className="form-label">
              Product Name Qr
            </label>
            <input
              id="pname"
              name="pname"
              placeholder="Enter product name in English"
              className="w-full mb-2 p-2 border rounded"
              value={form.pname || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter general product description..."
              className="w-full mb-2 p-2 border rounded"
              value={form.description || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group span-2">
            <label htmlFor="how_to_use" className="form-label">
              How To Use
            </label>
            <textarea
              id="how_to_use"
              name="how_to_use"
              placeholder="Explain how to use the product..."
              className="w-full mb-2 p-2 border rounded"
              value={form.how_to_use || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Price
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full mb-2 p-2 border rounded"
              value={form.price ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight" className="form-label">
              Weight
            </label>
            <input
              id="weight"
              name="weight"
              placeholder="e.g. 900G"
              className="w-full mb-2 p-2 border rounded"
              value={form.weight || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="qr_code" className="form-label">
              QR Code Link
            </label>
            <input
              id="qr_code"
              name="qr_code"
              placeholder="Enter QR code URL"
              className="w-full mb-2 p-2 border rounded"
              value={form.qr_code || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="const_BarCode" className="form-label">
              Barcode (const_BarCode)
            </label>
            <input
              id="const_BarCode"
              name="const_BarCode"
              placeholder="Enter barcode"
              className="w-full mb-2 p-2 border rounded"
              value={form.const_BarCode || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">
              Type
            </label>
            <select
              id="type"
              name="type"
              className="w-full mb-2 p-2 border rounded"
              value={form.type ?? ""}
              onChange={handleChange}
            >
              <option value="">Select type</option>
              <option value="0">Tablet</option>
              <option value="1">Powder</option>
              <option value="2">Injection</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label htmlFor="warnings" className="form-label">
              Important Warnings
            </label>
            <textarea
              id="warnings"
              name="warnings"
              placeholder="Enter important warnings..."
              className="w-full mb-2 p-2 border rounded"
              value={form.warnings || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="img_url2" className="form-label">
              Image 1
            </label>
            <input
              id="img_url2"
              name="img_url2"
              type="file"
              accept="image/*"
              className="w-full mb-2 p-2 border rounded"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  img_url2: e.target.files?.[0] || null,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="img_url3" className="form-label">
              Image 2
            </label>
            <input
              id="img_url3"
              name="img_url3"
              type="file"
              accept="image/*"
              className="w-full mb-2 p-2 border rounded"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  img_url3: e.target.files?.[0] || null,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="img_background" className="form-label">
              Image 3 (Background)
            </label>
            <input
              id="img_background"
              name="img_background"
              type="file"
              accept="image/*"
              className="w-full mb-2 p-2 border rounded"
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  img_background: e.target.files?.[0] || null,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="vid_url" className="form-label">
              Product Video
            </label>
            <input
              id="vid_url"
              name="vid_url"
              type="file"
              accept="video/*"
              className="w-full mb-2 p-2 border rounded"
              onChange={(e) =>
                setForm((f) => ({ ...f, vid_url: e.target.files?.[0] || null }))
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="sugars" className="form-label">
              Sugars
            </label>
            <input
              id="sugars"
              name="sugars"
              type="text"
              placeholder="e.g. 0"
              className="w-full mb-2 p-2 border rounded"
              value={form.sugars ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="protein" className="form-label">
              Protein
            </label>
            <input
              id="protein"
              name="protein"
              type="text"
              placeholder="e.g. 24"
              className="w-full mb-2 p-2 border rounded"
              value={form.protein ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="calories" className="form-label">
              Calories
            </label>
            <input
              id="calories"
              name="calories"
              type="text"
              placeholder="e.g. 120"
              className="w-full mb-2 p-2 border rounded"
              value={form.calories ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="carb" className="form-label">
              Carb
            </label>
            <input
              id="carb"
              name="carb"
              type="text"
              placeholder="e.g. 10"
              className="w-full mb-2 p-2 border rounded"
              value={form.carb ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amino_acids" className="form-label">
              Amino Acids
            </label>
            <input
              id="amino_acids"
              name="amino_acids"
              type="text"
              placeholder="e.g. 5"
              className="w-full mb-2 p-2 border rounded"
              value={form.amino_acids ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bcaa" className="form-label">
              BCAA
            </label>
            <input
              id="bcaa"
              name="bcaa"
              type="text"
              placeholder="e.g. 3"
              className="w-full mb-2 p-2 border rounded"
              value={form.bcaa ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Flavors</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="flavor1"
                placeholder="Flavor 1"
                className="w-full mb-2 p-2 border rounded"
                value={form.flavor1 || ""}
                onChange={handleChange}
              />
              <input
                name="flavor2"
                placeholder="Flavor 2"
                className="w-full mb-2 p-2 border rounded"
                value={form.flavor2 || ""}
                onChange={handleChange}
              />
              <input
                name="flavor3"
                placeholder="Flavor 3"
                className="w-full mb-2 p-2 border rounded"
                value={form.flavor3 || ""}
                onChange={handleChange}
              />
              <input
                name="flavor4"
                placeholder="Flavor 4"
                className="w-full mb-2 p-2 border rounded"
                value={form.flavor4 || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="num_of_serving" className="form-label">
              Servings per container
            </label>
            <input
              id="num_of_serving"
              name="num_of_serving"
              placeholder="e.g. Servings per container : 50"
              className="w-full mb-2 p-2 border rounded"
              value={form.num_of_serving || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="num_of_scope" className="form-label">
              Serving size
            </label>
            <input
              id="num_of_scope"
              name="num_of_scope"
              placeholder="e.g. Serving size: 1 scoop"
              className="w-full mb-2 p-2 border rounded"
              value={form.num_of_scope || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="other" className="form-label">
              Other
            </label>
            <input
              id="other"
              name="other"
              type="text"
              placeholder="Enter any other information"
              className="w-full mb-2 p-2 border rounded"
              value={form.other || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {formError && (
          <div className="text-red-500 mb-2" role="alert">
            {formError}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button type="submit" className="dashboard-btn" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="dashboard-btn"
            style={{ backgroundColor: "#e5e7eb", color: "#2563eb" }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [sections, setSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError, setSectionsError] = useState(null);

  // Fetch sections from API
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setSectionsLoading(true);
        const res = await fetch("https://thunder-nutrition.com/api/get_sections.php");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const sectionList = Array.isArray(data) ? data : data.sections || [];
        setSections(sectionList);
      } catch (err) {
        setSectionsError(err.message);
        setSections([]); // Fallback to empty
      } finally {
        setSectionsLoading(false);
      }
    };

    fetchSections();
  }, []);

  // Generate SEC_ID_TO_KEY mapping from dynamic sections
  const SEC_ID_TO_KEY = Object.fromEntries(
    sections.map((s, idx) => [idx + 1, s])
  );
  const KEY_TO_SEC_ID = Object.fromEntries(
    Object.entries(SEC_ID_TO_KEY).map(([k, v]) => [v, Number(k)])
  );

  const rawInitial = (searchParams.get("section") || (sections[0] || "protein")).toLowerCase();

  const normalizeSectionKey = (s) => {
    if (!s) return sections[0] || "protein";
    const t = String(s)
      .toLowerCase()
      .replace(/[-\s]+/g, "_");
    
    // Check if normalized input matches any section
    const matchedSection = sections.find(
      (sec) => sec.toLowerCase().replace(/[-\s]+/g, "_") === t
    );
    
    if (matchedSection) return matchedSection;
    
    // Fallback to first section
    return sections[0] || "protein";
  };

  const [activeSection, setActiveSection] = useState(
    normalizeSectionKey(rawInitial)
  );

  // Load all sections in parallel on page open
  const sectionQueries = useQueries({
    queries: sections.map((s) => ({
      queryKey: ["products", s],
      queryFn: () => getProductsBySection(s),
      staleTime: 1000 * 60 * 2, // 2 minutes
      enabled: sections.length > 0, // Only run if sections are loaded
    })),
  });

  const isLoading = sectionQueries.some((q) => q.isLoading);
  const error = sectionQueries.find((q) => q.error)?.error ?? null;

  const productsMap = Object.fromEntries(
    sections.map((s, i) => [s, sectionQueries[i]?.data ?? []])
  );

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setEditProduct(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setDeleteId(null);
      setDeleteError(null);
    },
    onError: (err) => {
      const msg = err?.message || "Failed to delete product";
      setDeleteError(msg);
    },
  });

  function handleLogout() {
    const token = localStorage.getItem("token");
    logout(1, token).then(() => {
      localStorage.removeItem("token");
      navigate("/login");
    });
  }

  const productsList = productsMap[activeSection] ?? [];
  const filteredProducts = productsList.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(p.pname || "")
        .toLowerCase()
        .includes(q) ||
      String(p.name || "")
        .toLowerCase()
        .includes(q) ||
      String(p.p_id || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const countFor = (secKey) => (productsMap[secKey] || []).length;

  function setSection(sec) {
    const norm = normalizeSectionKey(sec);
    setActiveSection(norm);
    setSearchParams({ section: norm });
  }

  const secIdForActiveTab =
    KEY_TO_SEC_ID[activeSection] || KEY_TO_SEC_ID[sections[0]] || 1;

  if (sectionsLoading) {
    return (
      <div className="dash">
        <div className="dashboard-bg min-h-screen p-8">
          <div className="text-center">Loading sections...</div>
        </div>
      </div>
    );
  }

  if (sectionsError) {
    return (
      <div className="dash">
        <div className="dashboard-bg min-h-screen p-8">
          <div className="text-red-500 text-center">Error loading sections: {sectionsError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash">
      <div className="dashboard-bg min-h-screen p-8">
        <div className="catego">
          <h1 className="text-center pt-5 fw-bold">
            <ShinyText text="Dashboard" speed={3} className="shiny-heading" />
          </h1>
        </div>
        <div className="container">
          <div className="toolbar mt-5 mb-5">
            <div className="toolbar-left">
              <input
                className="toolbar-search"
                placeholder="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="toolbar-right">
              <button
                className="dashboard-btn"
                onClick={() => setShowForm(true)}
              >
                + Add Product
              </button>
              <button className="dashboard-btn logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          <div className="section-tabs">
            {sections.map((sec) => (
              <button
                key={sec}
                className={`tab ${activeSection === sec ? "active" : ""}`}
                onClick={() => setSection(sec)}
              >
                {sec.charAt(0).toUpperCase() + sec.slice(1)} ({countFor(sec)})
              </button>
            ))}
          </div>

          {isLoading ? (
            <div>Loading products...</div>
          ) : error ? (
            <div className="text-red-500">Error loading products.</div>
          ) : (
            <div>
              {filteredProducts.length === 0 ? (
                <div className="text-center text-gray-500">
                  No matching products.
                </div>
              ) : (
                <div className="product-swiper-wrap">
                  <Swiper
                    className="product-swiper"
                    modules={[Navigation, Pagination, Keyboard]}
                    navigation
                    pagination={{ clickable: true }}
                    keyboard={{ enabled: true, onlyInViewport: true }}
                    watchOverflow={true}
                    centeredSlides={true}
                    centeredSlidesBounds={true}
                    spaceBetween={12}
                    slidesPerView={1}
                    breakpoints={{
                      640: {
                        slidesPerView: 2,
                        spaceBetween: 12,
                        centeredSlides: false,
                      },
                      900: {
                        slidesPerView: 3,
                        spaceBetween: 12,
                        centeredSlides: false,
                      },
                      1280: {
                        slidesPerView: 4,
                        spaceBetween: 12,
                        centeredSlides: false,
                      },
                    }}
                  >
                    {filteredProducts.map((prod) => {
                      const img =
                        prod.img_url ||
                        prod.img_url2 ||
                        prod.img_url3 ||
                        prod.img_background;
                      return (
                        <SwiperSlide key={prod.p_id}>
                          <div className="product-card">
                            <div className="product-card-image">
                              {img ? (
                                <img
                                  src={img}
                                  alt={prod.name || prod.pname || "product"}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="product-card-image placeholder">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="product-card-body">
                              <div className="product-card-title">
                                {prod.name}
                              </div>
                              {prod.pname && (
                                <div className="product-card-subtitle">
                                  {prod.pname}
                                </div>
                              )}
                              <div className="product-card-price">
                                Price: {prod.price}$
                              </div>
                            </div>
                            <div className="product-card-actions">
                              {prod.qr_code ? (
                                <a
                                  className="dashboard-btn"
                                  href={`${prod.qr_code}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Go to product QR route"
                                >
                                  Show More
                                </a>
                              ) : (
                                <span
                                  className="dashboard-btn"
                                  style={{
                                    opacity: 0.6,
                                    pointerEvents: "none",
                                  }}
                                >
                                  Show More
                                </span>
                              )}
                              <button
                                className="dashboard-btn edit"
                                onClick={() => {
                                  setEditProduct(prod);
                                  setShowForm(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="dashboard-btn delete"
                                onClick={() => {
                                  setDeleteError(null);
                                  setDeleteTarget(prod);
                                  const raw =
                                    prod.p_id ??
                                    prod.id ??
                                    prod.product_id ??
                                    prod.pid;
                                  const cleaned =
                                    typeof raw === "string" ? raw.trim() : raw;
                                  const numeric =
                                    cleaned != null && !isNaN(Number(cleaned))
                                      ? Number(cleaned)
                                      : cleaned;
                                  setDeleteId(numeric);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              )}
            </div>
          )}

          {showForm && (
            <ProductForm
              initial={
                editProduct
                  ? {
                      pname: editProduct.pname ?? "",
                      description: editProduct.description ?? "",
                      science_name: editProduct.science_name ?? "",
                      how_to_use: editProduct.how_to_use ?? "",
                      price: editProduct.price ?? "",
                      qr_code: editProduct.qr_code ?? "",
                      const_QrCode: editProduct.const_QrCode ?? "",
                      const_BarCode: editProduct.const_BarCode ?? "",
                      warnings: editProduct.warnings ?? "",
                      weight: editProduct.weight ?? "",
                      type: String(editProduct.type ?? ""),
                      sec_id: editProduct.sec_id ?? secIdForActiveTab,
                      videos: Array.isArray(editProduct.videos)
                        ? [...editProduct.videos]
                        : (editProduct.vid_url ? [editProduct.vid_url] : []),
                      vid_url: editProduct.vid_url ? String(editProduct.vid_url) : null,
                      images: Array.isArray(editProduct.images)
                        ? [...editProduct.images]
                        : (editProduct.img_url ? [editProduct.img_url] : []),
                      img_url: editProduct.img_url ? String(editProduct.img_url) : null,
                      img_url2: editProduct.img_url2 ? String(editProduct.img_url2) : null,
                      img_url3: editProduct.img_url3 ? String(editProduct.img_url3) : null,
                      img_background: editProduct.img_background ? String(editProduct.img_background) : null,
                      sugars: editProduct.sugars ?? "",
                      protein: editProduct.protein ?? "",
                      calories: editProduct.calories ?? "",
                      carb: editProduct.carb ?? "",
                      amino_acids: editProduct.amino_acids ?? "",
                      bcaa: editProduct.bcaa ?? "",
                      flavor1: (Array.isArray(editProduct.flavors) && editProduct.flavors[0]) ? String(editProduct.flavors[0]).trim() : (editProduct.flavor1 ?? ""),
                      flavor2: (Array.isArray(editProduct.flavors) && editProduct.flavors[1]) ? String(editProduct.flavors[1]).trim() : (editProduct.flavor2 ?? ""),
                      flavor3: (Array.isArray(editProduct.flavors) && editProduct.flavors[2]) ? String(editProduct.flavors[2]).trim() : (editProduct.flavor3 ?? ""),
                      flavor4: (Array.isArray(editProduct.flavors) && editProduct.flavors[3]) ? String(editProduct.flavors[3]).trim() : (editProduct.flavor4 ?? ""),
                      flavors: Array.isArray(editProduct.flavors)
                        ? editProduct.flavors.filter(f => f && String(f).trim() !== "")
                        : [],
                      num_of_serving: editProduct.num_of_serving ?? "",
                      num_of_scope: editProduct.num_of_scope ?? "",
                      other: editProduct.other ?? "",
                    }
                  : {
                      pname: "",
                      description: "",
                      science_name: "",
                      how_to_use: "",
                      price: "",
                      qr_code: "",
                      const_QrCode: "",
                      const_BarCode: "",
                      warnings: "",
                      weight: "",
                      type: "",
                      sec_id: secIdForActiveTab,
                      videos: [],
                      vid_url: null,
                      images: [],
                      img_url: null,
                      img_url2: null,
                      img_url3: null,
                      img_background: null,
                      sugars: "",
                      protein: "",
                      calories: "",
                      carb: "",
                      amino_acids: "",
                      bcaa: "",
                      flavor1: "",
                      flavor2: "",
                      flavor3: "",
                      flavor4: "",
                      flavors: [],
                      num_of_serving: "",
                      num_of_scope: "",
                      other: "",
                    }
              }
              onSave={(data) => {
                if (editProduct?.p_id) {
                  const payload = { ...data, p_id: editProduct.p_id };
                  if (!payload.sec_id) payload.sec_id = secIdForActiveTab;
                  updateMutation.mutate(payload);
                } else {
                  const payload = { ...data };
                  if (!payload.sec_id) payload.sec_id = secIdForActiveTab;
                  createMutation.mutate(payload);
                }
              }}
              onClose={() => {
                setShowForm(false);
                setEditProduct(null);
              }}
              isLoading={createMutation.isLoading || updateMutation.isLoading}
            />
          )}

          {deleteId && (
            <div className="dashboard-modal-bg">
              <div className="dashboard-modal">
                <h5>Are you sure you want to delete this product ?</h5>
                {deleteError && (
                  <div className="text-red-500 mb-3" role="alert">
                    {String(deleteError)}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    className="dashboard-btn delete"
                    onClick={() => {
                      const pid = deleteTarget?.p_id ?? deleteId;
                      const p_id =
                        pid != null && !isNaN(Number(pid)) ? Number(pid) : pid;
                      const payload = {
                        p_id,
                        sec_id: deleteTarget?.sec_id ?? secIdForActiveTab,
                      };
                      console.debug("[Delete] payload", payload);
                      deleteMutation.mutate(payload);
                    }}
                    disabled={deleteMutation.isLoading}
                  >
                    {deleteMutation.isLoading ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    className="dashboard-btn"
                    style={{ backgroundColor: "#e5e7eb", color: "#2563eb" }}
                    onClick={() => {
                      setDeleteId(null);
                      setDeleteTarget(null);
                      setDeleteError(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}