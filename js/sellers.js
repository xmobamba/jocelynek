// Module Vendeuses : suivi des stocks confiés et historiques

(function () {
    const container = () => document.getElementById('sellers-list');

    function renderSellers() {
        const list = container();
        if (!list) return;
        list.innerHTML = '';
        const sellers = POSApp.state.sellers;
        if (!sellers.length) {
            const empty = document.createElement('div');
            empty.className = 'card empty-card';
            empty.innerHTML = `
                <span class="empty-icon" aria-hidden="true">👜</span>
                <p class="empty-title">Aucune vendeuse enregistrée.</p>
                <p class="empty-subtitle">Ajoutez votre première collaboratrice pour suivre les marchandises confiées.</p>`;
            list.appendChild(empty);
            return;
        }
        sellers.forEach(seller => {
            const card = document.createElement('article');
            card.className = 'card seller-card';
            const assignedQty = totalAssignedQuantity(seller);
            const assignedValue = totalAssignedValue(seller);
            card.innerHTML = `
                <header class="seller-header">
                    <div class="seller-avatar" aria-hidden="true">${(seller.name || '?').slice(0, 1).toUpperCase()}</div>
                    <div>
                        <h3>${seller.name}</h3>
                        <small>${seller.phone || 'Contact non défini'}</small>
                    </div>
                </header>
                <div class="seller-stats">
                    <span class="status-badge">Stock confié : ${assignedQty} pièce(s)</span>
                    <span class="status-badge">Valeur : ${POSApp.formatCurrency(assignedValue)}</span>
                </div>
                <p class="seller-notes">${seller.notes || 'Aucune note pour cette vendeuse.'}</p>
                <div class="seller-actions">
                    <button data-action="assign" data-id="${seller.id}">Confier du stock</button>
                    <button class="secondary" data-action="return" data-id="${seller.id}">Retour stock</button>
                    <button class="secondary" data-action="edit" data-id="${seller.id}">Modifier</button>
                    <button class="danger" data-action="delete" data-id="${seller.id}">Supprimer</button>
                </div>
                <details>
                    <summary>Stock confié</summary>
                    <ul class="seller-assignments">${renderAssignments(seller)}</ul>
                </details>
                <details>
                    <summary>Historique</summary>
                    <ul class="seller-history">${renderHistory(seller.history)}</ul>
                </details>`;
            list.appendChild(card);
        });
    }

    function totalAssignedQuantity(seller) {
        return seller.assignments?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    }

    function totalAssignedValue(seller) {
        return (seller.assignments || []).reduce((sum, item) => {
            const product = POSApp.state.products.find(p => p.id === item.productId);
            return sum + (product?.price || 0) * (item.quantity || 0);
        }, 0);
    }

    function renderAssignments(seller) {
        if (!seller.assignments?.length) {
            return '<li>Aucun stock confié.</li>';
        }
        return seller.assignments
            .map(item => {
                const product = POSApp.state.products.find(p => p.id === item.productId);
                const name = product?.name || item.productId;
                return `<li><strong>${name}</strong> · ${item.quantity} pièce(s)</li>`;
            })
            .join('');
    }

    function renderHistory(history = []) {
        if (!history.length) {
            return '<li>Aucune activité enregistrée.</li>';
        }
        return history
            .slice()
            .reverse()
            .map(entry => {
                const date = entry.date ? new Date(entry.date).toLocaleString('fr-FR') : '';
                const product = entry.productId
                    ? POSApp.state.products.find(p => p.id === entry.productId)?.name || entry.productId
                    : '';
                if (entry.type === 'assign') {
                    return `<li>${date} · Confié ${entry.quantity} ${product}</li>`;
                }
                if (entry.type === 'return') {
                    return `<li>${date} · Retour ${entry.quantity} ${product}</li>`;
                }
                if (entry.type === 'sale') {
                    return `<li>${date} · Vente ${entry.saleId} · ${POSApp.formatCurrency(entry.amount || 0)}</li>`;
                }
                return `<li>${date} · ${entry.note || 'Activité'}</li>`;
            })
            .join('');
    }

    function generateSellerId() {
        const prefix = 'VEN';
        const highest = POSApp.state.sellers.reduce((max, seller) => {
            const match = seller.id?.match(/(\d+)/);
            if (!match) return max;
            const numeric = Number(match[1]);
            return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
        }, 0);
        return `${prefix}${String(highest + 1).padStart(3, '0')}`;
    }

    function addSeller() {
        const id = generateSellerId();
        POSApp.openModal('Nouvelle vendeuse', [
            { id: 'id', label: 'Identifiant', value: id, readonly: true, required: true },
            { id: 'name', label: 'Nom complet', required: true, autofocus: true },
            { id: 'phone', label: 'Contact', placeholder: '+225 ...' },
            { id: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Secteur, marché, jours de tournée...' }
        ], (data, close) => {
            POSApp.state.sellers.push({
                id: data.id,
                name: data.name,
                phone: data.phone || '',
                notes: data.notes || '',
                assignments: [],
                history: []
            });
            persistState();
            POSApp.notify('Vendeuse ajoutée', 'success');
            POSApp.refresh('sellers');
            POSApp.refresh('sales');
            close();
        });
    }

    function editSeller(id) {
        const seller = POSApp.state.sellers.find(s => s.id === id);
        if (!seller) return;
        POSApp.openModal('Modifier la vendeuse', [
            { id: 'id', label: 'Identifiant', value: seller.id, readonly: true },
            { id: 'name', label: 'Nom complet', required: true, value: seller.name },
            { id: 'phone', label: 'Contact', value: seller.phone },
            { id: 'notes', label: 'Notes', type: 'textarea', value: seller.notes || '' }
        ], (data, close) => {
            Object.assign(seller, {
                name: data.name,
                phone: data.phone || '',
                notes: data.notes || ''
            });
            persistState();
            POSApp.notify('Vendeuse mise à jour', 'success');
            POSApp.refresh('sellers');
            POSApp.refresh('sales');
            close();
        });
    }

    function assignStock(id) {
        const seller = POSApp.state.sellers.find(s => s.id === id);
        if (!seller) return;
        seller.assignments = seller.assignments || [];
        seller.history = seller.history || [];
        const availableProducts = POSApp.state.products.filter(product => product.stock > 0);
        if (!availableProducts.length) {
            POSApp.notify('Aucun stock disponible en boutique.', 'error');
            return;
        }
        POSApp.openModal('Confier du stock', [
            {
                id: 'seller-product',
                label: 'Produit',
                type: 'select',
                options: availableProducts.map(product => ({
                    value: product.id,
                    label: `${product.name} · ${product.stock} en boutique`
                })),
                required: true
            },
            {
                id: 'seller-quantity',
                label: 'Quantité confiée',
                type: 'number',
                value: 1,
                min: 1,
                max: availableProducts[0].stock,
                required: true
            }
        ], (data, close) => {
            const productId = data['seller-product'];
            const quantity = Number(data['seller-quantity']);
            const product = POSApp.state.products.find(p => p.id === productId);
            if (!product) {
                POSApp.notify('Produit introuvable.', 'error');
                return;
            }
            if (!Number.isFinite(quantity) || quantity <= 0) {
                POSApp.notify('Quantité invalide.', 'error');
                return;
            }
            if (quantity > product.stock) {
                POSApp.notify('Stock insuffisant en boutique.', 'error');
                return;
            }
            product.stock -= quantity;
            const existing = seller.assignments.find(item => item.productId === productId);
            if (existing) {
                existing.quantity += quantity;
            } else {
                seller.assignments.push({
                    productId,
                    quantity,
                    assignedAt: new Date().toISOString()
                });
            }
            seller.history.push({
                type: 'assign',
                productId,
                quantity,
                date: new Date().toISOString()
            });
            persistState();
            POSApp.notify('Stock confié à la vendeuse', 'success');
            POSApp.refresh('inventory');
            POSApp.refresh('sellers');
            POSApp.refresh('sales');
            close();
        });
        const modal = document.getElementById('modal');
        const productSelect = modal.querySelector('#seller-product');
        const quantityInput = modal.querySelector('#seller-quantity');
        const updateMax = () => {
            const product = POSApp.state.products.find(p => p.id === productSelect.value);
            if (!product) return;
            quantityInput.max = product.stock;
            quantityInput.placeholder = `Max ${product.stock}`;
            if (Number(quantityInput.value) > product.stock) {
                quantityInput.value = product.stock || 1;
            }
        };
        productSelect?.addEventListener('change', updateMax);
        updateMax();
    }

    function registerReturn(id) {
        const seller = POSApp.state.sellers.find(s => s.id === id);
        if (!seller) return;
        seller.assignments = seller.assignments || [];
        seller.history = seller.history || [];
        const assignedItems = seller.assignments.filter(item => item.quantity > 0);
        if (!assignedItems.length) {
            POSApp.notify('Cette vendeuse n\'a pas de stock à retourner.', 'error');
            return;
        }
        POSApp.openModal('Retour de stock', [
            {
                id: 'return-product',
                label: 'Produit',
                type: 'select',
                options: assignedItems.map(item => {
                    const product = POSApp.state.products.find(p => p.id === item.productId);
                    const name = product?.name || item.productId;
                    return { value: item.productId, label: `${name} · ${item.quantity} confié(s)` };
                }),
                required: true
            },
            {
                id: 'return-quantity',
                label: 'Quantité retournée',
                type: 'number',
                value: assignedItems[0].quantity,
                min: 1,
                max: assignedItems[0].quantity,
                required: true
            }
        ], (data, close) => {
            const productId = data['return-product'];
            const quantity = Number(data['return-quantity']);
            const assignment = seller.assignments.find(item => item.productId === productId);
            if (!assignment) {
                POSApp.notify('Affectation introuvable.', 'error');
                return;
            }
            if (!Number.isFinite(quantity) || quantity <= 0) {
                POSApp.notify('Quantité invalide.', 'error');
                return;
            }
            const restored = Math.min(quantity, assignment.quantity);
            assignment.quantity -= restored;
            if (assignment.quantity <= 0) {
                seller.assignments = seller.assignments.filter(item => item.productId !== productId);
            }
            const product = POSApp.state.products.find(p => p.id === productId);
            if (product) {
                product.stock += restored;
            }
            seller.history.push({
                type: 'return',
                productId,
                quantity: restored,
                date: new Date().toISOString()
            });
            persistState();
            POSApp.notify('Retour enregistré', 'success');
            POSApp.refresh('inventory');
            POSApp.refresh('sellers');
            POSApp.refresh('sales');
            close();
        });
        const modal = document.getElementById('modal');
        const productSelect = modal.querySelector('#return-product');
        const quantityInput = modal.querySelector('#return-quantity');
        const updateMax = () => {
            const assignment = seller.assignments.find(item => item.productId === productSelect.value);
            if (!assignment) return;
            quantityInput.max = assignment.quantity;
            quantityInput.placeholder = `Max ${assignment.quantity}`;
            if (Number(quantityInput.value) > assignment.quantity) {
                quantityInput.value = assignment.quantity;
            }
        };
        productSelect?.addEventListener('change', updateMax);
        updateMax();
    }

    function deleteSeller(id) {
        const seller = POSApp.state.sellers.find(s => s.id === id);
        if (!seller) return;
        const outstanding = seller.assignments.some(item => item.quantity > 0);
        if (outstanding) {
            POSApp.notify('Impossible de supprimer : stock encore confié.', 'error');
            return;
        }
        POSApp.state.sellers = POSApp.state.sellers.filter(s => s.id !== id);
        persistState();
        POSApp.notify('Vendeuse supprimée', 'success');
        POSApp.refresh('sellers');
        POSApp.refresh('sales');
    }

    function handleActions(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const id = target.dataset.id;
        if (!id) return;
        switch (target.dataset.action) {
            case 'assign':
                assignStock(id);
                break;
            case 'return':
                registerReturn(id);
                break;
            case 'edit':
                editSeller(id);
                break;
            case 'delete':
                deleteSeller(id);
                break;
            default:
                break;
        }
    }

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || detail.section === 'sellers') {
            renderSellers();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        container()?.addEventListener('click', handleActions);
        document.getElementById('add-seller-btn')?.addEventListener('click', addSeller);
        renderSellers();
    });
})();
