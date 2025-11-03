// Module Résumé intelligent : synthèse automatique des indicateurs clés

(function () {
    const overviewEl = () => document.getElementById('insights-overview');
    const listEl = () => document.getElementById('insights-list');
    const refreshButton = () => document.getElementById('refresh-insights');

    function plural(count, singular = '', pluralSuffix = 's') {
        return count > 1 ? pluralSuffix : singular;
    }

    function formatPieces(count) {
        return `${count} pièce${plural(count)}`;
    }

    function sumAssignedByProduct() {
        const map = new Map();
        (POSApp.state.sellers || []).forEach(seller => {
            (seller.assignments || []).forEach(item => {
                const qty = Number(item.quantity) || 0;
                if (!map.has(item.productId)) {
                    map.set(item.productId, 0);
                }
                map.set(item.productId, map.get(item.productId) + qty);
            });
        });
        return map;
    }

    function computeHighlights(now) {
        const todayIso = now.toISOString().slice(0, 10);
        const monthIso = now.toISOString().slice(0, 7);
        const products = POSApp.state.products || [];
        const sales = POSApp.state.sales || [];
        const sellers = POSApp.state.sellers || [];
        const finances = POSApp.state.finances || [];

        const lowStock = products.filter(product => (Number(product.stock) || 0) <= 3).length;
        const stockBoutique = products.reduce((sum, product) => sum + (Number(product.stock) || 0), 0);
        const assignedMap = sumAssignedByProduct();
        const assignedTotal = Array.from(assignedMap.values()).reduce((sum, qty) => sum + qty, 0);
        const consignedValue = Array.from(assignedMap.entries()).reduce((total, [productId, qty]) => {
            const product = products.find(p => p.id === productId);
            return total + ((product?.price || 0) * qty);
        }, 0);
        const inventoryValueBoutique = products.reduce((sum, product) => {
            return sum + ((product?.price || 0) * (Number(product.stock) || 0));
        }, 0);

        const salesToday = sales.filter(sale => (sale.date || '').slice(0, 10) === todayIso);
        const salesTodayTotal = salesToday.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
        const salesMonth = sales.filter(sale => (sale.date || '').slice(0, 7) === monthIso);
        const salesMonthTotal = salesMonth.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);

        const sellerTotals = salesMonth.reduce((acc, sale) => {
            const label = sale.seller || 'Boutique';
            acc[label] = (acc[label] || 0) + (Number(sale.total) || 0);
            return acc;
        }, {});
        const topSeller = Object.entries(sellerTotals).sort((a, b) => b[1] - a[1])[0];

        let expensesMonth = 0;
        let incomeMonth = 0;
        finances.forEach(entry => {
            if ((entry.date || '').slice(0, 7) !== monthIso) return;
            if (entry.type === 'expense') expensesMonth += Number(entry.amount) || 0;
            if (entry.type === 'income') incomeMonth += Number(entry.amount) || 0;
        });

        return {
            lowStock,
            stockBoutique,
            assignedTotal,
            consignedValue,
            inventoryValue: inventoryValueBoutique + consignedValue,
            totalProducts: products.length,
            salesTodayCount: salesToday.length,
            salesTodayTotal,
            salesMonthCount: salesMonth.length,
            salesMonthTotal,
            sellersCount: sellers.length,
            topSeller,
            incomeMonth,
            expensesMonth
        };
    }

    function buildOverview(now, highlights) {
        const parts = [];
        if (highlights.salesMonthTotal > 0) {
            parts.push(`Le chiffre d'affaires du mois atteint ${POSApp.formatCurrency(highlights.salesMonthTotal)}.`);
        }
        if (highlights.topSeller) {
            const [name, amount] = highlights.topSeller;
            parts.push(`${name} mène les ventes avec ${POSApp.formatCurrency(amount)}.`);
        }
        if (highlights.lowStock > 0) {
            parts.push(`${highlights.lowStock} référence${plural(highlights.lowStock)} demandent un réassort.`);
        }
        if (highlights.assignedTotal > 0) {
            parts.push(`Les vendeuses ont ${formatPieces(highlights.assignedTotal)} en circulation.`);
        }
        if (!parts.length) {
            parts.push('Ajoutez vos premières données pour générer une synthèse automatique de votre activité.');
        }
        return `Résumé du ${now.toLocaleDateString('fr-FR')} · ${parts.join(' ')}`;
    }

    function buildLines(now, highlights) {
        const lines = [];
        if (highlights.totalProducts === 0) {
            lines.push("Inventaire : aucun produit enregistré pour le moment.");
        } else {
            const totalPieces = highlights.stockBoutique + highlights.assignedTotal;
            let line = `Inventaire : ${highlights.totalProducts} référence${plural(highlights.totalProducts)} pour ${formatPieces(totalPieces)} (${POSApp.formatCurrency(highlights.inventoryValue)}).`;
            if (highlights.lowStock > 0) {
                line += ` ${highlights.lowStock} alerte${plural(highlights.lowStock)} stock à traiter.`;
            }
            lines.push(line);
        }

        if (highlights.salesMonthCount === 0) {
            lines.push('Ventes : aucune vente enregistrée ce mois.');
        } else {
            let line = `Ventes : ${highlights.salesMonthCount} vente${plural(highlights.salesMonthCount)} ce mois pour ${POSApp.formatCurrency(highlights.salesMonthTotal)}.`;
            if (highlights.salesTodayCount > 0) {
                line += ` Dont ${highlights.salesTodayCount} aujourd'hui (${POSApp.formatCurrency(highlights.salesTodayTotal)}).`;
            }
            lines.push(line);
        }

        if (highlights.sellersCount === 0) {
            lines.push('Vendeuses : aucune collaboratrice suivie.');
        } else {
            let line = `Vendeuses : ${highlights.sellersCount} collaboratrice${plural(highlights.sellersCount, '', 's')} actives.`;
            if (highlights.assignedTotal > 0) {
                line += ` ${formatPieces(highlights.assignedTotal)} confiée${plural(highlights.assignedTotal)} (${POSApp.formatCurrency(highlights.consignedValue)}).`;
            } else {
                line += ' Aucun stock confié pour le moment.';
            }
            lines.push(line);
        }

        if (highlights.incomeMonth === 0 && highlights.expensesMonth === 0) {
            lines.push('Finances : aucun mouvement enregistré pour le mois en cours.');
        } else {
            const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long' });
            const monthDisplay = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
            lines.push(`Finances : recettes ${POSApp.formatCurrency(highlights.incomeMonth)}, dépenses ${POSApp.formatCurrency(highlights.expensesMonth)}, solde ${POSApp.formatCurrency(highlights.incomeMonth - highlights.expensesMonth)} pour ${monthDisplay}.`);
        }

        return lines;
    }

    function renderInsights() {
        const overview = overviewEl();
        const list = listEl();
        if (!overview || !list) return;
        const now = new Date();
        const highlights = computeHighlights(now);
        overview.textContent = buildOverview(now, highlights);
        list.innerHTML = '';
        buildLines(now, highlights).forEach(text => {
            const item = document.createElement('li');
            item.textContent = text;
            list.appendChild(item);
        });
    }

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || detail.section === 'dashboard') {
            renderInsights();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        refreshButton()?.addEventListener('click', () => {
            renderInsights();
            POSApp.notify('Résumé actualisé', 'info');
        });
        renderInsights();
    });
})();
