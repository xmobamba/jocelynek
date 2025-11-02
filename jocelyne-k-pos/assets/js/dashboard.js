/**
 * Dashboard module initialisation.
 * Sets up charts placeholders and simple assistant logic.
 */

(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const { STORAGE_KEYS, getData, formatCurrency } = window.JKPOS;
        const sales = getData(STORAGE_KEYS.sales, []);
        const products = getData(STORAGE_KEYS.products, []);

        const salesTodayEl = document.getElementById('salesToday');
        const advancesWeekEl = document.getElementById('advancesWeek');
        const lowStockCountEl = document.getElementById('lowStockCount');
        const topProductEl = document.getElementById('topProduct');

        const today = new Date().toISOString().slice(0, 10);
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const salesToday = sales.filter((sale) => sale.date === today)
            .reduce((total, sale) => total + (sale.total || 0), 0);

        const advancesWeek = sales.filter((sale) => new Date(sale.date) >= startOfWeek)
            .reduce((total, sale) => total + (sale.advance || 0), 0);

        const lowStockCount = products.filter((product) => (product.quantity || 0) < 5).length;

        const topProduct = sales.reduce((acc, sale) => {
            const item = Array.isArray(sale.items) ? sale.items[0] : sale;
            if (!item?.productId) return acc;
            acc[item.productId] = (acc[item.productId] || 0) + (item.quantity || sale.quantity || 0);
            return acc;
        }, {});

        const topProductId = Object.entries(topProduct).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topProductName = products.find((product) => product.id === topProductId)?.name || '-';

        if (salesTodayEl) salesTodayEl.textContent = formatCurrency(salesToday);
        if (advancesWeekEl) advancesWeekEl.textContent = formatCurrency(advancesWeek);
        if (lowStockCountEl) lowStockCountEl.textContent = lowStockCount.toString();
        if (topProductEl) topProductEl.textContent = topProductName;

        renderCharts(products, sales);
        initAssistant({ sales, products, salesToday, advancesWeek, lowStockCount, topProductName });
    });

    function renderCharts(products, sales) {
        const salesChartEl = document.getElementById('salesChart');
        const inventoryChartEl = document.getElementById('inventoryChart');

        if (salesChartEl) {
            const dates = sales.slice(-7).map((sale) => sale.date);
            const totals = sales.slice(-7).map((sale) => sale.total || 0);

            new Chart(salesChartEl, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Ventes',
                        data: totals,
                        borderColor: '#ff7a00',
                        backgroundColor: 'rgba(255, 122, 0, 0.2)',
                        tension: 0.4,
                        fill: true
                    }]
                }
            });
        }

        if (inventoryChartEl) {
            const categories = {};
            products.forEach((product) => {
                categories[product.category] = (categories[product.category] || 0) + (product.quantity || 0);
            });

            new Chart(inventoryChartEl, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        label: 'Stock',
                        data: Object.values(categories),
                        backgroundColor: ['#ff7a00', '#34c759', '#ffd166', '#a855f7']
                    }]
                }
            });
        }
    }

    function initAssistant(context) {
        const messagesContainer = document.getElementById('assistantMessages');
        const form = document.getElementById('assistantForm');
        const input = document.getElementById('assistantInput');

        if (!form || !messagesContainer || !input) return;

        addMessage('Bonjour ! Posez-moi une question sur vos ventes ou votre stock.', 'bot');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const question = input.value.trim();
            if (!question) return;

            addMessage(question, 'user');
            const answer = getAssistantAnswer(question.toLowerCase(), context);
            addMessage(answer, 'bot');
            input.value = '';
        });

        function addMessage(content, type) {
            const message = document.createElement('div');
            message.className = `assistant__message assistant__message--${type}`;
            message.textContent = content;
            messagesContainer.appendChild(message);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    function getAssistantAnswer(question, context) {
        if (question.includes('combien') && question.includes('ventes')) {
            return `Il y a ${context.salesToday ? context.salesToday.toLocaleString('fr-FR') : '0'} FCFA de ventes aujourd'hui.`;
        }
        if (question.includes('presque') && question.includes('épuisés')) {
            return context.lowStockCount > 0
                ? `Vous avez ${context.lowStockCount} produits en alerte stock.`
                : 'Aucun produit en alerte stock pour le moment.';
        }
        if (question.includes('total') && question.includes('avances')) {
            return `Le total des avances cette semaine est de ${context.advancesWeek ? context.advancesWeek.toLocaleString('fr-FR') : '0'} FCFA.`;
        }
        return "Je n'ai pas encore la réponse à cette question, mais je m'améliore chaque jour !";
    }
})();
