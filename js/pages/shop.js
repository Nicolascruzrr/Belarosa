(() => {
  // _static/js-src/shared/format.js
  function pluralize(count2, singular, plural = `${singular}s`) {
    return `${count2} ${count2 === 1 ? singular : plural}`;
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

  // _static/js-src/modules/dom.js
  var $ = (selector, root2 = document) => root2.querySelector(selector);

  // _static/js-src/pages/shop.js
  var root = $("[data-shop]");
  var form = $("[data-shop-form]", root);
  var region = $("[data-shop-region]", root);
  var count = $("[data-shop-count]", root);
  var grid = region?.querySelector(".product-grid");
  if (form && grid) {
    const cards = [...grid.querySelectorAll(".product-card")];
    const priceOf = (card) => Number((card.querySelector(".price__value")?.textContent ?? "0").replace(/[^\d]/g, "")) || 0;
    const isNew = (card) => Boolean(card.querySelector(".tag:not(.tag--muted)"));
    const apply = () => {
      const availableOnly = form.elements.disponibilidad.checked;
      const sort2 = form.elements.orden.value;
      const ranked = cards.filter((card) => !availableOnly || !card.classList.contains("is-soldout")).map((card, index) => ({ card, index, price: priceOf(card), isNew: isNew(card) }));
      if (sort2 === "precio-asc") ranked.sort((a, b) => a.price - b.price || a.index - b.index);
      else if (sort2 === "precio-desc") ranked.sort((a, b) => b.price - a.price || a.index - b.index);
      else if (sort2 === "novedades") ranked.sort((a, b) => Number(b.isNew) - Number(a.isNew) || a.index - b.index);
      else ranked.sort((a, b) => a.index - b.index);
      grid.replaceChildren(...ranked.map((item) => item.card));
      count.textContent = pluralize(ranked.length, "pieza");
      const params2 = new URLSearchParams();
      if (sort2 && sort2 !== "destacados") params2.set("orden", sort2);
      if (availableOnly) params2.set("disponibilidad", "disponible");
      const query = params2.toString();
      history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
    };
    const params = new URLSearchParams(location.search);
    const sort = params.get("orden");
    if (sort && form.elements.orden.querySelector(`option[value="${sort}"]`)) form.elements.orden.value = sort;
    if (params.get("disponibilidad") === "disponible") form.elements.disponibilidad.checked = true;
    form.addEventListener("change", apply);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      apply();
    });
    if (location.search) apply();
  }
})();
