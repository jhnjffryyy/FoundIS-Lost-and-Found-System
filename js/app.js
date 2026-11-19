  /*
  FoundIS — Single-File School Office Edition (TUP Manila OSA)
  Self-contained HTML/CSS/JS with localStorage persistence.
*/
  /* scroll position: remember it and put it back exactly after a refresh.
     The page is drawn by JS after load, so the browser's own restore fires too early and lands in the wrong spot. */
  const SCROLL_KEY = "foundis-scroll-v1";
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  let restoreY = null;
  let restoreStarted = false;
  let restoreActive = false;
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    const type = nav ? nav.type : "navigate";
    if (type === "reload" || type === "back_forward") {
      const saved = JSON.parse(sessionStorage.getItem(SCROLL_KEY) || "null");
      if (saved && saved.hash === location.hash && Number.isFinite(saved.y)) restoreY = saved.y;
    }
  } catch (e) {}
  const ADMIN_KEY = "foundis-admin-v1";
  function saveAdminState() {
    // OSA dashboard section (Claim requests, Lost reports, ...) and its filters live in memory, so keep them for a refresh
    try {
      sessionStorage.setItem(ADMIN_KEY, JSON.stringify({ tab: adminTab, filter: adminFilter }));
    } catch (e) {}
  }
  function saveScroll() {
    saveAdminState();
    if (restoreActive) return; // keep the saved value safe while we are still putting it back
    try {
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ hash: location.hash, y: Math.round(window.scrollY) }));
    } catch (e) {}
  }
  let saveQueued = false;
  window.addEventListener("scroll", () => {
    if (saveQueued) return;
    saveQueued = true;
    requestAnimationFrame(() => {
      saveQueued = false;
      saveScroll();
    });
  }, { passive: true });
  window.addEventListener("pagehide", saveScroll);
  window.addEventListener("beforeunload", saveScroll);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveScroll();
  });
  function startScrollRestore() {
    if (restoreStarted || restoreY === null) return;
    restoreStarted = true;
    restoreActive = true;
    const target = restoreY;
    const t0 = performance.now();
    const finish = () => {
      if (!restoreActive) return;
      restoreActive = false;
      ["wheel", "touchstart", "keydown", "mousedown"].forEach((ev) => window.removeEventListener(ev, finish));
      saveScroll();
    };
    // if the user scrolls on their own, stop pulling the page back
    ["wheel", "touchstart", "keydown", "mousedown"].forEach((ev) => window.addEventListener(ev, finish, { passive: true }));
    const attempt = () => {
      if (!restoreActive) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: Math.min(target, Math.max(max, 0)), left: 0, behavior: "instant" });
      // images and fonts can still change the page height, so keep correcting until everything has loaded
      const settled = document.readyState === "complete" && performance.now() - t0 > 400;
      if (settled || performance.now() - t0 > 3000) finish();
      else requestAnimationFrame(attempt);
    };
    attempt();
  }
  // v3 = clean deployment start: browsers holding older test data begin again with only the 10 default items
  const STORE_KEY = "foundis-osa-v3";
  try {
    localStorage.removeItem("foundis-osa-v2");
  } catch (e) {}
  const SESSION_KEY = "foundis-osa-session-v2";
  const LONG_STORAGE_DAYS = 30;
  const DEFAULT_CATEGORIES = window.FOUNDIS_DATA.categories;
  // "All" is a filter, not a category; OSA-managed categories live in data.categories.
  const categoryOptions = () => data.categories;
  const categoryFilters = () => ["All", ...data.categories];
  function categorySelectOptions(selected = "") {
    return categoryOptions()
      .map((c) => `<option value="${safe(c)}" ${c === selected ? "selected" : ""}>${safe(c)}</option>`)
      .join("");
  }
  const EMOJI_MAP = {
    Electronics: "🎧",
    IDs: "🪪",
    Accessories: "☂️",
    Bags: "👜",
    Keys: "🔑",
    Clothing: "🧥",
    Other: "📦",
  };
  const STAFF_DEMO = window.FOUNDIS_DATA.staff;
  const ICON = {
    search:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
    arrowRight:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    arrowLeft:
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
    shield:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
    lock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    pin: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    calendar:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
    hash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>',
    clock:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    building:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>',
    package:
      '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>',
    users:
      '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>',
    ticket:
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>',
    printer:
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>',
    copy: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    upload:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    check:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>',
    x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    sparkles:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>',
    info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    grid: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
    list: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
    inbox:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
    logout:
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
    eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><line x1="2" x2="22" y1="2" y2="22"/></svg>',
    grad: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  };
  const daysAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };
  const SEED = window.FOUNDIS_DATA; // starting data lives in js/data.js
  const seedItems = () =>
    SEED.items.map(({ daysAgo: n, image, ...item }) => ({ ...item, date: daysAgo(n) }));
  function loadData() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (
        saved &&
        Array.isArray(saved.items) &&
        Array.isArray(saved.claims)
      ) {
        if (!Array.isArray(saved.lostReports)) saved.lostReports = [];
        if (!Array.isArray(saved.students)) saved.students = [];
        if (!Array.isArray(saved.categories) || !saved.categories.length)
          saved.categories = DEFAULT_CATEGORIES.slice();
        return saved;
      }
    } catch (e) {}
    return {
      items: seedItems(),
      claims: [],
      lostReports: [],
      students: [],
      categories: DEFAULT_CATEGORIES.slice(),
    };
  }
  let data = loadData();
  let searchTerm = "";
  let category = "All";
  let sortOrder = "newest";
  let adminTab = "overview";
  let adminFilter = { q: "", from: "", to: "", category: "All" };
  // after a refresh, reopen the same OSA dashboard section with the same filters
  try {
    const navEntry = performance.getEntriesByType("navigation")[0];
    const navType = navEntry ? navEntry.type : "navigate";
    if (navType === "reload" || navType === "back_forward") {
      const savedAdmin = JSON.parse(sessionStorage.getItem(ADMIN_KEY) || "null");
      const tabs = ["overview", "items", "archive", "claims", "lost", "categories", "add"];
      if (savedAdmin && tabs.includes(savedAdmin.tab)) {
        adminTab = savedAdmin.tab;
        if (savedAdmin.filter && typeof savedAdmin.filter === "object") {
          adminFilter = { ...adminFilter, ...savedAdmin.filter };
        }
      }
    }
  } catch (e) {}
  let loginRole = "student";
  let authMode = "signin";
  let pendingNext = "";
  let pendingPhotoPreview = "";
  let reportSuccessRef = "";
  // last ticket and email the signed-in student entered; kept for refreshes while signed in and cleared on sign out.
  const TRACK_KEY = "foundis-track-v1";
  let trackLookup = null;
  try {
    trackLookup = JSON.parse(sessionStorage.getItem(TRACK_KEY) || "null");
  } catch (e) {}
  function setTrackLookup(value) {
    trackLookup = value;
    try {
      if (value) sessionStorage.setItem(TRACK_KEY, JSON.stringify(value));
      else sessionStorage.removeItem(TRACK_KEY);
    } catch (e) {}
  }
  const app = document.getElementById("app");
  function saveData() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) {
      showToast("Browser storage is full. The photo may be too large.");
    }
  }
  function safe(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  }
  function safeDataUrl(url) {
    return typeof url === "string" &&
      /^data:image\/(jpeg|png|webp|gif);base64,/i.test(url)
      ? url
      : "";
  }
  function showToast(message) {
    const el = document.getElementById("toast");
    el.innerHTML = `${ICON.check} <span>${safe(message)}</span>`;
    el.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.add("hidden"), 2600);
  }
  function dateLabel(value) {
    return new Date(value).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  function daysStored(item) {
    return Math.max(
      0,
      Math.floor((Date.now() - new Date(item.date).getTime()) / 86400000),
    );
  }
  function daysLabel(item) {
    const d = daysStored(item);
    return d === 0 ? "Today" : d === 1 ? "1 day ago" : `${d} days ago`;
  }
  function publicItems() {
    return data.items.filter((i) =>
      ["available", "pending"].includes(i.status),
    );
  }
  function itemById(id) {
    return data.items.find((i) => i.id === id);
  }
  // demo items ship with a stock photo; staff uploads (data URLs) take priority
  const SEED_PHOTOS = Object.fromEntries(SEED.items.filter((i) => i.image).map((i) => [i.id, i.image]));
  function itemPhotoSrc(item) {
    return safeDataUrl(item.photo) || SEED_PHOTOS[item.id] || "";
  }
  function canShowPhoto(item) {
    return (
      Boolean(itemPhotoSrc(item)) &&
      item.category !== "IDs" &&
      !item.hidePhoto
    );
  }
  function statusBadge(status) {
    const labels = {
      available: "Available",
      pending: "Claim pending",
      claimed: "Released",
      archived: "Archived",
      submitted: "Submitted",
      verified: "Verified for pickup",
      rejected: "Could not verify",
      released: "Released",
      open: "Open",
      resolved: "Resolved",
    };
    const cls = String(status || "").toLowerCase();
    return `<span class="badge ${safe(cls)}"><span class="badge-dot"></span>${safe(labels[cls] || status)}</span>`;
  }
  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  }
  function setSession(s) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  }
  function isStaff() {
    const s = getSession();
    return Boolean(s && s.role === "staff");
  }
  function isStudent() {
    const s = getSession();
    return Boolean(s && s.role === "student");
  }
  async function hashPassword(password, salt) {
    const text = `${salt}:${password}`;
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(text),
      );
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    let h = 0;
    for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0;
    return "f" + h;
  }
  function resizePhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read the photo."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () =>
          reject(new Error("That file is not a valid image."));
        img.onload = () => {
          const max = 600;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas
            .getContext("2d")
            .drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function goTo(hash) {
    if (location.hash === "#" + hash) render();
    else location.hash = hash;
  }
  function renderHeader() {
    const session = getSession();
    const nav = document.getElementById("navLinks");
    const actions = document.getElementById("navActions");
    const links =
      session && session.role === "staff"
        ? `<span class="nav-indicator" aria-hidden="true"></span><a href="#admin" data-nav="admin">Dashboard</a><a href="#browse" data-nav="browse">Public catalog</a>`
        : session
          ? `<span class="nav-indicator" aria-hidden="true"></span><a href="#home" data-nav="home">Home</a>
       <a href="#browse" data-nav="browse">Browse items</a>
       <a href="#report" data-nav="report">Report lost</a>
       <a href="#track" data-nav="track">Track claim</a>`
          : ""; // signed-out visitors only ever see the sign-in page
    const authControls = session
      ? `<span class="user-chip" title="Signed in as ${session.role === "staff" ? "OSA Staff" : safe(session.username)}">${session.role === "staff" ? ICON.shield : ICON.grad}<span>${session.role === "staff" ? "OSA Staff" : safe(session.username)}</span></span>
       <button class="btn btn-ghost btn-small" type="button" data-action="logout">${ICON.logout} Sign out</button>`
      : `<button class="btn btn-ghost btn-small" type="button" data-action="open-login" data-role="student">Sign in</button>
       <button class="btn btn-primary btn-small" type="button" data-action="open-login" data-role="student" data-mode="signup">Sign up</button>`;
    // only rebuild when the markup changes (sign in/out); rebuilding on every render made the header flash
    const navHtml = `${links}<div class="mobile-auth-slot hidden" id="mobileAuthSlot">${authControls}</div>`;
    if (nav.dataset.html !== navHtml) {
      nav.innerHTML = navHtml;
      nav.dataset.html = navHtml;
      actions.innerHTML = authControls;
    }
  }
  const CATEGORY_ICON_PATHS = {
    Electronics: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    IDs: '<path d="M16 10h2"/><path d="M16 14h2"/><path d="M6.17 15a3 3 0 0 1 5.66 0"/><circle cx="9" cy="11" r="2"/><rect x="2" y="5" width="20" height="14" rx="2"/>',
    Accessories: '<circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M14 15a2 2 0 0 0-4 0"/><path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2"/><path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2"/>',
    Bags: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 10h8"/><path d="M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
    Keys: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    Clothing: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    Other: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  };
  function categoryIcon(cat, size = 40) {
    const paths = CATEGORY_ICON_PATHS[cat] || CATEGORY_ICON_PATHS.Other;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }
  function itemVisualHtml(item, large = false) {
    const photo = canShowPhoto(item) ? itemPhotoSrc(item) : "";
    return `
    <div class="item-visual ${large ? "large" : ""}">
      ${
        photo
          ? `<img src="${photo}" alt="Photo of ${safe(item.title)}" />`
          : categoryIcon(item.category)
      }
      ${
        item.category === "IDs" || item.hidePhoto
          ? `<div class="id-privacy-pill">${ICON.lock}<span>${item.category === "IDs" ? "ID photo" : "Photo"} hidden for privacy</span></div>`
          : ""
      }
    </div>`;
  }
  function itemCardHtml(item) {
    return `
    <a class="card card-hover item-card" href="#item/${encodeURIComponent(item.id)}" aria-label="View ${safe(item.title)}">
      <div class="item-visual-wrap">
        ${itemVisualHtml(item, false)}
        <div class="visual-badge-tl">${statusBadge(item.status)}</div>
        <span class="badge visual-badge-tr">${safe(item.category)}</span>
      </div>
      <div class="item-content">
        <h3>${safe(item.title)}</h3>
        <p class="item-desc">${safe(item.description)}</p>
        <div class="item-bottom">
          <span>${ICON.pin} ${safe(item.location)}</span>
          <span>${ICON.calendar} ${daysLabel(item)}</span>
        </div>
      </div>
    </a>`;
  }
  function renderHome() {
    const publicList = publicItems();
    const featured = publicList
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
    const claimedCount = data.items.filter(
      (i) => i.status === "claimed",
    ).length;
    return `
    <section class="hero">
      <div class="hero-sky" aria-hidden="true"><i class="cloud c1"></i><i class="cloud c2"></i><i class="cloud c3"></i><i class="cloud c4"></i><i class="cloud c5"></i></div>
      <div class="hero-building-bg" role="img" aria-label="Front view of the TUP Manila main building"></div>
      <div class="hero-wash" aria-hidden="true"></div>
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">Office of Student Affairs &middot; TUP Manila</span>
          <h1>Lost something on campus?</h1>
          <p class="hero-copy">
            Everything turned over to OSA gets listed here. Search the catalog, file a claim for anything that's yours, then pick it up at the office once staff check your ID.
          </p>
          <form id="heroSearch" class="hero-search">
            ${ICON.search}
            <input name="query" type="search" placeholder="Try &ldquo;umbrella&rdquo;, &ldquo;calculator&rdquo; or a building name" aria-label="Search found items" />
            <button class="btn btn-primary btn-small" style="min-height:38px;padding:8px 16px;" type="submit">Search</button>
          </form>
          <p class="hero-hint">Not listed yet? <a href="#report">Leave a lost-item report</a> and OSA will email you if it turns up.</p>
        </div>
      </div>
    </section>
    <section class="reveal section container">
      <div class="section-head">
        <div>
          <h2>Recently turned over</h2>
          <p>Newest first. Open a listing to see where it was found and how to claim it.</p>
        </div>
        <a class="btn btn-outline" href="#browse">See all ${publicList.length} items ${ICON.arrowRight}</a>
      </div>
      ${
        featured.length
          ? `<div class="items-grid">${featured.map(itemCardHtml).join("")}</div>`
          : emptyHtml(
              "No items listed yet",
              "New belongings turned over to OSA will appear here.",
            )
      }
    </section>
    <section class="reveal section steps-section">
      <div class="container">
        <div class="section-head">
          <div>
            <h2>How claiming works</h2>
            <p>Nothing is released online. OSA checks every claim in person.</p>
          </div>
        </div>
        <ol class="steps-grid">
          <li class="step">
            <h3>Find it in the catalog</h3>
            <p>Search by keyword, category or building. ID numbers, bag contents and unique markings are left out of public listings on purpose.</p>
          </li>
          <li class="step">
            <h3>File a claim</h3>
            <p>Describe something only the owner would know, like a scratch, a sticker or what's inside. You get a 4-digit ticket right away.</p>
          </li>
          <li class="step">
            <h3>Pick it up at OSA</h3>
            <p>Bring the ticket and a valid ID to the 1st Floor office. Staff match your answers before handing anything over.</p>
          </li>
        </ol>
      </div>
    </section>
    <section class="reveal section container">
      <div class="cta-banner">
        <div class="cta-content">
          <h2>Found something that isn't yours?</h2>
          <p>Drop it off at the OSA counter on the 1st Floor. Staff log it, photograph it when that's safe to do, and list it here.</p>
        </div>
        <div class="cta-actions">
          <a class="btn btn-primary" href="#browse">Browse the catalog</a>
          <a class="btn btn-outline" href="#report">Report a lost item</a>
        </div>
      </div>
    </section>`;
  }
  function emptyHtml(title, message, showClear = false) {
    return `
    <div class="card empty">
      <div class="empty-icon">${ICON.search}</div>
      <h3>${safe(title)}</h3>
      <p>${safe(message)}</p>
      ${
        showClear
          ? `<button type="button" class="btn btn-outline" data-action="clear-filters">Clear search &amp; filters</button>`
          : `<a class="btn btn-outline" href="#browse">View all items</a>`
      }
    </div>`;
  }
  // every typed word must match the start of a word in the title, category, location or description,
  // so "cie" finds "CIE Building" but not "Scientific" or "College of Science"
  function matchesSearch(item, query) {
    const words = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    if (!words.length) return true;
    const hay = `${item.title} ${item.category} ${item.location} ${item.description}`.toLowerCase().split(/[^a-z0-9]+/);
    return words.every((w) => hay.some((h) => h.startsWith(w)));
  }
  function renderBrowse() {
    if (!categoryFilters().includes(category)) category = "All";
    const q = searchTerm.toLowerCase().trim();
    const items = publicItems()
      .filter((item) => {
        if (category !== "All" && item.category !== category) return false;
        return matchesSearch(item, q);
      })
      .sort((a, b) =>
        sortOrder === "oldest"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date),
      );
    return `
    <div class="container">
      <a class="back-link" href="#home">${ICON.arrowLeft} Back to home</a>
      <div class="page-heading" style="padding-top:20px;">
        <span class="eyebrow">Catalog</span>
        <h1>Found items held at OSA</h1>
        <p>Browse items safely held by the Office of Student Affairs. Photos of IDs and sensitive belongings are withheld.</p>
      </div>
      <form id="catalogSearch" class="card catalog-tools">
        <div class="field-search">
          ${ICON.search}
          <input name="query" type="search" value="${safe(searchTerm)}" placeholder="Search items, buildings, or categories..." aria-label="Search catalog" />
        </div>
        <select id="sortOrder" class="select" aria-label="Sort items">
          <option value="newest" ${sortOrder === "newest" ? "selected" : ""}>Newest first</option>
          <option value="oldest" ${sortOrder === "oldest" ? "selected" : ""}>Oldest first</option>
        </select>
        <button class="btn btn-primary" style="min-height:42px;" type="submit">Search</button>
      </form>
      <div class="chips" role="group" aria-label="Filter by category">
        ${categoryFilters().map((c) => `<button type="button" class="chip ${category === c ? "active" : ""}" data-category="${safe(c)}">${safe(c)}</button>`).join("")}
      </div>
      <p class="result-count">
        Showing <strong>${items.length}</strong> ${items.length === 1 ? "item" : "items"}${category !== "All" ? ` in <strong>${safe(category)}</strong>` : ""}${q ? ` matching &ldquo;${safe(searchTerm)}&rdquo;` : ""}
      </p>
      <div style="padding-bottom:40px;">
        ${
          items.length
            ? `<div class="items-grid">${items.map(itemCardHtml).join("")}</div>`
            : emptyHtml(
                "No matching items found",
                "Try a broader keyword or select a different category.",
                true,
              )
        }
      </div>
    </div>`;
  }
  function renderDetail(id) {
    const item = itemById(id);
    if (!item || !["available", "pending"].includes(item.status)) {
      return `<div class="container" style="padding:48px 0;">${emptyHtml("Item not available", "This listing may have already been claimed or archived.")}</div>`;
    }
    const session = getSession();
    const canClaim = item.status === "available";
    let claimCta = "";
    if (!canClaim) {
      claimCta = `<div class="notice">${ICON.clock}<div><strong>Claim under review:</strong> Another request is currently being reviewed for this item. Please inquire at OSA if you believe this is yours.</div></div>`;
    } else if (session && session.role === "student") {
      claimCta = `<a class="btn btn-primary" style="min-height:48px;padding:12px 24px;" href="#claim/${encodeURIComponent(item.id)}">This might be mine ${ICON.arrowRight}</a>`;
    } else if (session && session.role === "staff") {
      claimCta = "";
    } else {
      claimCta = `
      <div class="notice soft-red" style="flex-direction:column;gap:12px;">
        <div><strong>Sign in to submit a claim.</strong> A student account is required to submit verification details and receive a claim ticket.</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-primary btn-small" data-action="open-login" data-role="student" data-next="claim/${safe(item.id)}">Sign in to claim</button>
          <button type="button" class="btn btn-outline btn-small" data-action="open-login" data-role="student" data-mode="signup" data-next="claim/${safe(item.id)}">Create student account</button>
        </div>
      </div>`;
    }
    return `
    <div class="container">
      <a class="back-link" href="#browse">${ICON.arrowLeft} Back to catalog</a>
      <div class="detail-grid">
        <div>
          ${itemVisualHtml(item, true)}
          <p class="field-hint" style="display:flex;align-items:center;gap:6px;margin-top:10px;">
            ${
              canShowPhoto(item)
                ? `${ICON.shield} Photo provided by OSA.`
                : `${ICON.lock} Photos of IDs and sensitive items are withheld for privacy.`
            }
          </p>
        </div>
        <div class="detail-info">
          ${statusBadge(item.status)}
          <h1>${safe(item.title)}</h1>
          <p style="color:#4b5563;line-height:1.7;">${safe(item.description)}</p>
          <div class="detail-meta">
            <div class="meta-row"><span class="meta-row-label">${ICON.hash} Reference ID</span><strong class="font-mono">${safe(item.id)}</strong></div>
            <div class="meta-row"><span class="meta-row-label">${ICON.hash} Category</span><strong>${safe(item.category)}</strong></div>
            <div class="meta-row"><span class="meta-row-label">${ICON.pin} Found at</span><strong>${safe(item.location)}</strong></div>
            <div class="meta-row"><span class="meta-row-label">${ICON.calendar} Turned over</span><strong>${dateLabel(item.date)}</strong></div>
            <div class="meta-row"><span class="meta-row-label">${ICON.clock} Days with OSA</span><strong>${daysLabel(item)}${daysStored(item) >= LONG_STORAGE_DAYS ? " &middot; Long storage" : ""}</strong></div>
            <div class="meta-row"><span class="meta-row-label">${ICON.building} Claim at</span><strong>OSA &middot; 1st Floor, TUP Manila</strong></div>
          </div>
          ${claimCta}
          <div class="notice soft-stone" style="margin-top:18px;">
            ${ICON.shield}
            <div>
              <strong>Why are some details hidden?</strong><br />
              FoundIS omits unique markings, ID numbers, and contents from public view. OSA uses your private verification notes in person before releasing any item.
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
  function renderClaim(id) {
    const item = itemById(id);
    if (!item || item.status !== "available") {
      return `<div class="container" style="padding:48px 0;">${emptyHtml("Item unavailable for claim", "It may already have a pending claim or is no longer available.")}</div>`;
    }
    const session = getSession();
    if (!session || session.role !== "student") {
      pendingNext = `claim/${id}`;
      loginRole = "student";
      return renderLogin();
    }
    return `
    <div class="container">
      <a class="back-link" href="#item/${encodeURIComponent(id)}">${ICON.arrowLeft} Back to item</a>
      <div class="claim-grid">
        <div>
          <div class="card" style="overflow:hidden;">
            ${itemVisualHtml(item, false)}
            <div style="padding:18px;">
              <span class="eyebrow">${safe(item.category)}</span>
              <h2 class="font-display" style="margin:6px 0 6px;font-size:22px;">${safe(item.title)}</h2>
              <p style="margin:0;font-size:13px;color:var(--muted);">${safe(item.description)}</p>
              <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line);font-size:12px;color:var(--muted);">
                <div>Reference: <strong class="font-mono" style="color:var(--ink);">${safe(item.id)}</strong></div>
                <div style="margin-top:3px;">Found at: <strong style="color:var(--ink);">${safe(item.location)}</strong></div>
              </div>
            </div>
          </div>
          <div class="notice soft-stone" style="margin-top:16px;">
            ${ICON.shield}
            <div>Your answers are visible only to authorized OSA staff to help verify ownership in person.</div>
          </div>
        </div>
        <div>
          <div class="page-heading" style="padding:0 0 20px;">
            <span class="eyebrow">Ownership verification</span>
            <h1>Submit a claim request</h1>
            <p>Provide details only the true owner would know. Submitting a request does not guarantee release.</p>
          </div>
          <form id="claimForm" class="card form-card" data-item-id="${safe(id)}">
            <div class="form-grid">
              <div class="form-group">
                <label class="field-label" for="claimName">Full name</label>
                <input id="claimName" class="input" name="name" maxlength="100" value="${safe(session.name)}" required />
              </div>
              <div class="form-group">
                <label class="field-label" for="claimEmail">Email address</label>
                <input id="claimEmail" class="input" name="email" type="email" maxlength="140" placeholder="you@tup.edu.ph" required />
                <span class="field-hint">Used with your ticket to check claim status.</span>
              </div>
              <div class="form-group full">
                <label class="field-label" for="claimDetails">What details prove this item is yours?</label>
                <textarea id="claimDetails" class="textarea" name="details" minlength="15" maxlength="1000" placeholder="Describe unique markings, scratches, contents, or attachments not shown in the public listing." required></textarea>
                <span class="field-hint">Do not enter passwords, PINs, or complete ID numbers.</span>
              </div>
              <div class="form-group full">
                <label class="field-label" for="claimWhen">When and where did you lose it?</label>
                <input id="claimWhen" class="input" name="lostContext" maxlength="250" placeholder="e.g., Monday afternoon near the Main Library entrance" required />
              </div>
            </div>
            <label class="checkbox-line">
              <input type="checkbox" required />
              <span>I understand OSA must verify my ownership and valid ID in person before releasing any item.</span>
            </label>
            <div class="form-actions">
              <button class="btn btn-primary" type="submit">Submit claim request ${ICON.arrowRight}</button>
              <a class="btn btn-outline" href="#item/${encodeURIComponent(id)}">Cancel</a>
            </div>
          </form>
        </div>
      </div>
    </div>`;
  }
  function makeTicket() {
    const used = new Set(data.claims.map((c) => c.ticket));
    if (used.size >= 9000)
      throw new Error("No available ticket numbers remain.");
    let code;
    do {
      code = String(Math.floor(1000 + Math.random() * 9000));
    } while (used.has(code));
    return code;
  }
  function renderTicket(ticket) {
    const session = getSession();
    if (!session) {
      pendingNext = `ticket/${ticket}`;
      loginRole = "student";
      return renderLogin();
    }
    const claim = data.claims.find((c) => c.ticket === ticket);
    if (!claim || (session.role === "student" && claim.owner && claim.owner !== session.username)) {
      return `<div class="container" style="padding:48px 0;">${emptyHtml("Ticket not found", "Check the four-digit ticket code and try tracking your claim.")}</div>`;
    }
    const item = itemById(claim.itemId);
    return `
    <div class="narrow">
      <div class="page-heading no-print" style="text-align:center;">
        <span class="eyebrow">Claim ticket issued</span>
        <h1>Keep this ticket</h1>
        <p style="margin-inline:auto;">Bring this code and a valid school or government ID to OSA for in-person verification.</p>
      </div>
      <div class="card ticket-card">
        <div class="ticket-top">
          <div class="ticket-icon-box">${ICON.ticket}</div>
          <div style="font-size:11px;font-weight:800;letter-spacing:0.24em;text-transform:uppercase;opacity:0.85;">FoundIS Claim Ticket</div>
          <div class="ticket-code-box" aria-label="Claim ticket ${safe(claim.ticket)}">
            <small>Ticket code</small>
            <strong>${safe(claim.ticket)}</strong>
          </div>
          <div>${statusBadge(claim.status)}</div>
          <div class="ticket-perf" aria-hidden="true">
            <div class="ticket-notch left"></div>
            <div class="ticket-dash"></div>
            <div class="ticket-notch right"></div>
          </div>
        </div>
        <div class="ticket-body">
          <div style="text-align:center;">
            <h2 class="font-display" style="margin:0;font-size:26px;">${safe(item ? item.title : "Found item")}</h2>
            <p style="margin:4px 0 0;font-size:13px;color:var(--muted);">Reference: <strong class="font-mono" style="color:var(--ink);">${safe(claim.itemId)}</strong></p>
          </div>
          <div class="slip-list">
            <div class="slip-row"><span>Claimant</span><strong>${safe(claim.name)}</strong></div>
            <div class="slip-row"><span>Submitted</span><strong>${dateLabel(claim.submittedAt)}</strong></div>
            <div class="slip-row"><span>Claim location</span><strong>OSA, 1st Floor, TUP Manila</strong></div>
            <div class="slip-row"><span>Required at pickup</span><strong>This slip + Valid ID</strong></div>
          </div>
          <div class="notice soft-green">
            ${ICON.check}
            <div>
              <strong>Next step:</strong> Visit OSA on the 1st Floor during office hours (Mon–Fri, 8:00 AM – 5:00 PM). Staff will review your details and verify ownership before releasing the item.
            </div>
          </div>
          <div class="form-actions no-print ticket-actions">
            <div class="ticket-action-group">
              <button class="btn btn-soft btn-small" type="button" data-copy="${safe(claim.ticket)}">${ICON.copy} Copy code</button>
              <button class="btn btn-outline btn-small" type="button" data-action="print-slip">${ICON.printer} Print claim slip</button>
            </div>
            <a class="btn btn-primary btn-small ticket-track-link" href="#track">Track my claim ${ICON.arrowRight}</a>
          </div>
        </div>
      </div>
    </div>`;
  }
  // a student can only open their own claims; older claims without an owner still need the matching ticket and email
  function findOwnClaim(ticket, email, session) {
    return data.claims.find(
      (c) =>
        c.ticket === ticket &&
        c.email === email &&
        (session.role !== "student" || !c.owner || c.owner === session.username),
    );
  }
  function trackResultHtml(claim) {
    if (!claim) {
      return `<div class="notice soft-red">${ICON.x}<div>No matching claim was found. Check your four-digit ticket and email address.</div></div>`;
    }
    const item = itemById(claim.itemId);
    const explanations = {
      submitted: "OSA has received your claim request and will review the verification details.",
      verified:
        "Your claim passed initial review. Bring your ticket and a valid ID to OSA on the 1st Floor for physical handover.",
      rejected: "OSA could not verify this request. Please visit OSA if you need assistance.",
      released: "OSA recorded this item as physically released to the claimant.",
    };
    return `
      <div class="card" style="padding:24px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
          <div>
            <div style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);">Claim for</div>
            <h3 class="font-display" style="margin:4px 0 4px;font-size:24px;">${safe(item ? item.title : "Found item")}</h3>
            <div style="font-size:13px;color:var(--muted);">Ticket <strong class="font-mono" style="color:var(--ink);">#${safe(claim.ticket)}</strong> &middot; Ref <strong class="font-mono">${safe(claim.itemId)}</strong> &middot; Submitted ${dateLabel(claim.submittedAt)}</div>
          </div>
          ${statusBadge(claim.status)}
        </div>
        <div class="notice soft-stone" style="margin-top:16px;">
          ${ICON.shield}
          <div>
            <strong>${safe(explanations[claim.status] || "")}</strong>
            ${claim.releasedAt ? `<div style="margin-top:4px;font-size:12px;">Released on ${dateLabel(claim.releasedAt)}</div>` : ""}
          </div>
        </div>
        ${
          claim.status === "rejected"
            ? `<div class="notice soft-red" style="margin-top:12px;">
          ${ICON.x}
          <div>
            <strong>Reason from OSA:</strong>
            <div style="margin-top:4px;white-space:pre-line;">${safe(claim.rejectReason || "No reason was recorded for this request. Please visit OSA for details.")}</div>
            ${claim.rejectedAt ? `<div style="margin-top:4px;font-size:12px;opacity:0.8;">Reviewed on ${dateLabel(claim.rejectedAt)}</div>` : ""}
          </div>
        </div>`
            : ""
        }
      </div>`;
  }
  // shows the earlier lookup only to the same signed-in user, so nothing is left behind after sign out
  function currentTrackHtml() {
    const session = getSession();
    if (!session || !trackLookup || trackLookup.user !== session.username || !trackLookup.shown) return "";
    return trackResultHtml(findOwnClaim(trackLookup.ticket, trackLookup.email, session));
  }
  function renderTrack() {
    const session = getSession();
    if (!session) {
      pendingNext = "track";
      loginRole = "student";
      return renderLogin();
    }
    const saved = trackLookup && trackLookup.user === session.username ? trackLookup : null;
    const savedTicket = saved ? saved.ticket : "";
    const savedEmail = saved ? saved.email : "";
    return `
    <div class="narrow">
      <a class="back-link" href="#home">${ICON.arrowLeft} Back to home</a>
      <div class="page-heading" style="padding-top:20px;">
        <span class="eyebrow">Claim status</span>
        <h1>Check on a claim</h1>
        <p>Enter your four-digit claim ticket and the email address used on submission.</p>
      </div>
      <form id="trackForm" class="card form-card" style="margin-bottom:20px;">
        <div class="form-grid">
          <div class="form-group">
            <label class="field-label" for="trackTicket">4-digit ticket</label>
            <input id="trackTicket" class="input font-mono" style="text-align:center;font-size:22px;letter-spacing:0.35em;" name="ticket" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="1234" value="${safe(savedTicket)}" required />
          </div>
          <div class="form-group">
            <label class="field-label" for="trackEmail">Email address</label>
            <input id="trackEmail" class="input" name="email" type="email" placeholder="you@tup.edu.ph" value="${safe(savedEmail)}" required />
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" style="width:100%;" type="submit">${ICON.search} Check claim status</button>
        </div>
      </form>
      <div id="trackOutput">${currentTrackHtml()}</div>
      <div class="notice soft-stone" style="margin:20px 0 60px;">
        ${ICON.clock}
        <div>Claim reviews usually take 1–2 working days. OSA makes all final ownership decisions and completes physical handovers in person.</div>
      </div>
    </div>`;
  }
  function renderReport() {
    const session = getSession();
    if (!session) {
      pendingNext = "report";
      loginRole = "student";
      return renderLogin();
    }
    const today = new Date().toISOString().slice(0, 10);
    if (reportSuccessRef) {
      const ref = reportSuccessRef;
      reportSuccessRef = "";
      return `
      <div class="narrow report-success-wrap">
        <div class="card empty report-success" id="reportSuccess" tabindex="-1" role="status" aria-live="polite">
          <div class="empty-icon" style="background:var(--green-bg);color:var(--green);">${ICON.check}</div>
          <h3>Lost report recorded</h3>
          <p>Your reference number is <strong class="font-mono" style="color:var(--red);">${safe(ref)}</strong>. If OSA receives a matching item, staff can reach out to the email you provided.</p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="btn btn-outline" data-action="new-report">Submit another report</button>
            <a class="btn btn-primary" href="#browse">Browse found items ${ICON.arrowRight}</a>
          </div>
        </div>
      </div>`;
    }
    return `
    <div class="narrow">
      <a class="back-link" href="#home">${ICON.arrowLeft} Back to home</a>
      <div class="page-heading" style="padding-top:20px;">
        <span class="eyebrow">Lost-item report</span>
        <h1>Report a lost item</h1>
        <p>Let OSA know what went missing. Staff can match your report against items turned over later.</p>
      </div>
      <form id="reportForm" class="card form-card">
        <div class="form-grid">
          <div class="form-group">
            <label class="field-label" for="repName">Full name</label>
            <input id="repName" class="input" name="name" maxlength="100" autocomplete="name" required />
          </div>
          <div class="form-group">
            <label class="field-label" for="repEmail">Email address</label>
            <input id="repEmail" class="input" name="email" type="email" maxlength="140" autocomplete="email" required />
          </div>
          <div class="form-group full">
            <label class="field-label" for="repTitle">What did you lose?</label>
            <input id="repTitle" class="input" name="title" maxlength="90" placeholder="e.g., Black leather wallet" required />
          </div>
          <div class="form-group">
            <label class="field-label" for="repCategory">Category</label>
            <select id="repCategory" class="select" name="category" required>
              <option value="" disabled selected>Select a category</option>
              ${categorySelectOptions()}
            </select>
          </div>
          <div class="form-group">
            <label class="field-label" for="repDate">Date lost</label>
            <input id="repDate" class="input" name="dateLost" type="date" max="${today}" required />
          </div>
          <div class="form-group full">
            <label class="field-label" for="repLocation">Approximate location lost</label>
            <input id="repLocation" class="input" name="location" maxlength="100" placeholder="e.g., Main Library 2nd Floor" required />
          </div>
          <div class="form-group full">
            <label class="field-label" for="repDesc">Description</label>
            <textarea id="repDesc" class="textarea" name="description" minlength="10" maxlength="500" placeholder="Color, brand, size, and identifying marks." required></textarea>
            <span class="field-hint">Do not enter passwords, PINs, or complete ID numbers.</span>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" style="width:100%;" type="submit">Submit lost report ${ICON.arrowRight}</button>
        </div>
      </form>
    </div>`;
  }
  function passwordField(id, name, autocomplete, extra = "") {
    return `
          <div class="pass-wrap">
            <input id="${id}" class="input" name="${name}" type="password" autocomplete="${autocomplete}" ${extra} required />
            <button type="button" class="pass-toggle" data-toggle-pass="${id}" aria-label="Show password">${ICON.eye}</button>
          </div>`;
  }
  function signinTitle() {
    return loginRole === "staff" ? "OSA staff sign in" : "Welcome back";
  }
  // Student and staff forms share the same field rows so switching tabs keeps every row in place.
  function signinBodyHtml() {
    const staff = loginRole === "staff";
    const userId = staff ? "staffUser" : "stTup";
    const passId = staff ? "staffPass" : "stPass";
    return `
      <form id="${staff ? "staffLogin" : "studentLogin"}">
        <div class="auth-field">
          <label class="field-label" for="${userId}">Username:</label>
          <input id="${userId}" class="input" name="${staff ? "username" : "tup"}" ${staff ? "" : 'maxlength="12"'} placeholder="Username" autocomplete="username" required />
        </div>
        <div class="auth-field">
          <label class="field-label" for="${passId}">Password:</label>
          ${passwordField(passId, "password", "current-password", 'placeholder="Password"')}
        </div>
        <div id="authError" class="auth-error hidden"></div>
        <button class="btn btn-primary auth-submit" type="submit">Sign in ${ICON.arrowRight}</button>
      </form>
      <p class="auth-switch" ${staff ? 'style="visibility:hidden;"' : ""}>No account yet? <button type="button" data-auth-mode="signup" ${staff ? 'tabindex="-1"' : ""}>Create one</button></p>`;
  }
  function renderLogin() {
    const signup = loginRole !== "staff" && authMode === "signup";
    let head;
    let body;
    if (signup) {
      head = `
          <h1 class="auth-title-sans">Create your student account</h1>
          <p class="auth-sub" style="margin-bottom:22px;">Use your TUP-issued student number to sign up.</p>`;
      body = `
      <form id="studentSignup">
        <div class="auth-field">
          <label class="field-label" for="suName">Full name</label>
          <input id="suName" class="input" name="name" maxlength="100" autocomplete="name" required />
        </div>
        <div class="auth-field">
          <label class="field-label" for="suTup">TUP number</label>
          <input id="suTup" class="input" name="tup" maxlength="12" pattern="[Tt][Uu][Pp][Mm]-[0-9]{2}-[0-9]{4}" title="Format: TUPM-24-1234" required />
          <span class="field-hint">Your student number, e.g. TUPM-24-1234</span>
        </div>
        <div class="auth-field">
          <label class="field-label" for="suPass">Password</label>
          ${passwordField("suPass", "password", "new-password", 'minlength="6"')}
          <span class="field-hint">At least 6 characters</span>
        </div>
        <div class="auth-field">
          <label class="field-label" for="suPass2">Confirm password</label>
          ${passwordField("suPass2", "confirm", "new-password", 'minlength="6"')}
        </div>
        <div id="authError" class="auth-error hidden"></div>
        <button class="btn btn-primary auth-submit" type="submit">Create account ${ICON.arrowRight}</button>
      </form>
      <p class="auth-switch">Already have an account? <button type="button" data-auth-mode="signin">Sign in</button></p>`;
    } else {
      head = `
          <h1 id="authTitle">${signinTitle()}</h1>
          <div class="auth-tabs" data-active="${loginRole}" role="tablist">
            <button type="button" class="${loginRole === "staff" ? "" : "active"}" data-auth-role="student">${ICON.grad} Student</button>
            <button type="button" class="${loginRole === "staff" ? "active" : ""}" data-auth-role="staff">${ICON.shield} OSA staff</button>
          </div>`;
      body = signinBodyHtml();
    }
    return `
    <div class="container auth-wrap">
      <div class="auth-split">
        <div class="auth-brand-panel">
          <h2>Reuniting the TUP Manila campus with what&rsquo;s lost.</h2>
          <p>Sign in with your TUP number to submit claims, track requests, or report a lost item. OSA staff can sign in to manage the catalog and verify claims.</p>
          <div class="auth-brand-foot">Office of Student Affairs &middot; TUP Manila</div>
        </div>
        <div class="auth-form-panel${signup ? " is-signup" : ""}">
          ${head}
          <div class="auth-body">${body}</div>
        </div>
      </div>
    </div>`;
  }
  function adminItemsTableHtml(items, emptyMessage = "No items recorded yet.") {
    if (!items.length)
      return `<p class="muted" style="text-align:center;padding:20px 0;">${emptyMessage}</p>`;
    return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Item</th><th>Location</th><th>Turned over</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead>
        <tbody>
          ${items
            .map((item) => {
              const photo = itemPhotoSrc(item);
              const aged =
                ["available", "pending"].includes(item.status) &&
                daysStored(item) >= LONG_STORAGE_DAYS;
              return `
              <tr>
                <td>
                  <button type="button" class="table-item table-item-btn" data-view-item="${safe(item.id)}" aria-label="View details for ${safe(item.title)}">
                    <span class="table-thumb">
                      ${photo ? `<img src="${photo}" alt="" />` : categoryIcon(item.category, 20)}
                    </span>
                    <span>
                      <strong>${safe(item.title)}</strong>
                      <span class="font-mono" style="display:block;font-size:11px;color:var(--muted);">${safe(item.id)} &middot; ${safe(item.category)}</span>
                    </span>
                  </button>
                </td>
                <td>${safe(item.location)}</td>
                <td>
                  <div>${dateLabel(item.date)}</div>
                  <div style="font-size:11px;color:var(--muted);">${daysLabel(item)}</div>
                  ${aged ? `<div style="margin-top:4px;"><span class="badge old">Over ${LONG_STORAGE_DAYS} days</span></div>` : ""}
                </td>
                <td>${statusBadge(item.status)}</td>
                <td>
                  <div class="table-actions">
                    ${["available", "claimed"].includes(item.status) ? `<button class="btn btn-outline btn-small" data-action="archive-item" data-id="${safe(item.id)}">Archive</button>` : ""}
                    ${item.status === "archived" ? `<button class="btn btn-outline btn-small" data-action="restore-item" data-id="${safe(item.id)}">Restore</button><button class="btn btn-danger btn-small" data-action="delete-item" data-id="${safe(item.id)}">Delete</button>` : ""}
                    ${item.status === "pending" ? `<span class="muted" style="font-size:12px;font-style:italic;">Review claim</span>` : ""}
                  </div>
                </td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
  }
  function adminClaimsTableHtml(claims) {
    if (!claims.length)
      return `<p class="muted" style="text-align:center;padding:20px 0;">No claim requests yet.</p>`;
    return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Ticket &amp; item</th><th>Claimant</th><th>Private verification details</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead>
        <tbody>
          ${claims
            .map((c) => {
              const item = itemById(c.itemId);
              return `
              <tr>
                <td>
                  <strong class="font-mono" style="color:var(--red);font-size:14px;">#${safe(c.ticket)}</strong>
                  <div style="font-size:12px;font-weight:650;margin-top:2px;">${safe(item ? item.title : c.itemId)}</div>
                  <div class="font-mono" style="font-size:11px;color:var(--muted);">${safe(c.itemId)} &middot; ${dateLabel(c.submittedAt)}</div>
                </td>
                <td>
                  <strong>${safe(c.name)}</strong>
                  <div style="font-size:11.5px;color:var(--muted);word-break:break-all;">${safe(c.email)}</div>
                </td>
                <td style="max-width:260px;">
                  <div style="font-size:12.5px;line-height:1.45;">${safe(c.details)}</div>
                  <div style="font-size:11.5px;color:var(--muted);margin-top:4px;font-style:italic;">Lost: ${safe(c.lostContext)}</div>
                </td>
                <td>
                  ${statusBadge(c.status)}
                  ${c.status === "rejected" ? `<div style="font-size:11.5px;line-height:1.4;margin-top:6px;max-width:200px;"><strong>Reason:</strong> ${safe(c.rejectReason || "No reason recorded")}</div>` : ""}
                </td>
                <td>
                  <div class="table-actions">
                    ${
                      c.status === "submitted"
                        ? `
                      <button class="btn btn-soft btn-small" data-action="verify-claim" data-id="${safe(c.ticket)}">${ICON.check} Verify</button>
                      <button class="btn btn-danger btn-small" data-action="reject-claim" data-id="${safe(c.ticket)}">${ICON.x} Reject</button>`
                        : ""
                    }
                    ${
                      c.status === "verified"
                        ? `
                      <button class="btn btn-primary btn-small" data-action="release-claim" data-id="${safe(c.ticket)}">${ICON.check} Record release</button>`
                        : ""
                    }
                    ${["rejected", "released"].includes(c.status) ? `<span class="muted" style="font-size:11.5px;font-style:italic;">${c.releasedAt ? `Released ${dateLabel(c.releasedAt)}` : "Closed"}</span>` : ""}
                  </div>
                </td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
  }
  function adminLostTableHtml(reports) {
    if (!reports.length)
      return `<p class="muted" style="text-align:center;padding:20px 0;">No lost item reports yet.</p>`;
    return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Item lost</th><th>Where / when</th><th>Reported by</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead>
        <tbody>
          ${reports
            .map(
              (r) => `
            <tr>
              <td>
                <strong>${safe(r.title)}</strong>
                <div class="font-mono" style="font-size:11px;color:var(--muted);">${safe(r.id)} &middot; ${safe(r.category)}</div>
                <div style="font-size:12px;color:#4b5563;margin-top:4px;max-width:280px;">${safe(r.description)}</div>
              </td>
              <td>
                <div>${safe(r.location)}</div>
                <div style="font-size:11.5px;color:var(--muted);">Lost ${dateLabel(r.dateLost)}</div>
              </td>
              <td>
                <strong>${safe(r.name)}</strong>
                <div style="font-size:11.5px;color:var(--muted);word-break:break-all;">${safe(r.email)}</div>
              </td>
              <td>${statusBadge(r.status)}</td>
              <td>
                <div class="table-actions">
                  ${
                    r.status === "open"
                      ? `<button class="btn btn-soft btn-small" data-action="resolve-report" data-id="${safe(r.id)}">${ICON.check} Mark resolved</button>`
                      : `<button class="btn btn-outline btn-small" data-action="reopen-report" data-id="${safe(r.id)}">Reopen</button>`
                  }
                </div>
              </td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
  }
  function renderAdmin() {
    if (!isStaff()) {
      pendingNext = "admin";
      loginRole = "staff";
      return renderLogin();
    }
    const availableCount = data.items.filter((i) =>
      ["available", "pending"].includes(i.status),
    ).length;
    const pendingClaims = data.claims.filter((c) =>
      ["submitted", "verified"].includes(c.status),
    );
    const claimedCount = data.items.filter(
      (i) => i.status === "claimed",
    ).length;
    const openReportsCount = data.lostReports.filter(
      (r) => r.status === "open",
    ).length;
    const today = new Date().toISOString().slice(0, 10);
    const titles = {
      overview: [
        "Dashboard overview",
        "Snapshot of OSA inventory and pending verification tasks.",
      ],
      items: [
        "Found item records",
        "Active and released item records.",
      ],
      archive: [
        "Archive",
        "Archived items. Restore an item to return it to Item records.",
      ],
      claims: [
        "Claim requests",
        "Review verification answers and record physical item releases.",
      ],
      lost: [
        "Student lost reports",
        "Match incoming belongings with reported missing items.",
      ],
      add: [
        "Record a found item",
        "Log a newly turned-over item into the OSA catalog.",
      ],
      categories: [
        "Categories",
        "Remove categories from the OSA list. Existing item and report labels stay unchanged.",
      ],
    };
    let body = "";
    if (adminTab === "overview") {
      body = `
      <div class="admin-metrics">
        <div class="card metric emerald"><span>Available items</span><strong>${availableCount}</strong></div>
        <div class="card metric amber"><span>Claims to review</span><strong>${pendingClaims.length}</strong></div>
        <div class="card metric blue"><span>Items released</span><strong>${claimedCount}</strong></div>
        <div class="card metric violet"><span>Open lost reports</span><strong>${openReportsCount}</strong></div>
      </div>
      <div class="card panel">
        <div class="panel-head"><h2>Claims needing attention</h2></div>
        ${adminClaimsTableHtml(sortClaimsForStaff(pendingClaims.slice().reverse()))}
      </div>
      <div class="card panel">
        <div class="panel-head">
          <h2>Recently recorded items</h2>
          <button class="btn btn-outline btn-small" data-admin-tab="add">${ICON.plus} Add item</button>
        </div>
        ${adminItemsTableHtml(sortNewestFirst(data.items.filter((item) => item.status !== "archived").reverse(), (i) => i.date).slice(0, 5))}
      </div>`;
    } else if (adminTab === "items") {
      const activeItems = data.items.filter((item) => item.status !== "archived");
      let rows = filterAdminRows(activeItems, (i) => [i.id, i.title, i.category, i.location, i.description], (i) => i.date, (i) => i.category);
      rows = sortNewestFirst(rows, (i) => i.date);
      body = adminFilterHtml("Turned over", rows.length, activeItems.length) +
        `<div class="card panel"><div class="panel-head"><h2>Item records (${rows.length})</h2></div>${adminRowsOrEmpty(rows, (filteredRows) => adminItemsTableHtml(filteredRows, "No active items."))}</div>`;
    } else if (adminTab === "archive") {
      const archivedItems = data.items.filter((item) => item.status === "archived");
      let rows = filterAdminRows(archivedItems, (i) => [i.id, i.title, i.category, i.location, i.description], (i) => i.date, (i) => i.category);
      rows = sortNewestFirst(rows, (i) => i.date);
      body = adminFilterHtml("Archived", rows.length, archivedItems.length) +
        `<div class="card panel"><div class="panel-head"><h2>Archived items (${rows.length})</h2></div>${adminRowsOrEmpty(rows, (filteredRows) => adminItemsTableHtml(filteredRows, "No archived items."))}</div>`;
    } else if (adminTab === "claims") {
      const rows = sortClaimsForStaff(
        filterAdminRows(
          data.claims,
          (c) => [c.ticket, c.itemId, itemById(c.itemId)?.title, c.name, c.email, c.details, c.lostContext],
          (c) => c.submittedAt,
          (c) => itemById(c.itemId)?.category,
        ),
      );
      body = adminFilterHtml("Submitted", rows.length, data.claims.length) +
        `<div class="card panel"><div class="panel-head"><h2>All claim requests (${rows.length})</h2></div>${adminRowsOrEmpty(rows, adminClaimsTableHtml)}</div>`;
    } else if (adminTab === "lost") {
      const rows = filterAdminRows(data.lostReports, (r) => [r.id, r.title, r.category, r.location, r.name, r.email, r.description], (r) => r.dateLost, (r) => r.category).sort((a, b) => {
        // reports that still need attention first, then resolved; newest report first inside each group
        const rank = (r) => (r.status === "open" ? 0 : 1);
        if (rank(a) !== rank(b)) return rank(a) - rank(b);
        const when = (r) => new Date(r.reportedAt || r.dateLost || 0).getTime() || 0;
        return when(b) - when(a) || String(b.id).localeCompare(String(a.id), undefined, { numeric: true });
      });
      body = adminFilterHtml("Date lost", rows.length, data.lostReports.length) +
        `<div class="card panel"><div class="panel-head"><h2>Lost item reports (${rows.length})</h2></div>${adminRowsOrEmpty(rows, adminLostTableHtml)}</div>`;
    } else if (adminTab === "categories") {
      const officialRows = data.categories
        .map((cat) => {
          const items = data.items.filter(
            (item) => item.category.toLowerCase() === cat.toLowerCase(),
          ).length;
          const reports = data.lostReports.filter(
            (report) => report.category.toLowerCase() === cat.toLowerCase(),
          ).length;
          return `
          <tr>
            <td><strong>${safe(cat)}</strong></td>
            <td>${items}</td>
            <td>${reports}</td>
            <td style="text-align:right;">
              ${
                cat === "Other"
                  ? `<span class="muted" style="font-size:12px;">Default</span>`
                  : `<button class="btn btn-outline btn-small" data-action="remove-category" data-id="${safe(cat)}">Remove</button>`
              }
            </td>
          </tr>`;
        })
        .join("");
      body = `
      <div class="card panel">
        <div class="panel-head"><h2>OSA categories (${data.categories.length})</h2></div>
        <form id="categoryForm">
          <div class="form-group">
            <label class="field-label" for="categoryName">New category</label>
            <div class="category-entry-pill">
              <input id="categoryName" name="category" maxlength="30" minlength="2" placeholder="e.g., Books or Water bottles" required />
              <button class="btn btn-primary btn-small" type="submit">${ICON.plus} Add category</button>
            </div>
          </div>
        </form>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Category</th><th>Found items</th><th>Lost reports</th><th style="text-align:right;">Actions</th></tr></thead>
            <tbody>${officialRows}</tbody>
          </table>
        </div>
      </div>
      `;
    } else {
      body = `
      <form id="addItemForm" class="card panel" style="padding:28px;">
        <div class="notice" style="margin-bottom:22px;">
          ${ICON.shield}
          <div><strong>Privacy reminder:</strong> Use only general descriptions publicly. Keep ID numbers, names, and bag contents in private staff notes only.</div>
        </div>
        <div class="form-grid">
          <div class="form-group full">
            <label class="field-label" for="itemTitle">Public item title</label>
            <input id="itemTitle" class="input" name="title" maxlength="90" placeholder="e.g., Blue backpack" required />
          </div>
          <div class="form-group">
            <label class="field-label" for="itemCategory">Category</label>
            <select id="itemCategory" class="select" name="category" required>
              ${categorySelectOptions()}
            </select>
          </div>
          <div class="form-group">
            <label class="field-label" for="itemLocation">Location found</label>
            <input id="itemLocation" class="input" name="location" maxlength="90" placeholder="e.g., COS Building" required />
          </div>
          <div class="form-group">
            <label class="field-label" for="itemDate">Date found</label>
            <input id="itemDate" class="input" name="foundAt" type="date" max="${today}" value="${today}" required />
          </div>
          <div class="form-group full">
            <label class="field-label" for="itemDescription">Privacy-screened public description</label>
            <textarea id="itemDescription" class="textarea" name="description" maxlength="400" placeholder="General appearance only. No personal or identifying details." required></textarea>
          </div>
          <div class="form-group full">
            <label class="field-label">Photo</label>
            <label class="upload-zone" for="itemPhoto">
              <div class="upload-icon">${ICON.upload}</div>
              <div>
                <strong style="display:block;font-size:13.5px;">Upload an item photo</strong>
                <span style="font-size:12px;color:var(--muted);">Auto-resized to 600px JPEG. Photos of IDs are never saved.</span>
              </div>
              <input id="itemPhoto" type="file" name="photo" accept="image/*" class="hidden" />
            </label>
            <div id="photoPreviewWrap" style="margin-top:10px;">
              ${pendingPhotoPreview ? `<img src="${pendingPhotoPreview}" alt="Preview" style="width:120px;height:120px;object-fit:cover;border-radius:12px;border:1px solid var(--line);" />` : ""}
            </div>
            <label class="checkbox-line" style="margin-top:10px;">
              <input type="checkbox" name="hidePhoto" />
              <span>Hide this photo from the public catalog (sensitive item)</span>
            </label>
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">${ICON.plus} Add to catalog</button>
          <button class="btn btn-outline" type="button" data-admin-tab="overview">Cancel</button>
        </div>
      </form>`;
    }
    const [heading, sub] = titles[adminTab];
    return `
    <div class="container admin-shell">
      <aside class="card admin-side" aria-label="OSA Workspace navigation">
        <div class="admin-side-head">
          <small>OSA Workspace</small>
          <strong>${safe(getSession()?.name || "OSA Staff")}</strong>
        </div>
        <button class="side-btn ${adminTab === "overview" ? "active" : ""}" data-admin-tab="overview">${ICON.grid} Overview</button>
        <button class="side-btn ${adminTab === "items" ? "active" : ""}" data-admin-tab="items">${ICON.package} Item records</button>
        <button class="side-btn ${adminTab === "archive" ? "active" : ""}" data-admin-tab="archive">${ICON.inbox} Archive</button>
        <button class="side-btn ${adminTab === "claims" ? "active" : ""}" data-admin-tab="claims">${ICON.list} Claim requests ${pendingClaims.length ? `<span class="side-badge">${pendingClaims.length}</span>` : ""}</button>
        <button class="side-btn ${adminTab === "lost" ? "active" : ""}" data-admin-tab="lost">${ICON.inbox} Lost reports ${openReportsCount ? `<span class="side-badge">${openReportsCount}</span>` : ""}</button>
        <button class="side-btn ${adminTab === "categories" ? "active" : ""}" data-admin-tab="categories">${ICON.hash} Categories</button>
        <button class="side-btn ${adminTab === "add" ? "active" : ""}" data-admin-tab="add">${ICON.plus} Add found item</button>
      </aside>
      <div class="admin-main">
        <div class="admin-title">
          <div>
            <span class="eyebrow">Staff workspace</span>
            <h1>${heading}</h1>
            <p style="margin:0;color:var(--muted);font-size:13.5px;">${sub}</p>
          </div>
        </div>
        ${body}
      </div>
    </div>`;
  }
  // staff record search: keyword plus an inclusive From/To date range
  function dayKey(value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
    const d = new Date(value);
    if (isNaN(d)) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  // newest first by the given date; rows with the same date keep the order they arrive in
  // (lists from filterAdminRows already have the latest record first)
  function sortNewestFirst(list, dateOf) {
    const time = (row) => new Date(dateOf(row) || 0).getTime() || 0;
    return list.slice().sort((a, b) => time(b) - time(a));
  }
  // claim requests: waiting for review first, then verified and waiting for release, then finished ones
  const CLAIM_PRIORITY = { submitted: 0, verified: 1 };
  function sortClaimsForStaff(list) {
    const rank = (c) => (c.status in CLAIM_PRIORITY ? CLAIM_PRIORITY[c.status] : 2);
    return sortNewestFirst(list, (c) => c.submittedAt).sort((a, b) => rank(a) - rank(b));
  }
  function filterAdminRows(list, textOf, dateOf, categoryOf) {
    const q = adminFilter.q.toLowerCase();
    return list
      .filter((row) => {
        if (
          adminFilter.category !== "All" &&
          String(categoryOf(row) || "").toLowerCase() !==
            adminFilter.category.toLowerCase()
        )
          return false;
        if (q && !textOf(row).filter(Boolean).join(" ").toLowerCase().includes(q)) return false;
        const day = dayKey(dateOf(row));
        if (adminFilter.from && day < adminFilter.from) return false;
        if (adminFilter.to && day > adminFilter.to) return false;
        return true;
      })
      .reverse();
  }
  function adminRowsOrEmpty(rows, tableHtml) {
    const filtering = adminFilter.q || adminFilter.from || adminFilter.to || adminFilter.category !== "All";
    if (!rows.length && filtering)
      return `<p class="muted" style="text-align:center;padding:20px 0;">No records match your search. Try a wider date range or a different keyword.</p>`;
    return tableHtml(rows);
  }
  function adminFilterHtml(dateLabel, shown, total, categories = categoryFilters()) {
    const today = new Date().toISOString().slice(0, 10);
    const filtering = adminFilter.q || adminFilter.from || adminFilter.to || adminFilter.category !== "All";
    return `
      <form id="adminFilter" class="card admin-filter" role="search">
        <div class="admin-filter-field admin-filter-q">
          <label class="field-label" for="afQ">Search</label>
          <div class="field-search">
            ${ICON.search}
            <input id="afQ" name="q" type="search" value="${safe(adminFilter.q)}" placeholder="Item, ticket, name, location..." />
          </div>
        </div>
        <div class="admin-filter-field">
          <label class="field-label" for="afFrom">${dateLabel} from</label>
          <input id="afFrom" class="input" name="from" type="date" max="${today}" value="${safe(adminFilter.from)}" />
        </div>
        <div class="admin-filter-field">
          <label class="field-label" for="afTo">To</label>
          <input id="afTo" class="input" name="to" type="date" max="${today}" value="${safe(adminFilter.to)}" />
        </div>
        <div class="admin-filter-actions">
          <button class="btn btn-primary" type="submit">${ICON.search} Search</button>
          ${filtering ? `<button class="btn btn-outline" type="button" data-action="clear-admin-filter">Clear</button>` : ""}
        </div>
      </form>
      <div class="chips" role="group" aria-label="Filter by category">
        ${categories.map((c) => `<button type="button" class="chip ${adminFilter.category === c ? "active" : ""}" data-admin-category="${safe(c)}">${safe(c)}</button>`).join("")}
      </div>
      ${filtering ? `<p class="result-count">Showing <strong>${shown}</strong> of ${total}</p>` : ""}`;
  }
  // staff item viewer: large photo, full record, private notes and actions in a native <dialog>
  function openItemDialog(id) {
    const item = itemById(id);
    const dialog = document.getElementById("itemDialog");
    if (!item || !dialog) return;
    const photo = itemPhotoSrc(item);
    const isPublic = ["available", "pending"].includes(item.status);
    dialog.innerHTML = `
      <div class="item-dialog-media">
        ${photo ? `<img src="${photo}" alt="Photo of ${safe(item.title)}" />` : `<div class="item-dialog-nophoto">${categoryIcon(item.category, 72)}<span>No photo on file</span></div>`}
      </div>
      <div class="item-dialog-body">
        <button type="button" class="item-dialog-close" data-close-dialog aria-label="Close">${ICON.x}</button>
        ${statusBadge(item.status)}
        <h2 id="itemDialogTitle">${safe(item.title)}</h2>
        <p class="item-dialog-desc">${safe(item.description)}</p>
        <dl class="item-dialog-meta">
          <div><dt>Reference</dt><dd class="font-mono">${safe(item.id)}</dd></div>
          <div><dt>Category</dt><dd>${safe(item.category)}</dd></div>
          <div><dt>Found at</dt><dd>${safe(item.location)}</dd></div>
          <div><dt>Turned over</dt><dd>${dateLabel(item.date)} &middot; ${daysLabel(item)}</dd></div>
        </dl>
        <div class="item-dialog-notes">
          <strong>Private verification notes</strong>
          <p>${item.notes ? safe(item.notes) : "No notes recorded."}</p>
        </div>
        <div class="item-dialog-actions">
          ${isPublic ? `<a class="btn btn-outline btn-small" href="#item/${encodeURIComponent(item.id)}" data-close-dialog>View public listing</a>` : ""}
          ${["available", "claimed"].includes(item.status) ? `<button class="btn btn-outline btn-small" data-action="archive-item" data-id="${safe(item.id)}">Archive</button>` : ""}
          ${item.status === "archived" ? `<button class="btn btn-outline btn-small" data-action="restore-item" data-id="${safe(item.id)}">Restore</button><button class="btn btn-danger btn-small" data-action="delete-item" data-id="${safe(item.id)}">Delete</button>` : ""}
        </div>
      </div>`;
    dialog.showModal();
  }
  // switch staff tabs in place: header and sidebar stay put, only the main column changes
  function swapAdminTab() {
    const main = app.querySelector(".admin-main");
    const side = app.querySelector(".admin-side");
    if (!main || !side) {
      render();
      return;
    }
    const next = document.createElement("div");
    next.innerHTML = renderAdmin();
    // hold the old height while scrolling so the page cannot snap when the new tab is shorter
    main.style.minHeight = main.offsetHeight + "px";
    side.innerHTML = next.querySelector(".admin-side").innerHTML;
    main.innerHTML = next.querySelector(".admin-main").innerHTML;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = main.getBoundingClientRect().top + window.scrollY - 92;
    if (window.scrollY > target) window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    if (!reduce) main.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
    setTimeout(() => (main.style.minHeight = ""), 500);
  }
  // slide the header highlight under the active link; first placement snaps so it doesn't fly in from the left
  function moveNavIndicator() {
    const nav = document.getElementById("navLinks");
    const pill = nav.querySelector(".nav-indicator");
    if (!pill) return;
    const active = nav.querySelector("a.active");
    if (!active || getComputedStyle(pill).display === "none") {
      pill.style.opacity = "0";
      return;
    }
    const snap = pill.style.opacity !== "1";
    if (snap) pill.style.transition = "none";
    pill.style.width = active.offsetWidth + "px";
    pill.style.height = active.offsetHeight + "px";
    pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    if (snap) {
      void pill.offsetWidth;
      pill.style.transition = "";
    }
    pill.style.opacity = "1";
  }
  window.addEventListener("resize", moveNavIndicator);
  if (document.fonts) document.fonts.ready.then(moveNavIndicator);
  let lastPage = null;
  // sections marked .reveal stay hidden until scrolled into view; without IntersectionObserver they just show
  const revealObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
        )
      : null;
  if (revealObserver) document.documentElement.classList.add("js-reveal");
  function observeReveals() {
    if (!revealObserver) return;
    revealObserver.disconnect();
    app.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  }
  const PAGE_TITLES = {
    home: "Home",
    browse: "Browse items",
    item: "Item details",
    claim: "Claim an item",
    ticket: "Claim ticket",
    track: "Track claim",
    report: "Report lost item",
    admin: "Staff dashboard",
    login: "Sign in",
  };
  function swapAuthPanel() {
    const panel = document.querySelector(".auth-form-panel");
    if (!panel) return false;
    const next = document.createElement("div");
    next.innerHTML = renderLogin();
    const nextPanel = next.querySelector(".auth-form-panel");
    panel.className = nextPanel.className;
    panel.innerHTML = nextPanel.innerHTML;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.animate(
        [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
        { duration: 240, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      );
    }
    return true;
  }
  function render() {
    // the site opens on sign in; every other page needs a student or staff session
    if (!getSession() && !location.hash.startsWith("#login")) history.replaceState(null, "", "#login");
    const route = decodeURIComponent(location.hash.slice(1) || "home");
    const [page, id] = route.split("/");
    const pageKey = page || "home";
    const pageChanged = pageKey !== lastPage;
    const restoringFirstDraw = restoreY !== null && !restoreStarted;
    if (!restoringFirstDraw) restoreActive = false; // the user navigated, so stop restoring
    app.classList.toggle("is-entering", pageChanged);
    lastPage = pageKey;
    document.title = `${PAGE_TITLES[pageKey] || "FoundIS"} | FoundIS`;
    renderHeader();
    // footer links stay visible with their hover; staff can't use any, signed-in students can't use "sign in"
    const role = getSession()?.role;
    document.querySelectorAll(".footer-links a").forEach((link) => {
      const off = role === "staff" || (role === "student" && link.getAttribute("href") === "#login");
      if (off) {
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("tabindex", "-1");
      } else {
        link.removeAttribute("aria-disabled");
        link.removeAttribute("tabindex");
      }
    });
    if (page === "login") app.innerHTML = renderLogin();
    else if (page === "browse") app.innerHTML = renderBrowse();
    else if (page === "item") app.innerHTML = renderDetail(id);
    else if (page === "claim") app.innerHTML = renderClaim(id);
    else if (page === "ticket") app.innerHTML = renderTicket(id);
    else if (page === "track") app.innerHTML = renderTrack();
    else if (page === "report") app.innerHTML = renderReport();
    else if (page === "admin") app.innerHTML = renderAdmin();
    else app.innerHTML = renderHome();
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const current = link.dataset.nav === pageKey;
      link.classList.toggle("active", current);
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    moveNavIndicator();
    document.getElementById("navLinks").classList.remove("open");
    const mobSlot = document.getElementById("mobileAuthSlot");
    if (mobSlot) mobSlot.classList.add("hidden");
    document
      .getElementById("mobileToggle")
      .setAttribute("aria-expanded", "false");
    // filters and tabs re-render the same page; keep the scroll position for those
    if (pageChanged && !restoringFirstDraw) window.scrollTo(0, 0);
    observeReveals();
    if (restoringFirstDraw) startScrollRestore();
  }
  function showAuthErr(msg) {
    const el = document.getElementById("authError");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
  }
  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (
      !form.matches(
        "#heroSearch, #catalogSearch, #adminFilter, #claimForm, #trackForm, #addItemForm, #categoryForm, #reportForm, #studentLogin, #studentSignup, #staffLogin",
      )
    )
      return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    if (form.id === "adminFilter") {
      const from = String(fields.get("from") || "");
      const to = String(fields.get("to") || "");
      if (from && to && from > to) {
        showToast("The From date must be on or before the To date.");
        return;
      }
      adminFilter = { ...adminFilter, q: String(fields.get("q") || "").trim(), from, to };
      swapAdminTab();
      return;
    }
    if (form.id === "categoryForm") {
      const categoryName = String(fields.get("category") || "")
        .trim()
        .replace(/\s+/g, " ");
      if (categoryName.length < 2) {
        showToast("Category names need at least 2 characters.");
        document.getElementById("categoryName").focus();
        return;
      }
      if (categoryName.toLowerCase() === "all") {
        showToast('"All" is not a valid category name.');
        document.getElementById("categoryName").focus();
        return;
      }
      if (
        data.categories.some(
          (category) =>
            category.toLowerCase() === categoryName.toLowerCase(),
        )
      ) {
        showToast(`"${categoryName}" is already a category.`);
        document.getElementById("categoryName").focus();
        return;
      }
      const otherAt = data.categories.indexOf("Other");
      data.categories.splice(
        otherAt === -1 ? data.categories.length : otherAt,
        0,
        categoryName,
      );
      saveData();
      showToast(`Category "${categoryName}" added.`);
      swapAdminTab();
      return;
    }
    if (form.id === "heroSearch" || form.id === "catalogSearch") {
      searchTerm = String(fields.get("query") || "").trim();
      goTo("browse");
      return;
    }
    if (form.id === "claimForm") {
      const item = itemById(form.dataset.itemId);
      if (!item || item.status !== "available") {
        showToast("This item is no longer available for a new claim.");
        render();
        return;
      }
      let ticket;
      try {
        ticket = makeTicket();
      } catch (err) {
        showToast(err.message);
        return;
      }
      data.claims.push({
        ticket,
        itemId: item.id,
        name: String(fields.get("name")).trim(),
        email: String(fields.get("email")).trim().toLowerCase(),
        details: String(fields.get("details")).trim(),
        lostContext: String(fields.get("lostContext")).trim(),
        status: "submitted",
        submittedAt: new Date().toISOString(),
        releasedAt: null,
        owner: (getSession() || {}).username || "",
      });
      item.status = "pending";
      saveData();
      showToast(`Claim ticket #${ticket} generated.`);
      location.hash = `ticket/${ticket}`;
      return;
    }
    if (form.id === "trackForm") {
      const session = getSession();
      if (!session) {
        render();
        return;
      }
      setTrackLookup({
        user: session.username,
        ticket: String(fields.get("ticket")).trim(),
        email: String(fields.get("email")).trim().toLowerCase(),
        shown: true,
      });
      document.getElementById("trackOutput").innerHTML = currentTrackHtml();
      return;
    }
    const TUP_RE = /^TUPM-\d{2}-\d{4}$/;
    if (form.id === "staffLogin") {
      const u = String(fields.get("username")).trim().toLowerCase();
      const pw = String(fields.get("password"));
      if (u !== STAFF_DEMO.username || pw !== STAFF_DEMO.password) {
        showAuthErr("Incorrect staff username or password.");
        return;
      }
      setSession({
        role: "staff",
        username: STAFF_DEMO.username,
        name: STAFF_DEMO.name,
      });
      showToast("Signed in as OSA Staff.");
      const dest =
        pendingNext && pendingNext === "admin" ? "admin" : "admin";
      pendingNext = "";
      goTo(dest);
      return;
    }
    if (form.id === "studentSignup") {
      const name = String(fields.get("name")).trim();
      const tup = String(fields.get("tup")).trim().toUpperCase();
      const pw = String(fields.get("password"));
      if (!TUP_RE.test(tup)) {
        showAuthErr("Enter your TUP number like TUPM-23-1234.");
        return;
      }
      if (pw.length < 6) {
        showAuthErr("Password must be at least 6 characters.");
        return;
      }
      if (pw !== String(fields.get("confirm"))) {
        showAuthErr("Passwords do not match.");
        return;
      }
      if (data.students.some((s) => s.username === tup)) {
        showAuthErr(
          "That TUP number already has an account. Try signing in.",
        );
        return;
      }
      const salt = Math.random().toString(36).slice(2);
      data.students.push({
        username: tup,
        name,
        salt,
        hash: await hashPassword(pw, salt),
        createdAt: new Date().toISOString(),
      });
      saveData();
      // no auto sign-in: send the new student to the sign-in form with their TUP number filled in
      authMode = "signin";
      loginRole = "student";
      if (!swapAuthPanel()) render();
      document.getElementById("stTup").value = tup;
      document.getElementById("stPass").focus();
      showToast("Account created. Sign in to continue.");
      return;
    }
    if (form.id === "studentLogin") {
      const tup = String(fields.get("tup")).trim().toUpperCase();
      const pw = String(fields.get("password"));
      const student = data.students.find((s) => s.username === tup);
      if (
        !student ||
        student.hash !== (await hashPassword(pw, student.salt))
      ) {
        showAuthErr("Incorrect TUP number or password.");
        return;
      }
      setSession({
        role: "student",
        username: student.username,
        name: student.name,
      });
      showToast(`Signed in as ${student.username}.`);
      const dest = pendingNext || "home";
      pendingNext = "";
      goTo(dest);
      return;
    }
    if (form.id === "reportForm") {
      const categoryName = String(fields.get("category") || "");
      if (!data.categories.includes(categoryName)) {
        showToast("Select a valid category for the lost item.");
        return;
      }
      const nextNum =
        Math.max(
          1000,
          ...data.lostReports.map(
            (r) => Number(r.id.replace("LR-", "")) || 0,
          ),
        ) + 1;
      const ref = `LR-${nextNum}`;
      data.lostReports.push({
        id: ref,
        name: String(fields.get("name")).trim(),
        email: String(fields.get("email")).trim().toLowerCase(),
        title: String(fields.get("title")).trim(),
        category: categoryName,
        location: String(fields.get("location")).trim(),
        dateLost: new Date(String(fields.get("dateLost"))).toISOString(),
        description: String(fields.get("description")).trim(),
        status: "open",
        reportedAt: new Date().toISOString(),
      });
      saveData();
      reportSuccessRef = ref;
      showToast("Lost item report submitted.");
      render();
      // the confirmation is much shorter than the form, so reset to the top; the wrapper centers the card in the screen
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const done = document.getElementById("reportSuccess");
      if (done) done.focus({ preventScroll: true });
      return;
    }
    if (form.id === "addItemForm") {
      const title = String(fields.get("title")).trim();
      const description = String(fields.get("description")).trim();
      const locationText = String(fields.get("location")).trim();
      const categoryName = String(fields.get("category") || "");
      if (!data.categories.includes(categoryName)) {
        showToast("Select a valid category for the found item.");
        return;
      }
      const foundAtVal = String(fields.get("foundAt"));
      if (!title || !description || !locationText) return;
      const emoji = String(
        fields.get("emoji") || EMOJI_MAP[categoryName] || "📦",
      ).trim();
      const nextNumber =
        Math.max(
          1000,
          ...data.items.map((i) => Number(i.id.replace("FI-", "")) || 0),
        ) + 1;
      let photo = "";
      const file = fields.get("photo");
      if (file && file.size > 0) {
        if (categoryName === "IDs") {
          showToast("ID photos are not saved for privacy.");
        } else {
          try {
            photo = await resizePhoto(file);
          } catch (err) {
            showToast(err.message);
            return;
          }
        }
      }
      data.items.push({
        id: `FI-${nextNumber}`,
        title,
        category: categoryName,
        emoji,
        location: locationText,
        date: foundAtVal
          ? new Date(foundAtVal).toISOString()
          : new Date().toISOString(),
        status: "available",
        description,
        photo,
        hidePhoto: fields.get("hidePhoto") === "on",
        notes: String(fields.get("notes") || "").trim(),
      });
      saveData();
      pendingPhotoPreview = "";
      adminTab = "items";
      showToast(`Added ${title} (FI-${nextNumber}).`);
      render();
    }
  });
  document.addEventListener("change", async (event) => {
    if (event.target.id === "sortOrder") {
      sortOrder = event.target.value;
      render();
    } else if (event.target.id === "itemCategory") {
      const emojiInput = document.getElementById("itemEmoji");
      if (emojiInput)
        emojiInput.value = EMOJI_MAP[event.target.value] || "📦";
    } else if (event.target.id === "itemPhoto") {
      const file = event.target.files?.[0];
      const wrap = document.getElementById("photoPreviewWrap");
      if (!file || !wrap) return;
      try {
        pendingPhotoPreview = await resizePhoto(file);
        wrap.innerHTML = `<img src="${pendingPhotoPreview}" alt="Preview" style="width:120px;height:120px;object-fit:cover;border-radius:12px;border:1px solid var(--line);" />`;
      } catch (err) {
        showToast(err.message);
      }
    }
  });
  // asks staff for a required rejection reason, then saves it on the claim so the student can read it
  function openRejectDialog(claim) {
    const old = document.getElementById("rejectDialog");
    if (old) old.remove();
    const dlg = document.createElement("dialog");
    dlg.id = "rejectDialog";
    dlg.className = "reject-dialog";
    dlg.setAttribute("aria-labelledby", "rejectTitle");
    dlg.innerHTML = `
      <form id="rejectForm" novalidate>
        <h3 id="rejectTitle" class="font-display">Reject claim #${safe(claim.ticket)}</h3>
        <p class="reject-help">Write why this claim is being rejected. The student will see this note when they track their claim.</p>
        <label for="rejectReason" class="reject-label">Reason for rejection <span>Required</span></label>
        <textarea id="rejectReason" class="textarea" rows="4" maxlength="300" placeholder="Example: The description did not match the item's markings."></textarea>
        <div id="rejectError" class="reject-error" role="alert" style="display:none;">Please enter a reason of at least 5 characters.</div>
        <div class="reject-actions">
          <button type="button" class="btn btn-outline btn-small" data-close-reject>Cancel</button>
          <button type="submit" class="btn btn-danger btn-small">${ICON.x} Reject claim</button>
        </div>
      </form>`;
    document.body.appendChild(dlg);
    const form = dlg.querySelector("#rejectForm");
    const reason = dlg.querySelector("#rejectReason");
    const error = dlg.querySelector("#rejectError");
    dlg.addEventListener("close", () => dlg.remove());
    dlg.querySelector("[data-close-reject]").addEventListener("click", () => dlg.close());
    reason.addEventListener("input", () => {
      error.style.display = "none";
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = reason.value.trim();
      if (text.length < 5) {
        error.style.display = "block";
        reason.focus();
        return;
      }
      claim.status = "rejected";
      claim.rejectReason = text;
      claim.rejectedAt = new Date().toISOString();
      const claimedItem = itemById(claim.itemId);
      if (claimedItem && claimedItem.status === "pending") claimedItem.status = "available";
      saveData();
      dlg.close();
      showToast(`Claim #${claim.ticket} rejected.`);
      render();
    });
    dlg.showModal();
    reason.focus();
  }
  // clicking the header link of the page you are already on returns to the top
  document.querySelector(".site-header").addEventListener("click", (event) => {
    const route = (h) => (h || "#home").split(/[/?]/)[0];
    const toTop = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, left: 0, behavior: reduce ? "auto" : "smooth" });
      document.getElementById("navLinks").classList.remove("open");
      const slot = document.getElementById("mobileAuthSlot");
      if (slot) slot.classList.add("hidden");
      document.getElementById("mobileToggle").setAttribute("aria-expanded", "false");
    };
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    if (route(link.getAttribute("href")) !== route(location.hash)) return; // different page: normal navigation
    event.preventDefault();
    toTop();
  });
  document.addEventListener("click", async (event) => {
    const catBtn = event.target.closest("[data-category]");
    if (catBtn) {
      category = catBtn.dataset.category;
      render();
      return;
    }
    const roleBtn = event.target.closest("[data-auth-role]");
    if (roleBtn) {
      loginRole = roleBtn.dataset.authRole;
      authMode = "signin";
      const tabs = document.querySelector(".auth-tabs");
      if (!tabs) {
        render();
        return;
      }
      tabs.dataset.active = loginRole;
      tabs.querySelectorAll("[data-auth-role]").forEach((b) =>
        b.classList.toggle("active", b.dataset.authRole === loginRole),
      );
      document.getElementById("authTitle").textContent = signinTitle();
      const authBody = document.querySelector(".auth-body");
      authBody.innerHTML = signinBodyHtml();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        authBody.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
      }
      return;
    }
    const passBtn = event.target.closest("[data-toggle-pass]");
    if (passBtn) {
      const field = document.getElementById(passBtn.dataset.togglePass);
      const show = field.type === "password";
      field.type = show ? "text" : "password";
      passBtn.setAttribute("aria-label", show ? "Hide password" : "Show password");
      passBtn.innerHTML = show ? ICON.eyeOff : ICON.eye;
      return;
    }
    const modeBtn = event.target.closest("[data-auth-mode]");
    if (modeBtn) {
      authMode = modeBtn.dataset.authMode;
      // swap only the form side; the photo panel stays put
      if (!swapAuthPanel()) render();
      return;
    }
    const adminCatBtn = event.target.closest("[data-admin-category]");
    if (adminCatBtn) {
      // keep whatever is typed in the search and date boxes when switching category
      const val = (id, fallback) => (document.getElementById(id) ? document.getElementById(id).value.trim() : fallback);
      adminFilter = {
        q: val("afQ", adminFilter.q),
        from: val("afFrom", adminFilter.from),
        to: val("afTo", adminFilter.to),
        category: adminCatBtn.dataset.adminCategory,
      };
      swapAdminTab();
      return;
    }
    const adminBtn = event.target.closest("[data-admin-tab]");
    if (adminBtn) {
      adminTab = adminBtn.dataset.adminTab;
      adminFilter = { q: "", from: "", to: "", category: "All" };
      swapAdminTab();
      return;
    }
    const copyBtn = event.target.closest("[data-copy]");
    if (copyBtn) {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copy);
        showToast(`Ticket #${copyBtn.dataset.copy} copied.`);
      } catch {
        showToast(`Your ticket code is #${copyBtn.dataset.copy}`);
      }
      return;
    }
    if (event.target.closest('.footer-links a[aria-disabled="true"]')) {
      event.preventDefault();
      return;
    }
    const brandLink = event.target.closest("a.brand");
    if (brandLink) {
      event.preventDefault();
      const home = getSession()?.role === "staff" ? "admin" : "home";
      // on sign up, the logo goes back to sign in (same swap as the "Sign in" link)
      if (location.hash.startsWith("#login") && authMode === "signup") {
        authMode = "signin";
        if (!swapAuthPanel()) render();
        window.scrollTo(0, 0);
        return;
      }
      // already on this page (or on sign in / sign up): just go back to the top
      if (location.hash === "#" + home || location.hash.startsWith("#login") || (home === "home" && location.hash === "")) {
        window.scrollTo({
          top: 0,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      } else {
        goTo(home);
      }
      return;
    }
    const viewBtn = event.target.closest("[data-view-item]");
    if (viewBtn) {
      openItemDialog(viewBtn.dataset.viewItem);
      return;
    }
    const itemDialog = document.getElementById("itemDialog");
    // close on the close button, on links inside it, or on a click on the dimmed backdrop
    if (itemDialog.open && (event.target === itemDialog || event.target.closest("[data-close-dialog]"))) {
      itemDialog.close();
      if (!event.target.closest("a[href]")) return;
    }
    const actionBtn = event.target.closest("[data-action]");
    if (!actionBtn) return;
    if (itemDialog.open && actionBtn.closest("#itemDialog")) itemDialog.close();
    const action = actionBtn.dataset.action;
    const id = actionBtn.dataset.id;
    if (action === "open-login") {
      loginRole = actionBtn.dataset.role || "student";
      authMode = actionBtn.dataset.mode || "signin";
      pendingNext = actionBtn.dataset.next || "";
      if (location.hash === "#login" && swapAuthPanel()) return;
      goTo("login");
      return;
    }
    if (action === "clear-admin-filter") {
      adminFilter = { q: "", from: "", to: "", category: "All" };
      swapAdminTab();
      return;
    }
    if (action === "clear-filters") {
      searchTerm = "";
      category = "All";
      sortOrder = "newest";
      render();
      return;
    }
    if (action === "new-report") {
      reportSuccessRef = "";
      render();
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }
    if (action === "print-slip") {
      window.print();
      return;
    }
    if (action === "logout") {
      // signing out clears the typed ticket, the email and the claim details
      setTrackLookup(null);
      sessionStorage.removeItem(SESSION_KEY);
      showToast("Signed out.");
      goTo("home");
      return;
    }
    if (action === "remove-category") {
      const categoryName = data.categories.find((category) => category === id);
      if (!categoryName) return;
      if (categoryName.toLowerCase() === "other") {
        showToast("The default category can't be removed.");
        return;
      }
      if (
        !confirm(
          `Remove the "${categoryName}" category from the OSA list? Existing items and lost reports will keep this category.`,
        )
      )
        return;
      data.categories = data.categories.filter((category) => category !== categoryName);
      saveData();
      showToast(`Category "${categoryName}" removed.`);
      swapAdminTab();
      return;
    }
    if (action === "resolve-report" || action === "reopen-report") {
      const rep = data.lostReports.find((r) => r.id === id);
      if (!rep) return;
      if (
        action === "resolve-report" &&
        !confirm(`Mark lost report ${rep.id} as resolved?`)
      )
        return;
      rep.status = action === "resolve-report" ? "resolved" : "open";
      saveData();
      showToast(
        rep.status === "resolved"
          ? "Lost report marked resolved."
          : "Lost report reopened.",
      );
      render();
      return;
    }
    const item = itemById(id);
    if (action === "archive-item" && item) {
      if (
        !confirm(
          `Archive "${item.title}"? It will be removed from the public catalog.`,
        )
      )
        return;
      item.status = "archived";
      saveData();
      showToast("Item archived.");
      render();
      return;
    }
    if (action === "restore-item") {
      if (!item || item.status !== "archived") return;
      if (!confirm(`Restore "${item.title}" to Item records and the public catalog?`))
        return;
      item.status = "available";
      saveData();
      showToast("Item restored to catalog.");
      render();
      return;
    }
    if (action === "delete-item") {
      if (!item || item.status !== "archived") return;
      if (!confirm(`Permanently delete "${item.title}"? This cannot be undone.`))
        return;
      data.items = data.items.filter((i) => i !== item);
      saveData();
      showToast("Item deleted.");
      render();
      return;
    }
    const claim = data.claims.find((c) => c.ticket === id);
    if (!claim) return;
    const claimedItem = itemById(claim.itemId);
    if (action === "verify-claim" && claim.status === "submitted") {
      if (!confirm(`Verify claim #${claim.ticket} and approve it for pickup?`))
        return;
      claim.status = "verified";
      saveData();
      showToast(`Claim #${claim.ticket} verified for pickup.`);
    } else if (action === "reject-claim" && claim.status === "submitted") {
      // a verified claim can no longer be rejected; staff must write a reason first
      openRejectDialog(claim);
      return;
    } else if (action === "release-claim" && claim.status === "verified") {
      if (
        !confirm(
          "Confirm OSA has verified the claimant's ID and physically released the item?",
        )
      )
        return;
      claim.status = "released";
      claim.releasedAt = new Date().toISOString();
      if (claimedItem) claimedItem.status = "claimed";
      saveData();
      showToast(`Item released for claim #${claim.ticket}.`);
    }
    render();
  });
  document.getElementById("mobileToggle").addEventListener("click", () => {
    const nav = document.getElementById("navLinks");
    const slot = document.getElementById("mobileAuthSlot");
    const open = nav.classList.toggle("open");
    if (slot) slot.classList.toggle("hidden", !open);
    document
      .getElementById("mobileToggle")
      .setAttribute("aria-expanded", String(open));
  });
  // the search box's X (or deleting all text) drops the search filter right away
  document.addEventListener("input", (event) => {
    if (!event.target.matches('#catalogSearch input[name="query"]') || event.target.value || !searchTerm) return;
    searchTerm = "";
    render();
    document.querySelector('#catalogSearch input[name="query"]')?.focus();
  });
  document.getElementById("year").textContent = new Date().getFullYear();
  window.addEventListener("hashchange", render);
  // a page restored from the back/forward cache must be drawn again, so nothing from a signed out session stays on screen
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) render();
  });
  render();
