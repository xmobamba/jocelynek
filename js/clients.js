// Module Clients : gestion des crédits et historique d'achat

(function () {
    const listContainer = () => document.getElementById('clients-list');

    function renderClients() {
        const container = listContainer();
        if (!container) return;
        container.innerHTML = '';
        const clients = POSApp.state.clients;
        if (!clients.length) {
            const empty = document.createElement('div');
            empty.className = 'card';
            empty.textContent = 'Aucun client enregistré.';
            container.appendChild(empty);
            return;
        }
        clients.forEach(client => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <header style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <h3>${client.name}</h3>
                        <small>${client.phone || 'Contact non défini'}</small>
                    </div>
                    <span class="status-badge">Crédit : ${POSApp.formatCurrency(client.credit || 0)}</span>
                </header>
                <div class="client-actions">
                    <button class="secondary" data-action="payment" data-id="${client.id}">Encaisser crédit</button>
                    <button class="secondary" data-action="edit" data-id="${client.id}">Modifier</button>
                    <button class="danger" data-action="delete" data-id="${client.id}">Supprimer</button>
                </div>
                <details>
                    <summary>Historique des achats</summary>
                    <ul>${renderHistory(client.history)}</ul>
                </details>`;
            container.appendChild(card);
        });
    }

    function renderHistory(history = []) {
        if (!history?.length) return '<li>Aucun achat.</li>';
        return history
            .slice()
            .reverse()
            .map(item => `<li>${new Date(item.date).toLocaleString('fr-FR')} - ${POSApp.formatCurrency(item.amount)} (Vente ${item.saleId})</li>`)
            .join('');
    }

    function addClient() {
        POSApp.openModal('Nouveau client', [
            { id: 'id', label: 'Identifiant', required: true },
            { id: 'name', label: 'Nom', required: true },
            { id: 'phone', label: 'Téléphone', required: true },
            { id: 'credit', label: 'Crédit initial', type: 'number', value: 0 }
        ], data => {
            POSApp.state.clients.push({
                id: data.id,
                name: data.name,
                phone: data.phone,
                credit: Number(data.credit || 0),
                history: []
            });
            persistState();
            POSApp.notify('Client ajouté', 'success');
            POSApp.refresh('clients');
            document.getElementById('modal').close();
        });
    }

    function editClient(id) {
        const client = POSApp.state.clients.find(c => c.id === id);
        if (!client) return;
        POSApp.openModal('Modifier le client', [
            { id: 'id', label: 'Identifiant', required: true, value: client.id },
            { id: 'name', label: 'Nom', required: true, value: client.name },
            { id: 'phone', label: 'Téléphone', required: true, value: client.phone },
            { id: 'credit', label: 'Crédit', type: 'number', value: client.credit }
        ], data => {
            Object.assign(client, {
                id: data.id,
                name: data.name,
                phone: data.phone,
                credit: Number(data.credit)
            });
            persistState();
            POSApp.notify('Client mis à jour', 'success');
            POSApp.refresh('clients');
            document.getElementById('modal').close();
        });
    }

    function deleteClient(id) {
        POSApp.state.clients = POSApp.state.clients.filter(c => c.id !== id);
        persistState();
        POSApp.notify('Client supprimé', 'success');
        POSApp.refresh('clients');
    }

    function registerPayment(id) {
        const client = POSApp.state.clients.find(c => c.id === id);
        if (!client) return;
        POSApp.openModal('Encaisser un crédit', [
            { id: 'amount', label: 'Montant encaissé', type: 'number', required: true }
        ], data => {
            const amount = Number(data.amount);
            client.credit = Math.max(0, (client.credit || 0) - amount);
            POSApp.state.finances.push({
                id: `REG-${Date.now()}`,
                type: 'income',
                amount,
                category: 'Règlement client',
                date: new Date().toISOString(),
                notes: client.name
            });
            persistState();
            POSApp.notify('Crédit client mis à jour', 'success');
            POSApp.refresh('clients');
            POSApp.refresh('finances');
            document.getElementById('modal').close();
        });
    }

    function handleActions(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const id = target.dataset.id;
        if (!id) return;
        if (target.dataset.action === 'edit') editClient(id);
        if (target.dataset.action === 'delete') deleteClient(id);
        if (target.dataset.action === 'payment') registerPayment(id);
    }

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || detail.section === 'clients') {
            renderClients();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        listContainer()?.addEventListener('click', handleActions);
        document.getElementById('add-client-btn')?.addEventListener('click', addClient);
        renderClients();
    });
})();
