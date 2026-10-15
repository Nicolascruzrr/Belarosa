(() => {
  // _static/js-src/shared/format.js
  var groupDigits = (value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  function formatMoney(cents, { decimals = "auto" } = {}) {
    const safe = Number.isFinite(cents) ? Math.round(cents) : 0;
    const negative = safe < 0;
    const abs = Math.abs(safe);
    const whole = Math.floor(abs / 100);
    const fraction = abs % 100;
    const showDecimals = decimals === "always" || decimals === "auto" && fraction !== 0;
    const text = `${groupDigits(String(whole))}${showDecimals ? `.${String(fraction).padStart(2, "0")}` : ""}`;
    return `${negative ? "-" : ""}RD$ ${text}`;
  }
  var DATE_FMT = new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santo_Domingo"
  });
  var DATETIME_FMT = new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santo_Domingo"
  });

  // _static/js-src/modules/cart-store.js
  var KEY = "belarosa:cart:v1";
  var MAX_QTY_PER_LINE = 10;
  var MAX_LINES = 30;
  var listeners = /* @__PURE__ */ new Set();
  var memory = { items: [] };
  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (parsed && Array.isArray(parsed.items)) {
        return {
          items: parsed.items.filter((i) => Number.isInteger(i.variantId) && i.variantId > 0).map((i) => ({ ...i, quantity: clampQty(i.quantity) })).slice(0, MAX_LINES)
        };
      }
    } catch {
    }
    return memory;
  }
  function write(state) {
    memory = state;
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
    } catch {
    }
    emit();
  }
  var clampQty = (q) => Math.min(MAX_QTY_PER_LINE, Math.max(1, Number.parseInt(q, 10) || 1));
  function emit() {
    const state = read();
    for (const fn of listeners) fn(state);
  }
  var cart = {
    items: () => read().items,
    count: () => read().items.reduce((sum, i) => sum + i.quantity, 0),
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** Adds a variant; returns the resulting quantity for that line. */
    add({ variantId, quantity = 1, ...snapshot }) {
      const state = read();
      const existing = state.items.find((i) => i.variantId === variantId);
      if (existing) {
        existing.quantity = clampQty(existing.quantity + quantity);
        Object.assign(existing, snapshot);
      } else {
        if (state.items.length >= MAX_LINES) return 0;
        state.items.unshift({ variantId, quantity: clampQty(quantity), ...snapshot });
      }
      write(state);
      return (existing ?? state.items[0]).quantity;
    },
    setQuantity(variantId, quantity) {
      const state = read();
      const line = state.items.find((i) => i.variantId === variantId);
      if (!line) return;
      if (quantity <= 0) state.items = state.items.filter((i) => i.variantId !== variantId);
      else line.quantity = clampQty(quantity);
      write(state);
    },
    remove(variantId) {
      const state = read();
      state.items = state.items.filter((i) => i.variantId !== variantId);
      write(state);
    },
    clear() {
      write({ items: [] });
    },
    /** Applies the server quote: refreshes snapshots and drops/clamps lines that changed. */
    reconcile(quote) {
      const state = read();
      const byId = new Map(quote.lines.map((l) => [l.variantId, l]));
      let changed = false;
      state.items = state.items.flatMap((item) => {
        const line = byId.get(item.variantId);
        if (!line) {
          changed = true;
          return [];
        }
        const next = {
          ...item,
          name: line.name,
          variantName: line.variantName,
          priceCents: line.unitPriceCents,
          image: line.image ?? item.image,
          slug: line.slug
        };
        if (line.status === "adjusted" && line.quantity > 0 && line.quantity !== item.quantity) {
          next.quantity = line.quantity;
          changed = true;
        }
        if (JSON.stringify(next) !== JSON.stringify(item)) changed = true;
        return [next];
      });
      if (changed) write(state);
    },
    payload: () => read().items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
  };
  window.addEventListener("storage", (event) => {
    if (event.key === KEY) emit();
  });

  // _static/js-src/modules/dom.js
  function h(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs ?? {})) {
      if (value === false || value === null || value === void 0) continue;
      if (key === "class") el.className = value;
      else if (key === "dataset") Object.assign(el.dataset, value);
      else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
      else if (value === true) el.setAttribute(key, "");
      else el.setAttribute(key, String(value));
    }
    append(el, children);
    return el;
  }
  function append(el, children) {
    for (const child of children.flat(Infinity)) {
      if (child === null || child === void 0 || child === false) continue;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
  }
  var SVG_NS = "http://www.w3.org/2000/svg";
  var ICONS = {
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    close: "M6 6l12 12M18 6 6 18",
    check: "m5 12.5 4.5 4.5L19 7.5"
  };
  function svgIcon(name, size = 16) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.25");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", ICONS[name] ?? "");
    svg.append(path);
    return svg;
  }
  var $ = (selector, root = document) => root.querySelector(selector);
  var $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // _static/js-src/modules/layers.js
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var CLOSE_MS = 600;
  var current = null;
  function setBackgroundInert(layer, inert) {
    for (const el of document.body.children) {
      if (el === layer || el.matches("script, [data-toasts]")) continue;
      if (inert) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    }
  }
  function lockScroll(lock) {
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.toggle("is-locked", lock);
    document.body.style.paddingRight = lock && gap > 0 ? `${gap}px` : "";
  }
  function onKeydown(event) {
    if (!current) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeLayer();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...current.el.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function onClick(event) {
    if (event.target.closest("[data-drawer-close], [data-search-close], [data-lightbox-close]")) {
      event.preventDefault();
      closeLayer();
    }
  }
  function openLayer(el, { trigger = document.activeElement, focus = null, onClose = null } = {}) {
    if (current?.el === el) return;
    if (current) closeLayer({ restoreFocus: false });
    clearTimeout(el._closeTimer);
    el.hidden = false;
    void el.offsetWidth;
    el.classList.add("is-open");
    current = { el, trigger, onClose };
    setBackgroundInert(el, true);
    lockScroll(true);
    document.addEventListener("keydown", onKeydown);
    el.addEventListener("click", onClick);
    const target = (typeof focus === "string" ? el.querySelector(focus) : focus) ?? el.querySelector('[tabindex="-1"]') ?? el.querySelector(FOCUSABLE);
    requestAnimationFrame(() => target?.focus({ preventScroll: true }));
    trigger?.setAttribute?.("aria-expanded", "true");
  }
  function closeLayer({ restoreFocus = true } = {}) {
    if (!current) return;
    const { el, trigger, onClose } = current;
    current = null;
    el.classList.remove("is-open");
    el.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeydown);
    setBackgroundInert(el, false);
    lockScroll(false);
    trigger?.setAttribute?.("aria-expanded", "false");
    el._closeTimer = setTimeout(() => {
      el.hidden = true;
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : CLOSE_MS);
    if (restoreFocus && trigger?.focus && document.contains(trigger)) trigger.focus({ preventScroll: true });
    onClose?.();
  }

  // _static/js-src/modules/ui.js
  function toast(message, { type = "info", duration = 3800 } = {}) {
    const region = $("[data-toasts]");
    if (!region) return;
    const el = h("div", { class: `toast${type === "error" ? " toast--error" : ""}`, role: type === "error" ? "alert" : "status" }, type === "error" ? null : svgIcon("check", 18), message);
    region.append(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 320);
    }, duration);
  }

  // _static/js-src/modules/cart-ui.js
  function openCart(trigger = document.activeElement) {
    const drawer = $('[data-drawer="cart"]');
    if (drawer) openLayer(drawer, { trigger: $("[data-cart-open]") ?? trigger, focus: ".drawer__panel" });
  }

  // _static/js-src/pages/product.js
  var gallery = $("[data-gallery]");
  if (gallery) {
    const slides = $$("[data-gallery-slide]", gallery);
    const thumbs = $$("[data-gallery-thumb]", gallery);
    const show = (index) => {
      slides.forEach((s, i) => {
        s.hidden = i !== index;
        s.classList.toggle("is-active", i === index);
      });
      thumbs.forEach((t, i) => {
        t.classList.toggle("is-active", i === index);
        t.setAttribute("aria-selected", String(i === index));
        t.tabIndex = i === index ? 0 : -1;
      });
    };
    thumbs.forEach((thumb, i) => {
      thumb.addEventListener("click", () => show(i));
      thumb.addEventListener("keydown", (event) => {
        const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
        if (!delta) return;
        event.preventDefault();
        const next = (i + delta + thumbs.length) % thumbs.length;
        show(next);
        thumbs[next].focus();
      });
    });
    if (thumbs.length) show(0);
    const lightbox = $("[data-lightbox]");
    const lightboxImg = $("[data-lightbox-img]", lightbox);
    gallery.addEventListener("click", (event) => {
      const button = event.target.closest("[data-gallery-zoom]");
      if (!button) return;
      const img = $("img", button);
      const largest = img.srcset.split(",").map((s) => s.trim().split(" ")[0]).at(-1) || img.currentSrc;
      lightboxImg.src = largest;
      lightboxImg.alt = img.alt;
      openLayer(lightbox, { trigger: button, focus: "[data-lightbox-close]" });
    });
    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox || event.target === lightboxImg) closeLayer();
    });
  }
  var form = $("[data-purchase]");
  if (form) {
    const data = JSON.parse($("[data-product-json]", form).textContent);
    const qtyInput = $("[data-quantity]", form);
    const availability = $("[data-availability]", form);
    const addButton = $("[data-add-button]", form);
    const addLabel = $("[data-add-label]", form);
    const variantLabel = $("[data-variant-label]", form);
    const priceEl = $("[data-price] .price__value");
    const priceFrom = $("[data-price] .price__from");
    const message = $("[data-purchase-message]", form);
    const selectedVariant = () => {
      const checked = form.querySelector('input[name="variant"]:checked') ?? form.querySelector('input[name="variant"]');
      return data.variants.find((v) => v.id === Number(checked?.value)) ?? null;
    };
    const inCart = (variantId) => cart.items().find((i) => i.variantId === variantId)?.quantity ?? 0;
    const maxFor = (variant) => Math.max(0, Math.min(MAX_QTY_PER_LINE, variant.available) - inCart(variant.id));
    const update = () => {
      const variant = selectedVariant();
      if (!variant) return;
      const max = maxFor(variant);
      qtyInput.max = String(Math.max(1, max));
      if (Number(qtyInput.value) > max) qtyInput.value = String(Math.max(1, max));
      if (variantLabel) variantLabel.textContent = variant.name ?? "";
      if (priceEl && data.variants.length > 1) {
        priceEl.textContent = formatMoney(variant.priceCents);
        if (priceFrom) priceFrom.hidden = true;
      }
      let text = "Disponible";
      let tone = "ok";
      if (variant.available <= 0) {
        text = "Agotado";
        tone = "out";
      } else if (max <= 0) {
        text = "Ya tienes en tu carrito todas las unidades disponibles";
        tone = "low";
      } else if (variant.available <= 3) {
        text = variant.available === 1 ? "\xDAltima unidad" : `\xDAltimas ${variant.available} unidades`;
        tone = "low";
      }
      availability.textContent = text;
      availability.className = `availability availability--${tone}`;
      const canAdd = variant.available > 0 && max > 0;
      addButton.disabled = !canAdd;
      addLabel.textContent = variant.available <= 0 ? "Agotado" : "A\xF1adir al carrito";
      for (const button of $$("[data-step]", form)) {
        const step = Number(button.dataset.step);
        const value = Number(qtyInput.value);
        button.disabled = !canAdd || (step < 0 ? value <= 1 : value >= max);
      }
    };
    form.addEventListener("change", (event) => {
      if (event.target.name === "variant") {
        qtyInput.value = "1";
        message.textContent = "";
      }
      update();
    });
    qtyInput.addEventListener("input", () => {
      const value = Number.parseInt(qtyInput.value, 10);
      if (Number.isInteger(value)) qtyInput.value = String(Math.min(Math.max(1, value), Number(qtyInput.max)));
      update();
    });
    for (const button of $$("[data-step]", form)) {
      button.addEventListener("click", () => {
        qtyInput.value = String(Math.min(Math.max(1, Number(qtyInput.value) + Number(button.dataset.step)), Number(qtyInput.max)));
        update();
      });
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const variant = selectedVariant();
      if (!variant || variant.available <= 0) return;
      const quantity = Math.min(Number.parseInt(qtyInput.value, 10) || 1, maxFor(variant));
      if (quantity <= 0) {
        message.textContent = "Ya tienes en tu carrito todas las unidades disponibles de esta pieza.";
        return;
      }
      const added = cart.add({
        variantId: variant.id,
        quantity,
        name: data.name,
        variantName: variant.name,
        priceCents: variant.priceCents,
        image: data.image,
        slug: data.slug
      });
      if (!added) {
        toast("Tu carrito alcanz\xF3 el m\xE1ximo de productos.", { type: "error" });
        return;
      }
      qtyInput.value = "1";
      update();
      openCart(addButton);
    });
    cart.subscribe(update);
    update();
  }
})();
