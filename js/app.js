(function () {
  const storageKey = "jk-pos-state";
  const defaultState = {
    settings: {
      storeName: "Boutique Jocelyne",
      tagline: "Caisse intelligente hors ligne",
      currency: "FCFA",
      vat: 0,
      lowStock: 5,
      manualPrice: true,
      theme: "light"
    },
    meta: {
      productCounter: 1,
      sellerCounter: 1,
      saleCounter: 1,
      financeCounter: 1
    },
    inventory: [],
    sellers: [],
    sales: [],
    finances: [],
    activities: [],
    lastBackup: null
  };

  const modules = [];
  const events = {};
  let state = hydrate(loadData(storageKey, defaultState));
  let ready = false;
  let modalReady = false;

  const modal = () => document.getElementById("modal");
  const modalTitle = () => document.getElementById("modal-title");
  const modalForm = () => document.getElementById("modal-form");
  const modalClose = () => document.getElementById("close-modal");

  function clone(value) {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function sanitizeString(value) {
    if (typeof value !== "string") return value;
    return value
      .replace(/<<<<<<<.*?=======/gs, "")
      .replace(/>>>>>>>.*?(\n|$)/g, "")
      .trim();
  }

  function hydrate(raw) {
    const safe = clone(defaultState);
    const data = raw && typeof raw === "object" ? raw : {};
    safe.settings = Object.assign({}, safe.settings, data.settings || {});
    safe.meta = Object.assign({}, safe.meta, data.meta || {});
    safe.inventory = Array.isArray(data.inventory)
      ? data.inventory.map((item, index) => ({
          id: item?.id || generateId("PROD", index + 1),
          name: sanitizeString(item?.name || "Produit"),
          category: sanitizeString(item?.category || "Divers"),
          price: Number(item?.price) || 0,
          stock: Number.isFinite(item?.stock) ? Number(item.stock) : 0,
          consigned:
            item?.consigned && typeof item.consigned === "object"
              ? Object.entries(item.consigned).reduce((acc, [key, value]) => {
                  acc[key] = Number(value) || 0;
                  return acc;
                }, {})
              : {},
          createdAt: item?.createdAt || new Date().toISOString()
        })
      : [];
    safe.sellers = Array.isArray(data.sellers)
      ? data.sellers.map((seller, index) => ({
          id: seller?.id || generateId("SELL", index + 1),
          name: sanitizeString(seller?.name || "Vendeuse"),
          phone: sanitizeString(seller?.phone || ""),
          balance: Number(seller?.balance) || 0,
          consignments: Array.isArray(seller?.consignments)
            ? seller.consignments.map((entry) => ({
                productId: entry?.productId,
                quantity: Number(entry?.quantity) || 0
              }))
            : [],
          history: Array.isArray(seller?.history)
            ? seller.history.map((entry) => ({
                type: entry?.type || "info",
                productId: entry?.productId,
                saleId: entry?.saleId,
                quantity: Number(entry?.quantity) || 0,
                amount: Number(entry?.amount) || 0,
                note: sanitizeString(entry?.note || ""),
                at: entry?.at || new Date().toISOString()
              }))
            : []
        }))
      : [];
    safe.sales = Array.isArray(data.sales)
      ? data.sales.map((sale, index) => ({
          id: sale?.id || generateId("SALE", index + 1),
          date: sale?.date || new Date().toISOString(),
          sellerId: sale?.sellerId || null,
          payment: sale?.payment || "cash",
          items: Array.isArray(sale?.items)
            ? sale.items.map((item) => ({
                productId: item?.productId,
                name: item?.name || "Produit",
                quantity: Number(item?.quantity) || 0,
                unitPrice: Number(item?.unitPrice) || 0,
                sellerId: item?.sellerId || null
              }))
            : [],
          total: Number(sale?.total) || 0,
          createdAt: sale?.createdAt || new Date().toISOString()
        }))
      : [];
    safe.finances = Array.isArray(data.finances)
      ? data.finances.map((entry, index) => ({
          id: entry?.id || generateId("FIN", index + 1),
          type: entry?.type === "expense" ? "expense" : "income",
          label: sanitizeString(entry?.label || "Mouvement"),
          amount: Number(entry?.amount) || 0,
          date: entry?.date || new Date().toISOString()
        }))
      : [];
    safe.activities = Array.isArray(data.activities)
      ? data.activities.slice(-40).map((entry) => ({
          message: sanitizeString(entry?.message || ""),
          createdAt: entry?.createdAt || new Date().toISOString()
        }))
      : [];
    safe.lastBackup = data.lastBackup || null;
    return safe;
  }

  function persist() {
    saveData(storageKey, state);
    emit("state:changed", getState());
    updateBadges();
  }

  function register(moduleInit) {
    modules.push(moduleInit);
    if (ready) moduleInit(AppAPI);
  }

  function on(event, handler) {
    events[event] = events[event] || [];
    events[event].push(handler);
  }

  function emit(event, payload) {
    (events[event] || []).forEach((handler) => handler(payload, getState()));
  }

  function getState() {
    return clone(state);
  }

  function updateState(mutator) {
    const draft = getState();
    mutator(draft);
    state = hydrate(draft);
    persist();
  }

  function setTheme(theme) {
    state.settings.theme = theme;
    document.body.classList.toggle("dark", theme === "dark");
    persist();
  }

  function toggleTheme() {
    const next = state.settings.theme === "dark" ? "light" : "dark";
    setTheme(next);
  }

  function generateId(prefix, counter) {
    return `${prefix}-${String(counter).padStart(3, "0")}`;
  }

  const prefixMap = {
    product: "PROD",
    seller: "SELL",
    sale: "SALE",
    finance: "FIN"
  };

  function nextId(type) {
    const key = `${type}Counter`;
    state.meta[key] = (state.meta[key] || 1) + 1;
    const prefix = prefixMap[type] || type.toUpperCase();
    return generateId(prefix, state.meta[key] - 1);
  }

  function addActivity(message) {
    state.activities.push({
      message,
      createdAt: new Date().toISOString()
    });
    state.activities = state.activities.slice(-40);
    persist();
  }

  function updateBadges() {
    const badge = document.getElementById("connection-badge");
    const topBadge = document.getElementById("topbar-status");
    const backup = document.getElementById("backup-indicator");
    const status = navigator.onLine ? "En ligne" : "Hors ligne";
    badge.textContent = status;
    topBadge.textContent = status;
    if (state.lastBackup) {
      const date = new Date(state.lastBackup).toLocaleString();
      backup.textContent = `Dernière sauvegarde : ${date}`;
    }
  }

  function showLoader(show) {
    const loader = document.getElementById("loader");
    loader.style.display = show ? "grid" : "none";
  }

  function initApp() {
    updateBadges();
    document.getElementById("store-name").textContent = state.settings.storeName;
    document.getElementById("store-tagline").textContent = state.settings.tagline;
    document.body.classList.toggle("dark", state.settings.theme === "dark");
    document.getElementById("toggle-theme").textContent =
      state.settings.theme === "dark" ? "Mode clair" : "Mode sombre";

    document.querySelectorAll(".menu-item").forEach((btn) => {
      btn.addEventListener("click", () => switchSection(btn.dataset.section));
    });

    document.getElementById("toggle-theme").addEventListener("click", () => {
      toggleTheme();
      document.getElementById("toggle-theme").textContent =
        state.settings.theme === "dark" ? "Mode clair" : "Mode sombre";
    });

    document.getElementById("trigger-backup").addEventListener("click", backupData);

    window.addEventListener("online", updateBadges);
    window.addEventListener("offline", updateBadges);

    if (!modalReady) {
      modalClose().addEventListener("click", closeModal);
      modal().addEventListener("click", (event) => {
        if (event.target === modal()) closeModal();
      });
      modalReady = true;
    }

    setTimeout(() => {
      document.getElementById("app").hidden = false;
      showLoader(false);
      ready = true;
      modules.forEach((fn) => fn(AppAPI));
      emit("state:ready", getState());
    }, 400);

    setInterval(() => {
      if (document.hidden) return;
      backupData(true);
    }, 10 * 60 * 1000);
  }

  function switchSection(section) {
    document.querySelectorAll(".menu-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.section === section);
    });
    document.querySelectorAll(".section").forEach((el) => {
      el.classList.toggle("active", el.id === section);
    });
  }

  function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadData(key, fallback = null) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return clone(fallback);
      return JSON.parse(stored);
    } catch (error) {
      console.warn("Impossible de charger", error);
      return clone(fallback);
    }
  }

  function backupData(silent = false) {
    try {
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jk-pos-backup-${Date.now()}.json`;
      if (!silent) {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
      state.lastBackup = new Date().toISOString();
      persist();
    } catch (error) {
      console.error("Sauvegarde impossible", error);
    }
  }

  function restoreData(payload) {
    try {
      const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
      state = hydrate(parsed);
      persist();
      modules.forEach((fn) => fn(AppAPI));
    } catch (error) {
      alert("Impossible de restaurer le fichier fourni");
      console.error(error);
    }
  }

  function reset() {
    state = clone(defaultState);
    persist();
    modules.forEach((fn) => fn(AppAPI));
  }

  function closeModal() {
    modal().setAttribute("hidden", "hidden");
    modal().setAttribute("aria-hidden", "true");
    modalForm().innerHTML = "";
  }

  function openModal({ title, fields = [], submitLabel = "Enregistrer", onSubmit }) {
    modalTitle().textContent = title;
    modalForm().innerHTML = "";
    fields.forEach((field) => {
      const wrapper = document.createElement("label");
      wrapper.className = "form-group";
      if (field.label) {
        const span = document.createElement("span");
        span.textContent = field.label;
        wrapper.appendChild(span);
      }
      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = field.rows || 3;
      } else if (field.type === "select") {
        input = document.createElement("select");
        (field.options || []).forEach((option) => {
          const opt = document.createElement("option");
          opt.value = option.value;
          opt.textContent = option.label;
          if (option.value === field.value) opt.selected = true;
          input.appendChild(opt);
        });
      } else {
        input = document.createElement("input");
        input.type = field.type || "text";
      }
      if (field.name) input.name = field.name;
      if (field.placeholder) input.placeholder = field.placeholder;
      if (typeof field.value !== "undefined") input.value = field.value;
      if (field.min !== undefined) input.min = field.min;
      if (field.max !== undefined) input.max = field.max;
      if (field.step !== undefined) input.step = field.step;
      if (field.required) input.required = true;
      if (field.readOnly) input.readOnly = true;
      wrapper.appendChild(input);
      if (field.hint) {
        const hint = document.createElement("small");
        hint.textContent = field.hint;
        hint.className = "hint";
        wrapper.appendChild(hint);
      }
      modalForm().appendChild(wrapper);
    });

    const actions = document.createElement("div");
    actions.className = "form-actions";
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = submitLabel;
    actions.appendChild(submit);
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "secondary";
    cancel.textContent = "Annuler";
    cancel.addEventListener("click", closeModal);
    actions.appendChild(cancel);
    modalForm().appendChild(actions);

    modalForm().onsubmit = (event) => {
      event.preventDefault();
      const formData = new FormData(modalForm());
      const result = {};
      fields.forEach((field) => {
        if (!field.name) return;
        if (field.type === "number") {
          result[field.name] = Number(formData.get(field.name));
        } else {
          result[field.name] = formData.get(field.name);
        }
      });
      if (onSubmit) onSubmit(result, closeModal);
    };

    modal().removeAttribute("hidden");
    modal().setAttribute("aria-hidden", "false");
  }

  const AppAPI = {
    getState,
    updateState,
    nextId,
    generateId,
    addActivity,
    on,
    emit,
    register,
    saveData,
    loadData,
    backupData,
    restoreData,
    reset,
    openModal,
    closeModal,
    defaultState: clone(defaultState)
  };

  window.App = AppAPI;
  document.addEventListener("DOMContentLoaded", initApp);
})();
