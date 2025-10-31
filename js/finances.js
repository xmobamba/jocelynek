// Module Finances : suivi des dépenses, recettes et export CSV

(function () {
    function renderFinances() {
        const tbody = document.getElementById('finances-table');
        if (!tbody) return;
        tbody.innerHTML = '';
        const finances = POSApp.state.finances.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
        if (!finances.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'Aucun mouvement enregistré.';
            row.appendChild(cell);
            tbody.appendChild(row);
            updateSummary();
            return;
        }
        finances.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(entry.date).toLocaleString('fr-FR')}</td>
                <td>${entry.type === 'income' ? 'Recette' : 'Dépense'}</td>
                <td>${POSApp.formatCurrency(entry.amount)}</td>
                <td>${entry.category}</td>
                <td>${entry.notes || ''}</td>`;
            tbody.appendChild(row);
        });
        updateSummary();
    }

    function updateSummary() {
        const month = new Date().toISOString().slice(0, 7);
        let expenses = 0;
        let income = 0;
        POSApp.state.finances.forEach(entry => {
            if (entry.date.slice(0, 7) !== month) return;
            if (entry.type === 'expense') expenses += entry.amount;
            if (entry.type === 'income') income += entry.amount;
        });
        document.getElementById('monthly-expenses').textContent = POSApp.formatCurrency(expenses);
        document.getElementById('monthly-income').textContent = POSApp.formatCurrency(income);
        document.getElementById('monthly-profit').textContent = POSApp.formatCurrency(income - expenses);
    }

    function addEntry(type) {
        POSApp.openModal(type === 'expense' ? 'Nouvelle dépense' : 'Nouvelle recette', [
            { id: 'amount', label: 'Montant', type: 'number', required: true },
            { id: 'category', label: 'Catégorie', required: true },
            { id: 'notes', label: 'Notes' }
        ], data => {
            POSApp.state.finances.push({
                id: `${type}-${Date.now()}`,
                type,
                amount: Number(data.amount),
                category: data.category,
                notes: data.notes,
                date: new Date().toISOString()
            });
            persistState();
            POSApp.notify('Mouvement enregistré', 'success');
            POSApp.refresh('finances');
            document.getElementById('modal').close();
        });
    }

    function exportCSV() {
        const rows = [
            ['date', 'type', 'amount', 'category', 'notes'],
            ...POSApp.state.finances.map(entry => [
                entry.date,
                entry.type,
                entry.amount,
                entry.category,
                entry.notes || ''
            ])
        ];
        const csv = rows.map(r => r.join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'finances.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || detail.section === 'finances' || detail.section === 'dashboard') {
            renderFinances();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('add-expense-btn')?.addEventListener('click', () => addEntry('expense'));
        document.getElementById('add-income-btn')?.addEventListener('click', () => addEntry('income'));
        document.getElementById('export-finance-csv')?.addEventListener('click', exportCSV);
        renderFinances();
    });
})();
