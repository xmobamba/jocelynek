// Module Fournisseurs : fiches, historiques et liaisons produits

(function () {
    const container = () => document.getElementById('suppliers-list');

    function renderSuppliers() {
        const list = container();
        if (!list) return;
        list.innerHTML = '';
        const suppliers = POSApp.state.suppliers;
        if (!suppliers.length) {
            const empty = document.createElement('div');
            empty.className = 'card';
            empty.textContent = 'Aucun fournisseur enregistré.';
            list.appendChild(empty);
            return;
        }
        suppliers.forEach(supplier => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="supplier-header">
                    <div class="avatar">${supplier.name.slice(0, 1)}</div>
                    <div>
                        <h3>${supplier.name}</h3>
                        <small>${supplier.phone}</small>
                    </div>
                </div>
                <div class="supplier-balances">
                    <span class="status-badge">Solde : ${POSApp.formatCurrency(supplier.balance)}</span>
                    <span class="status-badge">Avance : ${POSApp.formatCurrency(supplier.advance)}</span>
                </div>
                <p>Produits associés : ${countProducts(supplier.id)}</p>
                <div class="supplier-actions">
                    <button class="secondary" data-action="edit" data-id="${supplier.id}">Modifier</button>
                    <button class="danger" data-action="delete" data-id="${supplier.id}">Supprimer</button>
                </div>
                <details>
                    <summary>Historique des achats</summary>
                    <ul>${renderHistory(supplier.history)}</ul>
                </details>`;
            list.appendChild(card);
        });
    }

    function countProducts(supplierId) {
        return POSApp.state.products.filter(p => p.supplier === supplierId).length;
    }

    function renderHistory(history = []) {
        if (!history?.length) return '<li>Aucun achat enregistré.</li>';
        return history.map(item => `<li>${new Date(item.date).toLocaleDateString('fr-FR')} - ${item.product} (${item.quantity})</li>`).join('');
    }

    function addSupplier() {
        POSApp.openModal('Nouveau fournisseur', [
            { id: 'id', label: 'Identifiant', required: true },
            { id: 'name', label: 'Nom', required: true },
            { id: 'phone', label: 'Téléphone', required: true },
            { id: 'advance', label: 'Avance', type: 'number', value: 0 },
            { id: 'balance', label: 'Solde', type: 'number', value: 0 }
        ], data => {
            POSApp.state.suppliers.push({
                id: data.id,
                name: data.name,
                phone: data.phone,
                advance: Number(data.advance),
                balance: Number(data.balance),
                history: []
            });
            persistState();
            POSApp.notify('Fournisseur ajouté', 'success');
            POSApp.refresh('suppliers');
            document.getElementById('modal').close();
        });
    }

    function editSupplier(id) {
        const supplier = POSApp.state.suppliers.find(s => s.id === id);
        if (!supplier) return;
        POSApp.openModal('Modifier le fournisseur', [
            { id: 'id', label: 'Identifiant', required: true, value: supplier.id },
            { id: 'name', label: 'Nom', required: true, value: supplier.name },
            { id: 'phone', label: 'Téléphone', required: true, value: supplier.phone },
            { id: 'advance', label: 'Avance', type: 'number', value: supplier.advance },
            { id: 'balance', label: 'Solde', type: 'number', value: supplier.balance }
        ], data => {
            Object.assign(supplier, {
                id: data.id,
                name: data.name,
                phone: data.phone,
                advance: Number(data.advance),
                balance: Number(data.balance)
            });
            persistState();
            POSApp.notify('Fournisseur mis à jour', 'success');
            POSApp.refresh('suppliers');
            document.getElementById('modal').close();
        });
    }

    function deleteSupplier(id) {
        if (POSApp.state.products.some(p => p.supplier === id)) {
            POSApp.notify('Impossible de supprimer : des produits sont liés.', 'error');
            return;
        }
        POSApp.state.suppliers = POSApp.state.suppliers.filter(s => s.id !== id);
        persistState();
        POSApp.notify('Fournisseur supprimé', 'success');
        POSApp.refresh('suppliers');
    }

    function handleActions(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const id = target.dataset.id;
        if (!id) return;
        if (target.dataset.action === 'edit') editSupplier(id);
        if (target.dataset.action === 'delete') deleteSupplier(id);
    }

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || detail.section === 'suppliers') {
            renderSuppliers();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        container()?.addEventListener('click', handleActions);
        document.getElementById('add-supplier-btn')?.addEventListener('click', addSupplier);
        renderSuppliers();
    });
})();
