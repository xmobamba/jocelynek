(function () {
  let app;
  let initialized = false;
  let subscribed = false;

  function init(api) {
    app = api;
    if (!initialized) {
      document.getElementById("settings-form").addEventListener("submit", handleSubmit);
      document.getElementById("reset-data").addEventListener("click", handleReset);
      document.getElementById("restore-json").addEventListener("change", handleRestore);
      initialized = true;
    }
    if (!subscribed) {
      app.on("state:changed", fillForm);
      subscribed = true;
    }
    fillForm(app.getState());
  }

  function fillForm(state) {
    if (!state || !state.settings) return;
    document.getElementById("setting-name").value = state.settings.storeName;
    document.getElementById("setting-tagline").value = state.settings.tagline;
    document.getElementById("setting-currency").value = state.settings.currency;
    document.getElementById("setting-vat").value = state.settings.vat;
    document.getElementById("setting-threshold").value = state.settings.lowStock;
    document.getElementById("setting-manual-price").checked = !!state.settings.manualPrice;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    app.updateState((draft) => {
      draft.settings.storeName = form["setting-name"].value.trim();
      draft.settings.tagline = form["setting-tagline"].value.trim();
      draft.settings.currency = form["setting-currency"].value.trim() || "FCFA";
      draft.settings.vat = Number(form["setting-vat"].value) || 0;
      draft.settings.lowStock = Number(form["setting-threshold"].value) || 0;
      draft.settings.manualPrice = form["setting-manual-price"].checked;
    });
    document.getElementById("store-name").textContent = form["setting-name"].value.trim();
    document.getElementById("store-tagline").textContent = form["setting-tagline"].value.trim();
    alert("Paramètres enregistrés");
  }

  function handleReset() {
    if (!confirm("Réinitialiser toutes les données ?")) return;
    app.reset();
    app.addActivity("Réinitialisation complète des données");
    location.reload();
  }

  function handleRestore(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      app.restoreData(reader.result);
      location.reload();
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  app.register(init);
})();
