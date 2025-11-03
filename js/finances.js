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
      document.getElementById("add-income").addEventListener("click", () => openFinanceForm("income"));
      document.getElementById("add-expense").addEventListener("click", () => openFinanceForm("expense"));
      document.getElementById("export-finances").addEventListener("click", exportCSV);
      initialized = true;
    }
    render(app.getState());
  }

  function render(state) {
    const history = document.getElementById("finance-history");
    history.innerHTML = "";
    if (!state.finances.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "Aucun mouvement enregistré.";
      history.appendChild(li);
    } else {
      state.finances.slice(0, 10).forEach((entry) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${entry.label}</strong><span>${new Date(entry.date).toLocaleDateString()}</span><span>${formatCurrency(entry.amount, state.settings.currency)}</span>`;
        history.appendChild(li);
      });
    }

    const totalIncome = state.finances.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const totalExpense = state.finances.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const summary = document.getElementById("finance-summary");
    summary.innerHTML = `
      <li>Total recettes : ${formatCurrency(totalIncome, state.settings.currency)}</li>
      <li>Total dépenses : ${formatCurrency(totalExpense, state.settings.currency)}</li>
      <li>Bénéfice net : ${formatCurrency(totalIncome - totalExpense, state.settings.currency)}</li>`;
  }

  function openFinanceForm(type) {
    const title = type === "income" ? "Nouvelle recette" : "Nouvelle dépense";
    app.openModal({
      title,
      fields: [
        { label: "Libellé", name: "label", required: true },
        { label: "Montant", name: "amount", type: "number", min: 0, step: "0.01", value: 0 },
        { label: "Date", name: "date", type: "date", value: new Date().toISOString().slice(0, 10) }
      ],
      onSubmit: (values, close) => {
        const amount = Number(values.amount) || 0;
        if (amount <= 0) return;
        const id = app.nextId("finance");
        app.updateState((draft) => {
          draft.finances.unshift({
            id,
            type,
            label: values.label.trim(),
            amount,
            date: values.date || new Date().toISOString()
          });
        });
        app.addActivity(`${type === "income" ? "Recette" : "Dépense"} enregistrée (${formatCurrency(amount)})`);
        close();
      }
    });
  }

  function exportCSV() {
    const state = app.getState();
    if (!state.finances.length) return;
    const headers = ["id", "type", "label", "amount", "date"];
    const rows = state.finances.map((item) =>
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
    link.download = "finances.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function formatCurrency(value, currency) {
    const state = app ? app.getState() : { settings: { currency: "FCFA" } };
    const sym = currency || state.settings.currency;
    return `${Number(value || 0).toLocaleString("fr-FR")} ${sym}`;
  }

  app.register(init);
})();
