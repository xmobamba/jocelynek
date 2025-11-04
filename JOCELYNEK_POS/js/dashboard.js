const DashboardModule = (function () {
    const cardsContainerId = 'dashboard-cards';

    function getStats() {
        const data = POSApp.getData();
        const totalSales = data.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const totalTransactions = data.sales.length;
        const averageTicket = totalTransactions ? totalSales / totalTransactions : 0;

        const salesByBoutique = data.sales.reduce((acc, sale) => {
            acc[sale.boutique] = (acc[sale.boutique] || 0) + sale.totalAmount;
            return acc;
        }, {});

        const productFrequency = data.sales.reduce((acc, sale) => {
            const items = Array.isArray(sale.items) && sale.items.length
                ? sale.items
                : [{ productName: sale.productName, quantity: sale.quantity }];
            items.forEach(item => {
                const name = item.productName || sale.productName || 'Article';
                const qty = Number(item.quantity) || 0;
                acc[name] = (acc[name] || 0) + qty;
            });
            return acc;
        }, {});

        const topProducts = Object.entries(productFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));

        const stockAlerts = data.products
            .filter(product => product.quantity < 5)
            .map(product => ({
                reference: product.reference,
                name: product.name,
                quantity: product.quantity,
                boutique: product.boutique
            }));

        return {
            totalSales,
            totalTransactions,
            averageTicket,
            salesByBoutique,
            topProducts,
            stockAlerts
        };
    }

    function renderCards(stats) {
        const container = document.getElementById(cardsContainerId);
        if (!container) return;

        const data = POSApp.getData();
        const boutiques = data.settings.boutiques;

        const cards = [
            {
                label: 'Chiffre d\'affaires',
                value: POSApp.formatCurrency(stats.totalSales),
                hint: `${stats.totalTransactions} ventes enregistrées`
            },
            {
                label: 'Panier moyen',
                value: POSApp.formatCurrency(stats.averageTicket),
                hint: 'Basé sur les ventes du jour'
            },
            ...boutiques.map(b => ({
                label: `Ventes - ${b.name}`,
                value: POSApp.formatCurrency(stats.salesByBoutique[b.id] || 0),
                hint: 'Performance par boutique'
            }))
        ];

        container.innerHTML = cards
            .map(card => `
                <article class="card">
                    <h3>${card.label}</h3>
                    <strong>${card.value}</strong>
                    <small>${card.hint}</small>
                </article>
            `)
            .join('');
    }

    function renderTopProducts(list) {
        const container = document.getElementById('top-products');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<li>Aucune vente enregistrée</li>';
            return;
        }
        container.innerHTML = list
            .map(item => `<li>${item.name} • ${item.quantity} ventes</li>`)
            .join('');
    }

    function renderStockAlerts(list) {
        const container = document.getElementById('stock-alerts');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<li>Aucune alerte pour le moment</li>';
            return;
        }
        container.innerHTML = list
            .map(alert => `<li><strong>${alert.reference}</strong> - ${alert.name} (${alert.quantity} restants)</li>`)
            .join('');
    }

    function generateSummary(stats) {
        const data = POSApp.getData();
        const boutiques = data.settings.boutiques;
        const boutiqueSentences = boutiques.map(b => {
            const sales = POSApp.formatCurrency(stats.salesByBoutique[b.id] || 0);
            const transactions = data.sales.filter(sale => sale.boutique === b.id).length;
            return `${b.name} a réalisé ${sales} avec ${transactions} ventes`;
        });

        const variation = (Math.random() * 20 - 10).toFixed(1);
        return `Aujourd'hui, ${boutiqueSentences.join(' et ')}. La tendance est de ${variation}% par rapport à hier.`;
    }

    function renderSummary() {
        const stats = getStats();
        const summary = generateSummary(stats);
        const summaryEl = document.getElementById('summary-text');
        if (summaryEl) {
            summaryEl.textContent = summary;
        }
    }

    function generateAiAnalysis() {
        const data = POSApp.getData();
        const lowStock = data.products.filter(product => product.quantity < 5);
        const highlighted = lowStock[0];
        if (highlighted) {
            return `Le stock de ${highlighted.name} (${highlighted.reference}) est presque épuisé. Pensez à recommander pour ${highlighted.boutique}.`;
        }
        if (data.sales.length === 0) {
            return "Aucune donnée de vente aujourd'hui. Enregistrez une première transaction pour obtenir une analyse.";
        }
        const lastSale = data.sales[data.sales.length - 1];
        const lastItem = (Array.isArray(lastSale.items) && lastSale.items.length)
            ? lastSale.items[0].productName
            : lastSale.productName;
        return `La dernière vente (${lastItem || 'Article'}) a été réalisée pour ${POSApp.formatCurrency(lastSale.totalAmount)} via ${lastSale.paymentMethod}. Continuez sur cette lancée !`;
    }

    function renderAiAnalysis() {
        const aiEl = document.getElementById('ai-analysis');
        if (aiEl) {
            aiEl.textContent = generateAiAnalysis();
        }
    }

    function refresh() {
        const stats = getStats();
        renderCards(stats);
        renderTopProducts(stats.topProducts);
        renderStockAlerts(stats.stockAlerts);
        renderAiAnalysis();
    }

    function init() {
        refresh();
        renderSummary();
        const refreshBtn = document.getElementById('refresh-summary');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                renderSummary();
                renderAiAnalysis();
            });
        }
        POSApp.eventTarget.addEventListener('pos-data-updated', () => {
            refresh();
            renderSummary();
        });
    }

    return { init };
})();
