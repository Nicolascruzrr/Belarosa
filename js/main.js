(() => {
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
  var prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

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

  // _static/js-src/catalog.js
  var products = [
    {
      "slug": "collar-aurora",
      "name": "Collar Aurora",
      "category": "Collares",
      "priceCents": 185e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-collar-aurora-480.webp",
      "search": "Collar Aurora Collares perla cadena fina minimalista regalo dorado collar aurora collares perla cadena fina minimalista regalo dorado cadena fina con una perla de agua dulce una cadena delicada con una sola perla que cae justo sobre la clavicula es la pieza que no te quitas funciona con una camisa blanca con un vestido de noche y en capas con otras cadenas br-col-001 40 cm 45 cm"
    },
    {
      "slug": "collar-marina",
      "name": "Collar Marina",
      "category": "Collares",
      "priceCents": 225e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-collar-marina-480.webp",
      "search": "Collar Marina Collares capas medalla moneda doble cadena dorado collar marina collares capas medalla moneda doble cadena dorado doble cadena con medalla martillada dos cadenas unidas en una sola pieza para conseguir el efecto de capas sin enredos la medalla martillada refleja la luz de forma suave y natural br-col-002"
    },
    {
      "slug": "collar-selene",
      "name": "Collar Selene",
      "category": "Collares",
      "priceCents": 165e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-collar-selene-480.webp",
      "search": "Collar Selene Collares luna dije cadena celestial dorado collar selene collares luna dije cadena celestial dorado dije de luna creciente sobre cadena fina una luna pequena y pulida pensada para quienes prefieren los detalles discretos se lleva sola o combinada con el collar aurora br-col-003"
    },
    {
      "slug": "collar-perla-clasica",
      "name": "Collar Perla Cl\xE1sica",
      "category": "Collares",
      "priceCents": 295e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-collar-perla-480.webp",
      "search": "Collar Perla Cl\xE1sica Collares perlas clasico elegante novia boda collar perla clasica collares perlas clasico elegante novia boda hilo de perlas redondas con cierre dorado un clasico que nunca pasa de moda perlas redondas de tamano uniforme y un cierre dorado que tambien puede lucirse al frente br-col-004"
    },
    {
      "slug": "pulsera-alba",
      "name": "Pulsera Alba",
      "category": "Pulseras",
      "priceCents": 125e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-pulsera-alba-480.webp",
      "search": "Pulsera Alba Pulseras cadena esferas fina minimalista dorado pulsera alba pulseras cadena esferas fina minimalista dorado cadena fina con esferas doradas ligera y luminosa con pequenas esferas que se mueven con la muneca ideal para combinar con relojes y otras pulseras br-pul-001"
    },
    {
      "slug": "brazalete-lia",
      "name": "Brazalete L\xEDa",
      "category": "Pulseras",
      "priceCents": 245e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-brazalete-lia-480.webp",
      "search": "Brazalete L\xEDa Pulseras rigido abierto cuff esclava pulido dorado brazalete lia pulseras rigido abierto cuff esclava pulido dorado brazalete abierto de lineas suaves un brazalete rigido y abierto que se adapta a la muneca su acabado pulido lo convierte en una pieza protagonista incluso cuando se lleva solo br-pul-002"
    },
    {
      "slug": "pulsera-serena",
      "name": "Pulsera Serena",
      "category": "Pulseras",
      "priceCents": 145e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-pulsera-serena-480.webp",
      "search": "Pulsera Serena Pulseras perlas elastica delicada novia pulsera serena pulseras perlas elastica delicada novia perlas elasticas con un acento dorado perlas redondas montadas sobre elastico resistente con una pequena esfera dorada como detalle facil de poner facil de combinar br-pul-003"
    },
    {
      "slug": "pulsera-vera",
      "name": "Pulsera Vera",
      "category": "Pulseras",
      "priceCents": 275e3,
      "hasRange": false,
      "inStock": false,
      "image": "images/p-pulsera-vera-480.webp",
      "search": "Pulsera Vera Pulseras eslabones gruesa chunky statement dorado pulsera vera pulseras eslabones gruesa chunky statement dorado eslabones gruesos con cierre de palanca eslabones ovalados de presencia rotunda y un cierre de palanca que forma parte del diseno para los dias en que el accesorio es el protagonista br-pul-004"
    },
    {
      "slug": "argollas-luna",
      "name": "Argollas Luna",
      "category": "Aretes",
      "priceCents": 155e3,
      "hasRange": true,
      "inStock": true,
      "image": "images/p-argollas-luna-480.webp",
      "search": "Argollas Luna Aretes argollas aros hoops pantallas diario dorado argollas luna aretes argollas aros hoops pantallas diario dorado argollas tubulares de uso diario las argollas que combinan con todo tubulares ligeras y con cierre de bisagra comodo para llevarlas todo el dia br-are-001 pequenas 20 mm medianas 30 mm"
    },
    {
      "slug": "aretes-gota-perla",
      "name": "Aretes Gota de Perla",
      "category": "Aretes",
      "priceCents": 145e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-aretes-gota-480.webp",
      "search": "Aretes Gota de Perla Aretes perla gota colgantes pantallas boda evento aretes gota de perla aretes perla gota colgantes pantallas boda evento perlas en forma de gota con gancho dorado una gota de perla que se mueve con naturalidad y enmarca el rostro perfectos para eventos pero lo bastante sencillos para el dia a dia br-are-002"
    },
    {
      "slug": "aretes-brisa",
      "name": "Aretes Brisa",
      "category": "Aretes",
      "priceCents": 115e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-aretes-brisa-480.webp",
      "search": "Aretes Brisa Aretes flor topos studs pequenos circonia brillo aretes brisa aretes flor topos studs pequenos circonia brillo flores doradas con circonia al centro pequenas flores caladas con una circonia en el centro que capta la luz un detalle dulce para llevar a diario br-are-003"
    },
    {
      "slug": "ear-cuff-onda",
      "name": "Ear Cuff Onda",
      "category": "Aretes",
      "priceCents": 135e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-earcuff-onda-480.webp",
      "search": "Ear Cuff Onda Aretes ear cuff escultorico sin perforacion moderno pantalla ear cuff onda aretes ear cuff escultorico sin perforacion moderno pantalla ear cuff escultorico sin perforacion una onda dorada que abraza el contorno de la oreja sin necesidad de perforacion se vende por unidad para combinarla con tus aretes favoritos br-are-004"
    },
    {
      "slug": "anillo-trenza",
      "name": "Anillo Trenza",
      "category": "Anillos",
      "priceCents": 115e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-anillo-trenza-480.webp",
      "search": "Anillo Trenza Anillos trenzado apilable banda sortija dorado anillo trenza anillos trenzado apilable banda sortija dorado banda trenzada para apilar una banda fina con textura trenzada que se apila facilmente con otros anillos su textura anade brillo sin perder delicadeza br-ani-001 talla 6 talla 7 talla 8"
    },
    {
      "slug": "anillo-sol",
      "name": "Anillo Sol",
      "category": "Anillos",
      "priceCents": 195e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-anillo-sol-480.webp",
      "search": "Anillo Sol Anillos domo grueso statement sortija dorado anillo sol anillos domo grueso statement sortija dorado anillo domo de acabado espejo volumen y luz en una sola pieza el anillo sol tiene forma de domo y un acabado espejo que le da presencia a cualquier look br-ani-002 talla 6 talla 7"
    },
    {
      "slug": "anillo-perla",
      "name": "Anillo Perla",
      "category": "Anillos",
      "priceCents": 125e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-anillo-perla-480.webp",
      "search": "Anillo Perla Anillos perla delicado fino sortija regalo anillo perla anillos perla delicado fino sortija regalo banda fina con una perla una banda finisima coronada por una perla redonda delicado femenino y perfecto para combinar con el collar aurora br-ani-003 talla 6 talla 7 talla 8"
    },
    {
      "slug": "set-celeste",
      "name": "Set Celeste",
      "category": "Sets",
      "priceCents": 325e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-set-celeste-480.webp",
      "search": "Set Celeste Sets regalo juego conjunto perla madres cumpleanos set celeste sets regalo juego conjunto perla madres cumpleanos collar y aretes de perla a juego un collar con dije de perla y aretes a juego presentados juntos es nuestro regalo favorito para cumpleanos graduaciones y el dia de las madres br-set-001"
    },
    {
      "slug": "set-duo-dorado",
      "name": "Set D\xFAo Dorado",
      "category": "Sets",
      "priceCents": 345e3,
      "hasRange": false,
      "inStock": true,
      "image": "images/p-set-duo-480.webp",
      "search": "Set D\xFAo Dorado Sets regalo juego conjunto eslabones argollas moderno set duo dorado sets regalo juego conjunto eslabones argollas moderno cadena de eslabones y argollas pequenas una cadena de eslabones alargados con argollas pequenas a juego un duo moderno que eleva incluso el look mas sencillo br-set-002"
    }
  ];
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

  // _static/js-src/shared/text.js
  function normalizeText(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  // _static/js-src/modules/quote.js
  var ITBIS = 0.18;
  var MAX_QTY = 10;
  var taxIncluded = (cents) => cents > 0 ? Math.round(cents - cents / (1 + ITBIS)) : 0;
  function searchCatalog(query) {
    const tokens = normalizeText(query).split(/\s+/).filter((token) => token.length > 1);
    const matched = products.filter((product) => {
      const haystack = normalizeText(product.search);
      return tokens.every((token) => haystack.includes(token));
    });
    return { total: matched.length, items: matched.slice(0, 6), all: matched };
  }
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
  function initHeader() {
    const header = $("[data-header]");
    if (!header) return;
    const sentinel = h("div", { "aria-hidden": "true", class: "header-sentinel" });
    header.before(sentinel);
    new IntersectionObserver(([entry]) => header.classList.toggle("is-scrolled", !entry.isIntersecting), { rootMargin: "0px" }).observe(sentinel);
  }
  function initAnnouncement() {
    const items = $$(".announcement__item");
    if (items.length < 2 || prefersReducedMotion()) return;
    let index = 0;
    let timer = null;
    const mq = window.matchMedia("(min-width: 1024px)");
    const start = () => {
      clearInterval(timer);
      if (mq.matches) return;
      timer = setInterval(() => {
        if (document.hidden) return;
        items[index].classList.remove("is-active");
        index = (index + 1) % items.length;
        items[index].classList.add("is-active");
      }, 4500);
    };
    mq.addEventListener("change", start);
    start();
  }
  function initReveal() {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("js-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    const observe = (root = document) => {
      const groups = /* @__PURE__ */ new Map();
      for (const el of $$("[data-reveal]:not(.is-visible)", root)) {
        const parent = el.parentElement;
        const i = groups.get(parent) ?? 0;
        groups.set(parent, i + 1);
        el.style.setProperty("--reveal-delay", `${Math.min(i, 6) * 70}ms`);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("is-visible");
        else observer.observe(el);
      }
    };
    observe();
    revealObserver = observe;
  }
  var revealObserver = null;
  function initCarousels() {
    for (const carousel of $$("[data-carousel]")) {
      const track = $("[data-carousel-track]", carousel);
      const controls = $(`[data-carousel-controls="${carousel.dataset.carousel}"]`);
      if (!track || !controls) continue;
      const prev = $("[data-carousel-prev]", controls);
      const next = $("[data-carousel-next]", controls);
      const step = () => (track.firstElementChild?.getBoundingClientRect().width ?? 300) + 24;
      const update = () => {
        prev.disabled = track.scrollLeft <= 4;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      };
      prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: prefersReducedMotion() ? "auto" : "smooth" }));
      next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: prefersReducedMotion() ? "auto" : "smooth" }));
      track.addEventListener("scroll", update, { passive: true });
      new ResizeObserver(update).observe(track);
      update();
    }
  }

  // _static/js-src/modules/cart-ui.js
  var lastQuote = null;
  var quoteRequest = 0;
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
  function initCartDrawer() {
    const drawer = $('[data-drawer="cart"]');
    const countEls = $$("[data-cart-count]");
    const labels = $$("[data-cart-label]");
    if (!drawer) return;
    const linesEl = $("[data-cart-lines]", drawer);
    const emptyEl = $("[data-cart-empty]", drawer);
    const footer = $("[data-cart-footer]", drawer);
    const subtotalEl = $("[data-cart-subtotal]", drawer);
    const headingCount = $("[data-cart-heading-count]", drawer);
    const checkoutLink = $("[data-checkout-link]", drawer);
    const render = () => {
      const items = cart.items();
      const count = cart.count();
      for (const el of countEls) {
        const before = el.textContent;
        el.textContent = String(count);
        el.hidden = count === 0;
        if (before !== String(count) && count > 0) {
          el.classList.remove("is-bumped");
          void el.offsetWidth;
          el.classList.add("is-bumped");
        }
      }
      for (const el of labels) el.setAttribute("aria-label", `Carrito, ${count} ${count === 1 ? "art\xEDculo" : "art\xEDculos"}`);
      headingCount.textContent = count ? `(${count})` : "";
      emptyEl.hidden = items.length > 0;
      footer.hidden = items.length === 0;
      const lines = new Map((lastQuote?.lines ?? []).map((l) => [l.variantId, l]));
      replaceLines(linesEl, items.map((item) => cartLine(item, lines.get(item.variantId))), $(".drawer__panel", drawer));
      const subtotal = lastQuote ? lastQuote.subtotalCents : items.reduce((sum, i) => sum + (i.priceCents ?? 0) * i.quantity, 0);
      subtotalEl.textContent = formatMoney(subtotal);
      const blocked = hasBlockingIssues(lastQuote);
      checkoutLink.classList.toggle("button--disabled", blocked);
      checkoutLink.setAttribute("aria-disabled", String(blocked));
    };
    const syncQuote = debounce(async () => {
      try {
        await refreshQuote();
      } catch {
      }
      render();
    }, 250);
    cart.subscribe(() => {
      render();
      syncQuote();
    });
    checkoutLink.addEventListener("click", (event) => {
      if (checkoutLink.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        toast("Retira los productos agotados para continuar.", { type: "error" });
      }
    });
    for (const trigger of $$("[data-cart-open]")) {
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.addEventListener("click", (event) => {
        if (document.body.classList.contains("page-checkout") || location.pathname.endsWith("carrito.html")) return;
        event.preventDefault();
        openCart(trigger);
      });
    }
    render();
    if (cart.items().length) syncQuote();
  }
  function openCart(trigger = document.activeElement) {
    const drawer = $('[data-drawer="cart"]');
    if (drawer) openLayer(drawer, { trigger: $("[data-cart-open]") ?? trigger, focus: ".drawer__panel" });
  }
  function initQuickAdd() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add-to-cart]");
      if (!button) return;
      event.preventDefault();
      const variantId = Number(button.dataset.variantId);
      if (!Number.isInteger(variantId)) return;
      const qty = cart.add({
        variantId,
        quantity: 1,
        name: button.dataset.name,
        priceCents: Number(button.dataset.price),
        image: button.dataset.image,
        slug: button.dataset.slug,
        variantName: null
      });
      if (!qty) {
        toast("Tu carrito alcanz\xF3 el m\xE1ximo de productos.", { type: "error" });
        return;
      }
      button.classList.add("is-added");
      setTimeout(() => button.classList.remove("is-added"), 1600);
      openCart(button);
    });
  }

  // _static/js-src/modules/search.js
  function highlight(text, query) {
    const tokens = normalizeText(query).split(/\s+/).filter((t) => t.length > 1);
    if (!tokens.length) return [text];
    const normalized = normalizeText(text);
    const ranges = [];
    for (const token of tokens) {
      let from = 0;
      let index;
      while ((index = normalized.indexOf(token, from)) !== -1) {
        ranges.push([index, index + token.length]);
        from = index + token.length;
      }
    }
    if (!ranges.length || normalized.length !== text.length) return [text];
    ranges.sort((a, b) => a[0] - b[0]);
    const parts = [];
    let cursor = 0;
    for (const [start, end] of ranges) {
      if (start < cursor) continue;
      if (start > cursor) parts.push(text.slice(cursor, start));
      parts.push(h("mark", {}, text.slice(start, end)));
      cursor = end;
    }
    parts.push(text.slice(cursor));
    return parts;
  }
  function initSearch() {
    const overlay = $("[data-search]");
    if (!overlay) return;
    const input = $("[data-search-input]", overlay);
    const list = $("[data-search-results]", overlay);
    const status = $("[data-search-status]", overlay);
    const all = $("[data-search-all]", overlay);
    const suggestions = $("[data-search-suggestions]", overlay);
    let controller = null;
    let active = -1;
    const options = () => $$('[role="option"]', list);
    const setActive = (index) => {
      const opts = options();
      opts.forEach((el, i) => el.setAttribute("aria-selected", String(i === index)));
      active = index;
      if (opts[index]) {
        input.setAttribute("aria-activedescendant", opts[index].id);
        opts[index].scrollIntoView({ block: "nearest" });
      } else input.removeAttribute("aria-activedescendant");
    };
    const render = (data, query) => {
      list.replaceChildren(
        ...data.items.map(
          (item, i) => h(
            "li",
            { role: "presentation" },
            h(
              "a",
              { class: "search-result", href: page(`/producto/${item.slug}`), role: "option", id: `search-opt-${i}`, "aria-selected": "false", tabindex: "-1" },
              item.image ? h("img", { src: item.image, alt: "", width: 64, height: 80, loading: "lazy" }) : h("span", { class: "img-placeholder" }),
              h("span", {}, h("span", { class: "search-result__name" }, highlight(item.name, query)), h("span", { class: "search-result__meta" }, item.category, item.inStock ? "" : " \xB7 Agotado")),
              h("span", { class: "search-result__price" }, item.hasRange ? `Desde ${formatMoney(item.priceCents)}` : formatMoney(item.priceCents))
            )
          )
        )
      );
      active = -1;
      input.setAttribute("aria-expanded", String(data.items.length > 0));
      status.textContent = data.total ? `${data.total} ${data.total === 1 ? "resultado" : "resultados"} para \u201C${query}\u201D` : `No encontramos piezas para \u201C${query}\u201D. Prueba con \u201Cargollas\u201D, \u201Cperlas\u201D o \u201Cdorado\u201D.`;
      all.hidden = data.total <= data.items.length;
      all.href = page(`/buscar?q=${encodeURIComponent(query)}`);
      all.textContent = `Ver los ${data.total} resultados`;
    };
    const run = debounce(async () => {
      const query = input.value.trim();
      controller?.abort();
      if (query.length < 2) {
        list.replaceChildren();
        status.textContent = "";
        all.hidden = true;
        suggestions.hidden = false;
        input.setAttribute("aria-expanded", "false");
        return;
      }
      suggestions.hidden = true;
      controller = new AbortController();
      status.textContent = "Buscando\u2026";
      render(searchCatalog(query), query);
    }, 220);
    input.addEventListener("input", run);
    input.addEventListener("keydown", (event) => {
      const opts = options();
      if (event.key === "ArrowDown" && opts.length) {
        event.preventDefault();
        setActive((active + 1) % opts.length);
      } else if (event.key === "ArrowUp" && opts.length) {
        event.preventDefault();
        setActive(active <= 0 ? opts.length - 1 : active - 1);
      } else if (event.key === "Enter" && active >= 0 && opts[active]) {
        event.preventDefault();
        window.location.href = opts[active].href;
      }
    });
    list.addEventListener("mousemove", (event) => {
      const opt = event.target.closest('[role="option"]');
      if (opt) setActive(options().indexOf(opt));
    });
    $("[data-search-form]", overlay).addEventListener("submit", (event) => {
      if (input.value.trim().length < 2) event.preventDefault();
    });
    for (const button of $$("[data-search-open]")) {
      button.setAttribute("aria-haspopup", "dialog");
      button.addEventListener("click", () => openLayer(overlay, { trigger: button, focus: input }));
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !event.target.closest("input, textarea, select, [contenteditable]")) {
        event.preventDefault();
        openLayer(overlay, { focus: input });
      }
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeLayer();
    });
  }

  // _static/js-src/main.js
  function initMobileMenu() {
    const menu = $('[data-drawer="menu"]');
    const trigger = $("[data-menu-open]");
    if (!menu || !trigger) return;
    trigger.addEventListener("click", () => openLayer(menu, { trigger, focus: ".drawer__panel" }));
  }
  initHeader();
  initAnnouncement();
  initMobileMenu();
  initSearch();
  initCartDrawer();
  initQuickAdd();
  initCarousels();
  initReveal();
})();
