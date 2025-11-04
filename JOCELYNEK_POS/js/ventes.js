const VentesModule = (function () {
    let currentFilter = '';

    function populateProductOptions() {
        const select = document.getElementById('sale-product');
        if (!select) return;
        const data = POSApp.getData();
        const options = ['<option value="">-- Produit libre --</option>'];
        data.products.forEach(product => {
            options.push(`<option value="${product.reference}" data-name="${product.name}">${product.reference} — ${product.name}</option>`);
        });
        select.innerHTML = options.join('');
    }

    function populateBoutiqueOptions() {
        const select = document.getElementById('sale-boutique');
        if (!select) return;
        const data = POSApp.getData();
        select.innerHTML = data.settings.boutiques
            .map(b => `<option value="${b.id}">${b.name}</option>`)
            .join('');
    }

    function getSaleFormValues() {
        const date = document.getElementById('sale-date').value;
        const selectedProductRef = document.getElementById('sale-product').value;
        const productName = document.getElementById('sale-product-name').value.trim();
        const quantity = Number(document.getElementById('sale-quantity').value);
        const price = Number(document.getElementById('sale-price').value);
        const boutique = document.getElementById('sale-boutique').value;
        const client = document.getElementById('sale-client').value.trim();
        const paymentMethod = document.getElementById('sale-payment').value;
        const advanceInput = document.getElementById('sale-advance');
        const advance = Number(advanceInput.value) || 0;

        return {
            date,
            selectedProductRef,
            productName,
            quantity,
            price,
            boutique,
            client,
            paymentMethod,
            advance
        };
    }

    function updateBalance() {
        const { quantity, price, advance } = getSaleFormValues();
        const total = quantity * price;
        const balance = Math.max(total - advance, 0);
        const balanceEl = document.getElementById('sale-balance');
        if (balanceEl) {
            balanceEl.textContent = POSApp.formatCurrency(balance);
        }
        return { total, balance };
    }

    function resetSaleForm() {
        document.getElementById('sale-product').value = '';
        document.getElementById('sale-product-name').value = '';
        document.getElementById('sale-quantity').value = 1;
        document.getElementById('sale-price').value = '';
        document.getElementById('sale-client').value = '';
        document.getElementById('sale-payment').value = 'Cash';
        document.getElementById('sale-advance').value = 0;
        document.getElementById('sale-payment').dispatchEvent(new Event('change'));
        updateBalance();
    }

    function renderSalesList() {
        const tbody = document.getElementById('sales-list');
        if (!tbody) return;
        const data = POSApp.getData();
        const boutiqueMap = Object.fromEntries(data.settings.boutiques.map(b => [b.id, b.name]));
        const filtered = data.sales.filter(sale => {
            const haystack = [
                sale.productName,
                sale.client,
                sale.boutique,
                sale.paymentMethod
            ].join(' ').toLowerCase();
            return haystack.includes(currentFilter.toLowerCase());
        });

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="8">Aucune vente trouvée</td></tr>';
            return;
        }

        tbody.innerHTML = filtered
            .map(sale => {
                const boutiqueLabel = sale.boutiqueLabel || boutiqueMap[sale.boutique] || sale.boutique;
                return `
                <tr>
                    <td>${sale.date}</td>
                    <td>${sale.productName}</td>
                    <td>${boutiqueLabel}</td>
                    <td>${sale.client || '—'}</td>
                    <td>${sale.quantity}</td>
                    <td>${POSApp.formatCurrency(sale.totalAmount)}</td>
                    <td>${sale.paymentMethod}</td>
                    <td><button class="btn ghost" data-action="print" data-id="${sale.id}">Imprimer</button></td>
                </tr>
            `;
            })
            .join('');
    }

    function prepareInvoice(sale) {
        const invoiceEl = document.getElementById('invoice');
        if (!invoiceEl) return;
        const data = POSApp.getData();
        const logo = data.settings.logo || POSApp.DEFAULT_LOGO;
        invoiceEl.innerHTML = `
            <header>
                <img src="${logo}" alt="Logo" style="height:80px;margin:0 auto 1rem;" />
                <h2>Facture - JOCELYNE K POS SYSTEM</h2>
                <p>${sale.boutiqueLabel}</p>
            </header>
            <section>
                <p><strong>Date :</strong> ${sale.date}</p>
                <p><strong>Client :</strong> ${sale.client || '—'}</p>
                <p><strong>Mode de paiement :</strong> ${sale.paymentMethod}</p>
            </section>
            <table style="width:100%;border-collapse:collapse;margin-top:1.5rem;">
                <thead>
                    <tr>
                        <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left;">Produit</th>
                        <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left;">Réf.</th>
                        <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left;">Quantité</th>
                        <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left;">Prix unitaire</th>
                        <th style="border-bottom:1px solid #ddd;padding:8px;text-align:left;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding:8px;">${sale.productName}</td>
                        <td style="padding:8px;">${sale.productRef || '—'}</td>
                        <td style="padding:8px;">${sale.quantity}</td>
                        <td style="padding:8px;">${POSApp.formatCurrency(sale.unitPrice)}</td>
                        <td style="padding:8px;">${POSApp.formatCurrency(sale.totalAmount)}</td>
                    </tr>
                </tbody>
            </table>
            <section style="margin-top:2rem;">
                <p><strong>Avance :</strong> ${POSApp.formatCurrency(sale.advance)}</p>
                <p><strong>Reste dû :</strong> ${POSApp.formatCurrency(sale.balance)}</p>
            </section>
            <footer style="margin-top:2rem;text-align:center;">
                <p>Merci pour votre confiance. À bientôt dans nos boutiques !</p>
            </footer>
        `;
        invoiceEl.classList.add('active');
        window.print();
        setTimeout(() => invoiceEl.classList.remove('active'), 500);
    }

    function handlePrint(event) {
        const target = event.target;
        if (target.dataset.action === 'print') {
            const saleId = Number(target.dataset.id);
            const data = POSApp.getData();
            const sale = data.sales.find(item => item.id === saleId);
            if (sale) {
                prepareInvoice(sale);
            }
        }
    }

    function attachEvents() {
        const form = document.getElementById('sale-form');
        const productSelect = document.getElementById('sale-product');
        const quantityInput = document.getElementById('sale-quantity');
        const priceInput = document.getElementById('sale-price');
        const advanceInput = document.getElementById('sale-advance');
        const paymentSelect = document.getElementById('sale-payment');
        const searchInput = document.getElementById('search-sales');
        const table = document.getElementById('sales-list');

        if (form) {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const values = getSaleFormValues();
                const { total, balance } = updateBalance();
                if (!values.productName || !values.date || !values.quantity || !values.price) {
                    alert('Merci de renseigner tous les champs obligatoires.');
                    return;
                }
                const data = POSApp.getData();
                const boutiqueLabel = data.settings.boutiques.find(b => b.id === values.boutique)?.name || values.boutique;
                const selectedProduct = data.products.find(p => p.reference === values.selectedProductRef);
                if (selectedProduct && selectedProduct.quantity < values.quantity) {
                    alert('Quantité insuffisante en stock.');
                    return;
                }

                const sale = {
                    id: Date.now(),
                    date: values.date,
                    productRef: selectedProduct?.reference || '',
                    productName: values.productName,
                    quantity: values.quantity,
                    unitPrice: values.price,
                    totalAmount: total,
                    boutique: values.boutique,
                    boutiqueLabel,
                    client: values.client,
                    paymentMethod: values.paymentMethod,
                    advance: values.paymentMethod === 'Avance + Solde' ? Math.min(values.advance, total) : 0,
                    balance: values.paymentMethod === 'Avance + Solde' ? balance : 0
                };

                POSApp.updateData(store => {
                    store.sales.push(sale);
                    if (selectedProduct) {
                        selectedProduct.quantity = Math.max(selectedProduct.quantity - values.quantity, 0);
                    }
                });

                resetSaleForm();
                renderSalesList();
                prepareInvoice(sale);
            });
        }

        if (productSelect) {
            productSelect.addEventListener('change', () => {
                const selectedOption = productSelect.options[productSelect.selectedIndex];
                const name = selectedOption?.dataset?.name || '';
                if (name) {
                    document.getElementById('sale-product-name').value = name;
                }
            });
        }

        [quantityInput, priceInput, advanceInput].forEach(input => {
            if (input) {
                input.addEventListener('input', updateBalance);
            }
        });

        if (paymentSelect) {
            paymentSelect.addEventListener('change', () => {
                const advanceField = document.getElementById('sale-advance');
                if (paymentSelect.value === 'Avance + Solde') {
                    advanceField.removeAttribute('disabled');
                } else {
                    advanceField.value = 0;
                    advanceField.setAttribute('disabled', 'disabled');
                }
                updateBalance();
            });
            paymentSelect.dispatchEvent(new Event('change'));
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                currentFilter = searchInput.value;
                renderSalesList();
            });
        }

        if (table) {
            table.addEventListener('click', handlePrint);
        }
    }

    function initDefaults() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = today;
        }
        document.getElementById('sale-quantity').value = 1;
        document.getElementById('sale-advance').value = 0;
        updateBalance();
    }

    function init() {
        populateProductOptions();
        populateBoutiqueOptions();
        renderSalesList();
        initDefaults();
        attachEvents();
        POSApp.eventTarget.addEventListener('pos-data-updated', () => {
            populateProductOptions();
            populateBoutiqueOptions();
            renderSalesList();
            updateBalance();
        });
    }

    return { init };
})();
