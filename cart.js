/* cart.js — منطق سلة قدح (تخزين محلي في المتصفح)
   نخزّن فقط { id, qty } لكل عنصر. الأسعار والتفاصيل تُجلب دائمًا من catalog_public
   في صفحة السلة، حتى لا نثق بسعر مخزّن محليًا وحتى لا يتقادم. */
(function () {
  "use strict";

  var CART_KEY = "qadah_cart_v1";

  function read() {
    try {
      var arr = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (i) { return i && i.id && i.qty > 0; });
    } catch (e) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadges();
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  var Cart = {
    // كل عناصر السلة كمصفوفة { id, qty }
    all: function () { return read(); },

    // إضافة كمية لمنتج (أو زيادتها إن كان موجودًا)
    add: function (id, qty) {
      qty = Math.max(1, parseInt(qty, 10) || 1);
      var items = read();
      var f = items.find(function (i) { return i.id === id; });
      if (f) f.qty += qty; else items.push({ id: id, qty: qty });
      write(items);
    },

    // ضبط كمية منتج (0 أو أقل = حذفه)
    setQty: function (id, qty) {
      qty = parseInt(qty, 10) || 0;
      var items = read();
      if (qty <= 0) {
        items = items.filter(function (i) { return i.id !== id; });
      } else {
        var f = items.find(function (i) { return i.id === id; });
        if (f) f.qty = qty; else items.push({ id: id, qty: qty });
      }
      write(items);
    },

    remove: function (id) {
      write(read().filter(function (i) { return i.id !== id; }));
    },

    clear: function () { write([]); },

    // إجمالي عدد القطع (لشارة السلة)
    count: function () {
      return read().reduce(function (s, i) { return s + (i.qty || 0); }, 0);
    },

    // تحديث أي شارة سلة في الصفحة (عناصر تحمل data-cart-count)
    updateBadges: function () {
      var n = Cart.count();
      var badges = document.querySelectorAll("[data-cart-count]");
      for (var k = 0; k < badges.length; k++) {
        badges[k].textContent = n;
        badges[k].style.display = n > 0 ? "" : "none";
      }
    }
  };

  window.Cart = Cart;
  document.addEventListener("DOMContentLoaded", Cart.updateBadges);
})();
