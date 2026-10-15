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

  // _static/js-src/shared/validation.js
  var PROVINCES = [
    "Azua",
    "Bahoruco",
    "Barahona",
    "Dajab\xF3n",
    "Distrito Nacional",
    "Duarte",
    "El Seibo",
    "El\xEDas Pi\xF1a",
    "Espaillat",
    "Hato Mayor",
    "Hermanas Mirabal",
    "Independencia",
    "La Altagracia",
    "La Romana",
    "La Vega",
    "Mar\xEDa Trinidad S\xE1nchez",
    "Monse\xF1or Nouel",
    "Monte Cristi",
    "Monte Plata",
    "Pedernales",
    "Peravia",
    "Puerto Plata",
    "Saman\xE1",
    "San Crist\xF3bal",
    "San Jos\xE9 de Ocoa",
    "San Juan",
    "San Pedro de Macor\xEDs",
    "S\xE1nchez Ram\xEDrez",
    "Santiago",
    "Santiago Rodr\xEDguez",
    "Santo Domingo",
    "Valverde"
  ];
  var DR_AREA_CODES = ["809", "829", "849"];
  function normalizeDominicanPhone(value) {
    let digits = String(value ?? "").replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
    if (digits.length !== 10) return null;
    if (!DR_AREA_CODES.includes(digits.slice(0, 3))) return null;
    if (/^(\d)\1+$/.test(digits.slice(3))) return null;
    return `+1${digits}`;
  }
  var EMAIL_RE = /^[^\s@"'<>()[\]\\,;:]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i;
  function isValidEmail(value) {
    const email = String(value ?? "").trim();
    return email.length <= 254 && EMAIL_RE.test(email);
  }
  var NAME_RE = /^[\p{L}][\p{L}\p{M}'’.\- ]*$/u;
  var clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
  function validateCheckoutCustomer(input = {}) {
    const errors = {};
    const values = {
      firstName: clean(input.firstName),
      lastName: clean(input.lastName),
      phone: clean(input.phone),
      email: clean(input.email).toLowerCase(),
      province: clean(input.province),
      zoneId: input.zoneId == null || input.zoneId === "" ? null : Number(input.zoneId),
      sector: clean(input.sector),
      address: clean(input.address),
      reference: clean(input.reference),
      notes: String(input.notes ?? "").trim()
    };
    if (!values.firstName) errors.firstName = "Escribe tu nombre.";
    else if (values.firstName.length > 60 || !NAME_RE.test(values.firstName)) errors.firstName = "Revisa el nombre.";
    if (!values.lastName) errors.lastName = "Escribe tu apellido.";
    else if (values.lastName.length > 60 || !NAME_RE.test(values.lastName)) errors.lastName = "Revisa el apellido.";
    const phone = normalizeDominicanPhone(values.phone);
    if (!values.phone) errors.phone = "Necesitamos un tel\xE9fono para coordinar la entrega.";
    else if (!phone) errors.phone = "Usa un n\xFAmero dominicano v\xE1lido (809, 829 o 849).";
    else values.phone = phone;
    if (!values.email) errors.email = "Escribe tu correo electr\xF3nico.";
    else if (!isValidEmail(values.email)) errors.email = "Revisa el formato del correo.";
    if (!values.province) errors.province = "Selecciona tu provincia.";
    else if (!PROVINCES.includes(values.province)) errors.province = "Selecciona una provincia de la lista.";
    if (!Number.isInteger(values.zoneId) || values.zoneId <= 0) errors.zoneId = "Selecciona tu municipio o zona de entrega.";
    if (!values.sector) errors.sector = "Indica tu sector.";
    else if (values.sector.length > 80) errors.sector = "El sector es demasiado largo.";
    if (!values.address) errors.address = "Escribe la direcci\xF3n completa.";
    else if (values.address.length < 8) errors.address = "Incluye calle, n\xFAmero y edificio o casa.";
    else if (values.address.length > 200) errors.address = "La direcci\xF3n es demasiado larga.";
    if (values.reference.length > 160) errors.reference = "La referencia es demasiado larga.";
    if (values.notes.length > 500) errors.notes = "Las notas no pueden superar 500 caracteres.";
    return { values, errors };
  }

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
    const lines = [];
    const issues = [];
    for (const [variantId, requested] of merged) {
      const variant = byId.get(variantId);
      if (!variant || !variant.purchasable) {
        lines.push({ variantId, status: "unavailable", requestedQuantity: requested, quantity: 0, lineTotalCents: 0, name: variant?.name ?? "Producto no disponible" });
        issues.push({ variantId, type: "unavailable" });
        continue;
      }
      const quantity = Math.min(requested, variant.available, MAX_QTY);
      const status = variant.available === 0 ? "soldout" : quantity < requested ? "adjusted" : "ok";
      if (status !== "ok") issues.push({ variantId, type: status, available: variant.available });
      lines.push({
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
    const sellable = lines.filter((line) => line.quantity > 0);
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
      lines,
      issues,
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
    reconcile(quote2) {
      const state = read();
      const byId = new Map(quote2.lines.map((l) => [l.variantId, l]));
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
  var $ = (selector, root2 = document) => root2.querySelector(selector);
  var $$ = (selector, root2 = document) => [...root2.querySelectorAll(selector)];
  var session = {
    get(key) {
      try {
        return JSON.parse(sessionStorage.getItem(key) ?? "null");
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
      }
    },
    remove(key) {
      try {
        sessionStorage.removeItem(key);
      } catch {
      }
    }
  };

  // _static/js-src/pages/checkout.js
  var DRAFT_KEY = "belarosa:checkout-draft";
  var root = $("[data-checkout]");
  var form = $("[data-checkout-form]", root);
  var submit = $("[data-checkout-submit]", form);
  var submitLabel = $("[data-submit-label]", submit);
  var errorBox = $("[data-checkout-error]", form);
  var provinceSelect = $("[data-province]", form);
  var zoneSelect = $("[data-zone]", form);
  var zoneHint = $("[data-zone-hint]", form);
  var paymentsEnabled = !submit.disabled;
  var summary = {
    loading: $("[data-summary-loading]", root),
    lines: $("[data-summary-lines]", root),
    subtotal: $("[data-summary-subtotal]", root),
    shipping: $("[data-summary-shipping]", root),
    total: $("[data-summary-total]", root),
    totalMobile: $("[data-summary-total-mobile]", root),
    tax: $("[data-summary-tax]", root),
    demo: $("[data-summary-demo]", root),
    toggle: $("[data-summary-toggle]", root)
  };
  var zones2 = [];
  var quote = null;
  var submitting = false;
  var touched = /* @__PURE__ */ new Set();
  function renderSummary() {
    summary.loading.hidden = true;
    if (!quote) return;
    summary.lines.replaceChildren(
      ...quote.lines.filter((l) => l.quantity > 0).map(
        (l) => h(
          "li",
          { class: "summary-line" },
          h("span", { class: "summary-line__media" }, l.image ? h("img", { src: l.image, alt: "", width: 60, height: 75, loading: "lazy" }) : null, h("span", { class: "summary-line__qty", "aria-label": `Cantidad ${l.quantity}` }, String(l.quantity))),
          h("span", { class: "summary-line__name" }, l.name, l.variantName ? h("span", { class: "summary-line__variant" }, l.variantName) : null),
          h("span", {}, formatMoney(l.lineTotalCents))
        )
      )
    );
    summary.subtotal.textContent = formatMoney(quote.subtotalCents);
    const shipping = quote.shipping;
    if (shipping?.deliverable) {
      summary.shipping.textContent = shipping.priceCents === 0 ? "Gratis" : formatMoney(shipping.priceCents);
      summary.total.textContent = formatMoney(quote.totalCents);
      summary.totalMobile.textContent = formatMoney(quote.totalCents);
      summary.demo.hidden = !shipping.isDemo;
    } else {
      summary.shipping.textContent = "Elige tu zona";
      summary.total.textContent = formatMoney(quote.totalCents);
      summary.totalMobile.textContent = formatMoney(quote.totalCents);
      summary.demo.hidden = true;
    }
    if (summary.tax) summary.tax.textContent = quote.itbisCents ? `Incluye ${formatMoney(quote.itbisCents)} de ITBIS.` : "";
    updateSubmitLabel();
  }
  function updateSubmitLabel() {
    if (!paymentsEnabled) return;
    if (submitting) return;
    submitLabel.textContent = "Continuar al pago";
  }
  async function requote() {
    const zoneId = Number(zoneSelect.value) || null;
    try {
      quote = quoteCart(cart.payload(), zoneId);
      cart.reconcile(quote);
      renderSummary();
      if (quote.issues.length) {
        showError("Algunos productos de tu carrito cambiaron de disponibilidad. Revisa el resumen.", { link: true });
      }
    } catch (error) {
      showError(error.message);
    }
  }
  function populateZones() {
    const province = provinceSelect.value;
    const options = zones2.filter((z) => z.province === province);
    const deliverable = options.filter((z) => z.deliverable);
    zoneSelect.replaceChildren();
    zoneHint.textContent = "";
    if (!province) {
      zoneSelect.append(h("option", { value: "" }, "Primero elige la provincia"));
      zoneSelect.disabled = true;
    } else if (!deliverable.length) {
      zoneSelect.append(h("option", { value: "" }, "Sin entregas disponibles"));
      zoneSelect.disabled = true;
      zoneHint.replaceChildren("Por ahora no realizamos entregas en esta provincia. Consulta las zonas disponibles en ", h("a", { href: page("/envios"), target: "_blank" }, "Env\xEDos"), ".");
    } else {
      zoneSelect.disabled = false;
      zoneSelect.append(h("option", { value: "" }, "Selecciona"));
      for (const z of options) {
        zoneSelect.append(
          h("option", { value: z.id, disabled: !z.deliverable }, z.deliverable ? `${z.name} \xB7 ${z.priceCents === 0 ? "Gratis" : formatMoney(z.priceCents)}` : `${z.name} (sin entrega por ahora)`)
        );
      }
    }
  }
  function describeZone() {
    const zone = zones2.find((z) => z.id === Number(zoneSelect.value));
    if (!zone) return;
    const parts = [];
    if (zone.estimatedDays) parts.push(`Entrega estimada: ${zone.estimatedDays}.`);
    if (zone.freeOverCents) parts.push(`Env\xEDo gratis desde ${formatMoney(zone.freeOverCents)}.`);
    zoneHint.textContent = parts.join(" ");
  }
  function formValues() {
    const data = Object.fromEntries(new FormData(form));
    return { ...data, zoneId: zoneSelect.value };
  }
  function showFieldErrors(errors, { only = null } = {}) {
    for (const el of $$("[data-error-for]", form)) {
      const name = el.dataset.errorFor;
      if (only && !only.has(name)) continue;
      const message = errors[name] ?? "";
      el.textContent = message;
      const input = form.elements[name];
      if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    }
  }
  function validate({ all = false } = {}) {
    const { errors } = validateCheckoutCustomer(formValues());
    showFieldErrors(errors, { only: all ? null : touched });
    return errors;
  }
  function showError(message, { link = false } = {}) {
    errorBox.hidden = false;
    errorBox.replaceChildren(message);
    if (link) errorBox.append(" ", h("a", { href: page("/carrito") }, "Ir al carrito"));
  }
  function saveDraft() {
    const { firstName, lastName, phone, email, province, zoneId, sector, address, reference, notes } = formValues();
    session.set(DRAFT_KEY, { firstName, lastName, phone, email, province, zoneId, sector, address, reference, notes });
  }
  function restoreDraft() {
    const draft = session.get(DRAFT_KEY);
    if (!draft) return;
    for (const [name, value] of Object.entries(draft)) {
      if (name === "zoneId") continue;
      const el = form.elements[name];
      if (el && typeof value === "string") el.value = value;
    }
    populateZones();
    if (draft.zoneId && [...zoneSelect.options].some((o) => o.value === String(draft.zoneId) && !o.disabled)) {
      zoneSelect.value = String(draft.zoneId);
      describeZone();
    }
  }
  function setSubmitting(state, label) {
    submitting = state;
    submit.disabled = state || !paymentsEnabled;
    submit.classList.toggle("is-loading", state);
    submit.setAttribute("aria-busy", String(state));
    if (label) submitLabel.textContent = label;
    if (!state) updateSubmitLabel();
  }
  function onSubmit(event) {
    event.preventDefault();
  }
  async function init() {
    if (!cart.items().length) {
      summary.loading.hidden = true;
      form.hidden = true;
      root.querySelector(".checkout__main").append(
        h(
          "div",
          { class: "empty-state" },
          h("p", { class: "empty-state__title" }, "Tu carrito est\xE1 vac\xEDo."),
          h("p", { class: "empty-state__text" }, "A\xF1ade alguna pieza para finalizar tu compra."),
          h("div", { class: "empty-state__actions" }, h("a", { class: "button", href: page("/tienda") }, "Explorar la tienda"))
        )
      );
      return;
    }
    if (window.matchMedia("(max-width: 1023px)").matches) summary.toggle.open = false;
    try {
      zones2 = zones;
    } catch (error) {
      showError(error.message);
    }
    restoreDraft();
    await requote();
    provinceSelect.addEventListener("change", () => {
      populateZones();
      requote();
    });
    zoneSelect.addEventListener("change", () => {
      describeZone();
      requote();
    });
    form.addEventListener("focusout", (event) => {
      if (!event.target.name) return;
      touched.add(event.target.name);
      validate();
      saveDraft();
    });
    form.addEventListener("input", (event) => {
      if (touched.has(event.target.name)) validate();
    });
    form.addEventListener("submit", onSubmit);
  }
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) setSubmitting(false);
  });
  init();
})();
