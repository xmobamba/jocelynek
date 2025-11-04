// Module Documents : génération des factures et étiquettes de livraison

(function () {
    let selectedSaleId = null;
    let activeDocument = 'invoice';
    let currentFilter = '';

    const selectors = {
        salesList: () => document.getElementById('documents-sales'),
        searchInput: () => document.getElementById('documents-search'),
        preview: () => document.getElementById('document-preview'),
        printButton: () => document.getElementById('print-document'),
        tabButtons: () => Array.from(document.querySelectorAll('.document-tabs .tab-button'))
    };

    function getSaleById(id) {
        if (!id) return null;
        return POSApp.state.sales.find(sale => sale.id === id) || null;
    }

    function formatDateTime(isoString) {
        if (!isoString) return 'Date inconnue';
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) return isoString;
        return date.toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatPayment(method) {
        if (!method) return 'Non spécifié';
        const label = String(method).toLowerCase();
        const dictionary = {
            cash: 'Espèces',
            'espèces': 'Espèces',
            mobile: 'Mobile Money',
            'mobile money': 'Mobile Money',
            credit: 'Crédit',
            cheque: 'Chèque',
            chèque: 'Chèque',
            avance: 'Avance',
            'avance + solde': 'Avance + Solde'
        };
        return dictionary[label] || method;
    }

    function renderSalesList(filter = currentFilter) {
        const list = selectors.salesList();
        if (!list) return;
        currentFilter = filter;
        const sales = [...POSApp.state.sales].sort((a, b) => new Date(b.date) - new Date(a.date));
        const query = filter.trim().toLowerCase();
        const filtered = query
            ? sales.filter(sale => {
                const items = Array.isArray(sale.items) ? sale.items : [];
                const haystack = [
                    sale.id,
                    sale.seller,
                    sale.customer,
                    sale.payment,
                    ...items.map(item => `${item.name} ${item.id}`)
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(query);
            })
            : sales;

        list.innerHTML = '';

        if (!filtered.length) {
            selectedSaleId = null;
            list.innerHTML = `
                <li class="empty-state mini">
                    <span class="empty-icon" aria-hidden="true">📂</span>
                    <div>
                        <span class="empty-title">Aucune vente trouvée.</span>
                        <span class="empty-subtitle">Enregistrez une vente ou modifiez la recherche.</span>
                    </div>
                </li>`;
            renderDocumentPreview();
            return;
        }

        if (!selectedSaleId || !filtered.some(sale => sale.id === selectedSaleId)) {
            selectedSaleId = filtered[0].id;
        }

        filtered.forEach(sale => {
            const li = document.createElement('li');
            li.className = 'document-sale';
            li.dataset.id = sale.id;
            const saleDate = formatDateTime(sale.date);
            const total = POSApp.formatCurrency(sale.total ?? 0);
            const customer = sale.customer || 'Client boutique';
            const seller = sale.seller || 'Boutique';
            const items = Array.isArray(sale.items) ? sale.items : [];
            li.innerHTML = `
                <div class="document-sale-header">
                    <strong>${saleDate}</strong>
                    <span>${items.length} article(s)</span>
                </div>
                <div class="document-sale-meta">
                    <span>${total}</span>
                    <span>${formatPayment(sale.payment)}</span>
                    <span>${customer} · ${seller}</span>
                </div>`;
            li.addEventListener('click', () => {
                if (selectedSaleId === sale.id) return;
                selectSale(sale.id);
            });
            list.appendChild(li);
        });

        updateActiveSale();
        renderDocumentPreview();
    }

    function updateActiveSale() {
        const list = selectors.salesList();
        if (!list) return;
        list.querySelectorAll('.document-sale').forEach(item => {
            item.classList.toggle('active', item.dataset.id === selectedSaleId);
        });
    }

    function selectSale(id) {
        selectedSaleId = id;
        updateActiveSale();
        renderDocumentPreview();
    }

    function buildInvoiceDocument(sale) {
        const storeName = POSApp.state.settings.storeName || 'JOCELYNE K POS SYSTEM';
        const items = Array.isArray(sale.items) ? sale.items : [];
        const subtotal = Math.max((sale.total ?? 0) - (sale.taxAmount ?? 0), 0);
        const tax = sale.taxAmount ?? 0;
        const total = sale.total ?? items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const customer = sale.customer || 'Client boutique';
        const seller = sale.seller || 'Boutique';
        const payment = formatPayment(sale.payment);
        return `
            <article class="document invoice-document" data-document="invoice">
                <header class="document-header">
                    <div>
                        <h3>${storeName}</h3>
                        <p>Facture · ${sale.id}</p>
                    </div>
                    <div class="document-meta">
                        <span>${formatDateTime(sale.date)}</span>
                        <span>Client : ${customer}</span>
                        <span>Vendeur : ${seller}</span>
                    </div>
                </header>
                <section class="document-body">
                    <table class="document-table">
                        <thead>
                            <tr>
                                <th>Article</th>
                                <th>Qté</th>
                                <th>Prix unitaire</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items
                                .map(item => `
                                    <tr>
                                        <td>${item.name || item.id}</td>
                                        <td>${item.quantity}</td>
                                        <td>${POSApp.formatCurrency(item.price)}</td>
                                        <td>${POSApp.formatCurrency(item.price * item.quantity)}</td>
                                    </tr>`)
                                .join('')}
                        </tbody>
                    </table>
                </section>
                <footer class="document-footer">
                    <div class="totals">
                        <div><span>Sous-total</span><strong>${POSApp.formatCurrency(subtotal)}</strong></div>
                        <div><span>TVA</span><strong>${POSApp.formatCurrency(tax)}</strong></div>
                        <div class="grand-total"><span>Total TTC</span><strong>${POSApp.formatCurrency(total)}</strong></div>
                    </div>
                    <p>Moyen de paiement : <strong>${payment}</strong></p>
                    <small>Merci pour votre confiance. Aucun échange n'est possible sans ce document.</small>
                </footer>
            </article>`;
    }

    function buildDeliveryDocument(sale) {
        const storeName = POSApp.state.settings.storeName || 'JOCELYNE K POS SYSTEM';
        const items = Array.isArray(sale.items) ? sale.items : [];
        const customer = sale.customer || 'Client boutique';
        const seller = sale.seller || 'Boutique';
        const payment = formatPayment(sale.payment);
        return `
            <article class="document delivery-document" data-document="delivery">
                <header class="document-header">
                    <div>
                        <h3>${storeName}</h3>
                        <p>Étiquette de livraison · ${sale.id}</p>
                    </div>
                    <div class="document-meta">
                        <span>${formatDateTime(sale.date)}</span>
                        <span>Préparé par : ${seller}</span>
                    </div>
                </header>
                <section class="document-body">
                    <div class="delivery-info">
                        <div>
                            <span class="label">Destinataire</span>
                            <strong>${customer}</strong>
                            <span class="placeholder">Téléphone : __________________________</span>
                        </div>
                        <div>
                            <span class="label">Paiement</span>
                            <strong>${payment}</strong>
                            <span class="placeholder">Montant : ${POSApp.formatCurrency(sale.total ?? 0)}</span>
                        </div>
                    </div>
                    <ul class="delivery-items">
                        ${items
                            .map(item => `
                                <li>
                                    <span>${item.quantity} × ${item.name || item.id}</span>
                                    <span>${POSApp.formatCurrency(item.price * item.quantity)}</span>
                                </li>`)
                            .join('')}
                    </ul>
                </section>
                <footer class="document-footer">
                    <small>Signature client : __________________________</small>
                    <small>Retour vendeur : __________________________</small>
                </footer>
            </article>`;
    }

    function renderDocumentPreview() {
        const container = selectors.preview();
        const printButton = selectors.printButton();
        if (!container || !printButton) return;
        const sale = getSaleById(selectedSaleId);
        if (!sale) {
            container.innerHTML = `
                <div class="empty-state mini">
                    <span class="empty-icon" aria-hidden="true">🧾</span>
                    <div>
                        <span class="empty-title">Sélectionnez une vente pour générer un document.</span>
                        <span class="empty-subtitle">Choisissez une facture ou une étiquette de livraison.</span>
                    </div>
                </div>`;
            printButton.disabled = true;
            return;
        }
        const html = activeDocument === 'delivery'
            ? buildDeliveryDocument(sale)
            : buildInvoiceDocument(sale);
        container.innerHTML = html;
        printButton.disabled = false;
    }

    function handlePrint() {
        const printButton = selectors.printButton();
        if (printButton?.disabled) return;
        const preview = document.querySelector('#document-preview .document');
        if (!preview) {
            POSApp.notify('Aucun document à imprimer.', 'error');
            return;
        }
        document.getElementById('print-area')?.remove();
        const printArea = document.createElement('div');
        printArea.id = 'print-area';
        printArea.appendChild(preview.cloneNode(true));
        document.body.appendChild(printArea);
        window.print();
        setTimeout(() => printArea.remove(), 400);
    }

    function bindEvents() {
        selectors.searchInput()?.addEventListener('input', event => {
            renderSalesList(event.target.value);
        });
        selectors.printButton()?.addEventListener('click', handlePrint);
        selectors.tabButtons().forEach(button => {
            button.addEventListener('click', () => {
                if (button.dataset.document === activeDocument) return;
                activeDocument = button.dataset.document || 'invoice';
                selectors.tabButtons().forEach(btn => {
                    btn.classList.toggle('active', btn === button);
                });
                renderDocumentPreview();
            });
        });
    }

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || ['sales', 'documents', 'dashboard'].includes(detail.section)) {
            renderSalesList();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
        renderSalesList();
    });
})();
