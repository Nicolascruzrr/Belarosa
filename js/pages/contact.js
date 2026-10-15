(() => {
  // _static/js-src/modules/dom.js
  var $ = (selector, root = document) => root.querySelector(selector);

  // _static/js-src/pages/contact.js
  var form = $("[data-contact-form]");
  var status = $("[data-contact-status]", form);
  var button = $("[data-contact-submit]", form);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
})();
