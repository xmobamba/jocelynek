const VentesModule = (function () {
    let currentFilter = '';
    let currentItems = [];

    function getData() {
        return POSApp.getData();
    }

    function getSelectedSellerId() {
        const select = document.getElementById('sale-seller');
        return select ? select.value : '';
    }

    function getSelectedSeller(data = getData()) {
        const sellerId = getSelectedSellerId();
        if (!sellerId) return null;
        return data.sellers.find(seller => String(seller.id) === String(sellerId)) || null;
    }

    function getSelectedBoutiqueId() {
        const select = document.getElementById('sale-boutique');
        return select ? select.value : '';
    }

    function getProductByRef(ref, data = getData()) {
        return data.products.find(product => product.reference === ref) || null;
    }

    function getAssignmentForSeller(ref, seller) {
        if (!seller) return null;
        return (seller.assignments || []).find(assignment => assignment.productRef === ref) || null;
    }

    function getCartQuantityForRef(ref) {
        return currentItems
            .filter(item => item.productRef === ref)
            .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }

    function populateBoutiqueOptions() {
        const select = document.getElementById('sale-boutique');
        if (!select) return;
        const data = getData();
        select.innerHTML = data.settings.boutiques
            .map(b => `<option value="${b.id}">${b.name}</option>`)
            .join('');
    }

    function populateSellerOptions() {
        const select = document.getElementById('sale-seller');
        if (!select) return;
        const data = getData();
        const selectedBoutique = getSelectedBoutiqueId();
        const sellers = selectedBoutique
            ? data.sellers.filter(seller => seller.boutique === selectedBoutique)
            : data.sellers;

        const options = ['<option value="">-- Vente directe --</option>'];
        sellers.forEach(seller => {
            const assignments = Array.isArray(seller.assignments) ? seller.assignments : [];
            const totalConsigned = assignments.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
            const suffix = totalConsigned ? ` · ${totalConsigned} pièces` : '';
            options.push(`<option value="${seller.id}" data-boutique="${seller.boutique}">${seller.name}${suffix}</option>`);
        });

        const previousValue = select.value;
        select.innerHTML = options.join('');
        if (previousValue && Array.from(select.options).some(option => option.value === previousValue)) {
            select.value = previousValue;
        } else {
            select.value = '';
        }
        toggleProductNameField();
        lockBoutiqueForSeller();
    }

    function populateProductOptions() {
        const select = document.getElementById('sale-product');
        if (!select) return;
        const data = getData();
        const seller = getSelectedSeller(data);
        const selectedBoutique = getSelectedBoutiqueId();
        const options = [];

        if (seller) {
            const assignments = (seller.assignments || []).filter(assignment => Number(assignment.quantity) > 0);
            options.push('<option value="">-- Sélectionner --</option>');
            if (!assignments.length) {
                options.push('<option value="" disabled>Aucun produit confié</option>');
            }
            assignments.forEach(assignment => {
                const product = getProductByRef(assignment.productRef, data);
                const productName = product?.name || assignment.productName || assignment.productRef;
                const stock = Number(assignment.quantity) || 0;
                const used = currentItems
                    .filter(item => item.productRef === assignment.productRef)
                    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                const remaining = Math.max(stock - used, 0);
                options.push(
                    `<option value="${assignment.productRef}" data-name="${productName}" data-stock="${remaining}" data-initial="${stock}" data-assignment="true">${assignment.productRef} — ${productName} · ${remaining}/${stock} restants</option>`
                );
            });
        } else {
            options.push('<option value="">-- Produit libre --</option>');
            const catalog = data.products
                .filter(product => !selectedBoutique || product.boutique === selectedBoutique)
                .map(product => ({
                    ...product,
                    quantity: Number(product.quantity) || 0
                }))
                .sort((a, b) => a.reference.localeCompare(b.reference));
            if (!catalog.length) {
                options.push('<option value="" disabled>Aucun produit disponible</option>');
            }
            catalog.forEach(product => {
                const used = currentItems
                    .filter(item => item.productRef === product.reference)
                    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                const remaining = Math.max(product.quantity - used, 0);
                options.push(
                    `<option value="${product.reference}" data-name="${product.name}" data-stock="${remaining}" data-initial="${product.quantity}">${product.reference} — ${product.name} · ${remaining} en stock</option>`
                );
            });
        }

        const previousValue = select.value;
        select.innerHTML = options.join('');
        if (previousValue && Array.from(select.options).some(option => option.value === previousValue)) {
            select.value = previousValue;
        } else {
            select.selectedIndex = 0;
        }
        updateSellerStockInfo();
    }

    function lockBoutiqueForSeller() {
        const sellerSelect = document.getElementById('sale-seller');
        const boutiqueSelect = document.getElementById('sale-boutique');
        if (!sellerSelect || !boutiqueSelect) return;
        const selectedOption = sellerSelect.options[sellerSelect.selectedIndex];
        if (sellerSelect.value && selectedOption) {
            const sellerBoutique = selectedOption.dataset.boutique;
            if (sellerBoutique) {
                boutiqueSelect.value = sellerBoutique;
            }
            boutiqueSelect.setAttribute('data-locked', 'true');
            boutiqueSelect.setAttribute('disabled', 'disabled');
        } else {
            boutiqueSelect.removeAttribute('data-locked');
            boutiqueSelect.removeAttribute('disabled');
        }
    }

    function toggleProductNameField() {
        const nameInput = document.getElementById('sale-product-name');
        const sellerSelect = document.getElementById('sale-seller');
        if (!nameInput || !sellerSelect) return;
        if (sellerSelect.value) {
            nameInput.setAttribute('readonly', 'readonly');
            nameInput.classList.add('readonly');
        } else {
            nameInput.removeAttribute('readonly');
            nameInput.classList.remove('readonly');
        }
    }

    function resetItemInputs() {
        const productSelect = document.getElementById('sale-product');
        const productName = document.getElementById('sale-product-name');
        const quantityInput = document.getElementById('sale-item-quantity');
        const priceInput = document.getElementById('sale-item-price');
        if (productSelect) productSelect.selectedIndex = 0;
        if (productName && !getSelectedSellerId()) productName.value = '';
        if (quantityInput) quantityInput.value = 1;
        if (priceInput) priceInput.value = '';
        updateSellerStockInfo();
    }

    function updateSellerStockInfo() {
        const infoEl = document.getElementById('seller-stock-info');
        const productSelect = document.getElementById('sale-product');
        const quantityInput = document.getElementById('sale-item-quantity');
        if (!infoEl || !productSelect || !quantityInput) return;

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const seller = getSelectedSeller();
        if (!seller) {
            if (selectedOption && selectedOption.value) {
                const available = Number(selectedOption.dataset.stock || 0);
                infoEl.textContent = `Stock boutique disponible : ${available}`;
            } else {
                infoEl.textContent = 'Sélectionnez un produit ou saisissez un article libre.';
            }
            return;
        }

        if (!selectedOption || !selectedOption.value) {
            infoEl.textContent = `Choisissez un produit confié à ${seller.name}.`;
            return;
        }

        const remaining = Number(selectedOption.dataset.stock || 0);
        const initial = Number(selectedOption.dataset.initial || remaining);
        const requested = Number(quantityInput.value) || 0;
        if (remaining <= 0) {
            infoEl.textContent = `Stock confié épuisé pour ${seller.name}.`;
        } else if (requested > remaining) {
            infoEl.textContent = `Stock confié disponible : ${remaining}/${initial}. Ajustez la quantité.`;
        } else {
            infoEl.textContent = `Stock confié disponible : ${remaining}/${initial}.`;
        }
    }

    function renderCurrentItems() {
        const tbody = document.getElementById('sale-items-body');
        if (!tbody) return;
        if (!currentItems.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="placeholder">Ajoutez des articles pour constituer la vente.</td></tr>';
        } else {
            tbody.innerHTML = currentItems.map(item => `
                <tr>
                    <td>${item.productName}</td>
                    <td>${item.productRef || '—'}</td>
                    <td>${item.quantity}</td>
                    <td>${POSApp.formatCurrency(item.unitPrice)}</td>
                    <td>${POSApp.formatCurrency(item.quantity * item.unitPrice)}</td>
                    <td><button type="button" class="btn ghost" data-remove="${item.id}">Retirer</button></td>
                </tr>
            `).join('');
        }
        updateSaleTotals();
    }

    function updateSaleTotals() {
        const total = currentItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const advanceInput = document.getElementById('sale-advance');
        const paymentSelect = document.getElementById('sale-payment');
        const totalEl = document.getElementById('sale-total');
        const balanceEl = document.getElementById('sale-balance');
        const submitBtn = document.querySelector('#sale-form button[type="submit"]');
        const advance = Math.min(Number(advanceInput?.value || 0), total);
        if (advanceInput && paymentSelect && paymentSelect.value !== 'Avance + Solde') {
            advanceInput.value = 0;
        } else if (advanceInput) {
            advanceInput.value = advance;
        }
        const balance = paymentSelect && paymentSelect.value === 'Avance + Solde' ? Math.max(total - advance, 0) : 0;
        if (totalEl) totalEl.textContent = POSApp.formatCurrency(total);
        if (balanceEl) balanceEl.textContent = POSApp.formatCurrency(balance);
        if (submitBtn) submitBtn.disabled = !currentItems.length;
        return { total, advance, balance };
    }

    function addItemToCart() {
        const productSelect = document.getElementById('sale-product');
        const productNameInput = document.getElementById('sale-product-name');
        const quantityInput = document.getElementById('sale-item-quantity');
        const priceInput = document.getElementById('sale-item-price');
        if (!productNameInput || !quantityInput || !priceInput) return;

        const seller = getSelectedSeller();
        const selectedOption = productSelect?.options[productSelect.selectedIndex];
        const productRef = selectedOption?.value || '';
        const productName = (selectedOption?.dataset?.name || '').trim() || productNameInput.value.trim();
        const quantity = Number(quantityInput.value) || 0;
        const unitPrice = Number(priceInput.value) || 0;

        if (!productName) {
            alert('Le nom du produit est requis.');
            return;
        }
        if (quantity <= 0) {
            alert('La quantité doit être supérieure à zéro.');
            return;
        }
        if (unitPrice < 0) {
            alert('Le prix ne peut pas être négatif.');
            return;
        }

        if (seller) {
            if (!productRef) {
                alert('Sélectionnez un produit confié à la vendeuse.');
                return;
            }
            const assignment = getAssignmentForSeller(productRef, seller);
            const stock = Number(assignment?.quantity) || 0;
            const used = getCartQuantityForRef(productRef);
            const remaining = stock - used;
            if (quantity > remaining) {
                alert(`Stock confié insuffisant. Disponible : ${remaining}.`);
                return;
            }
        } else if (productRef) {
            const product = getProductByRef(productRef);
            const stock = Number(product?.quantity) || 0;
            const used = getCartQuantityForRef(productRef);
            const remaining = stock - used;
            if (quantity > remaining) {
                alert(`Stock boutique insuffisant. Disponible : ${remaining}.`);
                return;
            }
        }

        const item = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            productRef,
            productName,
            quantity,
            unitPrice,
            source: seller ? 'seller' : 'boutique'
        };

        currentItems.push(item);
        populateProductOptions();
        renderCurrentItems();
        resetItemInputs();
    }

    function removeItemFromCart(id) {
        currentItems = currentItems.filter(item => item.id !== id);
        populateProductOptions();
        renderCurrentItems();
    }

    function normalizeSale(rawSale) {
        if (!rawSale) return null;
        const items = Array.isArray(rawSale.items) && rawSale.items.length
            ? rawSale.items
            : [{
                productName: rawSale.productName,
                productRef: rawSale.productRef,
                quantity: rawSale.quantity,
                unitPrice: rawSale.unitPrice
            }];
        const normalizedItems = items.map((item, index) => ({
            productName: item.productName || `Article ${index + 1}`,
            productRef: item.productRef || '',
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            total: Number(item.total) || (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)
        }));
        const totalAmount = typeof rawSale.totalAmount === 'number'
            ? rawSale.totalAmount
            : normalizedItems.reduce((sum, item) => sum + item.total, 0);
        return {
            ...rawSale,
            items: normalizedItems,
            totalAmount,
            advance: Number(rawSale.advance) || 0,
            balance: Number(rawSale.balance) || 0
        };
    }

    function renderSalesList() {
        const tbody = document.getElementById('sales-list');
        if (!tbody) return;
        const data = getData();
        const boutiqueMap = Object.fromEntries(data.settings.boutiques.map(b => [b.id, b.name]));
        const sellerMap = Object.fromEntries(data.sellers.map(seller => [String(seller.id), seller.name]));
        const normalizedSales = data.sales.map(normalizeSale).filter(Boolean);

        const filtered = normalizedSales.filter(sale => {
            const itemsText = sale.items.map(item => item.productName).join(' ');
            const sellerLabel = sale.sellerName || sellerMap[String(sale.sellerId)] || '';
            const haystack = [
                itemsText,
                sale.client,
                sellerLabel,
                sale.boutique,
                sale.paymentMethod
            ].join(' ').toLowerCase();
            return haystack.includes((currentFilter || '').toLowerCase());
        });

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="9">Aucune vente trouvée</td></tr>';
            return;
        }

        tbody.innerHTML = filtered
            .map(sale => {
                const boutiqueLabel = sale.boutiqueLabel || boutiqueMap[sale.boutique] || sale.boutique;
                const sellerLabel = sale.sellerName || sellerMap[String(sale.sellerId)] || '—';
                const totalQuantity = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                const products = sale.items.map(item => `${item.productName} (x${item.quantity})`).join('<br>');
                return `
                <tr>
                    <td>${sale.date}</td>
                    <td>${products}</td>
                    <td>${boutiqueLabel}</td>
                    <td>${sellerLabel}</td>
                    <td>${sale.client || '—'}</td>
                    <td>${totalQuantity}</td>
                    <td>${POSApp.formatCurrency(sale.totalAmount)}</td>
                    <td>${sale.paymentMethod}</td>
                    <td><button class="btn ghost" data-action="print" data-id="${sale.id}">Imprimer</button></td>
                </tr>
            `;
            })
            .join('');
    }

    function prepareInvoice(rawSale) {
        const sale = normalizeSale(rawSale);
        const invoiceEl = document.getElementById('invoice');
        if (!invoiceEl || !sale) return;
        const data = getData();
        const logo = data.settings.logo || POSApp.DEFAULT_LOGO;
        const sellerMap = Object.fromEntries(data.sellers.map(seller => [String(seller.id), seller.name]));
        const sellerLabel = sale.sellerName || sellerMap[String(sale.sellerId)] || '—';
        const boutique = data.settings.boutiques.find(b => b.id === sale.boutique);
        const boutiqueLabel = boutique ? boutique.name : (sale.boutiqueLabel || sale.boutique);
        invoiceEl.innerHTML = `
            <header>
                <img src="${logo}" alt="Logo" style="height:80px;margin:0 auto 1rem;" />
                <h2>Facture - JOCELYNE K POS SYSTEM</h2>
                <p>${boutiqueLabel || ''}</p>
            </header>
            <section>
                <p><strong>Date :</strong> ${sale.date}</p>
                <p><strong>Client :</strong> ${sale.client || '—'}</p>
                <p><strong>Vendeur :</strong> ${sellerLabel}</p>
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
                    ${sale.items.map(item => `
                        <tr>
                            <td style="padding:8px;">${item.productName}</td>
                            <td style="padding:8px;">${item.productRef || '—'}</td>
                            <td style="padding:8px;">${item.quantity}</td>
                            <td style="padding:8px;">${POSApp.formatCurrency(item.unitPrice)}</td>
                            <td style="padding:8px;">${POSApp.formatCurrency(item.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <section style="margin-top:2rem;">
                <p><strong>Total :</strong> ${POSApp.formatCurrency(sale.totalAmount)}</p>
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
            const saleId = target.dataset.id;
            const data = getData();
            const sale = data.sales.find(item => String(item.id) === String(saleId));
            if (sale) {
                prepareInvoice(sale);
            }
        }
    }

    function getSaleFormValues() {
        const date = document.getElementById('sale-date').value;
        const boutique = getSelectedBoutiqueId();
        const sellerId = getSelectedSellerId();
        const client = document.getElementById('sale-client').value.trim();
        const paymentMethod = document.getElementById('sale-payment').value;
        const advanceInput = document.getElementById('sale-advance');
        const advance = Number(advanceInput?.value) || 0;
        return { date, boutique, sellerId, client, paymentMethod, advance };
    }

    function resetSaleForm() {
        const form = document.getElementById('sale-form');
        if (!form) return;
        form.reset();
        currentItems = [];
        const sellerSelect = document.getElementById('sale-seller');
        if (sellerSelect) sellerSelect.value = '';
        const boutiqueSelect = document.getElementById('sale-boutique');
        if (boutiqueSelect) {
            boutiqueSelect.removeAttribute('disabled');
            boutiqueSelect.removeAttribute('data-locked');
        }
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
        const paymentSelect = document.getElementById('sale-payment');
        paymentSelect.value = 'Cash';
        const advanceField = document.getElementById('sale-advance');
        if (advanceField) {
            advanceField.value = 0;
        }
        paymentSelect.dispatchEvent(new Event('change'));
        toggleProductNameField();
        populateProductOptions();
        renderCurrentItems();
        updateSellerStockInfo();
    }

    function attachEvents() {
        const form = document.getElementById('sale-form');
        const productSelect = document.getElementById('sale-product');
        const productNameInput = document.getElementById('sale-product-name');
        const quantityInput = document.getElementById('sale-item-quantity');
        const priceInput = document.getElementById('sale-item-price');
        const sellerSelect = document.getElementById('sale-seller');
        const boutiqueSelect = document.getElementById('sale-boutique');
        const paymentSelect = document.getElementById('sale-payment');
        const advanceInput = document.getElementById('sale-advance');
        const addItemBtn = document.getElementById('add-sale-item');
        const searchInput = document.getElementById('search-sales');
        const itemsTable = document.getElementById('sale-items-body');
        const salesTable = document.getElementById('sales-list');

        addItemBtn?.addEventListener('click', addItemToCart);

        itemsTable?.addEventListener('click', event => {
            const button = event.target.closest('[data-remove]');
            if (!button) return;
            removeItemFromCart(button.dataset.remove);
        });

        productSelect?.addEventListener('change', () => {
            const selectedOption = productSelect.options[productSelect.selectedIndex];
            const name = selectedOption?.dataset?.name || '';
            if (name) {
                productNameInput.value = name;
            } else if (!getSelectedSellerId()) {
                productNameInput.value = '';
            }
            updateSellerStockInfo();
        });

        productNameInput?.addEventListener('input', () => {
            if (getSelectedSellerId()) {
                toggleProductNameField();
            }
        });

        [quantityInput, priceInput].forEach(input => {
            input?.addEventListener('input', () => {
                if (input === quantityInput && Number(quantityInput.value) < 1) {
                    quantityInput.value = 1;
                }
                updateSellerStockInfo();
            });
        });

        paymentSelect?.addEventListener('change', () => {
            if (paymentSelect.value === 'Avance + Solde') {
                advanceInput.removeAttribute('disabled');
            } else {
                advanceInput.value = 0;
                advanceInput.setAttribute('disabled', 'disabled');
            }
            updateSaleTotals();
        });
        paymentSelect?.dispatchEvent(new Event('change'));

        advanceInput?.addEventListener('input', () => {
            if (Number(advanceInput.value) < 0) {
                advanceInput.value = 0;
            }
            updateSaleTotals();
        });

        sellerSelect?.addEventListener('change', () => {
            lockBoutiqueForSeller();
            toggleProductNameField();
            populateProductOptions();
            currentItems = [];
            renderCurrentItems();
            resetItemInputs();
            if (getSelectedSellerId()) {
                const selectedOption = productSelect?.options[productSelect.selectedIndex];
                const name = selectedOption?.dataset?.name || '';
                if (name) {
                    productNameInput.value = name;
                }
            }
            updateSellerStockInfo();
        });

        boutiqueSelect?.addEventListener('change', () => {
            populateSellerOptions();
            populateProductOptions();
            currentItems = [];
            renderCurrentItems();
            resetItemInputs();
        });

        searchInput?.addEventListener('input', () => {
            currentFilter = searchInput.value;
            renderSalesList();
        });

        form?.addEventListener('submit', event => {
            event.preventDefault();
            if (!currentItems.length) {
                alert('Ajoutez au moins un article à la vente.');
                return;
            }
            const values = getSaleFormValues();
            if (!values.date) {
                alert('Veuillez sélectionner une date.');
                return;
            }
            const { total, balance, advance } = updateSaleTotals();
            const data = getData();
            const seller = getSelectedSeller(data);
            const boutiqueLabel = data.settings.boutiques.find(b => b.id === values.boutique)?.name || values.boutique;
            const items = currentItems.map(item => ({
                productRef: item.productRef,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice
            }));

            const sale = {
                id: Date.now(),
                date: values.date,
                boutique: values.boutique,
                boutiqueLabel,
                sellerId: seller ? seller.id : null,
                sellerName: seller ? seller.name : '',
                client: values.client,
                paymentMethod: values.paymentMethod,
                advance: values.paymentMethod === 'Avance + Solde' ? advance : 0,
                balance: values.paymentMethod === 'Avance + Solde' ? balance : 0,
                totalAmount: total,
                items
            };

            POSApp.updateData(store => {
                store.sales.push(sale);
                if (seller) {
                    const sellerRecord = store.sellers.find(s => String(s.id) === String(seller.id));
                    if (sellerRecord) {
                        items.forEach(item => {
                            if (!item.productRef) return;
                            const assignment = sellerRecord.assignments.find(a => a.productRef === item.productRef);
                            if (assignment) {
                                assignment.quantity = Math.max((Number(assignment.quantity) || 0) - item.quantity, 0);
                            }
                        });
                        sellerRecord.assignments = sellerRecord.assignments.filter(a => (Number(a.quantity) || 0) > 0);
                    }
                } else {
                    items.forEach(item => {
                        if (!item.productRef) return;
                        const productRecord = store.products.find(p => p.reference === item.productRef);
                        if (productRecord) {
                            productRecord.quantity = Math.max((Number(productRecord.quantity) || 0) - item.quantity, 0);
                        }
                    });
                }
            });

            resetSaleForm();
            renderSalesList();
            prepareInvoice(sale);
        });

        salesTable?.addEventListener('click', handlePrint);
    }

    function initDefaults() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('sale-date');
        if (dateInput) {
            dateInput.value = today;
        }
        const advanceInput = document.getElementById('sale-advance');
        if (advanceInput) {
            advanceInput.value = 0;
        }
        currentItems = [];
        renderCurrentItems();
        updateSellerStockInfo();
    }

    function init() {
        populateBoutiqueOptions();
        populateSellerOptions();
        populateProductOptions();
        renderSalesList();
        initDefaults();
        attachEvents();
        POSApp.eventTarget.addEventListener('pos-data-updated', () => {
            populateBoutiqueOptions();
            populateSellerOptions();
            populateProductOptions();
            renderSalesList();
            updateSaleTotals();
            toggleProductNameField();
            lockBoutiqueForSeller();
            updateSellerStockInfo();
        });
    }

    return { init };
})();
