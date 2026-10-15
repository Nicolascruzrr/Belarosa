(() => {
  // _static/js-src/shared/format.js
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
  var $ = (selector, root2 = document) => root2.querySelector(selector);
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

  // _static/js-src/pages/confirmation.js
  var PENDING_KEY = "belarosa:checkout";
  var ORDER_TOKEN_KEY = (number) => `belarosa:order:${number}`;
  var root = $("[data-confirmation]");
  var loading = $("[data-confirmation-loading]", root);
  var content = $("[data-confirmation-content]", root);
  var params = new URLSearchParams(location.search);
  var result = params.get("resultado");
  var pending = session.get(PENDING_KEY);
  var orderNumber = params.get("pedido") || pending?.orderNumber || null;
  var token = orderNumber ? session.get(ORDER_TOKEN_KEY(orderNumber)) : null;
  var whatsapp = root.dataset.whatsapp;
  var storeEmail = root.dataset.storeEmail;
  function contactLinks(message) {
    const links = [];
    if (whatsapp) links.push(h("a", { class: "button button--outline", href: `${whatsapp.split("?")[0]}?text=${encodeURIComponent(message)}`, target: "_blank", rel: "noopener" }, "Escribir por WhatsApp"));
    if (storeEmail) links.push(h("a", { class: "button button--outline", href: `mailto:${storeEmail}?subject=${encodeURIComponent(message)}` }, "Escribir por correo"));
    if (!links.length) links.push(h("a", { class: "button button--outline", href: page("/contacto") }, "Contactar a Belarosa"));
    return links;
  }
  function show(...nodes) {
    loading.hidden = true;
    content.hidden = false;
    content.replaceChildren(...nodes.filter(Boolean));
    const heading = content.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  function head({ status, tone, title, text, actions = [] }) {
    return h(
      "div",
      { class: "confirmation__head" },
      status ? h("span", { class: `confirmation__status${tone ? ` confirmation__status--${tone}` : ""}` }, status) : null,
      h("h1", { class: "confirmation__title" }, title),
      ...[text].flat().filter(Boolean).map((t) => h("p", { class: "confirmation__text" }, t)),
      actions.length ? h("div", { class: "confirmation__actions" }, actions) : null
    );
  }
  async function init() {
    if (result === "invalid" || result === "mismatch") {
      return show(
        head({
          status: "Verificaci\xF3n pendiente",
          tone: "bad",
          title: "No pudimos verificar el pago.",
          text: ["Recibimos una respuesta de pago que no pudimos validar, por eso no confirmamos el pedido. Si ves un cargo en tu tarjeta, cont\xE1ctanos con tu n\xFAmero de pedido y lo revisaremos."],
          actions: contactLinks(`Pedido ${orderNumber ?? ""}: no se pudo verificar el pago`)
        })
      );
    }
    if (result === "error") {
      return show(head({ title: "Algo sali\xF3 mal al procesar la respuesta del pago.", text: "Si se realiz\xF3 un cargo, recibir\xE1s un correo de confirmaci\xF3n. Si no lo recibes en unos minutos, cont\xE1ctanos.", actions: contactLinks("Consulta sobre mi pago") }));
    }
    if (!orderNumber) {
      return show(head({ title: "No encontramos un pedido en curso.", text: "Puedes volver a la tienda.", actions: [h("a", { class: "button", href: page("/tienda") }, "Ir a la tienda")] }));
    }
    return show(head({ title: "No encontramos un pedido en curso.", text: "Puedes volver a la tienda.", actions: [h("a", { class: "button", href: page("/tienda") }, "Ir a la tienda")] }));
  }
  init();
})();
