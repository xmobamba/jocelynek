import {
  calculateSaleAmounts,
  formatCurrency,
  formatNumber,
  todayISO,
  toISODate
} from './utils.js';

function getSalesInPeriod(sales, start, end) {
  return sales.filter((sale) => {
    const rawDate = sale.date || sale.createdAt || sale.timestamp;
    const saleDate = new Date(rawDate);
    if (Number.isNaN(saleDate.getTime())) return false;
    saleDate.setHours(0, 0, 0, 0);
    return saleDate >= start && saleDate <= end;
  });
}

function summarizeSales(sales, products, sellers) {
  const summary = {
    total: 0,
    count: 0,
    outstanding: 0,
    byProduct: new Map(),
    bySeller: new Map(),
    byDay: new Map()
  };

  sales.forEach((sale) => {
    const product = products.find((item) => item.id === sale.productId);
    const seller = sellers.find((item) => item.id === sale.sellerId);
    const amounts = calculateSaleAmounts(sale, product);

    summary.total += amounts.total;
    summary.outstanding += amounts.balance;
    summary.count += 1;

    if (product) {
      const current = summary.byProduct.get(product.id) || {
        name: product.name,
        quantity: 0,
        total: 0
      };
      current.quantity += Number(sale.quantity || 0);
      current.total += amounts.total;
      summary.byProduct.set(product.id, current);
    }

    if (seller) {
      const current = summary.bySeller.get(seller.id) || {
        name: seller.name,
        quantity: 0,
        total: 0
      };
      current.quantity += Number(sale.quantity || 0);
      current.total += amounts.total;
      summary.bySeller.set(seller.id, current);
    }

    const dayKey = toISODate(sale.date || todayISO());
    if (dayKey) {
      const current = summary.byDay.get(dayKey) || { total: 0, count: 0 };
      current.total += amounts.total;
      current.count += 1;
      summary.byDay.set(dayKey, current);
    }
  });

  return summary;
}

function pickTopEntry(map) {
  if (!map || map.size === 0) return null;
  return Array.from(map.values()).sort((a, b) => b.total - a.total)[0];
}

function buildGrowthMessage(current, previous) {
  if (previous === 0 && current === 0) return 'Aucune vente enregistrée sur la période.';
  if (previous === 0) return 'Croissance de 100% par rapport à la période précédente.';
  const delta = current - previous;
  const ratio = (delta / previous) * 100;
  if (delta > 0) {
    return `+${ratio.toFixed(1)}% vs période précédente.`;
  }
  if (delta < 0) {
    return `${ratio.toFixed(1)}% vs période précédente.`;
  }
  return 'Performances stables vs période précédente.';
}

export function initAi(context) {
  const highlightsList = document.getElementById('aiHighlights');
  const opportunitiesList = document.getElementById('aiOpportunities');
  const alertsList = document.getElementById('aiAlerts');
  const narrative = document.getElementById('aiNarrative');
  const refreshButton = document.getElementById('refreshInsights');
  const copyButton = document.getElementById('copyAiNarrative');
  const dashboardHighlights = document.getElementById('dashboardAiHighlights');
  const dashboardOpportunities = document.getElementById('dashboardAiOpportunities');
  const dashboardAlerts = document.getElementById('dashboardAiAlerts');
  const dashboardNarrative = document.getElementById('dashboardAiNarrative');

  if (
    !highlightsList &&
    !opportunitiesList &&
    !alertsList &&
    !dashboardHighlights &&
    !dashboardOpportunities &&
    !dashboardAlerts
  ) {
    return {
      render() {}
    };
  }

  function render() {
    const { sales, products, sellers, settings } = context.getData();
    const currency = settings.currency || 'FCFA';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentStart = new Date(today);
    currentStart.setDate(today.getDate() - 6);
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(currentStart.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousEnd.getDate() - 6);

    const currentSales = getSalesInPeriod(sales, currentStart, today);
    const previousSales = getSalesInPeriod(sales, previousStart, previousEnd);

    const currentSummary = summarizeSales(currentSales, products, sellers);
    const previousSummary = summarizeSales(previousSales, products, sellers);
    const lowStockProducts = products
      .filter((product) => Number(product.stock || 0) <= Number(settings.lowStockThreshold || 5))
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));

    const highlights = [];
    const opportunities = [];
    const alerts = [];
    let narrativeText = '';

    if (currentSummary.count === 0) {
      highlights.push('<li class="insight-item">Ajoutez des ventes pour générer des recommandations personnalisées.</li>');
      opportunities.push('<li class="insight-item">Renseignez vos ventes afin que l\'assistant IA identifie les produits phares et les vendeuses performantes.</li>');

      if (lowStockProducts.length) {
        const alertMarkup = lowStockProducts
          .slice(0, 3)
          .map((product) => `<strong>${product.name}</strong> (${formatNumber(product.stock || 0)} restants)`)
          .join('<br />');
        alerts.push(`<li class="insight-item">Stock faible détecté :<br />${alertMarkup}</li>`);
      } else {
        alerts.push('<li class="insight-item">Vos stocks sont stables pour le moment.</li>');
      }

      narrativeText =
        "Enregistrez les ventes de vos boutiques pour obtenir une analyse automatique des performances, des opportunités et des alertes de stock.";
    } else {
      const avgTicket = currentSummary.count ? currentSummary.total / currentSummary.count : 0;
      const dailyAverage = currentSummary.total / 7;
      const growth = buildGrowthMessage(currentSummary.total, previousSummary.total);

      highlights.push(
        `<li class="insight-item"><span>Chiffre d'affaires 7 jours</span><strong>${formatCurrency(
          currentSummary.total,
          currency
        )}</strong><small>${growth}</small></li>`
      );
      highlights.push(
        `<li class="insight-item"><span>Ventes réalisées</span><strong>${formatNumber(
          currentSummary.count
        )}</strong><small>${formatCurrency(dailyAverage, currency)} par jour en moyenne</small></li>`
      );
      highlights.push(
        `<li class="insight-item"><span>Panier moyen</span><strong>${formatCurrency(
          avgTicket,
          currency
        )}</strong><small>${formatNumber(currentSummary.count)} ventes analysées</small></li>`
      );

      const topProduct = pickTopEntry(currentSummary.byProduct);
      if (topProduct) {
        opportunities.push(
          `<li class="insight-item"><strong>${topProduct.name}</strong> génère ${formatCurrency(
            topProduct.total,
            currency
          )}. Proposez un lot ou une remise flash pour prolonger la dynamique.</li>`
        );
      }

      const topSeller = pickTopEntry(currentSummary.bySeller);
      if (topSeller) {
        opportunities.push(
          `<li class="insight-item">${topSeller.name} mène les ventes (${formatCurrency(
            topSeller.total,
            currency
          )}). Partagez ses bonnes pratiques avec l'équipe.</li>`
        );
      }

      if (currentSummary.outstanding > 0) {
        opportunities.push(
          `<li class="insight-item">${formatCurrency(
            currentSummary.outstanding,
            currency
          )} restent à encaisser. Planifiez un suivi clients pour solder les avances.</li>`
        );
      }

      if (previousSummary.total && currentSummary.total < previousSummary.total) {
        const shortfall = previousSummary.total - currentSummary.total;
        opportunities.push(
          `<li class="insight-item">Le chiffre d'affaires est en retrait de ${formatCurrency(
            shortfall,
            currency
          )} vs la semaine précédente. Lancez une action commerciale ciblée.</li>`
        );
      }

      if (lowStockProducts.length) {
        alerts.push(
          `<li class="insight-item">Priorité réassort : ${lowStockProducts
            .slice(0, 3)
            .map((product) => `${product.name} (${formatNumber(product.stock || 0)} restants)`)
            .join(', ')}.</li>`
        );
      } else {
        alerts.push('<li class="insight-item">Aucune alerte de stock critique sur le seuil actuel.</li>');
      }

      const inactiveProducts = products.filter((product) => {
        const soldRecently = currentSales.some((sale) => sale.productId === product.id);
        return !soldRecently;
      });
      if (inactiveProducts.length) {
        alerts.push(
          `<li class="insight-item">${inactiveProducts.length} produit(s) sans vente cette semaine. Pensez à les mettre en avant ou à ajuster le prix.</li>`
        );
      }

      const bestDayEntry = Array.from(currentSummary.byDay.entries())
        .map(([date, values]) => ({ date, total: values.total, count: values.count }))
        .sort((a, b) => b.total - a.total)[0];

      if (bestDayEntry) {
        highlights.push(
          `<li class="insight-item"><span>Jour le plus performant</span><strong>${formatCurrency(
            bestDayEntry.total,
            currency
          )}</strong><small>${new Date(bestDayEntry.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}</small></li>`
        );
      }

      const narrativeParts = [
        `Sur les 7 derniers jours, le chiffre d'affaires atteint ${formatCurrency(
          currentSummary.total,
          currency
        )} pour ${formatNumber(currentSummary.count)} ventes enregistrées.`
      ];

      if (bestDayEntry) {
        narrativeParts.push(
          `La meilleure journée a été ${new Date(bestDayEntry.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })} avec ${formatCurrency(bestDayEntry.total, currency)} encaissés.`
        );
      }

      if (topProduct) {
        narrativeParts.push(
          `${topProduct.name} domine les ventes avec ${formatNumber(topProduct.quantity)} unité(s) vendue(s) représentant ${formatCurrency(
            topProduct.total,
            currency
          )}.`
        );
      }

      if (topSeller) {
        narrativeParts.push(
          `${topSeller.name} réalise la meilleure performance vendeuse avec ${formatCurrency(
            topSeller.total,
            currency
          )} générés.`
        );
      }

      if (currentSummary.outstanding > 0) {
        narrativeParts.push(
          `Il reste ${formatCurrency(currentSummary.outstanding, currency)} d'avances à régulariser auprès de vos clients.`
        );
      }

      if (lowStockProducts.length) {
        narrativeParts.push(
          `Planifiez un réassort rapide pour ${lowStockProducts
            .slice(0, 3)
            .map((product) => product.name)
            .join(', ')} afin d'éviter les ruptures.`
        );
      }

      narrativeText = narrativeParts.join(' ');
    }

    const highlightMarkup = highlights.length
      ? highlights.join('')
      : '<li class="insight-item">Aucune donnée disponible pour cette période.</li>';
    const opportunityMarkup = opportunities.length
      ? opportunities.join('')
      : '<li class="insight-item">Vos ventes sont en progression continue, poursuivez vos actions actuelles.</li>';
    const alertMarkup = alerts.length
      ? alerts.join('')
      : '<li class="insight-item">Aucune alerte urgente détectée. Continuez sur cette lancée !</li>';

    if (highlightsList) {
      highlightsList.innerHTML = highlightMarkup;
    }
    if (opportunitiesList) {
      opportunitiesList.innerHTML = opportunityMarkup;
    }
    if (alertsList) {
      alertsList.innerHTML = alertMarkup;
    }

    if (dashboardHighlights) {
      const preview = highlights.length ? highlights.slice(0, 2).join('') : highlightMarkup;
      dashboardHighlights.innerHTML = preview;
    }
    if (dashboardOpportunities) {
      const preview = opportunities.length ? opportunities.slice(0, 1).join('') : opportunityMarkup;
      dashboardOpportunities.innerHTML = preview;
    }
    if (dashboardAlerts) {
      const preview = alerts.length ? alerts.slice(0, 1).join('') : alertMarkup;
      dashboardAlerts.innerHTML = preview;
    }

    const finalNarrative =
      narrativeText ||
      "Enregistrez les ventes de vos boutiques pour obtenir une analyse automatique des performances, des opportunités et des alertes de stock.";

    if (narrative) {
      narrative.textContent = finalNarrative;
    }

    if (dashboardNarrative) {
      const sentences = finalNarrative.match(/[^.!?]+[.!?]?/g) || [finalNarrative];
      const summary = sentences.slice(0, 2).join(' ').trim() || finalNarrative;
      dashboardNarrative.textContent = summary;
    }
  }

  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      render();
      const originalText = refreshButton.textContent;
      refreshButton.textContent = 'Analyse actualisée';
      refreshButton.disabled = true;
      setTimeout(() => {
        refreshButton.textContent = originalText;
        refreshButton.disabled = false;
      }, 1400);
    });
  }

  function showCopyFeedback(message) {
    if (!copyButton) return;
    const originalText = copyButton.textContent;
    copyButton.textContent = message;
    copyButton.disabled = true;
    setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.disabled = false;
    }, 1800);
  }

  if (copyButton) {
    copyButton.addEventListener('click', async () => {
      const text = narrative?.textContent?.trim();
      if (!text) return;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', 'true');
          textarea.style.position = 'absolute';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        showCopyFeedback('Rapport copié');
      } catch (error) {
        console.error('Copie impossible', error);
        showCopyFeedback('Copie impossible');
      }
    });
  }

  return { render };
}
