/* =====================================================================
   VEROX — site logic
   Content (products, prices, images, reviews) is loaded from content/*.json
   and edited via Decap CMS at /admin (after GitHub + Netlify setup).
   ===================================================================== */

const CONFIG = {
  email: "hello@example.com",
  formEndpoint: "",
  whatsapp: "",
  facebook: "",
};

let PRODUCTS = [];
let VIDEOS = [];
let TESTIMONIALS = [];
let SETTINGS = {};

// Deterministic stock photos so the site never shows broken images before
// you upload real product shots. Replace by adding files to assets/img/.
const PH = (seed, w, h) => `https://picsum.photos/seed/verox-${seed}/${w}/${h}`;

/* ---------------------- content loading ---------------------- */

async function loadContent() {
  try {
    const [productsRes, videosRes, testiRes, settingsRes] = await Promise.all([
      fetch("content/products.json"),
      fetch("content/videos.json"),
      fetch("content/testimonials.json"),
      fetch("content/settings.json"),
    ]);
    const products = await productsRes.json();
    const videos = await videosRes.json();
    const testi = await testiRes.json();
    const settings = await settingsRes.json();

    PRODUCTS = (products.items || []).filter((p) => p.published !== false);
    VIDEOS = videos.items || [];
    TESTIMONIALS = testi.items || [];
    SETTINGS = settings;

    Object.assign(CONFIG, {
      email: settings.email || CONFIG.email,
      formEndpoint: settings.formEndpoint || CONFIG.formEndpoint,
      whatsapp: settings.whatsapp || CONFIG.whatsapp,
      facebook: settings.facebook || CONFIG.facebook,
    });

    applySettings(settings);
  } catch (err) {
    console.warn("Could not load content/*.json — is the site served over HTTP?", err);
  }
}

function applySettings(s) {
  if (!s) return;
  if (s.stats) {
    const map = [
      ["statCustomers", s.stats.customers],
      ["statCountries", s.stats.countries],
      ["statReorder", s.stats.reorder],
      ["statSatisfaction", s.stats.satisfaction],
    ];
    map.forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    });
  }
  setImgSrc("aboutImage", s.aboutImage, PH("about", 680, 760));
  setImgSrc("heroImage", s.heroImage, PH("hero", 720, 820));
  setImgSrc("shippingImage", s.shippingImage, PH("ship", 640, 720));
  populateProductSelect();
}

function setImgSrc(id, src, fallback) {
  const el = document.getElementById(id);
  if (!el || !src) return;
  el.src = src;
  el.onerror = function () { this.onerror = null; this.src = fallback; };
}

function populateProductSelect() {
  const sel = document.getElementById("product");
  if (!sel || !PRODUCTS.length) return;
  const notsure = t("form.notsure");
  sel.innerHTML =
    PRODUCTS.map((p) => `<option value="${p.name}">${p.name}</option>`).join("") +
    `<option value="Not sure yet">${notsure}</option>`;
}

/* ---------------------- product helpers ---------------------- */

function normalizeGallery(p, idx) {
  let imgs = [];
  if (Array.isArray(p.gallery) && p.gallery.length) {
    imgs = p.gallery.map((item) =>
      typeof item === "string" ? item : (item.image || item.url || "")
    ).filter(Boolean);
  }
  if (!imgs.length && p.coverImage) imgs = [p.coverImage];
  return imgs.map((img, i) => ({
    img,
    fallback: PH(`${idx}-${i}`, 600, 450),
  }));
}

function productField(p, field) {
  if (currentLang === "zh" && p[field + "_zh"]) return p[field + "_zh"];
  return p[field + "_en"] || "";
}

function priceLabel(p) {
  const low = parseInt(String(p.priceFrom).replace(/[^0-9]/g, ""), 10) || 0;
  const unit = productField(p, "unit");
  return `$${low.toLocaleString("en-US")}${unit ? " " + unit : ""}`;
}

/* ---------------------- render ---------------------- */

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  if (!PRODUCTS.length) {
    grid.innerHTML = `<p class="section-sub">Loading…</p>`;
    return;
  }
  grid.innerHTML = PRODUCTS.map((p, idx) => {
    const cover = p.coverImage || `assets/img/${p.key}-1.jpg`;
    const fb = PH(`card-${idx}`, 600, 450);
    return `
    <article class="product-card" data-idx="${idx}">
      <div class="media">
        <span class="tag">${productField(p, "tag")}</span>
        <img src="${cover}" alt="${p.name}" loading="lazy"
             onerror="this.onerror=null;this.src='${fb}'" />
      </div>
      <div class="body">
        <h3>${p.name}</h3>
        <p class="zh">${p.zh || ""}</p>
        <p class="desc">${productField(p, "desc")}</p>
        <div class="foot">
          <div class="price">${priceLabel(p)}<span>${t("products.note")}</span></div>
          <button class="btn btn-small" data-idx="${idx}">${t("products.details")}</button>
        </div>
      </div>
    </article>`;
  }).join("");

  grid.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => openProductModal(+card.dataset.idx));
  });
}

function openProductModal(idx) {
  const p = PRODUCTS[idx];
  const modal = document.getElementById("productModal");
  const body = document.getElementById("productModalBody");
  if (!p || !modal || !body) return;

  const gallery = normalizeGallery(p, idx);
  const traitFields = ["format", "serving", "actives", "supply", "bestfor"];
  const mainImg = gallery[0]?.img || p.coverImage;
  const mainFb = gallery[0]?.fallback || PH("modal", 600, 450);

  body.innerHTML = `
    <div class="bm-gallery">
      <div class="bm-main">
        <img id="bmMain" src="${mainImg}" alt="${p.name}"
             onerror="this.onerror=null;this.src='${mainFb}'" />
      </div>
      <div class="bm-thumbs">
        ${gallery.map((g, i) => `
          <img class="bm-thumb${i === 0 ? " active" : ""}" data-src="${g.img}" data-fb="${g.fallback}"
               src="${g.img}" alt="${p.name} ${i + 1}"
               onerror="this.onerror=null;this.src='${g.fallback}'" />`).join("")}
      </div>
    </div>
    <div class="bm-info">
      <span class="bm-tag">${productField(p, "tag")}</span>
      <h3>${p.name}</h3>
      <p class="bm-zh">${p.zh || ""}</p>
      <p class="bm-price">${priceLabel(p)} · ${t("products.note")}</p>
      <h4>${t("detail.about")}</h4>
      <p class="bm-long">${productField(p, "long")}</p>
      <h4>${t("detail.traits")}</h4>
      <ul class="bm-traits">
        ${traitFields.map((f) => `<li><span>${t("traits." + f)}</span><b>${productField(p, f)}</b></li>`).join("")}
      </ul>
      <h4>${t("included.title")}</h4>
      <ul class="bm-included">
        ${[1, 2, 3, 4, 5, 6].map((n) => `<li>${t("included.i" + n)}</li>`).join("")}
      </ul>
      <button class="btn btn-block" id="bmInquire">${t("detail.cta")}</button>
    </div>`;

  body.querySelectorAll(".bm-thumb").forEach((th) => {
    th.addEventListener("click", () => {
      const main = document.getElementById("bmMain");
      main.onerror = function () { this.onerror = null; this.src = th.dataset.fb; };
      main.src = th.dataset.src;
      body.querySelectorAll(".bm-thumb").forEach((x) => x.classList.remove("active"));
      th.classList.add("active");
    });
  });

  body.querySelector("#bmInquire").addEventListener("click", () => {
    const sel = document.getElementById("product");
    if (sel) sel.value = p.name;
    closeProductModal();
    document.getElementById("inquire").scrollIntoView({ behavior: "smooth" });
  });

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

function initProductModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) closeProductModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProductModal();
  });
}

function renderTestimonials() {
  const grid = document.getElementById("testiGrid");
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map((r) => {
    const initial = (r.name.trim()[0] || "?").toUpperCase();
    const rating = Math.min(5, Math.max(1, r.rating || 5));
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    return `
      <figure class="testi-card">
        <div class="testi-stars">${stars}</div>
        <blockquote>${r.quote}</blockquote>
        <figcaption>
          <span class="testi-ava">${initial}</span>
          <span class="testi-who"><b>${r.name}</b><small>${r.country}</small></span>
        </figcaption>
      </figure>`;
  }).join("");
}

function renderVideos() {
  const grid = document.getElementById("videoGrid");
  if (!grid) return;
  grid.innerHTML = VIDEOS.map((v, i) => {
    const fb = PH(`video-${i}`, 640, 400);
    return `
    <div class="video-card" data-idx="${i}">
      <img class="poster-img" src="${v.poster}" alt="${v.title}" loading="lazy"
           onerror="this.onerror=null;this.src='${fb}'" />
      <div class="play"><span></span></div>
      <div class="cap">${v.title}${v.note ? " · " + v.note : ""}</div>
    </div>`;
  }).join("");

  grid.querySelectorAll(".video-card").forEach((card) => {
    card.addEventListener("click", () => {
      const v = VIDEOS[card.dataset.idx];
      if (!v || !v.src) return;
      card.innerHTML = `<video controls autoplay playsinline src="${v.src}"></video>`;
    });
  });
}

function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

function initContacts() {
  const wa = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : "";
  document.querySelectorAll(".js-wa").forEach((a) => {
    if (!wa) return a.remove();
    a.href = wa; a.textContent = "WhatsApp"; a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll(".js-fb").forEach((a) => {
    if (!CONFIG.facebook) return a.remove();
    a.href = CONFIG.facebook; a.textContent = "Facebook"; a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.href = `mailto:${CONFIG.email}`;
    a.textContent = CONFIG.email;
  });
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

function initForm() {
  const form = document.getElementById("inquiryForm");
  const note = document.getElementById("formNote");
  if (!form) return;

  if (CONFIG.formEndpoint) form.setAttribute("action", CONFIG.formEndpoint);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    note.className = "form-note";
    note.textContent = "";

    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const country = (data.get("country") || "").toString().trim();

    if (!name || !email || !country) {
      note.classList.add("err");
      note.textContent = t("form.errFill");
      return;
    }

    if (!CONFIG.formEndpoint || CONFIG.formEndpoint.includes("your-form-id")) {
      const subject = encodeURIComponent(`VEROX order/inquiry — ${data.get("product")}`);
      const bodyText = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nWhatsApp/Phone: ${data.get("whatsapp")}\n` +
        `Country/City: ${country}\nProduct: ${data.get("product")}\n\n${data.get("message")}`
      );
      window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${bodyText}`;
      note.classList.add("ok");
      note.textContent = t("form.opening");
      return;
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        form.reset();
        note.classList.add("ok");
        note.textContent = t("form.thanks");
      } else {
        throw new Error("Request failed");
      }
    } catch (err) {
      note.classList.add("err");
      note.textContent = t("form.error");
    }
  });
}

/* ---------------------- boot ---------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  initI18n();
  await loadContent();
  renderProducts();
  renderVideos();
  renderTestimonials();
  initProductModal();
  initNav();
  initContacts();
  initForm();
});

document.addEventListener("langchange", () => {
  renderProducts();
  renderVideos();
  populateProductSelect();
});
