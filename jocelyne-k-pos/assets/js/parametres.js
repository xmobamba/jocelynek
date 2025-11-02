/**
 * Paramètres module initialisation.
 */

(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const { STORAGE_KEYS, getData, setData, showToast, generateId } = window.JKPOS;

        const storeForm = document.getElementById('storeForm');
        const userForm = document.getElementById('userForm');
        const usersTableBody = document.querySelector('#usersTable tbody');
        const exportButton = document.getElementById('exportData');
        const importInput = document.getElementById('importData');

        if (!storeForm || !userForm || !usersTableBody) return;

        const settings = getData(STORAGE_KEYS.settings, window.JKPOS.DEFAULT_SETTINGS);
        renderUsers(settings.users || []);
        populateStoreForm(settings);

        storeForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(storeForm);
            settings.stores[0].name = formData.get('storeName') || settings.stores[0].name;
            settings.stores[0].address = formData.get('storeAddress') || '';
            settings.stores[0].phone = formData.get('storePhone') || '';
            setData(STORAGE_KEYS.settings, settings);
            showToast({ icon: 'success', title: 'Informations boutique mises à jour.' });
        });

        userForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('userName').value.trim();
            const role = document.getElementById('userRole').value;
            if (!name) {
                showToast({ icon: 'error', title: 'Merci de renseigner un nom.' });
                return;
            }
            const newUser = { id: generateId('user'), name, role };
            settings.users.push(newUser);
            setData(STORAGE_KEYS.settings, settings);
            renderUsers(settings.users);
            userForm.reset();
            showToast({ icon: 'success', title: 'Utilisateur ajouté.' });
        });

        usersTableBody.addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('button[data-user]')) {
                const userId = target.getAttribute('data-user');
                settings.users = settings.users.filter((user) => user.id !== userId);
                setData(STORAGE_KEYS.settings, settings);
                renderUsers(settings.users);
                showToast({ icon: 'info', title: 'Utilisateur supprimé.' });
            }
        });

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                const data = {
                    products: getData(STORAGE_KEYS.products, []),
                    sales: getData(STORAGE_KEYS.sales, []),
                    vendors: getData(STORAGE_KEYS.vendors, []),
                    delegated: getData(STORAGE_KEYS.delegated, []),
                    settings: getData(STORAGE_KEYS.settings, window.JKPOS.DEFAULT_SETTINGS)
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'jocelyne-k-pos-backup.json';
                link.click();
                URL.revokeObjectURL(url);
            });
        }

        if (importInput) {
            importInput.addEventListener('change', (event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        Object.entries(data).forEach(([key, value]) => {
                            const storageKey = STORAGE_KEYS[key];
                            if (storageKey) setData(storageKey, value);
                        });
                        showToast({ icon: 'success', title: 'Importation réussie.' });
                    } catch (error) {
                        console.error(error);
                        showToast({ icon: 'error', title: "Le fichier n'est pas valide." });
                    }
                };
                reader.readAsText(file);
            });
        }

        function renderUsers(users) {
            usersTableBody.innerHTML = '';
            users.forEach((user) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.role}</td>
                    <td><button class="btn btn--tiny" data-user="${user.id}">Supprimer</button></td>
                `;
                usersTableBody.appendChild(row);
            });
        }

        function populateStoreForm(settings) {
            storeForm.querySelector('#storeName').value = settings.stores?.[0]?.name || '';
            storeForm.querySelector('#storeAddress').value = settings.stores?.[0]?.address || '';
            storeForm.querySelector('#storePhone').value = settings.stores?.[0]?.phone || '';
        }
    });
})();
