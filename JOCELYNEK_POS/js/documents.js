const DocumentsModule = (function () {
    let currentFilter = '';
    let activeSaleId = null;
    let activeDocType = 'invoice';
    let closureDate = '';
    let closureData = null;

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

    function formatDateLong(dateStr) {
        if (!dateStr) return 'Date inconnue';
        const date = new Date(`${dateStr}T00:00:00`);
        if (Number.isNaN(date.getTime())) {
            return dateStr;
        }
        return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
    }

    function getSalesForDate(dateStr) {
        if (!dateStr) return [];
        return getSales()
            .filter(sale => sale.date === dateStr)
            .sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
    }

    function computeClosureSummary(dateStr) {
        const sales = getSalesForDate(dateStr);
        const totals = {
            saleCount: sales.length,
            totalAmount: 0,
            totalAdvance: 0,
            totalBalance: 0,
            totalItems: 0,
            averageTicket: 0,
            collected: 0
        };

        const paymentMap = new Map();
        const boutiqueMap = new Map();
        const sellerMap = new Map();
        const productMap = new Map();

        sales.forEach(sale => {
            totals.totalAmount += Number(sale.totalAmount) || 0;
            totals.totalAdvance += Number(sale.advance) || 0;
            totals.totalBalance += Number(sale.balance) || 0;
            const saleItems = Number(sale.totalQuantity) || sale.items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
            totals.totalItems += saleItems;

            const method = sale.paymentMethod || 'Autre';
            if (!paymentMap.has(method)) {
                paymentMap.set(method, { count: 0, amount: 0 });
            }
            const paymentEntry = paymentMap.get(method);
            paymentEntry.count += 1;
            paymentEntry.amount += Number(sale.totalAmount) || 0;

            const boutiqueLabel = sale.boutiqueLabel || sale.boutique || '—';
            if (!boutiqueMap.has(boutiqueLabel)) {
                boutiqueMap.set(boutiqueLabel, { count: 0, amount: 0 });
            }
            const boutiqueEntry = boutiqueMap.get(boutiqueLabel);
            boutiqueEntry.count += 1;
            boutiqueEntry.amount += Number(sale.totalAmount) || 0;

            const sellerLabel = sale.sellerName || 'Vente directe';
            if (!sellerMap.has(sellerLabel)) {
                sellerMap.set(sellerLabel, { count: 0, amount: 0, items: 0 });
            }
            const sellerEntry = sellerMap.get(sellerLabel);
            sellerEntry.count += 1;
            sellerEntry.amount += Number(sale.totalAmount) || 0;
            sellerEntry.items += saleItems;

            sale.items.forEach(item => {
                const key = item.productName || item.productRef || 'Article';
                if (!productMap.has(key)) {
                    productMap.set(key, { quantity: 0, amount: 0 });
                }
                const productEntry = productMap.get(key);
                productEntry.quantity += Number(item.quantity) || 0;
                productEntry.amount += Number(item.total) || ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0));
            });
        });

        if (totals.saleCount > 0) {
            totals.averageTicket = totals.totalAmount / totals.saleCount;
        }
        totals.collected = Math.max(totals.totalAmount - totals.totalBalance, 0);

        const paymentEntries = Array.from(paymentMap, ([label, data]) => ({ label, ...data }))
            .sort((a, b) => b.amount - a.amount);
        const boutiqueEntries = Array.from(boutiqueMap, ([label, data]) => ({ label, ...data }))
            .sort((a, b) => b.amount - a.amount);
        const sellerEntries = Array.from(sellerMap, ([label, data]) => ({ label, ...data }))
            .sort((a, b) => b.amount - a.amount);
        const productEntries = Array.from(productMap, ([label, data]) => ({ label, ...data }))
            .sort((a, b) => b.quantity - a.quantity);

        return {
            date: dateStr,
            sales,
            totals,
            paymentEntries,
            boutiqueEntries,
            sellerEntries,
            productEntries
        };
    }

    function renderBreakdown(entries, formatter) {
        if (!entries || !entries.length) {
            return '<p class="closure-empty">Aucune donnée pour cette section.</p>';
        }
        return `
            <ul class="breakdown-list">
                ${entries.map(entry => `
                    <li>
                        <span class="label">${entry.label}</span>
                        <span class="value">${formatter(entry)}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    function buildClosureSections(summary) {
        const metrics = [
            { label: "Chiffre d'affaires", value: POSApp.formatCurrency(summary.totals.totalAmount) },
            { label: 'Montant encaissé', value: POSApp.formatCurrency(summary.totals.collected) },
            { label: 'Avances enregistrées', value: POSApp.formatCurrency(summary.totals.totalAdvance) },
            { label: 'Ticket moyen', value: POSApp.formatCurrency(summary.totals.averageTicket) }
        ];

        const metricsHtml = `
            <div class="closure-metrics">
                ${metrics.map(metric => `
                    <div class="closure-metric">
                        <span class="label">${metric.label}</span>
                        <span class="value">${metric.value}</span>
                    </div>
                `).join('')}
            </div>
        `;

        const sections = [
            {
                title: 'Répartition par boutique',
                html: renderBreakdown(summary.boutiqueEntries, entry => `${entry.count} vente(s) • ${POSApp.formatCurrency(entry.amount)}`)
            },
            {
                title: 'Modes de paiement',
                html: renderBreakdown(summary.paymentEntries, entry => `${entry.count} vente(s) • ${POSApp.formatCurrency(entry.amount)}`)
            },
            {
                title: 'Performance des vendeurs',
                html: renderBreakdown(summary.sellerEntries, entry => `${entry.count} vente(s) • ${entry.items} article(s) • ${POSApp.formatCurrency(entry.amount)}`)
            },
            {
                title: 'Top articles',
                html: renderBreakdown(summary.productEntries.slice(0, 5), entry => `${entry.quantity} pièce(s) • ${POSApp.formatCurrency(entry.amount)}`)
            }
        ];

        const sectionHtml = sections.map(section => `
            <div class="closure-section">
                <h5>${section.title}</h5>
                ${section.html}
            </div>
        `).join('');

        const salesRows = summary.sales.map(sale => `
            <tr>
                <td>${sale.client || '—'}</td>
                <td>${sale.sellerName || 'Vente directe'}</td>
                <td>${sale.boutiqueLabel || sale.boutique || '—'}</td>
                <td>${sale.totalQuantity} article(s)</td>
                <td>${POSApp.formatCurrency(sale.totalAmount)}</td>
                <td>${POSApp.formatCurrency(sale.advance)}</td>
                <td>${POSApp.formatCurrency(sale.balance)}</td>
                <td>${sale.paymentMethod || '—'}</td>
            </tr>
        `).join('');

        const tableHtml = `
            <div class="closure-section">
                <h5>Détail des ventes (${summary.sales.length})</h5>
                <table class="closure-table">
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Vendeur</th>
                            <th>Boutique</th>
                            <th>Articles</th>
                            <th>Total</th>
                            <th>Avance</th>
                            <th>Solde</th>
                            <th>Paiement</th>
                        </tr>
                    </thead>
                    <tbody>${salesRows}</tbody>
                </table>
            </div>
        `;

        return `${metricsHtml}${sectionHtml}${tableHtml}`;
    }

    function buildClosurePreview(summary) {
        return `
            <div class="closure-header">
                <h4>Clôture du ${formatDateLong(summary.date)}</h4>
                <p>${summary.totals.saleCount} vente(s) • ${summary.totals.totalItems} article(s)</p>
            </div>
            ${buildClosureSections(summary)}
        `;
    }

    function buildClosureDocument(summary) {
        return `
            <article class="document closure-document">
                <header>
                    <h2>Clôture journalière</h2>
                    <p class="subtitle">${formatDateLong(summary.date)}</p>
                    <p class="meta">${summary.totals.saleCount} vente(s) • ${summary.totals.totalItems} article(s) • ${POSApp.formatCurrency(summary.totals.totalAmount)}</p>
                </header>
                ${buildClosureSections(summary)}
            </article>
        `;
    }

    function renderClosurePreview() {
        const container = document.getElementById('closure-preview');
        const printBtn = document.getElementById('print-closure');
        if (!container) return;

        if (!closureDate) {
            container.innerHTML = '<p class="placeholder">Sélectionnez une date pour afficher le résumé de fin de journée.</p>';
            if (printBtn) printBtn.disabled = true;
            closureData = null;
            return;
        }

        const summary = computeClosureSummary(closureDate);
        closureData = summary;

        if (!summary.sales.length) {
            container.innerHTML = `<p class="placeholder">Aucune vente enregistrée le ${formatDateLong(closureDate)}.</p>`;
            if (printBtn) printBtn.disabled = true;
            return;
        }

        container.innerHTML = buildClosurePreview(summary);
        if (printBtn) printBtn.disabled = false;
    }

    function handleClosurePrint() {
        if (!closureData || !closureData.sales.length) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Clôture journalière</title><style>${getPrintStyles()}</style></head><body>${buildClosureDocument(closureData)}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
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
        const closureForm = document.getElementById('closure-form');
        const closureDateInput = document.getElementById('closure-date');
        const closurePrintBtn = document.getElementById('print-closure');

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

        closureForm?.addEventListener('submit', event => {
            event.preventDefault();
            if (!closureDateInput?.value) {
                alert('Sélectionnez une date à clôturer.');
                return;
            }
            closureDate = closureDateInput.value;
            renderClosurePreview();
        });

        closureDateInput?.addEventListener('change', () => {
            closureDate = closureDateInput.value;
            renderClosurePreview();
        });

        closurePrintBtn?.addEventListener('click', () => {
            if (closurePrintBtn.disabled) return;
            handleClosurePrint();
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
            .closure-document header { display: block; text-align: center; }
            .closure-document header h2 { font-size: 1.75rem; }
            .closure-document header .subtitle { margin-top: 6px; color: #555; }
            .closure-document header .meta { margin-top: 4px; color: #777; font-size: 0.9rem; }
            .closure-document .closure-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 20px 0; }
            .closure-document .closure-metric { border: 1px solid #ddd; border-radius: 12px; padding: 12px; background: rgba(255, 122, 0, 0.08); }
            .closure-document .closure-metric .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: #666; }
            .closure-document .closure-metric .value { font-size: 1.1rem; font-weight: 600; color: #111; }
            .closure-document .closure-section { margin-top: 18px; }
            .closure-document .closure-section h5 { margin-bottom: 8px; color: #0b7a3b; }
            .closure-document .breakdown-list { list-style: none; margin: 0; padding: 0; }
            .closure-document .breakdown-list li { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 6px 0; }
            .closure-document .breakdown-list .label { font-weight: 600; }
            .closure-document .breakdown-list .value { color: #444; }
            .closure-document table { margin-top: 12px; }
            .closure-document table th { background: rgba(0, 151, 57, 0.12); }
        `;
    }

    function initClosureForm() {
        const dateInput = document.getElementById('closure-date');
        if (!dateInput) return;
        if (!dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        closureDate = dateInput.value;
        renderClosurePreview();
    }

    function init() {
        renderSalesList();
        renderPreview();
        initClosureForm();
        attachEvents();
        POSApp.eventTarget.addEventListener('pos-data-updated', () => {
            renderSalesList();
            renderPreview();
            if (closureDate) {
                renderClosurePreview();
            }
        });
    }

    return { init };
})();
