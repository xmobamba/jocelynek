(function () {
  let app;
  let initialized = false;
  let subscribed = false;
  let cart = [];
  let lastSale = null;

  function init(api) {
    app = api;
    if (!subscribed) {
      app.on("state:changed", render);
      subscribed = true;
    }
    if (!initialized) {
      bindEvents();
      initialized = true;
    }
    render(app.getState());
  }

  function bindEvents() {
    document.getElementById("search-product").addEventListener("input", renderProducts);
    document.getElementById("toggle-manual-price").addEventListener("click", toggleManualPrice);
    document.getElementById("complete-sale").addEventListener("click", completeSale);
    document.getElementById("print-receipt").addEventListener("click", printReceipt);
    document.getElementById("reset-sale").addEventListener("click", resetSale);
    document.getElementById("sale-date").value = currentDate();
  }

  function render(state) {
    updateManualPriceButton(state.settings.manualPrice);
    populateSellers(state);
    renderProducts();
    renderCart();
    renderHistory(state);
  }

  function renderProducts() {
    const list = document.getElementById("product-list");
    const state = app.getState();
    const query = document.getElementById("search-product").value.toLowerCase();
    list.innerHTML = "";
    const products = state.inventory.filter((product) =>
      product.name.toLowerCase().includes(query) || product.id.toLowerCase().includes(query)
    );
    if (!products.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Aucun produit";
      list.appendChild(li);
      return;
    }
    products.forEach((product) => {
      const sellerId = document.getElementById("sale-seller").value;
      const available = sellerId ? product.consigned?.[sellerId] || 0 : product.stock;
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="info">
          <strong>${product.name}</strong>
          <small>${product.id} • ${product.category}</small>
          <div>
            <span class="badge">Stock ${sellerId ? "confié" : "boutique"} : ${available}</span>
          </div>
        </div>
        <button data-id="${product.id}">Ajouter</button>`;
      const button = li.querySelector("button");
      button.disabled = available <= 0;
      button.addEventListener("click", () => addToCart(product));
      list.appendChild(li);
    });
  }

  function addToCart(product) {
    const state = app.getState();
    const sellerId = document.getElementById("sale-seller").value;
    const available = sellerId ? product.consigned?.[sellerId] || 0 : product.stock;
    if (available <= 0) {
      alert("Stock insuffisant");
      return;
    }
    const manual = state.settings.manualPrice;
    if (manual) {
      app.openModal({
        title: `Ajouter ${product.name}`,
        fields: [
          {
            label: "Quantité",
            name: "quantity",
            type: "number",
            min: 1,
            value: 1,
            hint: `Disponible : ${available}`
          },
          {
            label: "Prix unitaire",
            name: "price",
            type: "number",
            min: 0,
            step: "0.01",
            value: product.price || 0
          }
        ],
        submitLabel: "Ajouter",
        onSubmit: (values, close) => {
          const quantity = Number(values.quantity) || 0;
          const price = Number(values.price) || 0;
          if (quantity <= 0 || price <= 0) return;
          pushCartItem(product, quantity, price, sellerId || null);
          close();
        }
      });
    } else {
      pushCartItem(product, 1, product.price || 0, sellerId || null);
    }
  }

  function pushCartItem(product, quantity, price, sellerId) {
    const existing = cart.find((item) => item.productId === product.id && item.sellerId === sellerId);
    if (existing) {
      existing.quantity += quantity;
      existing.unitPrice = price;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        unitPrice: price,
        quantity,
        sellerId
      });
    }
    renderCart();
  }

  function renderHistory(state) {
    const history = document.getElementById("sales-history");
    history.innerHTML = "";
    if (!state.sales.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Aucune vente enregistrée.";
      history.appendChild(li);
      return;
    }
    state.sales.slice(0, 6).forEach((sale) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${sale.id}</strong><span>${new Date(sale.date).toLocaleDateString()}</span><span>${formatCurrency(sale.total, state.settings.currency)}</span>`;
      history.appendChild(li);
    });
  }

  function populateSellers(state) {
    const select = document.getElementById("sale-seller");
    const prev = select.value;
    select.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Boutique";
    select.appendChild(defaultOption);
    state.sellers.forEach((seller) => {
      const option = document.createElement("option");
      option.value = seller.id;
      option.textContent = seller.name;
      if (seller.id === prev) option.selected = true;
      select.appendChild(option);
    });
    if (!select.dataset.bound) {
      select.addEventListener("change", () => {
        renderProducts();
        renderCart();
      });
      select.dataset.bound = "true";
    }
  }

  function toggleManualPrice() {
    const state = app.getState();
    app.updateState((draft) => {
      draft.settings.manualPrice = !state.settings.manualPrice;
    });
    render(app.getState());
  }

  function updateManualPriceButton(enabled) {
    const btn = document.getElementById("toggle-manual-price");
    btn.textContent = `Prix manuel : ${enabled ? "oui" : "non"}`;
  }

  function cartTotal() {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  function completeSale() {
    if (!cart.length) return;
    const state = app.getState();
    const sellerId = document.getElementById("sale-seller").value || null;
    const payment = document.getElementById("sale-payment").value;
    const rawDate = document.getElementById("sale-date").value;
    const date = rawDate ? new Date(rawDate) : new Date();
    const validDate = Number.isFinite(date.getTime()) ? date.toISOString() : new Date().toISOString();
    const invalidItem = cart.find((item) => {
      const product = state.inventory.find((prod) => prod.id === item.productId);
      if (!product) return true;
      const available = item.sellerId
        ? product.consigned?.[item.sellerId] || 0
        : product.stock;
      return available < item.quantity;
    });
    if (invalidItem) {
      alert("Stock insuffisant pour valider cette vente");
      return;
    }
    const saleId = app.nextId("sale");
    const financeId = app.nextId("finance");
    const saleItems = cart.map((item) => ({ ...item }));
    const total = cartTotal();
    app.updateState((draft) => {
      saleItems.forEach((item) => {
        const product = draft.inventory.find((prod) => prod.id === item.productId);
        if (!product) return;
        if (sellerId) {
          const seller = draft.sellers.find((s) => s.id === sellerId);
          if (!seller) return;
          const consign = seller.consignments.find((c) => c.productId === item.productId);
          if (consign) consign.quantity = Math.max(0, consign.quantity - item.quantity);
          product.consigned[sellerId] = Math.max(0, (product.consigned[sellerId] || 0) - item.quantity);
          seller.history.push({
            type: "sale",
            saleId,
            productId: item.productId,
            quantity: item.quantity,
            at: new Date().toISOString()
          });
          seller.balance += total;
        } else {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      });
      draft.sales.unshift({
        id: saleId,
        date: validDate,
        sellerId,
        payment,
        items: saleItems,
        total,
        createdAt: new Date().toISOString()
      });
      draft.finances.unshift({
        id: financeId,
        type: "income",
        label: `Vente ${saleId}`,
        amount: total,
        date: validDate
      });
    });
    app.addActivity(`Vente ${saleId} enregistrée (${formatCurrency(total, state.settings.currency)})`);
    lastSale = { id: saleId, items: saleItems, total, date: validDate, sellerId, payment };
    cart = [];
    renderCart();
    document.getElementById("sale-date").value = currentDate();
  }

  function printReceipt() {
    if (!lastSale) {
      alert("Aucune vente à imprimer");
      return;
    }
    const state = app.getState();
    const win = window.open("", "_blank", "width=600,height=700");
    const rows = lastSale.items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unitPrice)}</td>
          <td>${formatCurrency(item.unitPrice * item.quantity)}</td>
        </tr>`
      )
      .join("");
    const date = new Date(lastSale.date).toLocaleString();
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Reçu ${lastSale.id}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 1.5rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #111; padding: 0.5rem; font-size: 0.85rem; }
        </style>
      </head>
      <body>
        <h1>${state.settings.storeName}</h1>
        <p>${date}</p>
        <table>
          <thead><tr><th>Article</th><th>Qté</th><th>Prix</th><th>Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p>Total : ${formatCurrency(lastSale.total)}</p>
        <script>window.print();</script>
      </body>
      </html>`);
    win.document.close();
  }

  function resetSale() {
    cart = [];
    renderCart();
    document.getElementById("sale-date").value = currentDate();
  }

  function renderCart() {
    const list = document.getElementById("cart-items");
    list.innerHTML = "";
    if (!cart.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Aucun article.";
      list.appendChild(li);
      document.getElementById("cart-total").textContent = formatCurrency(0);
      return;
    }
    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <header>
          <strong>${item.name}</strong>
          <button class="secondary" data-index="${index}">Retirer</button>
        </header>
        <footer>
          <label>Qté <input type="number" min="1" value="${item.quantity}" data-field="quantity" data-index="${index}"></label>
          <label>Prix <input type="number" min="0" step="0.01" value="${item.unitPrice}" data-field="unitPrice" data-index="${index}"></label>
          <span>Total ${formatCurrency(item.quantity * item.unitPrice)}</span>
        </footer>`;
      list.appendChild(li);
    });
    list.querySelectorAll("button[data-index]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const idx = Number(event.currentTarget.dataset.index);
        cart.splice(idx, 1);
        renderCart();
      });
    });
    list.querySelectorAll("input[data-field]").forEach((input) => {
      input.addEventListener("change", (event) => {
        const idx = Number(event.currentTarget.dataset.index);
        const field = event.currentTarget.dataset.field;
        const value = Number(event.currentTarget.value);
        if (value <= 0) return;
        cart[idx][field] = value;
        renderCart();
      });
    });
    document.getElementById("cart-total").textContent = formatCurrency(cartTotal());
  }

  function currentDate() {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  function formatCurrency(value, currency) {
    const settings = app ? app.getState().settings : { currency: "FCFA" };
    const symbol = currency || settings.currency;
    return `${Number(value || 0).toLocaleString("fr-FR")} ${symbol}`;
  }

  app.register(init);
})();
