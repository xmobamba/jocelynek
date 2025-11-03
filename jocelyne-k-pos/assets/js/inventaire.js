/**
 * Inventaire module initialisation.
 */

(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const { STORAGE_KEYS, getData, setData, generateId, generateProductReference, showToast } = window.JKPOS;

        const form = document.getElementById('productForm');
        const tableBody = document.querySelector('#inventoryTable tbody');
        const historyList = document.getElementById('inventoryHistory');

        if (!form || !tableBody || !historyList) return;

        const products = getData(STORAGE_KEYS.products, []);
        const history = getData(STORAGE_KEYS.history, []);

        renderProducts(products);
        renderHistory(history);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('productName').value.trim();
            const category = document.getElementById('productCategory').value.trim();
            const quantity = Number(document.getElementById('productQuantity').value);
            const store = document.getElementById('productStore').value;

            if (!name || !category || Number.isNaN(quantity)) {
                showToast({ icon: 'error', title: 'Merci de vérifier les informations.' });
                return;
            }

            const updatedProducts = getData(STORAGE_KEYS.products, []);
            const reference = generateProductReference(updatedProducts);
            const product = {
                id: generateId('prod'),
                reference,
                name,
                category,
                quantity,
                store,
                createdAt: new Date().toISOString()
            };

            updatedProducts.push(product);
            setData(STORAGE_KEYS.products, updatedProducts);

            const historyEntry = {
                id: generateId('history'),
                type: 'entrée',
                description: `${quantity} × ${name} ajoutés (${store})`,
                createdAt: new Date().toISOString()
            };
            const updatedHistory = getData(STORAGE_KEYS.history, []);
            updatedHistory.unshift(historyEntry);
            setData(STORAGE_KEYS.history, updatedHistory);

            renderProducts(updatedProducts);
            renderHistory(updatedHistory);
            form.reset();
            showToast({ icon: 'success', title: 'Produit ajouté avec succès !' });
        });

        function renderProducts(list) {
            tableBody.innerHTML = '';
            list.forEach((product) => {
                const row = document.createElement('tr');
                if ((product.quantity || 0) < 5) {
                    row.classList.add('table__row--alert');
                }
                row.innerHTML = `
                    <td>${product.reference}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.quantity}</td>
                    <td>${product.store}</td>
                `;
                tableBody.appendChild(row);
            });
        }

        function renderHistory(list) {
            historyList.innerHTML = '';
            list.slice(0, 15).forEach((entry) => {
                const item = document.createElement('li');
                item.textContent = `${new Date(entry.createdAt).toLocaleString('fr-FR')} — ${entry.description}`;
                historyList.appendChild(item);
            });
        }
    });
})();
