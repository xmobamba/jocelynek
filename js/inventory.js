// Module Inventaire : gestion des produits, imports, exports et alertes

(function () {
    const tableBody = () => document.getElementById('inventory-table');

    function renderInventory() {
        const tbody = tableBody();
        if (!tbody) return;
        const products = POSApp.state.products;
        tbody.innerHTML = '';
        if (!products.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 7;
            cell.textContent = 'Aucun produit enregistré.';
            row.appendChild(cell);
            tbody.appendChild(row);
            document.getElementById('low-stock-count').textContent = '0';
            return;
        }
        let lowStock = 0;
        products.forEach(product => {
            const isLowStock = product.stock <= 3;
            if (isLowStock) lowStock++;
            const row = document.createElement('tr');
            if (isLowStock) row.classList.add('low-stock');
            const stockBadge = isLowStock
                ? `<span class="chip danger">${product.stock}</span>`
                : product.stock >= 20
                    ? `<span class="chip success">${product.stock}</span>`
                    : `<span class="chip">${product.stock}</span>`;
            const assignedQuantity = totalAssignedToSellers(product.id);
            const assignedBadge = assignedQuantity
                ? `<span class="chip warning">${assignedQuantity}</span>`
                : '<span class="chip">0</span>';
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${POSApp.formatCurrency(product.price)}</td>
                <td>${stockBadge}</td>
                <td>${assignedBadge}</td>
                <td>
                    <button class="secondary" data-action="edit" data-id="${product.id}">Modifier</button>
                    <button class="danger" data-action="delete" data-id="${product.id}">Supprimer</button>
                </td>`;
            tbody.appendChild(row);
        });
        document.getElementById('low-stock-count').textContent = lowStock;
        document.getElementById('low-stock-card').classList.toggle('warning', lowStock > 0);
    }

    function totalAssignedToSellers(productId) {
        const sellers = Array.isArray(POSApp.state.sellers) ? POSApp.state.sellers : [];
        return sellers.reduce((sum, seller) => {
            const assignment = seller.assignments?.find(item => item.productId === productId);
            return sum + (assignment?.quantity || 0);
        }, 0);
    }

    function generateProductReference() {
        const prefix = 'PROD';
        const highest = POSApp.state.products.reduce((max, product) => {
            const match = product.id?.match(/(\d+)/);
            if (!match) return max;
            const numeric = Number(match[1]);
            return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
        }, 0);
        const next = highest + 1;
        return `${prefix}${String(next).padStart(3, '0')}`;
    }

    function addProduct() {
        const reference = generateProductReference();
        POSApp.openModal('Nouveau produit', [
            { id: 'id', label: 'Référence', required: true, value: reference, readonly: true },
            { id: 'name', label: 'Nom du produit', required: true },
            { id: 'category', label: 'Catégorie', required: true },
            { id: 'price', label: 'Prix de vente', required: true, type: 'number' },
            { id: 'stock', label: 'Stock disponible', required: true, type: 'number' }
        ], data => {
            if (POSApp.state.products.some(p => p.id === data.id)) {
                POSApp.notify('Un produit avec cette référence existe déjà.', 'error');
                return;
            }
            POSApp.state.products.push({
                id: data.id,
                name: data.name,
                category: data.category,
                price: Number(data.price),
                cost: Number(data.cost ?? 0) || 0,
                stock: Number(data.stock)
            });
            persistState();
            POSApp.notify('Produit ajouté avec succès', 'success');
            POSApp.refresh('inventory');
            POSApp.refresh('sales');
            document.getElementById('modal').close();
        });
    }

    function editProduct(id) {
        const product = POSApp.state.products.find(p => p.id === id);
        if (!product) return;
        POSApp.openModal('Modifier le produit', [
            { id: 'id', label: 'Référence', required: true, value: product.id, readonly: true },
            { id: 'name', label: 'Nom du produit', required: true, value: product.name },
            { id: 'category', label: 'Catégorie', required: true, value: product.category },
            { id: 'price', label: 'Prix de vente', required: true, type: 'number', value: product.price },
            { id: 'stock', label: 'Stock disponible', required: true, type: 'number', value: product.stock }
        ], data => {
            Object.assign(product, {
                id: data.id,
                name: data.name,
                category: data.category,
                price: Number(data.price),
                stock: Number(data.stock)
            });
            persistState();
            POSApp.notify('Produit mis à jour', 'success');
            POSApp.refresh('inventory');
            POSApp.refresh('sales');
            document.getElementById('modal').close();
        });
    }

    function deleteProduct(id) {
        POSApp.state.products = POSApp.state.products.filter(p => p.id !== id);
        POSApp.state.sellers.forEach(seller => {
            seller.assignments = seller.assignments?.filter(item => item.productId !== id) || [];
        });
        persistState();
        POSApp.notify('Produit supprimé', 'success');
        POSApp.refresh('inventory');
        POSApp.refresh('sellers');
        POSApp.refresh('sales');
    }

    function handleTableActions(event) {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const id = target.dataset.id;
        if (!id) return;
        if (target.dataset.action === 'edit') {
            editProduct(id);
        }
        if (target.dataset.action === 'delete') {
            if (confirm('Supprimer ce produit ?')) deleteProduct(id);
        }
    }

    function exportCSV() {
        const rows = [
            ['id', 'name', 'category', 'price', 'cost', 'stock'],
            ...POSApp.state.products.map(p => [p.id, p.name, p.category, p.price, p.cost ?? 0, p.stock])
        ];
        const csv = rows.map(r => r.join(';')).join('\n');
        downloadFile(csv, 'inventaire.csv', 'text/csv');
    }

    function exportJSON() {
        downloadFile(JSON.stringify(POSApp.state.products, null, 2), 'inventaire.json', 'application/json');
    }

    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    function importCSV(file) {
        const reader = new FileReader();
        reader.onload = e => {
            const lines = e.target.result.split(/\r?\n/).filter(Boolean);
            const [header, ...rows] = lines;
            const columns = header.split(';');
            const items = rows.map(row => {
                const values = row.split(';');
                const obj = {};
                columns.forEach((col, index) => (obj[col] = values[index]));
                obj.price = Number(obj.price ?? 0) || 0;
                obj.cost = Number(obj.cost ?? 0) || 0;
                obj.stock = Number(obj.stock ?? 0) || 0;
                delete obj.supplier;
                return obj;
            });
            POSApp.state.products = items;
            persistState();
            POSApp.notify('Import CSV réussi', 'success');
            POSApp.refresh('inventory');
            POSApp.refresh('sellers');
            POSApp.refresh('sales');
        };
        reader.readAsText(file, 'utf-8');
    }

    function importJSON(file) {
        const reader = new FileReader();
        reader.onload = e => {
            const data = JSON.parse(e.target.result);
            POSApp.state.products = data.map(item => ({
                ...item,
                price: Number(item.price ?? 0) || 0,
                cost: Number(item.cost ?? 0) || 0,
                stock: Number(item.stock ?? 0) || 0,
                supplier: undefined
            }));
            persistState();
            POSApp.notify('Import JSON réussi', 'success');
            POSApp.refresh('inventory');
            POSApp.refresh('sellers');
            POSApp.refresh('sales');
        };
        reader.readAsText(file, 'utf-8');
    }

    function bindEvents() {
        document.getElementById('add-product-btn')?.addEventListener('click', addProduct);
        tableBody()?.addEventListener('click', handleTableActions);
        document.getElementById('export-csv')?.addEventListener('click', exportCSV);
        document.getElementById('export-json')?.addEventListener('click', exportJSON);
        document.getElementById('print-labels')?.addEventListener('click', printLabels);
        document.getElementById('import-csv')?.addEventListener('change', e => {
            const file = e.target.files?.[0];
            if (file) importCSV(file);
            e.target.value = '';
        });
        document.getElementById('import-json')?.addEventListener('change', e => {
            const file = e.target.files?.[0];
            if (file) importJSON(file);
            e.target.value = '';
        });
    }

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || detail.section === 'inventory') {
            renderInventory();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
        renderInventory();
    });

    function generatePseudoQR(text) {
        const canvas = document.createElement('canvas');
        const modules = 21;
        const scale = 4;
        canvas.width = canvas.height = modules * scale;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        let seed = Array.from(text).reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0) || 1;
        const random = () => {
            seed = (seed * 16807) % 2147483647;
            return seed / 2147483647;
        };
        for (let y = 0; y < modules; y++) {
            for (let x = 0; x < modules; x++) {
                if (x < 4 && y < 4) continue;
                if (x > modules - 5 && y < 4) continue;
                if (x < 4 && y > modules - 5) continue;
                if (random() > 0.5) {
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
        return canvas.toDataURL('image/png');
    }

    function printLabels() {
        if (!POSApp.state.products.length) {
            POSApp.notify('Aucun produit à imprimer.', 'error');
            return;
        }
        document.getElementById('print-area')?.remove();
        const wrapper = document.createElement('div');
        wrapper.id = 'print-area';
        const sheet = document.createElement('div');
        sheet.className = 'label-sheet';
        POSApp.state.products.forEach(product => {
            const label = document.createElement('div');
            label.className = 'label';
            label.innerHTML = `
                <strong style="font-size:7px;">${product.name.slice(0, 12)}</strong>
                <span style="font-size:6px;">${POSApp.formatCurrency(product.price)}</span>
                <img src="${generatePseudoQR(product.id)}" alt="QR ${product.id}" style="width:6mm;height:6mm;">
            `;
            sheet.appendChild(label);
        });
        wrapper.appendChild(sheet);
        document.body.appendChild(wrapper);
        window.print();
        setTimeout(() => wrapper.remove(), 500);
    }
})();
