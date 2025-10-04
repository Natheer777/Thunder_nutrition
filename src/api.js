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
  
  // Helper to normalize a single product from the API, ensuring numbers and defaulting nulls
  const normalizeProductFromApi = (p) => {
    if (!p || typeof p !== 'object') return p;
    const copy = { ...p };
    
    const toNumberOr = (val, fallback = 0) => {
      if (val === '' || val === null || val === undefined) return fallback;
      const n = Number(val);
      return isNaN(n) ? fallback : n;
    };
    
    const toStringOrEmpty = (val) => {
      if (val === null || val === undefined || val === '') return '';
      return String(val);
    };
    
    // Coerce id and price
    if ('p_id' in copy) copy.p_id = toNumberOr(copy.p_id, copy.p_id);
    if ('id' in copy && (copy.p_id == null)) copy.p_id = toNumberOr(copy.id, copy.id);
    copy.price = toNumberOr(copy.price, 0);
    
    // Convert null metrics to empty strings for form compatibility
    copy.strength = toStringOrEmpty(copy.strength);
    copy.side_effects = toStringOrEmpty(copy.side_effects);
    copy.muscle_gain = toStringOrEmpty(copy.muscle_gain);
    copy.keep_gains = toStringOrEmpty(copy.keep_gains);
    copy.fat_water = toStringOrEmpty(copy.fat_water);

    // Map new API fields to expected ones
    // Prefer pname for display name if name is missing
    copy.name = toStringOrEmpty(copy.name || copy.pname);

    // Normalize QR/Bar codes coming under alternative keys
    copy.qr_code = toStringOrEmpty(copy.qr_code || copy.const_QrCode || copy.const_QRCode);
    copy.bar_code = toStringOrEmpty(copy.bar_code || copy.const_BarCode);

    // Derive section name from type if sec_name is absent
    if (!copy.sec_name) {
      const rawType = copy.type;
      const tStr = toStringOrEmpty(rawType).toLowerCase();
      // Support both textual and numeric encodings
      if (tStr === 'powder' || tStr === 'tablet' || tStr === 'tablets') {
        copy.sec_name = 'tablets';
      } else if (tStr === 'inject' || tStr === 'injection' || tStr === 'injectables' || tStr === 'vial') {
        copy.sec_name = 'injectables';
      } else if (!isNaN(Number(rawType))) {
        const n = Number(rawType);
        // 0: tablet, 1: powder -> tablets; 2: injection -> injectables
        copy.sec_name = (n === 2) ? 'injectables' : 'tablets';
      }
    }

    // Ensure flavors is an array
    if (typeof copy.flavors === 'string') {
      try {
        const parsed = JSON.parse(copy.flavors);
        copy.flavors = Array.isArray(parsed) ? parsed : [copy.flavors];
      } catch {
        copy.flavors = copy.flavors
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    // Coerce digit metrics and mirror to top-level if missing
    if (copy.digit && typeof copy.digit === 'object') {
      ['protein', 'calories', 'carbs'].forEach((k) => {
        if (k in copy.digit) {
          copy.digit[k] = toNumberOr(copy.digit[k], toNumberOr(copy[k]));
        }
      });
    }
    copy.protein = toNumberOr(copy.protein, toNumberOr(copy?.digit?.protein));
    copy.calories = toNumberOr(copy.calories, toNumberOr(copy?.digit?.calories));
    copy.carbs = toNumberOr(copy.carbs, toNumberOr(copy?.digit?.carbs));

    return copy;
  };

  // إذا كان هناك مفتاح data وهو مصفوفة، قم بتطبيع العناصر وأرجعها
  if (result && Array.isArray(result.data)) {
    return result.data.map(normalizeProductFromApi);
  }
  // fallback: إذا كان data كائن واحد فقط
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

export async function createProduct(productData) {
  // Log the incoming data for debugging
  console.log('createProduct called with data:', JSON.stringify({
    ...productData,
    // Don't log file objects as they can be very large
    vid_url: productData.vid_url ? '[File]' : productData.vid_url,
    img_url: productData.img_url ? '[File]' : productData.img_url,
    img_url2: productData.img_url2 ? '[File]' : productData.img_url2,
    img_background: productData.img_background ? '[File]' : productData.img_background,
    images: productData.images ? `[${productData.images.length} files]` : null,
    videos: productData.videos ? `[${productData.videos.length} files]` : null
  }, null, 2));

  // Destructure with defaults
  const {
    pname = '',
    name = '',
    description = '',
    science_name = '',
    how_to_use = '',
    price = '',
    qr_code = '',
    const_QrCode = '',
    warnings = '',
    vial = '',
    caliber = '',
    sec_id = '',
    type = '',
    vid_url = null,
    img_url = null,
    img_url2 = null,
    img_background = null,
    images = [],
    videos = [],
    strength = '',
    side_effects = '',
    muscle_gain = '',
    keep_gains = '',
    fat_water = '',
    weight = '',
    sugars = '',
    protein = '',
    calories = '',
    flavor1 = '',
    flavor2 = '',
    flavor3 = '',
    flavor4 = '',
    num_of_serving = '',
    num_of_scope = ''
  } = productData;
  const formData = new FormData();
  const normalizeUrl = (u) => {
    const s = (u || "").trim();
    if (!s) return "";
    return /^https?:\/\//i.test(s) ? s : `https://thunder-nutrition.com/${s.replace(/^\/+/, "")}`;
  };
  
  // Ensure pname is always set and not empty
  if (!pname || pname.trim() === '') {
    console.error('Validation failed: pname is required');
    throw new Error('Product name (pname) is required');
  }
  
  // Always include pname and name (fallback to pname if name is not provided)
  const finalPname = String(pname || '').trim();
  const finalName = String(name || pname || '').trim();
  
  console.log('Setting form data - pname:', finalPname);
  console.log('Setting form data - name:', finalName);
  
  formData.append("pname", finalPname);
  formData.append("name", finalName);
  
  // Log all form data entries
  console.log('FormData entries:');
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ', pair[1]);
  }
  if (description != null) formData.append("description", String(description));
  // Legacy key for backend compatibility
  if (description != null) formData.append("product_overview", String(description));
  if (science_name != null) formData.append("science_name", String(science_name));
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
  if (vial != null) formData.append("vial", String(vial));
  if (caliber != null) formData.append("caliber", String(caliber));
  if (sec_id != null) formData.append("sec_id", String(Number(sec_id)));
  if (type != null) formData.append("type", String(type));
  if (weight != null) formData.append("weight", String(weight));
  if (sugars != null) formData.append("sugars", String(sugars));

  // معالجة الحقول الرقمية - إرسالها دائماً إذا كانت موجودة وليست فارغة
  if (price !== undefined && price !== null && price !== '') {
    formData.append("price", String(price));
  }
  if (strength !== undefined && strength !== null && strength !== '') {
    formData.append("strength", String(strength));
  }
  if (side_effects !== undefined && side_effects !== null && side_effects !== '') {
    formData.append("side_effects", String(side_effects));
  }
  if (muscle_gain !== undefined && muscle_gain !== null && muscle_gain !== '') {
    formData.append("muscle_gain", String(muscle_gain));
  }
  if (keep_gains !== undefined && keep_gains !== null && keep_gains !== '') {
    formData.append("keep_gains", String(keep_gains));
  }
  if (fat_water !== undefined && fat_water !== null && fat_water !== '') {
    formData.append("fat_water", String(fat_water));
  }

  // Nutrition metrics if provided
  if (protein !== undefined && protein !== null && protein !== '') {
    formData.append("protein", String(protein));
  }
  if (calories !== undefined && calories !== null && calories !== '') {
    formData.append("calories", String(calories));
  }

  // Flavors support: flavor1..flavor4 and combined JSON array
  const updFlavorsArr = [flavor1, flavor2, flavor3, flavor4].filter((f) => f != null && `${f}`.trim() !== "");
  if (updFlavorsArr.length) {
    formData.append("flavor1", String(updFlavorsArr[0] ?? ''));
    if (updFlavorsArr[1]) formData.append("flavor2", String(updFlavorsArr[1]));
    if (updFlavorsArr[2]) formData.append("flavor3", String(updFlavorsArr[2]));
    if (updFlavorsArr[3]) formData.append("flavor4", String(updFlavorsArr[3]));
    formData.append("flavors", JSON.stringify(updFlavorsArr));
  }

  if (num_of_serving != null) formData.append("num_of_serving", String(num_of_serving));
  if (num_of_scope != null) formData.append("num_of_scope", String(num_of_scope));

  

  // Debug logging
  console.log('FormData metrics:', {
    strength: formData.get('strength'),
    side_effects: formData.get('side_effects'),
    muscle_gain: formData.get('muscle_gain'),
    keep_gains: formData.get('keep_gains'),
    fat_water: formData.get('fat_water')
  });

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
    // Append using both possible backend keys
    formData.append("vid_url", videoFile);
    formData.append("videos", videoFile);
  } else if (typeof vid_url === 'string' && vid_url.trim() !== '') {
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
    // Append using both possible backend keys
    formData.append("img_url", imageFile);
    formData.append("images", imageFile);
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

  // Simple file size validation (max 10MB per file)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const files = [
    { file: vid_url, name: 'Video' },
    { file: img_url, name: 'Image 1' },
    { file: img_url2, name: 'Image 2' },
    { file: img_background, name: 'Background Image' },
    ...(Array.isArray(images) ? images.map((f, i) => ({ file: f, name: `Image ${i + 1}` })) : []),
    ...(Array.isArray(videos) ? videos.map((f, i) => ({ file: f, name: `Video ${i + 1}` })) : [])
  ].filter(item => item.file);

  for (const { file, name } of files) {
    if (file instanceof File && file.size > MAX_FILE_SIZE) {
      throw new Error(`${name} is too large. Maximum size is 10MB.`);
    }
  }

  try {
    console.log('Sending request to server...');
    
    // First, upload the video separately if it exists
    let videoUrl = null;
    if (vid_url && vid_url instanceof File) {
      console.log('Uploading video file...');
      const videoFormData = new FormData();
      videoFormData.append('video', vid_url);
      videoFormData.append('action', 'upload_video');
      
      const videoResponse = await fetch("https://thunder-nutrition.com/api/CreateProduct.php", {
        method: "POST",
        body: videoFormData
      });
      
      if (!videoResponse.ok) {
        const errorText = await videoResponse.text();
        throw new Error(`Video upload failed: ${videoResponse.status} - ${videoResponse.statusText}`);
      }
      
      const videoData = await videoResponse.json();
      if (videoData.status === 'success' && videoData.video_url) {
        formData.append('vid_url', videoData.video_url);
        console.log('Video uploaded successfully:', videoData.video_url);
      } else {
        throw new Error(videoData?.message || 'Failed to upload video');
      }
    }
    
    // Now send the main product data
    const response = await fetch("https://thunder-nutrition.com/api/CreateProduct.php", {
      method: "POST",
      body: formData
    });
    
    console.log('Received response, status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server responded with error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Server error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data && data.status === "success") {
      return data;
    }
    
    throw new Error(data?.message || "Failed to create product");
    
  } catch (error) {
    console.error('Error in createProduct:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error.message.includes('Failed to fetch') 
      ? new Error('Could not connect to the server. Please try again later.')
      : error;
  }
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
  warnings,
  vial,
  caliber,
  sec_id,
  type,
  vid_url,
  img_url,
  img_url2,
  img_background,
  images,
  videos,
  strength,
  side_effects,
  muscle_gain,
  keep_gains,
  fat_water,
  weight,
  sugars,
  protein,
  calories,
  flavor1,
  flavor2,
  flavor3,
  flavor4,
  num_of_serving,
  num_of_scope,
}) {
  const formData = new FormData();
  const normalizeUrl = (u) => {
    const s = (u || "").trim();
    if (!s) return "";
    return /^https?:\/\//i.test(s) ? s : `https://thunder-nutrition.com/${s.replace(/^\/+/, "")}`;
  };
  if (p_id != null) formData.append("p_id", String(Number(p_id)));
  if (pname != null) formData.append("pname", String(pname));
  if (name != null) formData.append("name", String(name));
  if (description != null) formData.append("description", String(description));
  if (science_name != null) formData.append("science_name", String(science_name));
  if (how_to_use != null) formData.append("how_to_use", String(how_to_use));
  // Support both qr_code and const_QrCode
  const updQrVal = normalizeUrl(qr_code || const_QrCode);
  if (updQrVal) {
    formData.append("qr_code", updQrVal);
    formData.append("const_QrCode", updQrVal);
  }
  if (warnings != null) formData.append("warnings", String(warnings));
  if (vial != null) formData.append("vial", String(vial));
  if (caliber != null) formData.append("caliber", String(caliber));
  if (sec_id != null) formData.append("sec_id", String(Number(sec_id)));
  if (type != null) formData.append("type", String(type));
  if (weight != null) formData.append("weight", String(weight));
  if (sugars != null) formData.append("sugars", String(sugars));

  // معالجة الحقول الرقمية - إرسالها دائماً إذا كانت موجودة وليست فارغة
  if (price !== undefined && price !== null && price !== '') {
    formData.append("price", String(price));
  }
  if (strength !== undefined && strength !== null && strength !== '') {
    formData.append("strength", String(strength));
  }
  if (side_effects !== undefined && side_effects !== null && side_effects !== '') {
    formData.append("side_effects", String(side_effects));
  }
  if (muscle_gain !== undefined && muscle_gain !== null && muscle_gain !== '') {
    formData.append("muscle_gain", String(muscle_gain));
  }
  if (keep_gains !== undefined && keep_gains !== null && keep_gains !== '') {
    formData.append("keep_gains", String(keep_gains));
  }
  if (fat_water !== undefined && fat_water !== null && fat_water !== '') {
    formData.append("fat_water", String(fat_water));
  }

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
    // Append using both possible backend keys
    formData.append("vid_url", updVideoFile);
    formData.append("videos", updVideoFile);
  } else if (typeof vid_url === 'string' && vid_url.trim() !== '') {
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
    // Append using both possible backend keys
    formData.append("img_url", updImageFile);
    formData.append("images", updImageFile);
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

  const res = await fetch("https://thunder-nutrition.com/api/UpdateProduct.php", {
    method: "POST",
    body: formData,
  });
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
    console.debug('[Delete API][POST]', url, { payload: '[FormData]', response: data });
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
      console.debug('[Delete API][POST-JSON]', url, { payload: jsonPayload, response: json });
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
    qs.set('action', 'delete');
    if (p_id != null) {
      qs.set('p_id', String(p_id));
      qs.set('id', String(p_id));
      qs.set('product_id', String(p_id));
      qs.set('pid', String(p_id));
    }
    if (sec_id != null) qs.set('sec_id', String(sec_id));
    const getTry = async (url) => {
      const res = await fetch(`${url}?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      console.debug('[Delete API][GET]', `${url}?${qs.toString()}`, { response: json });
      return json;
    };
    data = await getTry(`${BASE_URL}DeleteProduct.php`).catch(() => null);
    if (!data || data.status !== 'success') {
      data = await getTry(`${BASE_URL}DeleteProduct.php`).catch(() => null);
    }
  }
  if (data && data.status === "success") return data;
  throw new Error(data?.message || "Failed to delete product");
}