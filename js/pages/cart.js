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

  // _static/js-src/catalog.js
  var variants = [
    {
      "id": 1,
      "name": "Collar Aurora",
      "variantName": "40 cm",
      "priceCents": 185e3,
      "available": 8,
      "purchasable": true,
      "slug": "collar-aurora",
      "image": "images/p-collar-aurora-480.webp"
    },
    {
      "id": 2,
      "name": "Collar Aurora",
      "variantName": "45 cm",
      "priceCents": 185e3,
      "available": 4,
      "purchasable": true,
      "slug": "collar-aurora",
      "image": "images/p-collar-aurora-480.webp"
    },
    {
      "id": 3,
      "name": "Collar Marina",
      "variantName": null,
      "priceCents": 225e3,
      "available": 9,
      "purchasable": true,
      "slug": "collar-marina",
      "image": "images/p-collar-marina-480.webp"
    },
    {
      "id": 4,
      "name": "Collar Selene",
      "variantName": null,
      "priceCents": 165e3,
      "available": 12,
      "purchasable": true,
      "slug": "collar-selene",
      "image": "images/p-collar-selene-480.webp"
    },
    {
      "id": 5,
      "name": "Collar Perla Cl\xE1sica",
      "variantName": null,
      "priceCents": 295e3,
      "available": 5,
      "purchasable": true,
      "slug": "collar-perla-clasica",
      "image": "images/p-collar-perla-480.webp"
    },
    {
      "id": 6,
      "name": "Pulsera Alba",
      "variantName": null,
      "priceCents": 125e3,
      "available": 15,
      "purchasable": true,
      "slug": "pulsera-alba",
      "image": "images/p-pulsera-alba-480.webp"
    },
    {
      "id": 7,
      "name": "Brazalete L\xEDa",
      "variantName": null,
      "priceCents": 245e3,
      "available": 7,
      "purchasable": true,
      "slug": "brazalete-lia",
      "image": "images/p-brazalete-lia-480.webp"
    },
    {
      "id": 8,
      "name": "Pulsera Serena",
      "variantName": null,
      "priceCents": 145e3,
      "available": 9,
      "purchasable": true,
      "slug": "pulsera-serena",
      "image": "images/p-pulsera-serena-480.webp"
    },
    {
      "id": 9,
      "name": "Pulsera Vera",
      "variantName": null,
      "priceCents": 275e3,
      "available": 0,
      "purchasable": true,
      "slug": "pulsera-vera",
      "image": "images/p-pulsera-vera-480.webp"
    },
    {
      "id": 10,
      "name": "Argollas Luna",
      "variantName": "Peque\xF1as (20 mm)",
      "priceCents": 155e3,
      "available": 10,
      "purchasable": true,
      "slug": "argollas-luna",
      "image": "images/p-argollas-luna-480.webp"
    },
    {
      "id": 11,
      "name": "Argollas Luna",
      "variantName": "Medianas (30 mm)",
      "priceCents": 175e3,
      "available": 8,
      "purchasable": true,
      "slug": "argollas-luna",
      "image": "images/p-argollas-luna-480.webp"
    },
    {
      "id": 12,
      "name": "Aretes Gota de Perla",
      "variantName": null,
      "priceCents": 145e3,
      "available": 11,
      "purchasable": true,
      "slug": "aretes-gota-perla",
      "image": "images/p-aretes-gota-480.webp"
    },
    {
      "id": 13,
      "name": "Aretes Brisa",
      "variantName": null,
      "priceCents": 115e3,
      "available": 14,
      "purchasable": true,
      "slug": "aretes-brisa",
      "image": "images/p-aretes-brisa-480.webp"
    },
    {
      "id": 14,
      "name": "Ear Cuff Onda",
      "variantName": null,
      "priceCents": 135e3,
      "available": 6,
      "purchasable": true,
      "slug": "ear-cuff-onda",
      "image": "images/p-earcuff-onda-480.webp"
    },
    {
      "id": 15,
      "name": "Anillo Trenza",
      "variantName": "Talla 6",
      "priceCents": 115e3,
      "available": 4,
      "purchasable": true,
      "slug": "anillo-trenza",
      "image": "images/p-anillo-trenza-480.webp"
    },
    {
      "id": 16,
      "name": "Anillo Trenza",
      "variantName": "Talla 7",
      "priceCents": 115e3,
      "available": 5,
      "purchasable": true,
      "slug": "anillo-trenza",
      "image": "images/p-anillo-trenza-480.webp"
    },
    {
      "id": 17,
      "name": "Anillo Trenza",
      "variantName": "Talla 8",
      "priceCents": 115e3,
      "available": 0,
      "purchasable": true,
      "slug": "anillo-trenza",
      "image": "images/p-anillo-trenza-480.webp"
    },
    {
      "id": 18,
      "name": "Anillo Sol",
      "variantName": "Talla 6",
      "priceCents": 195e3,
      "available": 2,
      "purchasable": true,
      "slug": "anillo-sol",
      "image": "images/p-anillo-sol-480.webp"
    },
    {
      "id": 19,
      "name": "Anillo Sol",
      "variantName": "Talla 7",
      "priceCents": 195e3,
      "available": 3,
      "purchasable": true,
      "slug": "anillo-sol",
      "image": "images/p-anillo-sol-480.webp"
    },
    {
      "id": 20,
      "name": "Anillo Perla",
      "variantName": "Talla 6",
      "priceCents": 125e3,
      "available": 3,
      "purchasable": true,
      "slug": "anillo-perla",
      "image": "images/p-anillo-perla-480.webp"
    },
    {
      "id": 21,
      "name": "Anillo Perla",
      "variantName": "Talla 7",
      "priceCents": 125e3,
      "available": 3,
      "purchasable": true,
      "slug": "anillo-perla",
      "image": "images/p-anillo-perla-480.webp"
    },
    {
      "id": 22,
      "name": "Anillo Perla",
      "variantName": "Talla 8",
      "priceCents": 125e3,
      "available": 2,
      "purchasable": true,
      "slug": "anillo-perla",
      "image": "images/p-anillo-perla-480.webp"
    },
    {
      "id": 23,
      "name": "Set Celeste",
      "variantName": null,
      "priceCents": 325e3,
      "available": 6,
      "purchasable": true,
      "slug": "set-celeste",
      "image": "images/p-set-celeste-480.webp"
    },
    {
      "id": 24,
      "name": "Set D\xFAo Dorado",
      "variantName": null,
      "priceCents": 345e3,
      "available": 4,
      "purchasable": true,
      "slug": "set-duo-dorado",
      "image": "images/p-set-duo-480.webp"
    }
  ];
  var zones = [
    {
      "id": 1,
      "province": "Distrito Nacional",
      "name": "Distrito Nacional",
      "deliverable": true,
      "priceCents": 25e3,
      "freeOverCents": null,
      "estimatedDays": "24 a 48 horas laborables",
      "isDemo": true
    },
    {
      "id": 2,
      "province": "Santo Domingo",
      "name": "Santo Domingo Este",
      "deliverable": true,
      "priceCents": 3e4,
      "freeOverCents": null,
      "estimatedDays": "24 a 48 horas laborables",
      "isDemo": true
    },
    {
      "id": 3,
      "province": "Santo Domingo",
      "name": "Santo Domingo Norte",
      "deliverable": true,
      "priceCents": 35e3,
      "freeOverCents": null,
      "estimatedDays": "24 a 72 horas laborables",
      "isDemo": true
    },
    {
      "id": 4,
      "province": "Santo Domingo",
      "name": "Santo Domingo Oeste",
      "deliverable": true,
      "priceCents": 35e3,
      "freeOverCents": null,
      "estimatedDays": "24 a 72 horas laborables",
      "isDemo": true
    },
    {
      "id": 5,
      "province": "Santo Domingo",
      "name": "Boca Chica",
      "deliverable": false,
      "priceCents": null,
      "freeOverCents": null,
      "estimatedDays": null,
      "isDemo": false
    },
    {
      "id": 6,
      "province": "Santo Domingo",
      "name": "Los Alcarrizos",
      "deliverable": false,
      "priceCents": null,
      "freeOverCents": null,
      "estimatedDays": null,
      "isDemo": false
    },
    {
      "id": 7,
      "province": "Santo Domingo",
      "name": "Pedro Brand",
      "deliverable": false,
      "priceCents": null,
      "freeOverCents": null,
      "estimatedDays": null,
      "isDemo": false
    },
    {
      "id": 8,
      "province": "Santo Domingo",
      "name": "San Antonio de Guerra",
      "deliverable": false,
      "priceCents": null,
      "freeOverCents": null,
      "estimatedDays": null,
      "isDemo": false
    }
  ];

  // _static/js-src/modules/quote.js
  var ITBIS = 0.18;
  var MAX_QTY = 10;
  var taxIncluded = (cents) => cents > 0 ? Math.round(cents - cents / (1 + ITBIS)) : 0;
  function quoteCart(rawItems, zoneId = null) {
    const merged = /* @__PURE__ */ new Map();
    for (const item of rawItems ?? []) {
      const variantId = Number(item?.variantId);
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(variantId) || variantId <= 0) continue;
      if (!Number.isInteger(quantity) || quantity <= 0) continue;
      merged.set(variantId, Math.min(MAX_QTY, (merged.get(variantId) ?? 0) + quantity));
    }
    const byId = new Map(variants.map((variant) => [variant.id, variant]));
    const lines2 = [];
    const issues2 = [];
    for (const [variantId, requested] of merged) {
      const variant = byId.get(variantId);
      if (!variant || !variant.purchasable) {
        lines2.push({ variantId, status: "unavailable", requestedQuantity: requested, quantity: 0, lineTotalCents: 0, name: variant?.name ?? "Producto no disponible" });
        issues2.push({ variantId, type: "unavailable" });
        continue;
      }
      const quantity = Math.min(requested, variant.available, MAX_QTY);
      const status = variant.available === 0 ? "soldout" : quantity < requested ? "adjusted" : "ok";
      if (status !== "ok") issues2.push({ variantId, type: status, available: variant.available });
      lines2.push({
        variantId,
        slug: variant.slug,
        name: variant.name,
        variantName: variant.variantName,
        image: variant.image || null,
        unitPriceCents: variant.priceCents,
        available: variant.available,
        requestedQuantity: requested,
        quantity,
        lineTotalCents: variant.priceCents * quantity,
        status
      });
    }
    const sellable = lines2.filter((line) => line.quantity > 0);
    const subtotalCents = sellable.reduce((sum, line) => sum + line.lineTotalCents, 0);
    const zone = zones.find((item) => item.id === Number(zoneId));
    let shipping = null;
    if (zoneId) {
      if (zone?.deliverable) {
        const free = zone.freeOverCents && subtotalCents >= zone.freeOverCents;
        shipping = {
          zoneId: zone.id,
          zoneName: zone.name,
          province: zone.province,
          deliverable: true,
          priceCents: free ? 0 : zone.priceCents,
          estimatedDays: zone.estimatedDays,
          isDemo: zone.isDemo
        };
      } else {
        shipping = { zoneId: zone?.id ?? null, zoneName: zone?.name ?? null, deliverable: false, priceCents: null };
      }
    }
    const shippingCents = shipping?.deliverable ? shipping.priceCents : 0;
    return {
      lines: lines2,
      issues: issues2,
      itemCount: sellable.reduce((sum, line) => sum + line.quantity, 0),
      subtotalCents,
      shippingCents,
      itbisCents: taxIncluded(subtotalCents + shippingCents),
      totalCents: subtotalCents + shippingCents,
      taxIncluded: true,
      shipping
    };
  }

  // _static/js-src/modules/paths.js
  var ROUTES = {
    "/": "index.html",
    "/tienda": "tienda.html",
    "/tienda/collares": "collares.html",
    "/tienda/pulseras": "pulseras.html",
    "/tienda/aretes": "aretes.html",
    "/tienda/anillos": "anillos.html",
    "/tienda/sets": "sets.html",
    "/categorias": "categorias.html",
    "/carrito": "carrito.html",
    "/checkout": "checkout.html",
    "/pedido/confirmacion": "confirmacion.html",
    "/sobre-belarosa": "sobre-belarosa.html",
    "/contacto": "contacto.html",
    "/envios": "envios.html",
    "/cambios-y-devoluciones": "cambios-y-devoluciones.html",
    "/terminos-y-condiciones": "terminos-y-condiciones.html",
    "/politica-de-privacidad": "politica-de-privacidad.html",
    "/preguntas-frecuentes": "preguntas-frecuentes.html",
    "/buscar": "buscar.html",
    "/producto/collar-aurora": "producto-collar-aurora.html",
    "/producto/collar-marina": "producto-collar-marina.html",
    "/producto/collar-selene": "producto-collar-selene.html",
    "/producto/collar-perla-clasica": "producto-collar-perla-clasica.html",
    "/producto/pulsera-alba": "producto-pulsera-alba.html",
    "/producto/brazalete-lia": "producto-brazalete-lia.html",
    "/producto/pulsera-serena": "producto-pulsera-serena.html",
    "/producto/pulsera-vera": "producto-pulsera-vera.html",
    "/producto/argollas-luna": "producto-argollas-luna.html",
    "/producto/aretes-gota-perla": "producto-aretes-gota-perla.html",
    "/producto/aretes-brisa": "producto-aretes-brisa.html",
    "/producto/ear-cuff-onda": "producto-ear-cuff-onda.html",
    "/producto/anillo-trenza": "producto-anillo-trenza.html",
    "/producto/anillo-sol": "producto-anillo-sol.html",
    "/producto/anillo-perla": "producto-anillo-perla.html",
    "/producto/set-celeste": "producto-set-celeste.html",
    "/producto/set-duo-dorado": "producto-set-duo-dorado.html",
  };
  function page(url) {
    if (!url || /^(https?:|mailto:|tel:)/.test(url)) return url;
    const hashAt = url.indexOf("#");
    const hash = hashAt >= 0 ? url.slice(hashAt) : "";
    const noHash = hashAt >= 0 ? url.slice(0, hashAt) : url;
    const q = noHash.indexOf("?");
    const pathname = q >= 0 ? noHash.slice(0, q) : noHash;
    const search = q >= 0 ? noHash.slice(q) : "";
    const file = ROUTES[pathname];
    return file ? file + search + hash : url;
  }

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
  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
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
  var lastQuote = null;
  var quoteRequest = 0;
  var getLastQuote = () => lastQuote;
  async function refreshQuote({ zoneId = null } = {}) {
    const items = cart.payload();
    if (!items.length) {
      lastQuote = null;
      return null;
    }
    const id = ++quoteRequest;
    const quote = quoteCart(items, zoneId);
    if (id !== quoteRequest) return lastQuote;
    lastQuote = quote;
    cart.reconcile(quote);
    return quote;
  }
  function issueText(line) {
    if (!line) return null;
    if (line.status === "unavailable") return "Este producto ya no est\xE1 disponible.";
    if (line.status === "soldout") return "Agotado. Ret\xEDralo para continuar.";
    if (line.status === "adjusted") return `Solo ${line.available === 1 ? "queda 1 unidad" : `quedan ${line.available} unidades`}; ajustamos la cantidad.`;
    return null;
  }
  function cartLine(item, line) {
    const unit = line?.unitPriceCents ?? item.priceCents;
    const quantity = item.quantity;
    const max = Math.min(MAX_QTY_PER_LINE, line?.available ?? MAX_QTY_PER_LINE);
    const blocked = line && (line.status === "soldout" || line.status === "unavailable");
    const name = line?.name ?? item.name ?? "Producto";
    const variant = line?.variantName ?? item.variantName;
    const setQty = (next) => cart.setQuantity(item.variantId, next);
    return h(
      "li",
      { class: "cart-line", dataset: { variantId: item.variantId } },
      h(
        "a",
        { class: "cart-line__media", href: item.slug ? page(`/producto/${item.slug}`) : page("/tienda"), tabindex: "-1", "aria-hidden": "true" },
        item.image ? h("img", { src: item.image, alt: "", width: 120, height: 150, loading: "lazy" }) : null
      ),
      h(
        "div",
        { class: "cart-line__info" },
        h(
          "div",
          { class: "cart-line__top" },
          h("a", { class: "cart-line__name", href: item.slug ? page(`/producto/${item.slug}`) : page("/tienda") }, name),
          h("span", { class: "cart-line__total" }, blocked ? "" : unit != null ? formatMoney(unit * quantity) : "")
        ),
        variant ? h("span", { class: "cart-line__variant" }, variant) : null,
        unit != null && !blocked ? h("span", { class: "cart-line__unit" }, `${formatMoney(unit)} c/u`) : null,
        issueText(line) ? h("span", { class: "cart-line__issue", role: "status" }, issueText(line)) : null,
        h(
          "div",
          { class: "cart-line__actions" },
          blocked ? h("span") : h(
            "div",
            { class: "stepper stepper--small", role: "group", "aria-label": `Cantidad de ${name}` },
            h("button", { type: "button", class: "stepper__btn", "aria-label": "Disminuir cantidad", disabled: quantity <= 1, onclick: () => setQty(quantity - 1) }, svgIcon("minus", 14)),
            h("span", { class: "stepper__value", "aria-live": "polite" }, String(quantity)),
            h("button", { type: "button", class: "stepper__btn", "aria-label": "Aumentar cantidad", disabled: quantity >= max, onclick: () => setQty(quantity + 1) }, svgIcon("plus", 14))
          ),
          h("button", { type: "button", class: "cart-line__remove", onclick: () => {
            cart.remove(item.variantId);
            toast(`${name} se retir\xF3 del carrito.`);
          } }, "Eliminar")
        )
      )
    );
  }
  function replaceLines(container, nodes, fallbackFocus) {
    const active = document.activeElement;
    const lineId = active?.closest?.(".cart-line")?.dataset.variantId;
    const label = active?.getAttribute?.("aria-label") ?? active?.textContent;
    container.replaceChildren(...nodes);
    if (!lineId) return;
    const line = container.querySelector(`.cart-line[data-variant-id="${CSS.escape(lineId)}"]`);
    const target = line && [...line.querySelectorAll("button")].find((b) => (b.getAttribute("aria-label") ?? b.textContent) === label);
    if (target && !target.disabled) target.focus({ preventScroll: true });
    else (line?.querySelector("button:not([disabled])") ?? fallbackFocus)?.focus({ preventScroll: true });
  }
  var hasBlockingIssues = (quote) => Boolean(quote?.lines.some((l) => l.status === "soldout" || l.status === "unavailable"));

  // _static/js-src/pages/cart.js
  var page2 = $("[data-cart-page]");
  var loading = $("[data-cart-page-loading]", page2);
  var empty = $("[data-cart-page-empty]", page2);
  var lines = $("[data-cart-page-lines]", page2);
  var issues = $("[data-cart-page-issues]", page2);
  var summary = $("[data-cart-page-summary]", page2);
  var subtotal = $("[data-cart-page-subtotal]", page2);
  var checkout = $('a[href="checkout.html"]', summary);
  function render() {
    const items = cart.items();
    const quote = getLastQuote();
    loading.hidden = true;
    empty.hidden = items.length > 0;
    summary.hidden = items.length === 0;
    const byId = new Map((quote?.lines ?? []).map((l) => [l.variantId, l]));
    replaceLines(lines, items.map((item) => cartLine(item, byId.get(item.variantId))), summary);
    subtotal.textContent = formatMoney(quote ? quote.subtotalCents : items.reduce((s, i) => s + (i.priceCents ?? 0) * i.quantity, 0));
    const blocked = hasBlockingIssues(quote);
    issues.hidden = !blocked;
    issues.textContent = blocked ? "Algunas piezas de tu carrito ya no est\xE1n disponibles. Ret\xEDralas para continuar con la compra." : "";
    checkout.classList.toggle("button--disabled", blocked);
    checkout.setAttribute("aria-disabled", String(blocked));
  }
  var sync = debounce(async () => {
    try {
      await refreshQuote();
    } catch (error) {
      toast(error.message, { type: "error" });
    }
    render();
  }, 200);
  checkout.addEventListener("click", (event) => {
    if (checkout.getAttribute("aria-disabled") === "true") event.preventDefault();
  });
  cart.subscribe(() => {
    render();
    sync();
  });
  if (cart.items().length) {
    refreshQuote().catch((error) => toast(error.message, { type: "error" })).finally(render);
  } else {
    render();
  }
})();
