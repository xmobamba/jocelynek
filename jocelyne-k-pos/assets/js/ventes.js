/**
 * Ventes module initialisation.
 */

(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const { STORAGE_KEYS, getData, setData, formatCurrency, generateSaleId, generateId, showToast } = window.JKPOS;

        const form = document.getElementById('saleForm');
        const productSelect = document.getElementById('saleProduct');
        const quantityInput = document.getElementById('saleQuantity');
        const priceInput = document.getElementById('salePrice');
        const advanceInput = document.getElementById('saleAdvance');
        const totalDisplay = document.getElementById('saleTotal');
        const balanceDisplay = document.getElementById('saleBalance');
        const salesTableBody = document.querySelector('#salesTable tbody');
        const filterDate = document.getElementById('filterDate');
        const filterVendor = document.getElementById('filterVendor');
        const filterStore = document.getElementById('filterStore');
        const printButton = document.getElementById('printInvoice');

        if (!form || !productSelect || !salesTableBody) return;

        const products = getData(STORAGE_KEYS.products, []);
        const sales = getData(STORAGE_KEYS.sales, []);

        populateProducts(products);
        renderSales(sales);

        form.addEventListener('input', updateSummaries);

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const selectedProduct = products.find((product) => product.id === productSelect.value);
            if (!selectedProduct) {
                showToast({ icon: 'error', title: 'Merci de sélectionner un produit.' });
                return;
            }

            const quantity = Number(quantityInput.value);
            const price = Number(priceInput.value);
            const advance = Number(advanceInput.value) || 0;
            const total = quantity * price;
            const balance = Math.max(total - advance, 0);

            const newSale = {
                id: generateSaleId(sales),
                internalId: generateId('sale'),
                date: document.getElementById('saleDate').value || new Date().toISOString().slice(0, 10),
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                quantity,
                unitPrice: price,
                total,
                advance,
                balance,
                client: document.getElementById('saleClient').value.trim(),
                vendor: document.getElementById('saleVendor').value.trim(),
                store: document.getElementById('saleStore').value
            };

            const updatedSales = getData(STORAGE_KEYS.sales, []);
            updatedSales.push(newSale);
            setData(STORAGE_KEYS.sales, updatedSales);

            renderSales(updatedSales);
            form.reset();
            updateSummaries();
            showToast({ icon: 'success', title: 'Vente enregistrée avec succès !' });
        });

        [filterDate, filterVendor, filterStore].forEach((input) => {
            if (!input) return;
            input.addEventListener('input', () => {
                const filtered = filterSales();
                renderSales(filtered);
            });
        });

        function populateProducts(list) {
            productSelect.innerHTML = '<option value="">Sélectionnez un produit</option>';
            list.forEach((product) => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.reference} — ${product.name}`;
                productSelect.appendChild(option);
            });
        }

        function updateSummaries() {
            const quantity = Number(quantityInput.value) || 0;
            const price = Number(priceInput.value) || 0;
            const advance = Number(advanceInput.value) || 0;
            const total = quantity * price;
            const balance = Math.max(total - advance, 0);
            if (totalDisplay) totalDisplay.textContent = formatCurrency(total);
            if (balanceDisplay) balanceDisplay.textContent = formatCurrency(balance);
        }

        function filterSales() {
            const allSales = getData(STORAGE_KEYS.sales, []);
            return allSales.filter((sale) => {
                const byDate = !filterDate.value || sale.date === filterDate.value;
                const byVendor = !filterVendor.value || sale.vendor?.toLowerCase().includes(filterVendor.value.toLowerCase());
                const byStore = !filterStore.value || sale.store === filterStore.value;
                return byDate && byVendor && byStore;
            });
        }

        function renderSales(list) {
            salesTableBody.innerHTML = '';
            list.slice().reverse().forEach((sale) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${sale.id}</td>
                    <td>${sale.date}</td>
                    <td>${sale.productName}</td>
                    <td>${formatCurrency(sale.total)}</td>
                    <td>${formatCurrency(sale.advance)}</td>
                    <td>${formatCurrency(sale.balance)}</td>
                    <td>${sale.vendor || '-'}</td>
                    <td>${sale.store}</td>
                    <td><button class="btn btn--tiny" data-sale="${sale.internalId}">Facture</button></td>
                `;
                salesTableBody.appendChild(row);
            });
        }

        salesTableBody.addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('button[data-sale]')) {
                const saleId = target.getAttribute('data-sale');
                const sale = getData(STORAGE_KEYS.sales, []).find((item) => item.internalId === saleId);
                if (sale) {
                    prepareInvoice(sale);
                    showToast({ icon: 'info', title: 'Facture prête à être imprimée.' });
                }
            }
        });

        if (printButton) {
            printButton.addEventListener('click', () => {
                window.print();
            });
        }

        function prepareInvoice(sale) {
            const template = document.getElementById('invoiceTemplate');
            if (!template) return;
            const clone = template.content.cloneNode(true);

            clone.getElementById('invoiceId').textContent = sale.id;
            clone.getElementById('invoiceDate').textContent = sale.date;
            clone.getElementById('invoiceClient').textContent = sale.client || 'Client comptant';
            clone.getElementById('invoiceVendor').textContent = sale.vendor || '-';
            clone.getElementById('invoiceStore').textContent = sale.store;
            clone.getElementById('invoiceContact').textContent = 'Contact : +225 00 00 00 00';

            const itemsContainer = clone.getElementById('invoiceItems');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sale.productName}</td>
                <td>${sale.quantity}</td>
                <td>${formatCurrency(sale.unitPrice)}</td>
                <td>${formatCurrency(sale.total)}</td>
            `;
            itemsContainer.appendChild(row);

            clone.getElementById('invoiceTotal').textContent = formatCurrency(sale.total);
            clone.getElementById('invoiceAdvance').textContent = formatCurrency(sale.advance);
            clone.getElementById('invoiceBalance').textContent = formatCurrency(sale.balance);

            const container = document.querySelector('.invoice-container');
            if (container) {
                container.innerHTML = '';
                container.appendChild(clone);
            } else {
                const newContainer = document.createElement('div');
                newContainer.className = 'invoice-container';
                newContainer.appendChild(clone);
                document.body.appendChild(newContainer);
            }
        }
    });
})();
