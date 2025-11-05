const BASE_URL = "https://thunder-nutrition.com/api/";

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}UserLogin.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function logout(id, token) {
  const res = await fetch(`${BASE_URL}UserLogout.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, token }),
  });
  return res.json();
}

export async function getAllProducts() {
  const res = await fetch(`${BASE_URL}get_all_products.php`);
  const result = await res.json();
  if (result && Array.isArray(result.data)) {
    return result.data.map(normalizeProductFromApi);
  }
  if (result && typeof result.data === "object" && result.data !== null) {
    return [normalizeProductFromApi(result.data)];
  }
  return [];
}

// Shared normalizer so other endpoints can reuse the same logic
const normalizeProductFromApi = (p) => {
  if (!p || typeof p !== "object") return p;
  const copy = { ...p };

  const toNumberOr = (val, fallback = 0) => {
    if (val === "" || val === null || val === undefined) return fallback;
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  const toStringOrEmpty = (val) => {
    if (val === null || val === undefined || val === "") return "";
    return String(val);
  };

  // Coerce id and price
  if ("p_id" in copy) copy.p_id = toNumberOr(copy.p_id, copy.p_id);
  if ("id" in copy && copy.p_id == null)
    copy.p_id = toNumberOr(copy.id, copy.id);
  copy.price = toNumberOr(copy.price, 0);

  // Map new API fields to expected ones
  // Prefer pname for display name if name is missing
  copy.name = toStringOrEmpty(copy.name || copy.pname);

  // Normalize QR/Bar codes coming under alternative keys
  copy.qr_code = toStringOrEmpty(
    copy.qr_code || copy.const_QrCode || copy.const_QRCode
  );
  copy.bar_code = toStringOrEmpty(copy.bar_code || copy.const_BarCode);

  // Derive section name from type if sec_name is absent
  if (!copy.sec_name) {
    const rawType = copy.type;
    const tStr = toStringOrEmpty(rawType).toLowerCase();
    // Support both textual and numeric encodings
    if (tStr === "powder" || tStr === "tablet" || tStr === "tablets") {
      copy.sec_name = "tablets";
    } else if (
      tStr === "inject" ||
      tStr === "injection" ||
      tStr === "injectables" ||
      tStr === "vial"
    ) {
      copy.sec_name = "injectables";
    } else if (!isNaN(Number(rawType))) {
      const n = Number(rawType);
      // 0: tablet, 1: powder -> tablets; 2: injection -> injectables
      copy.sec_name = n === 2 ? "injectables" : "tablets";
    }
  }

  // Ensure flavors is an array
  if (typeof copy.flavors === "string") {
    try {
      const parsed = JSON.parse(copy.flavors);
      copy.flavors = Array.isArray(parsed) ? parsed : [copy.flavors];
    } catch {
      copy.flavors = copy.flavors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  // Coerce digit metrics and mirror to top-level if missing
  if (copy.digit && typeof copy.digit === "object") {
    ["protein", "calories", "carb"].forEach((k) => {
      if (k in copy.digit) {
        copy.digit[k] = toNumberOr(copy.digit[k], toNumberOr(copy[k]));
      }
    });
  }
  copy.protein = toNumberOr(copy.protein, toNumberOr(copy?.digit?.protein));
  copy.calories = toNumberOr(copy.calories, toNumberOr(copy?.digit?.calories));
  
  // Handle both 'carb' and 'carbs' from API
  copy.carb = toNumberOr(
    copy.carb || copy.carbs,
    toNumberOr(copy?.digit?.carb || copy?.digit?.carbs)
  );

  return copy;
};

// Fetch sections dynamically from API
export async function getSections() {
  try {
    const res = await fetch(`${BASE_URL}get_sections.php`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    const sectionList = Array.isArray(data) ? data : data.sections || [];
    return sectionList;
  } catch (err) {
    console.error("Failed to fetch sections:", err);
    return []; // Return empty array on error
  }
}

// Helper: Build SEC_ID mapping based on sections order
export function buildSecIdMapping(sections) {
  const SEC_ID_TO_KEY = Object.fromEntries(
    sections.map((s, idx) => [idx + 1, s])
  );
  const KEY_TO_SEC_ID = Object.fromEntries(
    Object.entries(SEC_ID_TO_KEY).map(([k, v]) => [v, Number(k)])
  );
  return { SEC_ID_TO_KEY, KEY_TO_SEC_ID };
}

// Cached sections list
let cachedSections = null;

// Get cached sections or fetch them
export async function getCachedSections() {
  if (cachedSections) return cachedSections;
  
  try {
    const res = await fetch(`${BASE_URL}get_sections.php`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    cachedSections = Array.isArray(data) ? data : data.sections || [];
    return cachedSections;
  } catch (err) {
    console.error("Failed to fetch sections:", err);
    return [];
  }
}

// Normalize section name to match backend expectations
async function normalizeSectionName(section) {
  const sections = await getCachedSections();
  
  if (section == null) {
    return sections[0] || "protein";
  }
  
  // If numeric sec_id, convert to section name
  if (typeof section === "number" || !isNaN(Number(section))) {
    const idx = Number(section) - 1;
    return sections[idx] || sections[0] || "protein";
  }
  
  // If string, normalize and match against actual sections
  const input = String(section).toLowerCase().trim();
  
  // Handle pre-workout variants
  if (
    input === "pre" ||
    input === "pre_workout" ||
    input === "preworkout" ||
    input === "pre-workout" ||
    input === "pre workout"
  ) {
    return sections.find(s => s.toLowerCase().includes("pre")) || "pre workout";
  }
  
  // Direct match
  const matched = sections.find(s => s.toLowerCase() === input);
  if (matched) return matched;
  
  // Fuzzy match
  const normalized = input.replace(/[-\s]+/g, "_");
  const fuzzyMatched = sections.find(
    s => s.toLowerCase().replace(/[-\s]+/g, "_") === normalized
  );
  if (fuzzyMatched) return fuzzyMatched;
  
  // Fallback
  return sections[0] || "protein";
}

export async function getProductsBySection(section) {
  const key = await normalizeSectionName(section);

  const res = await fetch(`${BASE_URL}get_products_by_section.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: key }),
  });
  const result = await res.json();
  if (result && Array.isArray(result.data)) {
    return result.data.map(normalizeProductFromApi);
  }
  if (result && typeof result.data === "object" && result.data !== null) {
    return [normalizeProductFromApi(result.data)];
  }
  return [];
}

// FIXED: Search by ID (more reliable than by name)
export async function getProductById(p_id) {
  if (!p_id) throw new Error("Product ID is required");
  
  const res = await fetch(`${BASE_URL}get_product_by_id.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ p_id: Number(p_id) }),
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  const result = await res.json();
  
  if (result && result.data) {
    const data = Array.isArray(result.data) ? result.data[0] : result.data;
    return normalizeProductFromApi(data);
  }
  
  throw new Error("Product not found");
}

// Legacy: Search by name (kept for backward compatibility)
export async function getProductByName(name) {
  if (!name) throw new Error("Product name is required");
  
  const res = await fetch(`${BASE_URL}get_product_by_id.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  const result = await res.json();
  
  if (result && result.data) {
    const data = Array.isArray(result.data) ? result.data[0] : result.data;
    return normalizeProductFromApi(data);
  }
  
  throw new Error("Product not found");
}

export async function createProduct({
  pname,
  name,
  description,
  science_name,
  how_to_use,
  price,
  qr_code,
  const_QrCode,
  const_BarCode,
  warnings,
  sec_id,
  type,
  vid_url,
  img_url,
  img_url2,
  img_url3,
  img_background,
  images,
  videos,
  weight,
  sugars,
  protein,
  calories,
  carb,
  amino_acids,
  bcaa,
  flavor1,
  flavor2,
  flavor3,
  flavor4,
  flavors,
  num_of_serving,
  num_of_scope,
  other,
}) {
  const formData = new FormData();
  const normalizeUrl = (u) => {
    const s = (u || "").trim();
    if (!s) return "";
    return /^https?:\/\//i.test(s)
      ? s
      : `https://thunder-nutrition.com/product-info/${s.replace(/^\/+/, "")}`;
  };
  if (pname != null) formData.append("pname", String(pname));
  if (name != null) formData.append("name", String(name));
  if (description != null) formData.append("description", String(description));
  if (description != null)
    formData.append("product_overview", String(description));
  if (science_name != null)
    formData.append("science_name", String(science_name));
  if (how_to_use != null) formData.append("how_to_use", String(how_to_use));
  if (how_to_use != null) formData.append("method_of_use", String(how_to_use));
  const qrVal = normalizeUrl(qr_code || const_QrCode);
  if (qrVal) {
    formData.append("qr_code", qrVal);
    formData.append("const_QrCode", qrVal);
  }
  if (warnings != null) formData.append("warnings", String(warnings));
  if (sec_id != null) formData.append("sec_id", String(Number(sec_id)));
  if (type != null) formData.append("type", String(type));
  if (weight != null) formData.append("weight", String(weight));
  if (sugars != null) formData.append("sugars", String(sugars));

  if (price !== undefined && price !== null && price !== "") {
    formData.append("price", String(price));
  }

  if (protein !== undefined && protein !== null && protein !== "") {
    formData.append("protein", String(protein));
  }
  if (calories !== undefined && calories !== null && calories !== "") {
    formData.append("calories", String(calories));
  }
  if (const_BarCode != null)
    formData.append("const_BarCode", String(const_BarCode));
  if (img_url3 != null) formData.append("img_url3", String(img_url3));
  if (carb != null) formData.append("carb", String(carb));
  if (amino_acids != null) formData.append("amino_acids", String(amino_acids));
  if (bcaa != null) formData.append("bcaa", String(bcaa));
  if (flavors != null && Array.isArray(flavors)) {
    formData.append("flavors", JSON.stringify(flavors));
  }
  const updFlavorsArr = [flavor1, flavor2, flavor3, flavor4].filter(
    (f) => f != null && `${f}`.trim() !== ""
  );
  if (updFlavorsArr.length) {
    formData.append("flavor1", String(updFlavorsArr[0] ?? ""));
    if (updFlavorsArr[1]) formData.append("flavor2", String(updFlavorsArr[1]));
    if (updFlavorsArr[2]) formData.append("flavor3", String(updFlavorsArr[2]));
    if (updFlavorsArr[3]) formData.append("flavor4", String(updFlavorsArr[3]));
    formData.append("flavors", JSON.stringify(updFlavorsArr));
  }

  if (num_of_serving != null)
    formData.append("num_of_serving", String(num_of_serving));
  if (num_of_scope != null)
    formData.append("num_of_scope", String(num_of_scope));
  if (other != null) formData.append("other", String(other));

  const videoFile =
    vid_url instanceof File
      ? vid_url
      : Array.isArray(videos) && videos[0] instanceof File
      ? videos[0]
      : videos instanceof File
      ? videos
      : null;
  if (videoFile) {
    formData.append("vid_url", videoFile);
  } else if (typeof vid_url === "string" && vid_url.trim() !== "") {
    formData.append("vid_url", vid_url.trim());
  } else if (Array.isArray(videos) && typeof videos[0] === "string") {
    formData.append("vid_url", String(videos[0]));
  }

  const imageFile =
    img_url instanceof File
      ? img_url
      : Array.isArray(images) && images[0] instanceof File
      ? images[0]
      : images instanceof File
      ? images
      : null;
  if (imageFile) {
    formData.append("img_url", imageFile);
  } else if (img_url != null) {
    formData.append("img_url", String(img_url));
  } else if (Array.isArray(images) && typeof images[0] === "string") {
    formData.append("img_url", String(images[0]));
  }

  if (img_url2 instanceof File) {
    formData.append("img_url2", img_url2);
  } else if (img_url2 != null) {
    formData.append("img_url2", String(img_url2));
  }
  if (img_background instanceof File) {
    formData.append("img_background", img_background);
  } else if (img_background != null) {
    formData.append("img_background", String(img_background));
  }

  const res = await fetch(
    "https://thunder-nutrition.com/api/CreateProduct.php",
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();

  console.log("API Response:", data);

  if (data && data.status === "success") return data;
  throw new Error(data?.message || "Failed to create product");
}

export async function updateProduct({
  p_id,
  pname,
  name,
  description,
  science_name,
  how_to_use,
  price,
  qr_code,
  const_QrCode,
  const_BarCode,
  warnings,
  sec_id,
  type,
  vid_url,
  img_url,
  img_url2,
  img_url3,
  img_background,
  images,
  videos,
  weight,
  sugars,
  protein,
  calories,
  carb,
  amino_acids,
  bcaa,
  flavor1,
  flavor2,
  flavor3,
  flavor4,
  flavors,
  num_of_serving,
  num_of_scope,
  other,
}) {
  const formData = new FormData();
  const normalizeUrl = (u) => {
    const s = (u || "").trim();
    if (!s) return "";
    return /^https?:\/\//i.test(s)
      ? s
      : `https://thunder-nutrition.com/product-info/${s.replace(/^\/+/, "")}`;
  };
  if (p_id != null) formData.append("p_id", String(Number(p_id)));
  if (pname != null) formData.append("pname", String(pname));
  if (name != null) formData.append("name", String(name));
  if (description != null) formData.append("description", String(description));
  if (science_name != null)
    formData.append("science_name", String(science_name));
  if (how_to_use != null) formData.append("how_to_use", String(how_to_use));
  const updQrVal = normalizeUrl(qr_code || const_QrCode);
  if (updQrVal) {
    formData.append("qr_code", updQrVal);
    formData.append("const_QrCode", updQrVal);
  }
  if (warnings != null) formData.append("warnings", String(warnings));
  if (sec_id != null) formData.append("sec_id", String(Number(sec_id)));
  if (type != null) formData.append("type", String(type));
  if (weight != null) formData.append("weight", String(weight));
  if (sugars != null) formData.append("sugars", String(sugars));

  if (price !== undefined && price !== null && price !== "") {
    formData.append("price", String(price));
  }

  if (protein !== undefined && protein !== null && protein !== "") {
    formData.append("protein", String(protein));
  }
  if (calories !== undefined && calories !== null && calories !== "") {
    formData.append("calories", String(calories));
  }

  if (const_BarCode != null)
    formData.append("const_BarCode", String(const_BarCode));
  if (img_url3 != null) formData.append("img_url3", String(img_url3));
  if (carb != null) formData.append("carb", String(carb));
  if (amino_acids != null) formData.append("amino_acids", String(amino_acids));
  if (bcaa != null) formData.append("bcaa", String(bcaa));
  if (flavors != null && Array.isArray(flavors)) {
    formData.append("flavors", JSON.stringify(flavors));
  }

  const updFlavorsArr = [flavor1, flavor2, flavor3, flavor4].filter(
    (f) => f != null && `${f}`.trim() !== ""
  );
  if (updFlavorsArr.length) {
    formData.append("flavor1", String(updFlavorsArr[0] ?? ""));
    if (updFlavorsArr[1]) formData.append("flavor2", String(updFlavorsArr[1]));
    if (updFlavorsArr[2]) formData.append("flavor3", String(updFlavorsArr[2]));
    if (updFlavorsArr[3]) formData.append("flavor4", String(updFlavorsArr[3]));
    formData.append("flavors", JSON.stringify(updFlavorsArr));
  }

  if (num_of_serving != null)
    formData.append("num_of_serving", String(num_of_serving));
  if (num_of_scope != null)
    formData.append("num_of_scope", String(num_of_scope));
  if (other != null) formData.append("other", String(other));

  const updVideoFile =
    vid_url instanceof File
      ? vid_url
      : Array.isArray(videos) && videos[0] instanceof File
      ? videos[0]
      : videos instanceof File
      ? videos
      : null;
  if (updVideoFile) {
    formData.append("vid_url", updVideoFile);
  } else if (typeof vid_url === "string" && vid_url.trim() !== "") {
    formData.append("vid_url", vid_url.trim());
  } else if (Array.isArray(videos) && typeof videos[0] === "string") {
    formData.append("vid_url", String(videos[0]));
  }

  const updImageFile =
    img_url instanceof File
      ? img_url
      : Array.isArray(images) && images[0] instanceof File
      ? images[0]
      : images instanceof File
      ? images
      : null;
  if (updImageFile) {
    formData.append("img_url", updImageFile);
  } else if (img_url != null) {
    formData.append("img_url", String(img_url));
  } else if (Array.isArray(images) && typeof images[0] === "string") {
    formData.append("img_url", String(images[0]));
  }

  if (img_url2 instanceof File) {
    formData.append("img_url2", img_url2);
  } else if (img_url2 != null) {
    formData.append("img_url2", String(img_url2));
  }
  if (img_background instanceof File) {
    formData.append("img_background", img_background);
  } else if (img_background != null) {
    formData.append("img_background", String(img_background));
  }

  const res = await fetch(
    "https://thunder-nutrition.com/api/UpdateProduct.php",
    {
      method: "POST",
      body: formData,
    }
  );
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  if (data && data.status === "success") return data;
  throw new Error(data?.message || "Failed to update product");
}

export async function deleteProduct(arg1, maybeSecId) {
  let p_id = null;
  let sec_id = null;
  if (arg1 && typeof arg1 === "object") {
    p_id = arg1.p_id ?? arg1.id ?? arg1.product_id ?? null;
    sec_id = arg1.sec_id ?? null;
  } else {
    p_id = arg1 ?? null;
    sec_id = maybeSecId ?? null;
  }

  const formData = new FormData();
  formData.append("action", "delete");
  if (p_id != null) {
    formData.append("p_id", String(p_id));
    formData.append("id", String(p_id));
    formData.append("product_id", String(p_id));
    formData.append("pid", String(p_id));
  }
  if (sec_id != null) {
    formData.append("sec_id", String(sec_id));
  }

  const tryDelete = async (url) => {
    const res = await fetch(url, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    console.debug("[Delete API][POST]", url, {
      payload: "[FormData]",
      response: data,
    });
    return data;
  };

  let data = await tryDelete(`${BASE_URL}DeleteProduct.php`).catch(() => null);
  if (!data || data.status !== "success") {
    data = await tryDelete(`${BASE_URL}DeleteProduct.php`).catch(() => null);
  }
  if (!data || data.status !== "success") {
    const jsonPayload = {
      action: "delete",
      p_id: p_id != null ? Number(p_id) : undefined,
      id: p_id != null ? Number(p_id) : undefined,
      product_id: p_id != null ? Number(p_id) : undefined,
      pid: p_id != null ? Number(p_id) : undefined,
      sec_id: sec_id != null ? Number(sec_id) : undefined,
    };
    const request = async (url) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonPayload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      console.debug("[Delete API][POST-JSON]", url, {
        payload: jsonPayload,
        response: json,
      });
      return json;
    };
    data = await request(`${BASE_URL}DeleteProduct.php`).catch(() => null);
    if (!data || data.status !== "success") {
      data = await request(`${BASE_URL}DeleteProduct.php`).catch(() => null);
    }
  }
  if (!data || data.status !== "success") {
    const qs = new URLSearchParams();
    qs.set("action", "delete");
    if (p_id != null) {
      qs.set("p_id", String(p_id));
      qs.set("id", String(p_id));
      qs.set("product_id", String(p_id));
      qs.set("pid", String(p_id));
    }
    if (sec_id != null) qs.set("sec_id", String(sec_id));
    const getTry = async (url) => {
      const res = await fetch(`${url}?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      console.debug("[Delete API][GET]", `${url}?${qs.toString()}`, {
        response: json,
      });
      return json;
    };
    data = await getTry(`${BASE_URL}DeleteProduct.php`).catch(() => null);
    if (!data || data.status !== "success") {
      data = await getTry(`${BASE_URL}DeleteProduct.php`).catch(() => null);
    }
  }
  if (data && data.status === "success") return data;
  throw new Error(data?.message || "Failed to delete product");
}