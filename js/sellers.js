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
    if (!initialized) {
      document.getElementById("add-seller").addEventListener("click", openSellerForm);
      initialized = true;
    }
    render(app.getState());
  }

  function render(state) {
    const container = document.getElementById("seller-list");
    container.innerHTML = "";
    if (!state.sellers.length) {
      container.classList.add("empty");
      container.innerHTML = "<p>Aucune vendeuse enregistrée.</p>";
      return;
    }
    container.classList.remove("empty");
    state.sellers.forEach((seller) => {
      const card = document.createElement("article");
      card.className = "seller-card";
      const consignments = seller.consignments
        .filter((item) => item.quantity > 0)
        .map((item) => {
          const product = state.inventory.find((prod) => prod.id === item.productId);
          return `<li>${product ? product.name : item.productId} · ${item.quantity} pièces</li>`;
        })
        .join("") || "<li>Aucune marchandise</li>";
      const history = seller.history.slice(-4).reverse().map(formatHistory).join("") || "<li>Aucune activité</li>";
      card.innerHTML = `
        <header>
          <div>
            <h3>${seller.name}</h3>
            <p>${seller.phone || ""}</p>
          </div>
          <span class="badge ${seller.balance > 0 ? "danger" : ""}">Solde ${formatCurrency(seller.balance)}</span>
        </header>
        <section>
          <h4>Marchandises confiées</h4>
          <ul>${consignments}</ul>
        </section>
        <section>
          <h4>Historique</h4>
          <ul>${history}</ul>
        </section>
        <footer>
          <button class="secondary" data-action="return" data-id="${seller.id}">Retour produit</button>
          <button class="secondary" data-action="payment" data-id="${seller.id}">Encaisser</button>
        </footer>`;
      card.querySelectorAll("button[data-action]").forEach((btn) => {
        btn.addEventListener("click", (event) => {
          const id = event.currentTarget.dataset.id;
          const action = event.currentTarget.dataset.action;
          if (action === "return") openReturnForm(id);
          if (action === "payment") openPaymentForm(id);
        });
      });
      container.appendChild(card);
    });
  }

  function openSellerForm() {
    app.openModal({
      title: "Nouvelle vendeuse",
      fields: [
        { label: "Nom", name: "name", required: true },
        { label: "Téléphone", name: "phone", placeholder: "+225..." }
      ],
      onSubmit: (values, close) => {
        const id = app.nextId("seller");
        app.updateState((draft) => {
          draft.sellers.push({
            id,
            name: values.name.trim(),
            phone: values.phone.trim(),
            balance: 0,
            consignments: [],
            history: []
          });
        });
        app.addActivity(`Vendeuse ${values.name.trim()} ajoutée`);
        close();
      }
    });
  }

  function openReturnForm(sellerId) {
    const state = app.getState();
    const seller = state.sellers.find((item) => item.id === sellerId);
    if (!seller) return;
    const available = seller.consignments.filter((item) => item.quantity > 0);
    if (!available.length) {
      alert("Aucun produit à retourner");
      return;
    }
    app.openModal({
      title: `Retour de ${seller.name}`,
      submitLabel: "Enregistrer",
      fields: [
        {
          label: "Produit",
          name: "productId",
          type: "select",
          options: available.map((item) => {
            const product = state.inventory.find((prod) => prod.id === item.productId);
            return { value: item.productId, label: `${product ? product.name : item.productId} (${item.quantity})` };
          })
        },
        {
          label: "Quantité",
          name: "quantity",
          type: "number",
          min: 1,
          value: 1
        }
      ],
      onSubmit: (values, close) => {
        const quantity = Number(values.quantity) || 0;
        if (quantity <= 0) return;
        app.updateState((draft) => {
          const sellerDraft = draft.sellers.find((item) => item.id === sellerId);
          const product = draft.inventory.find((item) => item.id === values.productId);
          if (!sellerDraft || !product) return;
          const consign = sellerDraft.consignments.find((item) => item.productId === values.productId);
          if (!consign || consign.quantity < quantity) return;
          consign.quantity -= quantity;
          product.consigned[sellerId] = Math.max(0, (product.consigned[sellerId] || 0) - quantity);
          product.stock += quantity;
          sellerDraft.history.push({
            type: "return",
            productId: values.productId,
            quantity,
            at: new Date().toISOString()
          });
        });
        app.addActivity(`Retour de ${quantity} pièces par ${seller.name}`);
        close();
      }
    });
  }

  function openPaymentForm(sellerId) {
    const state = app.getState();
    const seller = state.sellers.find((item) => item.id === sellerId);
    if (!seller) return;
    app.openModal({
      title: `Encaisser ${seller.name}`,
      submitLabel: "Valider",
      fields: [
        {
          label: "Montant encaissé",
          name: "amount",
          type: "number",
          min: 0,
          value: seller.balance || 0
        },
        {
          label: "Commentaire",
          name: "note",
          type: "textarea",
          rows: 3
        }
      ],
      onSubmit: (values, close) => {
        const amount = Number(values.amount) || 0;
        if (amount <= 0) return;
        const financeId = app.nextId("finance");
        app.updateState((draft) => {
          const sellerDraft = draft.sellers.find((item) => item.id === sellerId);
          if (!sellerDraft) return;
          sellerDraft.balance = Math.max(0, sellerDraft.balance - amount);
          sellerDraft.history.push({
            type: "payment",
            amount,
            note: values.note,
            at: new Date().toISOString()
          });
          draft.finances.unshift({
            id: financeId,
            type: "income",
            label: `Règlement ${sellerDraft.name}`,
            amount,
            date: new Date().toISOString()
          });
        });
        app.addActivity(`Paiement ${formatCurrency(amount)} reçu de ${seller.name}`);
        close();
      }
    });
  }

  function formatHistory(entry) {
    const date = new Date(entry.at).toLocaleDateString();
    if (entry.type === "consign") return `<li>${date} · ${entry.quantity} confiés (${entry.productId})</li>`;
    if (entry.type === "return") return `<li>${date} · ${entry.quantity} retournés (${entry.productId})</li>`;
    if (entry.type === "sale") return `<li>${date} · Vente ${entry.saleId} (${entry.quantity} ${entry.productId})</li>`;
    if (entry.type === "payment") return `<li>${date} · Paiement ${formatCurrency(entry.amount)}</li>`;
    return `<li>${date}</li>`;
  }

  function formatCurrency(value) {
    const state = app ? app.getState() : { settings: { currency: "FCFA" } };
    return `${Number(value || 0).toLocaleString("fr-FR")} ${state.settings.currency}`;
  }

  app.register(init);
})();
