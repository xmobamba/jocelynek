// Module Ventes : interface POS, panier et reçus imprimables

(function () {
    const salesProductsList = () => document.getElementById('sales-products');
    let cart = [];
    let chartAnimationFrame = null;
    let chartProgress = 0;

    function renderProductList(filter = '') {
        const list = salesProductsList();
        if (!list) return;
        list.innerHTML = '';
        const products = POSApp.state.products.filter(p =>
            p.name.toLowerCase().includes(filter.toLowerCase()) ||
            p.id.toLowerCase().includes(filter.toLowerCase())
        );
        products.forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${product.name}</strong>
                <span>${POSApp.formatCurrency(product.price)}</span>
                <small>Stock : ${product.stock}</small>
                <button data-id="${product.id}">Ajouter</button>`;
            li.querySelector('button').disabled = product.stock === 0;
            li.querySelector('button').addEventListener('click', () => addToCart(product.id));
            list.appendChild(li);
        });
        if (!products.length) {
            const empty = document.createElement('li');
            empty.textContent = 'Aucun produit disponible.';
            list.appendChild(empty);
        }
    }

    function addToCart(productId) {
        const product = POSApp.state.products.find(p => p.id === productId);
        if (!product || product.stock === 0) return;
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            if (existing.quantity < product.stock) existing.quantity += 1;
        } else {
            cart.push({ id: productId, name: product.name, price: product.price, quantity: 1 });
        }
        renderCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    }

    function changeQuantity(productId, delta) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;
        const product = POSApp.state.products.find(p => p.id === productId);
        const newQty = Math.min(Math.max(1, item.quantity + delta), product.stock);
        item.quantity = newQty;
        renderCart();
    }

    function renderCart() {
        const container = document.getElementById('cart-items');
        container.innerHTML = '';
        if (!cart.length) {
            container.textContent = 'Panier vide.';
            updateCartTotal();
            return;
        }
        cart.forEach(item => {
            const wrapper = document.createElement('div');
            wrapper.className = 'cart-item';
            wrapper.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <small>${POSApp.formatCurrency(item.price)}</small>
                </div>
                <div>
                    <button class="secondary" data-action="minus" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="secondary" data-action="plus" data-id="${item.id}">+</button>
                </div>
                <button class="danger" data-action="remove" data-id="${item.id}">×</button>`;
            container.appendChild(wrapper);
        });
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                if (btn.dataset.action === 'minus') changeQuantity(id, -1);
                if (btn.dataset.action === 'plus') changeQuantity(id, 1);
                if (btn.dataset.action === 'remove') removeFromCart(id);
            });
        });
        updateCartTotal();
    }

    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        document.getElementById('cart-total').textContent = POSApp.formatCurrency(total);
        return total;
    }

    function populateSelectors() {
        const sellerSelect = document.getElementById('sales-seller');
        sellerSelect.innerHTML = '<option value="">Sélectionner vendeur</option>';
        POSApp.state.settings.sellers.forEach(seller => {
            const option = document.createElement('option');
            option.value = seller;
            option.textContent = seller;
            sellerSelect.appendChild(option);
        });
        const clientSelect = document.getElementById('cart-client');
        clientSelect.innerHTML = '<option value="">Client comptant</option>';
        POSApp.state.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.name} (${client.credit} FCFA crédit)`;
            clientSelect.appendChild(option);
        });
    }

    function bindEvents() {
        document.getElementById('sales-search')?.addEventListener('input', e => {
            renderProductList(e.target.value);
        });
        document.getElementById('checkout-btn')?.addEventListener('click', completeSale);
        document.getElementById('print-receipt')?.addEventListener('click', printReceipt);
    }

    function completeSale() {
        if (!cart.length) {
            POSApp.notify('Panier vide.', 'error');
            return;
        }
        const seller = document.getElementById('sales-seller').value || 'Default';
        const payment = document.getElementById('payment-method').value;
        const clientId = document.getElementById('cart-client').value;
        const total = updateCartTotal();
        const taxRate = Number(POSApp.state.settings.tax || 0) / 100;
        const taxAmount = Math.round(total * taxRate);
        const grandTotal = total + taxAmount;
        const sale = {
            id: `VENTE-${Date.now()}`,
            date: new Date().toISOString(),
            seller,
            payment,
            clientId: clientId || null,
            taxAmount,
            total: grandTotal,
            items: cart.map(item => ({ ...item }))
        };
        POSApp.state.sales.push(sale);
        cart.forEach(item => {
            const product = POSApp.state.products.find(p => p.id === item.id);
            if (product) product.stock -= item.quantity;
        });
        if (payment === 'credit' && clientId) {
            const client = POSApp.state.clients.find(c => c.id === clientId);
            if (client) {
                client.credit += grandTotal;
                client.history.push({
                    saleId: sale.id,
                    amount: grandTotal,
                    date: sale.date
                });
            }
        }
        POSApp.state.finances.push({
            id: sale.id,
            type: 'income',
            amount: grandTotal,
            category: 'Vente',
            date: sale.date,
            notes: `${payment} - ${seller}`
        });
        persistState();
        appendActivity(`Vente ${sale.id} ${POSApp.formatCurrency(grandTotal)}`);
        POSApp.notify('Vente enregistrée', 'success');
        cart = [];
        renderCart();
        renderProductList(document.getElementById('sales-search').value || '');
        populateSelectors();
        renderSalesHistory();
        POSApp.refresh();
    }

    function renderSalesHistory() {
        const history = document.getElementById('sales-history');
        history.innerHTML = '';
        const sales = POSApp.state.sales.slice(-5).reverse();
        if (!sales.length) {
            history.innerHTML = '<li>Aucune vente récente.</li>';
            return;
        }
        sales.forEach(sale => {
            const li = document.createElement('li');
            const date = new Date(sale.date).toLocaleString('fr-FR');
            li.textContent = `${date} - ${POSApp.formatCurrency(sale.total)} (${sale.payment})`;
            history.appendChild(li);
        });
    }

    function appendActivity(message) {
        const feed = document.getElementById('activity-feed');
        const item = document.createElement('li');
        item.textContent = `${new Date().toLocaleTimeString('fr-FR')} · ${message}`;
        feed.prepend(item);
        while (feed.children.length > 6) feed.removeChild(feed.lastChild);
    }

    function updateDashboardMetrics() {
        const today = new Date().toISOString().slice(0, 10);
        const salesToday = POSApp.state.sales.filter(s => s.date.slice(0, 10) === today);
        const totalToday = salesToday.reduce((sum, sale) => sum + sale.total, 0);
        document.getElementById('daily-sales').textContent = POSApp.formatCurrency(totalToday);
        document.getElementById('daily-sales-count').textContent = `${salesToday.length} vente(s)`;
        const month = new Date().toISOString().slice(0, 7);
        const monthSales = POSApp.state.sales.filter(s => s.date.slice(0, 7) === month);
        const revenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);
        const cost = monthSales.reduce((sum, sale) => {
            return sum + sale.items.reduce((acc, item) => {
                const product = POSApp.state.products.find(p => p.id === item.id);
                return acc + (product?.cost || 0) * item.quantity;
            }, 0);
        }, 0);
        document.getElementById('net-profit').textContent = POSApp.formatCurrency(revenue - cost);
    }

    function renderChart() {
        const canvas = document.getElementById('sales-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const days = [...Array(7).keys()].map(i => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const iso = date.toISOString().slice(0, 10);
            const total = POSApp.state.sales
                .filter(s => s.date.slice(0, 10) === iso)
                .reduce((sum, sale) => sum + sale.total, 0);
            return { date, total };
        });
        const max = Math.max(...days.map(d => d.total), 1);
        const chartHeight = canvas.height - 40;
        const barWidth = (canvas.width - 60) / days.length;
        if (chartAnimationFrame) cancelAnimationFrame(chartAnimationFrame);
        chartProgress = 0;

        const drawGrid = () => {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.lineWidth = 1;
            const steps = 4;
            for (let i = 0; i <= steps; i++) {
                const y = canvas.height - 20 - (chartHeight / steps) * i;
                ctx.beginPath();
                ctx.moveTo(40, y);
                ctx.lineTo(canvas.width - 10, y);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.moveTo(40, 20);
            ctx.lineTo(40, canvas.height - 20);
            ctx.lineTo(canvas.width - 10, canvas.height - 20);
            ctx.stroke();
        };

        const animate = () => {
            chartProgress = Math.min(chartProgress + 0.08, 1);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid();
            ctx.textBaseline = 'alphabetic';
            days.forEach((day, index) => {
                const label = day.date.toLocaleDateString('fr-FR', { weekday: 'short' });
                const x = 40 + index * barWidth;
                const barHeight = (day.total / max) * chartHeight * chartProgress;
                const barX = x + 6;
                const barY = canvas.height - 20 - barHeight;
                const barWidthAdjusted = Math.max(barWidth - 22, 12);
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(barX, barY, barWidthAdjusted, barHeight);
                ctx.fillStyle = '#6b6b6b';
                ctx.font = '12px Inter, sans-serif';
                ctx.fillText(label, barX, canvas.height - 6);
                if (day.total > 0) {
                    const valueY = barY - 8;
                    ctx.fillStyle = barHeight > 24 ? '#ffffff' : '#1a1a1a';
                    ctx.font = '11px Inter, sans-serif';
                    ctx.fillText(POSApp.formatCurrency(day.total), barX, Math.max(valueY, 16));
                }
            });
            if (chartProgress < 1) {
                chartAnimationFrame = requestAnimationFrame(animate);
            }
        };

        animate();
    }

    function printReceipt() {
        const total = updateCartTotal();
        if (!cart.length && !POSApp.state.sales.length) {
            POSApp.notify('Rien à imprimer.', 'error');
            return;
        }
        const lastSale = POSApp.state.sales.slice(-1)[0];
        const items = lastSale ? lastSale.items : cart;
        const amount = lastSale ? lastSale.total : total;
        const html = `
        <div class="receipt">
            <h2>${POSApp.state.settings.storeName}</h2>
            <table>
                <thead><tr><th>Article</th><th>Qté</th><th>Total</th></tr></thead>
                <tbody>
                ${items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${POSApp.formatCurrency(item.price * item.quantity)}</td></tr>`).join('')}
                </tbody>
            </table>
            <p style="text-align:right;font-weight:700;">Total: ${POSApp.formatCurrency(amount)}</p>
            <p style="text-align:center;">Merci pour votre achat !</p>
        </div>`;
        document.getElementById('print-area')?.remove();
        const printArea = document.createElement('div');
        printArea.id = 'print-area';
        printArea.innerHTML = html;
        document.body.appendChild(printArea);
        window.print();
        setTimeout(() => printArea.remove(), 500);
    }

    document.getElementById('refresh-chart')?.addEventListener('click', renderChart);

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || detail.section === 'sales' || detail.section === 'dashboard') {
            renderProductList(document.getElementById('sales-search')?.value || '');
            populateSelectors();
            renderSalesHistory();
            updateDashboardMetrics();
            renderChart();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
        populateSelectors();
        renderProductList();
        renderSalesHistory();
        updateDashboardMetrics();
        renderChart();
    });
})();
