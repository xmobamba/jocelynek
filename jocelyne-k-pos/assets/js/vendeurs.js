/**
 * Vendeurs module initialisation.
 */

(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const { STORAGE_KEYS, getData, setData, generateId, showToast, formatCurrency } = window.JKPOS;

        const form = document.getElementById('vendorForm');
        const vendorList = document.getElementById('vendorList');
        const delegatedTable = document.querySelector('#delegatedTable tbody');
        const vendorSalesTable = document.querySelector('#vendorSalesTable tbody');

        if (!form || !vendorList || !delegatedTable || !vendorSalesTable) return;

        const vendors = getData(STORAGE_KEYS.vendors, []);
        const delegated = getData(STORAGE_KEYS.delegated, []);
        const sales = getData(STORAGE_KEYS.sales, []);

        renderVendors(vendors);
        renderDelegated(delegated);
        renderVendorSales(vendors, sales);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('vendorName').value.trim();
            if (!name) {
                showToast({ icon: 'error', title: 'Merci de renseigner un nom.' });
                return;
            }

            const updatedVendors = getData(STORAGE_KEYS.vendors, []);
            updatedVendors.push({
                id: generateId('vendor'),
                name,
                balance: 0
            });
            setData(STORAGE_KEYS.vendors, updatedVendors);
            renderVendors(updatedVendors);
            form.reset();
            showToast({ icon: 'success', title: 'Vendeur ajouté avec succès.' });
        });

        function renderVendors(list) {
            vendorList.innerHTML = '';
            list.forEach((vendor) => {
                const item = document.createElement('li');
                item.textContent = vendor.name;
                vendorList.appendChild(item);
            });
        }

        function renderDelegated(list) {
            delegatedTable.innerHTML = '';
            list.forEach((entry) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.vendorName}</td>
                    <td>${entry.productName}</td>
                    <td>${entry.quantity}</td>
                    <td>${formatCurrency(entry.totalValue || 0)}</td>
                `;
                delegatedTable.appendChild(row);
            });
        }

        function renderVendorSales(vendorsList, salesList) {
            vendorSalesTable.innerHTML = '';
            vendorsList.forEach((vendor) => {
                const vendorSales = salesList.filter((sale) => sale.vendor === vendor.name);
                const totalSales = vendorSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
                const totalAdvances = vendorSales.reduce((sum, sale) => sum + (sale.advance || 0), 0);
                const totalBalance = vendorSales.reduce((sum, sale) => sum + (sale.balance || 0), 0);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${vendor.name}</td>
                    <td>${formatCurrency(totalSales)}</td>
                    <td>${formatCurrency(totalAdvances)}</td>
                    <td>${formatCurrency(totalBalance)}</td>
                    <td>${formatCurrency(vendor.balance || 0)}</td>
                `;
                vendorSalesTable.appendChild(row);
            });
        }
    });
})();
