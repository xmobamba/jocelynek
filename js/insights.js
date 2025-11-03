(function () {
  let app;
  let ctx;
  let initialized = false;

  function init(api) {
    app = api;
    if (!initialized) {
      document.getElementById("refresh-insights").addEventListener("click", () => render(app.getState()));
      document.getElementById("refresh-chart").addEventListener("click", () => drawChart());
      ctx = document.getElementById("sales-chart").getContext("2d");
      app.on("state:changed", render);
      initialized = true;
    }
    render(app.getState());
  }

  function render(state) {
    updateMetrics(state);
    updateInsights(state);
    updateActivity(state);
    drawChart(state);
  }

  function updateMetrics(state) {
    const today = new Date().toISOString().slice(0, 10);
    const dailySales = state.sales.filter((sale) => sale.date.slice(0, 10) === today);
    const totalDaily = dailySales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    document.getElementById("metric-sales").textContent = formatCurrency(totalDaily, state.settings.currency);
    document.getElementById("metric-sales-count").textContent = `${dailySales.length} vente${dailySales.length > 1 ? "s" : ""}`;

    const stock = state.inventory.reduce((sum, product) => sum + Number(product.stock || 0), 0);
    const consigned = state.inventory.reduce((sum, product) =>
      sum + Object.values(product.consigned || {}).reduce((sub, qty) => sub + Number(qty || 0), 0), 0
    );
    const lowStock = state.inventory.filter((product) => product.stock <= state.settings.lowStock).length;
    document.getElementById("metric-stock").textContent = `${stock} produits`;
    document.getElementById("metric-low-stock").textContent = `${lowStock} alertes · ${consigned} confiés`;

    const incomes = state.finances.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = state.finances.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount || 0), 0);
    document.getElementById("metric-profit").textContent = formatCurrency(incomes - expenses, state.settings.currency);
    document.getElementById("metric-expense").textContent = `${formatCurrency(expenses, state.settings.currency)} de dépenses`;
  }

  function updateInsights(state) {
    const intro = document.getElementById("insights-intro");
    const list = document.getElementById("insights-list");
    if (!state.inventory.length && !state.sales.length && !state.sellers.length) {
      intro.textContent = "Ajoutez vos premiers produits et ventes pour générer la synthèse.";
      list.innerHTML = '<li class="empty">Les informations s\'afficheront ici.</li>';
      return;
    }
    intro.textContent = `Analyse réalisée le ${new Date().toLocaleString("fr-FR")}`;
    const stock = state.inventory.reduce((sum, item) => sum + item.stock, 0);
    const consigned = state.inventory.reduce((sum, item) =>
      sum + Object.values(item.consigned || {}).reduce((sub, qty) => sub + Number(qty || 0), 0), 0
    );
    const lastSale = state.sales[0];
    const topSeller = [...state.sellers].sort((a, b) => b.balance - a.balance)[0];
    list.innerHTML = `
      <li><strong>Inventaire</strong><span>${stock} articles en boutique et ${consigned} confiés aux vendeuses.</span></li>
      <li><strong>Ventes</strong><span>${state.sales.length} transaction(s) au total${lastSale ? ` • dernière ${new Date(lastSale.date).toLocaleString("fr-FR")}` : ""}.</span></li>
      <li><strong>Vendeuses</strong><span>${state.sellers.length} active(s)${topSeller ? ` • ${topSeller.name} doit ${formatCurrency(topSeller.balance, state.settings.currency)}` : ""}.</span></li>
      <li><strong>Finances</strong><span>Bénéfice net ${formatCurrency(sumBy(state.finances, "income") - sumBy(state.finances, "expense"), state.settings.currency)}.</span></li>`;
  }

  function updateActivity(state) {
    const feed = document.getElementById("activity-feed");
    feed.innerHTML = "";
    if (!state.activities.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.innerHTML = "<span aria-hidden=\"true\">🕒</span><div><strong>Aucune activité</strong><p>Les actions apparaîtront ici.</p></div>";
      feed.appendChild(li);
      return;
    }
    state.activities
      .slice()
      .reverse()
      .slice(0, 6)
      .forEach((entry) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${new Date(entry.createdAt).toLocaleString("fr-FR")}</strong><span>${entry.message}</span>`;
        feed.appendChild(li);
      });
  }

  function drawChart(state = app.getState()) {
    const canvas = ctx.canvas;
    const width = canvas.clientWidth || canvas.width;
    const height = canvas.clientHeight || canvas.height;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date;
    });
    const totals = days.map((day) => {
      const key = day.toISOString().slice(0, 10);
      return state.sales
        .filter((sale) => sale.date.slice(0, 10) === key)
        .reduce((sum, sale) => sum + Number(sale.total || 0), 0);
    });
    const max = Math.max(...totals, 10);
    const padding = 32;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    const barWidth = chartWidth / totals.length - 12;
    const textColor = getComputedStyle(document.body).color || "#0f172a";
    totals.forEach((value, index) => {
      const x = padding + index * (barWidth + 12) + 6;
      const barHeight = (value / max) * chartHeight;
      const y = height - padding - barHeight;
      const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
      gradient.addColorStop(0, "rgba(255, 165, 0, 0.8)");
      gradient.addColorStop(1, "rgba(0, 168, 107, 0.6)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const radius = 6;
      ctx.moveTo(x, height - padding);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, height - padding);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = textColor;
      ctx.font = "12px Inter";
      ctx.fillText(days[index].toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), x, height - padding + 16);
    });
  }

  function sumBy(list, type) {
    return list
      .filter((item) => item.type === type)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }

  function formatCurrency(value, currency) {
    return `${Number(value || 0).toLocaleString("fr-FR")} ${currency}`;
  }

  app.register(init);
})();
