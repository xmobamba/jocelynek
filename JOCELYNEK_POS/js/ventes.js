const VentesModule = (function () {
    let currentFilter = '';

    function populateProductOptions() {
        const select = document.getElementById('sale-product');
        if (!select) return;
        const data = POSApp.getData();
        const boutiqueSelect = document.getElementById('sale-boutique');
        const sellerSelect = document.getElementById('sale-seller');
        const selectedBoutique = boutiqueSelect ? boutiqueSelect.value : '';
        const selectedSellerId = sellerSelect ? sellerSelect.value : '';
        const options = [];

        if (selectedSellerId) {
            const seller = data.sellers.find(item => String(item.id) === selectedSellerId);
            const assignments = seller?.assignments || [];
            options.push('<option value="">-- Sélectionner --</option>');
            assignments.forEach(assignment => {
                const product = data.products.find(p => p.reference === assignment.productRef);
                const productName = product?.name || assignment.productName;
                options.push(
                    `<option value="${assignment.productRef}" data-name="${productName}" data-stock="${assignment.quantity}" data-assignment="true">${assignment.productRef} — ${productName}</option>`
                );
            });
        } else {
            options.push('<option value="">-- Produit libre --</option>');
            const catalog = data.products.filter(product => !selectedBoutique || product.boutique === selectedBoutique);
            catalog.forEach(product => {
                options.push(
                    `<option value="${product.reference}" data-name="${product.name}" data-stock="${product.quantity}">${product.reference} — ${product.name}</option>`
                );
            });
        }

        const previousValue = select.value;
        select.innerHTML = options.join('');
        if (options.some(option => option.includes(`value="${previousValue}"`))) {
            select.value = previousValue;
        } else {
            select.selectedIndex = 0;
        }
    }

    function populateBoutiqueOptions() {
        const select = document.getElementById('sale-boutique');
        if (!select) return;
        const data = POSApp.getData();
        select.innerHTML = data.settings.boutiques
            .map(b => `<option value="${b.id}">${b.name}</option>`)
            .join('');
    }

    function populateSellerOptions() {
        const select = document.getElementById('sale-seller');
        if (!select) return;
        const data = POSApp.getData();
        const boutiqueSelect = document.getElementById('sale-boutique');
        const selectedBoutique = boutiqueSelect ? boutiqueSelect.value : '';
        const sellers = selectedBoutique
            ? data.sellers.filter(seller => seller.boutique === selectedBoutique)
            : data.sellers;

        const options = ['<option value="">-- Vente directe --</option>'];
        sellers.forEach(seller => {
            options.push(`<option value="${seller.id}">${seller.name}</option>`);
        });
        const previousValue = select.value;
        select.innerHTML = options.join('');
        if (options.some(option => option.includes(`value="${previousValue}"`))) {
            select.value = previousValue;
        } else {
            select.value = '';
        }
        toggleProductNameField();
    }

    function updateSellerStockInfo() {
        const infoEl = document.getElementById('seller-stock-info');
        if (!infoEl) return;
        const sellerSelect = document.getElementById('sale-seller');
        const productSelect = document.getElementById('sale-product');
        if (!sellerSelect || !productSelect) return;

        const sellerId = sellerSelect.value;
        const productRef = productSelect.value;
        if (!sellerId) {
            infoEl.textContent = 'Sélectionnez une vendeuse pour utiliser le stock confié.';
            return;
        }

        const data = POSApp.getData();
        const seller = data.sellers.find(item => String(item.id) === sellerId);
        if (!seller) {
            infoEl.textContent = 'Vendeur introuvable.';
            return;
        }

        if (!productRef) {
            infoEl.textContent = 'Choisissez un produit pour vérifier le stock confié.';
            return;
        }

        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const assignment = seller.assignments.find(a => a.productRef === productRef);
        const stock = Number(selectedOption?.dataset?.stock ?? assignment?.quantity ?? 0);
        infoEl.textContent = assignment
            ? `Stock confié disponible : ${stock}`
            : 'Aucun stock confié pour ce produit.';
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

    function getSaleFormValues() {
        const date = document.getElementById('sale-date').value;
        const productSelect = document.getElementById('sale-product');
        const selectedProductRef = productSelect.value;
        const selectedProductOption = productSelect.options[productSelect.selectedIndex];
        const productName = document.getElementById('sale-product-name').value.trim();
        const quantity = Number(document.getElementById('sale-quantity').value);
        const price = Number(document.getElementById('sale-price').value);
        const boutique = document.getElementById('sale-boutique').value;
        const sellerId = document.getElementById('sale-seller').value;
        const client = document.getElementById('sale-client').value.trim();
        const paymentMethod = document.getElementById('sale-payment').value;
        const advanceInput = document.getElementById('sale-advance');
        const advance = Number(advanceInput.value) || 0;

        return {
            date,
            selectedProductRef,
            selectedProductOption,
            productName,
            quantity,
            price,
            boutique,
            sellerId,
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
        const productSelect = document.getElementById('sale-product');
        productSelect.value = '';
        document.getElementById('sale-product-name').value = '';
        document.getElementById('sale-quantity').value = 1;
        document.getElementById('sale-price').value = '';
        document.getElementById('sale-client').value = '';
        document.getElementById('sale-payment').value = 'Cash';
        const sellerSelect = document.getElementById('sale-seller');
        if (sellerSelect) {
            sellerSelect.value = '';
        }
        document.getElementById('sale-advance').value = 0;
        document.getElementById('sale-payment').dispatchEvent(new Event('change'));
        populateProductOptions();
        updateBalance();
        toggleProductNameField();
        updateSellerStockInfo();
    }

    function renderSalesList() {
        const tbody = document.getElementById('sales-list');
        if (!tbody) return;
        const data = POSApp.getData();
        const boutiqueMap = Object.fromEntries(data.settings.boutiques.map(b => [b.id, b.name]));
        const sellerMap = Object.fromEntries(data.sellers.map(seller => [String(seller.id), seller.name]));
        const filtered = data.sales.filter(sale => {
            const sellerLabel = sale.sellerName || sellerMap[String(sale.sellerId)] || '';
            const haystack = [
                sale.productName,
                sale.client,
                sellerLabel,
                sale.boutique,
                sale.paymentMethod
            ].join(' ').toLowerCase();
            return haystack.includes(currentFilter.toLowerCase());
        });

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="9">Aucune vente trouvée</td></tr>';
            return;
        }

        tbody.innerHTML = filtered
            .map(sale => {
                const boutiqueLabel = sale.boutiqueLabel || boutiqueMap[sale.boutique] || sale.boutique;
                const sellerLabel = sale.sellerName || sellerMap[String(sale.sellerId)] || '—';
                return `
                <tr>
                    <td>${sale.date}</td>
                    <td>${sale.productName}</td>
                    <td>${boutiqueLabel}</td>
                    <td>${sellerLabel}</td>
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
        const sellerMap = Object.fromEntries(data.sellers.map(seller => [String(seller.id), seller.name]));
        const sellerLabel = sale.sellerName || sellerMap[String(sale.sellerId)] || '—';
        invoiceEl.innerHTML = `
            <header>
                <img src="${logo}" alt="Logo" style="height:80px;margin:0 auto 1rem;" />
                <h2>Facture - JOCELYNE K POS SYSTEM</h2>
                <p>${sale.boutiqueLabel}</p>
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
        const sellerSelect = document.getElementById('sale-seller');
        const boutiqueSelect = document.getElementById('sale-boutique');
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
                if (!values.date || !values.quantity || !values.price) {
                    alert('Merci de renseigner tous les champs obligatoires.');
                    return;
                }
                const data = POSApp.getData();
                const boutiqueLabel = data.settings.boutiques.find(b => b.id === values.boutique)?.name || values.boutique;
                const selectedProduct = data.products.find(p => p.reference === values.selectedProductRef);
                const seller = values.sellerId ? data.sellers.find(s => String(s.id) === values.sellerId) : null;
                const assignment = seller?.assignments.find(a => a.productRef === values.selectedProductRef) || null;
                const optionName = values.selectedProductOption?.dataset?.name || '';
                const productName = assignment?.productName || optionName || selectedProduct?.name || values.productName;
                if (!productName) {
                    alert('Le nom du produit est requis.');
                    return;
                }

                if (seller) {
                    if (!values.selectedProductRef) {
                        alert('Veuillez choisir un produit attribué au vendeur.');
                        return;
                    }
                    if (!assignment || assignment.quantity < values.quantity) {
                        alert('Stock confié insuffisant pour cette vente.');
                        return;
                    }
                } else if (selectedProduct && selectedProduct.quantity < values.quantity) {
                    alert('Quantité insuffisante en stock.');
                    return;
                }

                const sale = {
                    id: Date.now(),
                    date: values.date,
                    productRef: values.selectedProductRef || '',
                    productName,
                    quantity: values.quantity,
                    unitPrice: values.price,
                    totalAmount: total,
                    boutique: values.boutique,
                    boutiqueLabel,
                    sellerId: seller ? seller.id : null,
                    sellerName: seller ? seller.name : '',
                    client: values.client,
                    paymentMethod: values.paymentMethod,
                    advance: values.paymentMethod === 'Avance + Solde' ? Math.min(values.advance, total) : 0,
                    balance: values.paymentMethod === 'Avance + Solde' ? balance : 0
                };

                POSApp.updateData(store => {
                    store.sales.push(sale);
                    if (seller && sale.productRef) {
                        const sellerRecord = store.sellers.find(s => s.id === seller.id);
                        if (sellerRecord) {
                            const assignment = sellerRecord.assignments.find(a => a.productRef === sale.productRef);
                            if (assignment) {
                                assignment.quantity = Math.max(assignment.quantity - sale.quantity, 0);
                                if (assignment.quantity === 0) {
                                    sellerRecord.assignments = sellerRecord.assignments.filter(a => a.productRef !== sale.productRef);
                                }
                            }
                        }
                    } else if (sale.productRef) {
                        const productRecord = store.products.find(p => p.reference === sale.productRef);
                        if (productRecord) {
                            productRecord.quantity = Math.max(productRecord.quantity - sale.quantity, 0);
                        }
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
                } else if (!sellerSelect.value) {
                    document.getElementById('sale-product-name').value = '';
                }
                updateSellerStockInfo();
            });
        }

        if (sellerSelect) {
            sellerSelect.addEventListener('change', () => {
                populateProductOptions();
                toggleProductNameField();
                const selectedOption = productSelect?.options[productSelect.selectedIndex];
                const name = selectedOption?.dataset?.name || '';
                if (name) {
                    document.getElementById('sale-product-name').value = name;
                } else {
                    document.getElementById('sale-product-name').value = '';
                }
                updateSellerStockInfo();
            });
        }

        if (boutiqueSelect) {
            boutiqueSelect.addEventListener('change', () => {
                populateSellerOptions();
                populateProductOptions();
                toggleProductNameField();
                updateSellerStockInfo();
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
        populateSellerOptions();
        populateProductOptions();
        toggleProductNameField();
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
            updateBalance();
            toggleProductNameField();
            updateSellerStockInfo();
        });
    }

    return { init };
})();
