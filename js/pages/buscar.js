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

  // _static/js-src/shared/text.js
  function normalizeText(value) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  }

  // _static/js-src/modules/quote.js
  function searchCatalog(query) {
    const tokens = normalizeText(query).split(/\s+/).filter((token) => token.length > 1);
    const matched = products.filter((product) => {
      const haystack = normalizeText(product.search);
      return tokens.every((token) => haystack.includes(token));
    });
    return { total: matched.length, items: matched.slice(0, 6), all: matched };
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

  // _static/js-src/pages/buscar.js
  var form = document.querySelector(".search-page-form");
  var input = form?.querySelector('input[name="q"]');
  var shop = document.querySelector("section.shop");
  if (!form || !input || !shop) {
  } else {
    const params = new URLSearchParams(location.search);
    if (params.get("q")) input.value = params.get("q");
    const render = (query) => {
      const title = document.querySelector(".page-title");
      let lede = document.querySelector(".page-lede");
      if (!query) {
        if (title) title.textContent = "Buscar";
        lede?.remove();
        shop.replaceChildren();
        return;
      }
      const { all } = searchCatalog(query);
      if (title) title.textContent = `Resultados para \u201C${query}\u201D`;
      if (!lede) {
        lede = document.createElement("p");
        lede.className = "page-lede";
        title?.after(lede);
      }
      lede.textContent = `${all.length} ${all.length === 1 ? "resultado" : "resultados"}`;
      if (!all.length) {
        shop.innerHTML = `<div class="empty-state"><p class="empty-state__title">No encontramos resultados.</p><p class="empty-state__text">Revisa la ortograf\xEDa o prueba con palabras como \u201Cargollas\u201D, \u201Cperlas\u201D o \u201Cdorado\u201D.</p><div class="empty-state__actions"><a class="button" href="${page("/tienda")}">Ver toda la tienda</a><a class="button button--outline" href="${page("/tienda/sets")}">Ver sets</a></div></div>`;
        return;
      }
      const grid = document.createElement("div");
      grid.className = "product-grid";
      for (const product of all) {
        const article = document.createElement("article");
        article.className = `product-card${product.inStock ? "" : " is-soldout"}`;
        const href = page(`/producto/${product.slug}`);
        article.innerHTML = `<a class="product-card__media" href="${href}" tabindex="-1" aria-hidden="true">${product.image ? `<img class="product-card__img" src="${product.image}" alt="" width="480" height="600">` : ""}${product.inStock ? "" : '<span class="tag tag--muted">Agotado</span>'}</a><div class="product-card__body"><h3 class="product-card__title"><a href="${href}"></a></h3><span class="price">${product.hasRange ? '<span class="price__from">Desde</span> ' : ""}<span class="price__value"></span></span></div>`;
        article.querySelector(".product-card__title a").textContent = product.name;
        article.querySelector(".price__value").textContent = formatMoney(product.priceCents);
        grid.append(article);
      }
      shop.replaceChildren(grid);
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const next = query ? `${location.pathname}?q=${encodeURIComponent(query)}` : location.pathname;
      history.replaceState(null, "", next);
      render(query);
    });
    render(input.value.trim());
  }
})();
