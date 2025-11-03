(function () {
  let app;
  let initialized = false;
  let subscribed = false;

  function init(api) {
    app = api;
    if (!subscribed) {
      app.on("state:changed", render);
      subscribed = true;
    }
    render(app.getState());
    if (!initialized) {
      bindEvents();
      initialized = true;
    }
  }

  function bindEvents() {
    document.getElementById("add-product").addEventListener("click", () => openProductForm());
    document.getElementById("export-csv").addEventListener("click", exportCSV);
    document.getElementById("print-labels").addEventListener("click", handlePrint);
    document.getElementById("import-csv").addEventListener("change", handleCSVImport);
    document.getElementById("import-json").addEventListener("change", handleJSONImport);
  }

  function render(state) {
    const body = document.getElementById("inventory-body");
    body.innerHTML = "";
    if (!state.inventory.length) {
      const row = document.createElement("tr");
      row.className = "empty";
      const cell = document.createElement("td");
      cell.colSpan = 7;
      cell.textContent = "Aucun produit enregistré.";
      row.appendChild(cell);
      body.appendChild(row);
      return;
    }

    state.inventory.forEach((product) => {
      const consignedTotal = Object.values(product.consigned || {}).reduce((sum, qty) => sum + Number(qty || 0), 0);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.category || "Divers"}</td>
        <td>${formatCurrency(product.price, state.settings.currency)}</td>
        <td>${product.stock}</td>
        <td>${consignedTotal}</td>
        <td class="actions">
          <button class="secondary" data-action="edit" data-id="${product.id}">Modifier</button>
          <button class="secondary" data-action="consign" data-id="${product.id}">Confier</button>
          <button class="secondary" data-action="delete" data-id="${product.id}">Supprimer</button>
        </td>`;
      body.appendChild(row);
    });

    body.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const id = event.currentTarget.dataset.id;
        const action = event.currentTarget.dataset.action;
        if (action === "edit") openProductForm(id);
        if (action === "delete") removeProduct(id);
        if (action === "consign") openConsignForm(id);
      });
    });
  }

  function openProductForm(productId) {
    const state = app.getState();
    const editing = state.inventory.find((item) => item.id === productId);
    const nextRef = app.generateId("PROD", state.meta.productCounter);

    app.openModal({
      title: editing ? "Modifier le produit" : "Nouveau produit",
      submitLabel: editing ? "Mettre à jour" : "Ajouter",
      fields: [
        {
          label: "Référence",
          name: "id",
          type: "text",
          value: editing ? editing.id : nextRef,
          readOnly: true
        },
        {
          label: "Nom du produit",
          name: "name",
          value: editing ? editing.name : "",
          required: true
        },
        {
          label: "Catégorie",
          name: "category",
          value: editing ? editing.category : "Divers"
        },
        {
          label: "Prix de vente",
          name: "price",
          type: "number",
          min: 0,
          step: "0.01",
          value: editing ? editing.price : 0
        },
        {
          label: "Stock boutique",
          name: "stock",
          type: "number",
          min: 0,
          step: "1",
          value: editing ? editing.stock : 0
        }
      ],
      onSubmit: (values, close) => {
        if (editing) {
          app.updateState((draft) => {
            const item = draft.inventory.find((prod) => prod.id === editing.id);
            if (!item) return;
            item.name = values.name.trim();
            item.category = values.category.trim();
            item.price = Number(values.price) || 0;
            item.stock = Number(values.stock) || 0;
          });
          app.addActivity(`Produit ${editing.id} mis à jour`);
        } else {
          const id = app.nextId("product");
          app.updateState((draft) => {
            draft.inventory.push({
              id,
              name: values.name.trim(),
              category: values.category.trim() || "Divers",
              price: Number(values.price) || 0,
              stock: Number(values.stock) || 0,
              consigned: {},
              createdAt: new Date().toISOString()
            });
          });
          app.addActivity(`Nouveau produit ${id}`);
        }
        close();
      }
    });
  }

  function removeProduct(productId) {
    if (!confirm("Supprimer ce produit ?")) return;
    app.updateState((draft) => {
      draft.inventory = draft.inventory.filter((item) => item.id !== productId);
      draft.sellers.forEach((seller) => {
        seller.consignments = seller.consignments.filter((consign) => consign.productId !== productId);
      });
    });
    app.addActivity(`Produit ${productId} supprimé`);
  }

  function openConsignForm(productId) {
    const state = app.getState();
    if (!state.sellers.length) {
      alert("Ajoutez d'abord une vendeuse dans l'onglet dédié.");
      return;
    }
    const product = state.inventory.find((item) => item.id === productId);
    if (!product) return;
    app.openModal({
      title: `Confier ${product.name}`,
      submitLabel: "Confier",
      fields: [
        {
          label: "Vendeuse",
          name: "sellerId",
          type: "select",
          options: state.sellers.map((seller) => ({ value: seller.id, label: seller.name })),
          value: state.sellers[0].id
        },
        {
          label: "Quantité",
          name: "quantity",
          type: "number",
          min: 1,
          value: 1,
          hint: `Stock disponible : ${product.stock}`
        }
      ],
      onSubmit: (values, close) => {
        const quantity = Number(values.quantity) || 0;
        if (quantity <= 0) return;
        if (product.stock < quantity) {
          alert("Stock boutique insuffisant");
          return;
        }
        app.updateState((draft) => {
          const item = draft.inventory.find((prod) => prod.id === productId);
          if (!item || item.stock < quantity) return;
          item.stock -= quantity;
          item.consigned = item.consigned || {};
          item.consigned[values.sellerId] = (item.consigned[values.sellerId] || 0) + quantity;
          const seller = draft.sellers.find((s) => s.id === values.sellerId);
          if (seller) {
            const existing = seller.consignments.find((c) => c.productId === productId);
            if (existing) existing.quantity += quantity;
            else seller.consignments.push({ productId, quantity });
            seller.history.push({
              type: "consign",
              productId,
              quantity,
              at: new Date().toISOString()
            });
          }
        });
        app.addActivity(`${quantity} unités de ${product.id} confiées`);
        close();
      }
    });
  }

  function handlePrint() {
    const state = app.getState();
    if (!state.inventory.length) {
      alert("Aucun produit à imprimer");
      return;
    }
    const win = window.open("", "_blank", "width=900,height=700");
    const labels = state.inventory
      .map((item) => {
        const qr = buildQR(item.id);
        return `
          <article>
            <strong>${item.name}</strong>
            <p>${item.id} · ${formatCurrency(item.price, state.settings.currency)}</p>
            <div class="qr">${qr}</div>
          </article>`;
      })
      .join("");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Étiquettes produits</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 1.5rem; }
          h1 { text-align: center; }
          #label-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; }
          article { border: 1px dashed #111; border-radius: 0.4rem; padding: 0.5rem; font-size: 0.8rem; }
          .qr { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; margin-top: 0.35rem; }
          .qr span { display: block; padding-top: 100%; background: #111; }
          .qr span.off { background: transparent; border: 1px solid #111; }
        </style>
      </head>
      <body>
        <h1>Étiquettes produits</h1>
        <div id="label-grid">${labels}</div>
        <script>window.print();</script>
      </body>
      </html>`);
    win.document.close();
  }

  function buildQR(text) {
    const size = 25;
    const chars = [];
    for (let i = 0; i < size; i++) {
      const code = text.charCodeAt(i % text.length) + i;
      chars.push(code % 2 === 0 ? "<span></span>" : "<span class='off'></span>");
    }
    return chars.join("");
  }

  function exportCSV() {
    const state = app.getState();
    if (!state.inventory.length) return;
    const headers = ["id", "name", "category", "price", "stock"];
    const rows = state.inventory.map((item) =>
      headers
        .map((key) => {
          const value = item[key];
          return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(",")
    );
    const data = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inventaire.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleCSVImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = reader.result.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      const headers = lines.shift().split(",");
      const products = lines.map((line) => {
        const values = line.split(",");
        const record = {};
        headers.forEach((header, index) => {
          record[header.trim()] = values[index]?.replace(/"/g, "").trim();
        });
        return record;
      });
      mergeProducts(products);
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleJSONImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) mergeProducts(data);
        else alert("Format JSON invalide");
      } catch (error) {
        alert("Impossible de lire le fichier JSON");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function mergeProducts(list) {
    const state = app.getState();
    let counter = state.meta.productCounter;
    const entries = list.map((raw) => {
      let id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : null;
      if (!id) {
        id = app.generateId("PROD", counter);
        counter += 1;
      }
      return {
        id,
        name: String(raw.name || "Produit").trim(),
        category: String(raw.category || "Divers").trim(),
        price: Number(raw.price) || 0,
        stock: Number(raw.stock) || 0
      };
    });

    app.updateState((draft) => {
      draft.meta.productCounter = Math.max(draft.meta.productCounter, counter);
      entries.forEach((payload) => {
        const existing = draft.inventory.find((item) => item.id === payload.id);
        if (existing) {
          existing.name = payload.name;
          existing.category = payload.category;
          existing.price = payload.price;
          existing.stock = payload.stock;
        } else {
          draft.inventory.push({
            id: payload.id,
            name: payload.name,
            category: payload.category,
            price: payload.price,
            stock: payload.stock,
            consigned: {},
            createdAt: new Date().toISOString()
          });
        }
      });
    });
    app.addActivity("Inventaire importé");
  }

  function formatCurrency(value, currency) {
    return `${Number(value || 0).toLocaleString("fr-FR")} ${currency}`;
  }

  app.register(init);
})();
