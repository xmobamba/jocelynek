const VendeurModule = (function () {
    let sellerFilter = '';

    function populateBoutiqueOptions() {
        const select = document.getElementById('seller-boutique');
        if (!select) return;
        const data = POSApp.getData();
        select.innerHTML = data.settings.boutiques
            .map(b => `<option value="${b.id}">${b.name}</option>`)
            .join('');
    }

    function populateAssignmentOptions() {
        const sellerSelect = document.getElementById('assignment-seller');
        const productSelect = document.getElementById('assignment-product');
        const data = POSApp.getData();

        if (sellerSelect) {
            sellerSelect.innerHTML = data.sellers
                .map(seller => `<option value="${seller.id}">${seller.name}</option>`)
                .join('');
        }

        if (productSelect) {
            productSelect.innerHTML = data.products
                .map(product => `<option value="${product.reference}">${product.reference} — ${product.name}</option>`)
                .join('');
        }
    }

    function handleAddSeller(event) {
        event.preventDefault();
        const name = document.getElementById('seller-name').value.trim();
        const boutique = document.getElementById('seller-boutique').value;
        if (!name) {
            alert('Veuillez renseigner le nom du vendeur.');
            return;
        }
        POSApp.updateData(store => {
            store.sellers.push({
                id: Date.now(),
                name,
                boutique,
                assignments: []
            });
        });
        event.target.reset();
        renderSellers();
        populateAssignmentOptions();
    }

    function handleAssignment(event) {
        event.preventDefault();
        const sellerId = Number(document.getElementById('assignment-seller').value);
        const productRef = document.getElementById('assignment-product').value;
        const quantity = Number(document.getElementById('assignment-quantity').value);

        if (!sellerId || !productRef || !quantity) {
            alert('Veuillez sélectionner un vendeur, un produit et une quantité.');
            return;
        }

        POSApp.updateData(store => {
            const seller = store.sellers.find(s => s.id === sellerId);
            const product = store.products.find(p => p.reference === productRef);
            if (!seller || !product) return;
            if (product.quantity < quantity) {
                alert('Stock insuffisant pour cette affectation.');
                return;
            }
            product.quantity -= quantity;
            const existing = seller.assignments.find(item => item.productRef === productRef);
            if (existing) {
                existing.quantity += quantity;
            } else {
                seller.assignments.push({ productRef, productName: product.name, quantity });
            }
        });

        document.getElementById('assignment-form').reset();
        renderSellers();
    }

    function renderSellers() {
        const tbody = document.getElementById('sellers-list');
        if (!tbody) return;
        const data = POSApp.getData();
        const boutiques = Object.fromEntries(data.settings.boutiques.map(b => [b.id, b.name]));
        const filtered = data.sellers.filter(seller => {
            const haystack = `${seller.name} ${seller.boutique}`.toLowerCase();
            return haystack.includes(sellerFilter.toLowerCase());
        });

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="3">Aucun vendeur enregistré</td></tr>';
            return;
        }

        tbody.innerHTML = filtered
            .map(seller => {
                const assignments = seller.assignments.length
                    ? seller.assignments.map(a => `${a.productName} (${a.productRef}) — ${a.quantity}`).join('<br>')
                    : 'Aucune dotation';
                return `
                    <tr>
                        <td>${seller.name}</td>
                        <td>${boutiques[seller.boutique] || seller.boutique}</td>
                        <td>${assignments}</td>
                    </tr>
                `;
            })
            .join('');
    }

    function attachEvents() {
        const sellerForm = document.getElementById('seller-form');
        const assignmentForm = document.getElementById('assignment-form');
        const searchInput = document.getElementById('search-sellers');

        if (sellerForm) {
            sellerForm.addEventListener('submit', handleAddSeller);
        }

        if (assignmentForm) {
            assignmentForm.addEventListener('submit', handleAssignment);
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                sellerFilter = searchInput.value;
                renderSellers();
            });
        }
    }

    function init() {
        populateBoutiqueOptions();
        populateAssignmentOptions();
        renderSellers();
        attachEvents();
        POSApp.eventTarget.addEventListener('pos-data-updated', () => {
            populateBoutiqueOptions();
            populateAssignmentOptions();
            renderSellers();
        });
    }

    return { init };
})();
