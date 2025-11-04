const DocumentsModule = (function () {
    let currentFilter = '';
    let activeSaleId = null;
    let activeDocType = 'invoice';

    function normalizeSale(rawSale) {
        if (!rawSale) return null;
        const base = { ...rawSale };
        const items = Array.isArray(base.items) && base.items.length
            ? base.items
            : [{
                productName: base.productName,
                productRef: base.productRef,
                quantity: base.quantity,
                unitPrice: base.unitPrice,
                total: base.totalAmount
            }];

        const normalizedItems = items
            .filter(item => item)
            .map((item, index) => {
                const quantity = Number(item.quantity) || 0;
                const unitPrice = Number(item.unitPrice) || 0;
                const total = typeof item.total === 'number' ? item.total : quantity * unitPrice;
                return {
                    id: item.id || `${base.id}-${index}`,
                    productName: item.productName || `Article ${index + 1}`,
                    productRef: item.productRef || '',
                    quantity,
                    unitPrice,
                    total
                };
            });

        const totalAmount = normalizedItems.reduce((sum, item) => sum + item.total, 0);
        const totalQuantity = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

        return {
            ...base,
            items: normalizedItems,
            totalAmount: typeof base.totalAmount === 'number' ? base.totalAmount : totalAmount,
            totalQuantity,
            advance: Number(base.advance) || 0,
            balance: Number(base.balance) || 0
        };
    }

    function getSales() {
        const data = POSApp.getData();
        return data.sales
            .map(normalizeSale)
            .filter(Boolean)
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }

    function formatSaleTitle(sale) {
        const date = sale.date || 'Date inconnue';
        const name = sale.client ? sale.client : 'Client inconnu';
        const summary = sale.items.map(item => `${item.productName} (x${item.quantity})`).join(', ');
        return `${date} • ${name} • ${POSApp.formatCurrency(sale.totalAmount)} — ${summary}`;
    }

    function renderSalesList() {
        const list = document.getElementById('documents-sales-list');
        if (!list) return;
        const sales = getSales();
        const filtered = currentFilter
            ? sales.filter(sale => formatSaleTitle(sale).toLowerCase().includes(currentFilter.toLowerCase()))
            : sales;

        if (!filtered.length) {
            list.innerHTML = '<li class="placeholder">Aucune vente enregistrée pour le moment.</li>';
            activeSaleId = null;
            renderPreview();
            return;
        }

        if (!activeSaleId || !filtered.some(sale => String(sale.id) === String(activeSaleId))) {
            activeSaleId = filtered[0].id;
        }

        list.innerHTML = filtered
            .map(sale => `
                <li>
                    <button type="button" class="document-item ${String(sale.id) === String(activeSaleId) ? 'active' : ''}" data-sale="${sale.id}">
                        <span class="document-item-title">${sale.client || 'Client inconnu'}</span>
                        <span class="document-item-meta">${sale.date || 'Date inconnue'} • ${POSApp.formatCurrency(sale.totalAmount)}</span>
                        <span class="document-item-summary">${sale.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}</span>
                    </button>
                </li>
            `)
            .join('');
    }

    function buildInvoice(sale) {
        const data = POSApp.getData();
        const logo = data.settings.logo || POSApp.DEFAULT_LOGO;
        const boutique = data.settings.boutiques.find(b => b.id === sale.boutique);
        const boutiqueLabel = boutique ? boutique.name : (sale.boutiqueLabel || sale.boutique);
        return `
            <article class="document invoice">
                <header>
                    <img src="${logo}" alt="Logo boutique" />
                    <div>
                        <h2>Facture</h2>
                        <p>${boutiqueLabel || 'Boutique Jocelyne K'}</p>
                    </div>
                </header>
                <section class="document-meta">
                    <p><strong>Date :</strong> ${sale.date}</p>
                    <p><strong>Client :</strong> ${sale.client || '—'}</p>
                    <p><strong>Vendeur :</strong> ${sale.sellerName || '—'}</p>
                    <p><strong>Paiement :</strong> ${sale.paymentMethod || '—'}</p>
                </section>
                <table class="document-table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Réf.</th>
                            <th>Qté</th>
                            <th>Prix unitaire</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.productRef || '—'}</td>
                                <td>${item.quantity}</td>
                                <td>${POSApp.formatCurrency(item.unitPrice)}</td>
                                <td>${POSApp.formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <section class="document-summary">
                    <p><strong>Total :</strong> ${POSApp.formatCurrency(sale.totalAmount)}</p>
                    <p><strong>Avance :</strong> ${POSApp.formatCurrency(sale.advance)}</p>
                    <p><strong>Reste dû :</strong> ${POSApp.formatCurrency(sale.balance)}</p>
                </section>
                <footer>
                    <p>Merci pour votre confiance. À bientôt dans nos boutiques !</p>
                </footer>
            </article>
        `;
    }

    function buildDeliveryLabel(sale) {
        const boutique = POSApp.getData().settings.boutiques.find(b => b.id === sale.boutique);
        const boutiqueLabel = boutique ? boutique.name : (sale.boutiqueLabel || sale.boutique);
        return `
            <article class="document delivery">
                <header>
                    <div>
                        <h2>Étiquette de livraison</h2>
                        <p>${boutiqueLabel || 'Boutique Jocelyne K'}</p>
                    </div>
                </header>
                <section class="document-meta">
                    <p><strong>Date :</strong> ${sale.date}</p>
                    <p><strong>Client :</strong> ${sale.client || '—'}</p>
                    <p><strong>Vendeur :</strong> ${sale.sellerName || '—'}</p>
                    <p><strong>Mode :</strong> ${sale.paymentMethod || '—'}</p>
                </section>
                <section class="document-items">
                    <h3>Articles à livrer</h3>
                    <ul>
                        ${sale.items.map(item => `<li>${item.productName} — ${item.quantity} pièce(s)</li>`).join('')}
                    </ul>
                </section>
                <section class="document-summary">
                    <p><strong>Total colis :</strong> ${sale.items.length} article(s)</p>
                    <p><strong>Quantité totale :</strong> ${sale.totalQuantity}</p>
                </section>
                <footer>
                    <p>Signature client : _________________________</p>
                </footer>
            </article>
        `;
    }

    function renderPreview() {
        const container = document.getElementById('document-preview');
        const printBtn = document.getElementById('print-document');
        if (!container || !printBtn) return;

        if (!activeSaleId) {
            container.innerHTML = '<p class="placeholder">Aucune vente sélectionnée.</p>';
            printBtn.disabled = true;
            return;
        }

        const sale = getSales().find(item => String(item.id) === String(activeSaleId));
        if (!sale) {
            container.innerHTML = '<p class="placeholder">Vente introuvable.</p>';
            printBtn.disabled = true;
            return;
        }

        container.innerHTML = activeDocType === 'delivery' ? buildDeliveryLabel(sale) : buildInvoice(sale);
        printBtn.disabled = false;
    }

    function attachEvents() {
        const list = document.getElementById('documents-sales-list');
        const searchInput = document.getElementById('search-documents');
        const tabs = document.querySelectorAll('.document-tabs .tab-button');
        const printBtn = document.getElementById('print-document');

        list?.addEventListener('click', event => {
            const button = event.target.closest('[data-sale]');
            if (!button) return;
            activeSaleId = button.dataset.sale;
            renderSalesList();
            renderPreview();
        });

        searchInput?.addEventListener('input', () => {
            currentFilter = searchInput.value;
            renderSalesList();
            renderPreview();
        });

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(btn => btn.classList.remove('active'));
                tab.classList.add('active');
                activeDocType = tab.dataset.doc;
                renderPreview();
            });
        });

        printBtn?.addEventListener('click', () => {
            if (printBtn.disabled) return;
            const preview = document.getElementById('document-preview');
            if (!preview) return;
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            printWindow.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Document</title><style>${getPrintStyles()}</style></head><body>${preview.innerHTML}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        });
    }

    function getPrintStyles() {
        return `
            body { font-family: 'Inter', 'Poppins', sans-serif; color: #222; margin: 32px; }
            .document { max-width: 720px; margin: 0 auto; }
            header { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #ff7a00; padding-bottom: 12px; margin-bottom: 24px; }
            header img { height: 64px; }
            h2 { margin: 0; color: #009739; }
            .document-meta p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e0e0e0; padding: 8px; text-align: left; }
            th { background: #f8f8f8; }
            .document-summary p { margin: 6px 0; font-weight: 600; }
            footer { margin-top: 24px; text-align: center; color: #555; }
            ul { padding-left: 20px; }
        `;
    }

    function init() {
        renderSalesList();
        renderPreview();
        attachEvents();
        POSApp.eventTarget.addEventListener('pos-data-updated', () => {
            renderSalesList();
            renderPreview();
        });
    }

    return { init };
})();
