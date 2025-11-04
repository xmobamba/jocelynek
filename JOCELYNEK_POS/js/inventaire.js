const InventaireModule = (function () {
    let productFilter = '';

    function getNextReference(products) {
        if (!products.length) {
            return POSApp.generateReference('JK', 0);
        }
        const numbers = products
            .map(product => Number(product.reference?.split('-')[1] || 0))
            .filter(Boolean);
        const max = numbers.length ? Math.max(...numbers) : 0;
        return POSApp.generateReference('JK', max);
    }

    function populateBoutiqueOptions() {
        const select = document.getElementById('product-boutique');
        if (!select) return;
        const data = POSApp.getData();
        select.innerHTML = data.settings.boutiques
            .map(b => `<option value="${b.id}">${b.name}</option>`)
            .join('');
    }

    function handleAddProduct(event) {
        event.preventDefault();
        const name = document.getElementById('product-name').value.trim();
        const quantity = Number(document.getElementById('product-quantity').value);
        const boutique = document.getElementById('product-boutique').value;
        const image = document.getElementById('product-image').value.trim();

        if (!name) {
            alert('Veuillez renseigner le nom du produit.');
            return;
        }

        POSApp.updateData(store => {
            const reference = getNextReference(store.products);
            store.products.push({
                id: Date.now(),
                reference,
                name,
                quantity,
                boutique,
                image
            });
        });

        event.target.reset();
        renderProducts();
    }

    function renderProducts() {
        const tbody = document.getElementById('products-list');
        if (!tbody) return;
        const data = POSApp.getData();
        const boutiques = Object.fromEntries(data.settings.boutiques.map(b => [b.id, b.name]));
        const filtered = data.products.filter(product => {
            const haystack = `${product.reference} ${product.name} ${product.boutique}`.toLowerCase();
            return haystack.includes(productFilter.toLowerCase());
        });

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="5">Aucun produit disponible</td></tr>';
            return;
        }

        tbody.innerHTML = filtered
            .map(product => `
                <tr>
                    <td>${product.reference}</td>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${boutiques[product.boutique] || product.boutique}</td>
                    <td>
                        <button class="btn ghost" data-action="edit" data-id="${product.id}">Modifier</button>
                        <button class="btn danger" data-action="delete" data-id="${product.id}">Supprimer</button>
                    </td>
                </tr>
            `)
            .join('');
    }

    function handleActions(event) {
        const target = event.target;
        if (!target.dataset.action) return;
        const productId = Number(target.dataset.id);
        const action = target.dataset.action;

        if (action === 'delete') {
            if (confirm('Supprimer ce produit ?')) {
                POSApp.updateData(store => {
                    store.products = store.products.filter(product => product.id !== productId);
                });
                renderProducts();
            }
        }

        if (action === 'edit') {
            const data = POSApp.getData();
            const product = data.products.find(item => item.id === productId);
            if (!product) return;
            const newName = prompt('Nom du produit', product.name);
            if (!newName) return;
            const newQuantity = Number(prompt('Quantité en stock', product.quantity));
            if (Number.isNaN(newQuantity)) return;
            const boutiqueChoices = data.settings.boutiques
                .map(b => `${b.id} (${b.name})`)
                .join(', ');
            const newBoutique = prompt(`Boutique (${boutiqueChoices})`, product.boutique) || product.boutique;

            POSApp.updateData(store => {
                const item = store.products.find(prod => prod.id === productId);
                if (item) {
                    item.name = newName;
                    item.quantity = newQuantity;
                    item.boutique = newBoutique;
                }
            });
            renderProducts();
        }
    }

    function attachEvents() {
        const form = document.getElementById('product-form');
        const search = document.getElementById('search-products');
        const table = document.getElementById('products-list');

        if (form) {
            form.addEventListener('submit', handleAddProduct);
        }

        if (search) {
            search.addEventListener('input', () => {
                productFilter = search.value;
                renderProducts();
            });
        }

        if (table) {
            table.addEventListener('click', handleActions);
        }
    }

    function init() {
        populateBoutiqueOptions();
        renderProducts();
        attachEvents();
        POSApp.eventTarget.addEventListener('pos-data-updated', () => {
            populateBoutiqueOptions();
            renderProducts();
        });
    }

    return { init };
})();
