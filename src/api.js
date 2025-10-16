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
  copy.carb = toNumberOr(copy.carb, toNumberOr(copy?.digit?.carb));

  return copy;
};

// Map section keys (exact backend names) to sec_id values used by the backend
const KEY_TO_SEC_ID = {
  protein: 1,
  carb: 2,
  "pre workout": 3,
  creatine: 4,
  amino: 5,
};

export async function getProductsBySection(section) {
  // The backend expects the section name, e.g. { "name": "protein" }.
  // Accept either a numeric sec_id or a string key.
  const SEC_ID_TO_KEY = Object.fromEntries(
    Object.entries(KEY_TO_SEC_ID).map(([k, v]) => [String(v), k])
  );

  let key = null;
  if (section == null) {
    key = "protein";
  } else if (typeof section === "number") {
    key = SEC_ID_TO_KEY[String(section)] ?? "protein";
  } else if (!isNaN(Number(section))) {
    key = SEC_ID_TO_KEY[String(Number(section))] ?? "protein";
  } else {
    // Normalize common variants into the exact backend name expected.
    const s = String(section).toLowerCase().trim();
    if (
      s === "pre" ||
      s === "pre_workout" ||
      s === "preworkout" ||
      s === "pre-workout" ||
      s === "pre workout"
    ) {
      key = "pre workout";
    } else if (s === "carbs" || s === "carb") {
      key = "carb";
    } else if (s === "protein" || s === "creatine" || s === "amino") {
      key = s;
    } else {
      key = "protein";
    }
  }

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

export async function getProductByName(name) {
  const res = await fetch(`${BASE_URL}get_product_by_id.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
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
      : `https://thunder-nutrition.com/${s.replace(/^\/+/, "")}`;
  };
  if (pname != null) formData.append("pname", String(pname));
  if (name != null) formData.append("name", String(name));
  if (description != null) formData.append("description", String(description));
  // Legacy key for backend compatibility
  if (description != null)
    formData.append("product_overview", String(description));
  if (science_name != null)
    formData.append("science_name", String(science_name));
  if (how_to_use != null) formData.append("how_to_use", String(how_to_use));
  // Legacy key for backend compatibility
  if (how_to_use != null) formData.append("method_of_use", String(how_to_use));
  // Support both qr_code and const_QrCode
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

  // معالجة الحقول الرقمية - إرسالها دائماً إذا كانت موجودة وليست فارغة
  if (price !== undefined && price !== null && price !== "") {
    formData.append("price", String(price));
  }

  // Nutrition metrics if provided
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

  // Files: if user selected a File, append it; if it's a string URL, also append as string for backend compatibility
  // Decide video file to send: prefer vid_url, else first of videos
  const videoFile =
    vid_url instanceof File
      ? vid_url
      : Array.isArray(videos) && videos[0] instanceof File
      ? videos[0]
      : videos instanceof File
      ? videos
      : null;
  if (videoFile) {
    // Send video file with primary field name
    formData.append("vid_url", videoFile);
  } else if (typeof vid_url === "string" && vid_url.trim() !== "") {
    formData.append("vid_url", vid_url.trim());
  } else if (Array.isArray(videos) && typeof videos[0] === "string") {
    formData.append("vid_url", String(videos[0]));
  }

  // Decide image file to send: prefer img_url, else first of images
  const imageFile =
    img_url instanceof File
      ? img_url
      : Array.isArray(images) && images[0] instanceof File
      ? images[0]
      : images instanceof File
      ? images
      : null;
  if (imageFile) {
    // Send image file with primary field name
    formData.append("img_url", imageFile);
  } else if (img_url != null) {
    formData.append("img_url", String(img_url));
  } else if (Array.isArray(images) && typeof images[0] === "string") {
    formData.append("img_url", String(images[0]));
  }

  // Additional image/background fields: support File or string
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

  // Debug: طباعة رد الـ API
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
      : `https://thunder-nutrition.com/${s.replace(/^\/+/, "")}`;
  };
  if (p_id != null) formData.append("p_id", String(Number(p_id)));
  if (pname != null) formData.append("pname", String(pname));
  if (name != null) formData.append("name", String(name));
  if (description != null) formData.append("description", String(description));
  if (science_name != null)
    formData.append("science_name", String(science_name));
  if (how_to_use != null) formData.append("how_to_use", String(how_to_use));
  // Support both qr_code and const_QrCode
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

  // معالجة الحقول الرقمية - إرسالها دائماً إذا كانت موجودة وليست فارغة
  if (price !== undefined && price !== null && price !== "") {
    formData.append("price", String(price));
  }

  // Nutrition metrics if provided
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

  // Flavors support: flavor1..flavor4 and combined JSON array (for backward compatibility)
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

  // videos/images can be File, array of File, or string path; prefer vid_url/img_url if File, else fallback to first of videos/images
  const updVideoFile =
    vid_url instanceof File
      ? vid_url
      : Array.isArray(videos) && videos[0] instanceof File
      ? videos[0]
      : videos instanceof File
      ? videos
      : null;
  if (updVideoFile) {
    // Send video file with primary field name
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
    // Send image file with primary field name
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
  // arg1 can be p_id (string/number) or an object { p_id, id, product_id, sec_id }
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
  // Required by backend to specify delete operation
  formData.append("action", "delete");
  if (p_id != null) {
    formData.append("p_id", String(p_id));
    // Add common alternative keys for compatibility with backend variations
    formData.append("id", String(p_id));
    formData.append("product_id", String(p_id));
    formData.append("pid", String(p_id));
  }
  if (sec_id != null) {
    formData.append("sec_id", String(sec_id));
  }

  // Try dashboard endpoint first, then fallback to root endpoint
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
    // Attempt root endpoint using FormData
    data = await tryDelete(`${BASE_URL}DeleteProduct.php`).catch(() => null);
  }
  if (!data || data.status !== "success") {
    // As a final fallback, attempt JSON payload version (some backends accept JSON only)
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
    // As a final fallback, try GET with query string
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
