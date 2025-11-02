// JOCELYNE K POS SYSTEM - noyau applicatif
// Ce module gère le routage, le stockage local et les utilitaires globaux

const STORAGE_KEYS = {
    products: 'jk_products',
    sales: 'jk_sales',
<<<<<<< HEAD
    sellers: 'jk_sellers',
=======
    suppliers: 'jk_suppliers',
    clients: 'jk_clients',
>>>>>>> main
    finances: 'jk_finances',
    settings: 'jk_settings',
    backupDate: 'jk_last_backup'
};

const cloneState = data => {
    if (typeof structuredClone === 'function') {
        return structuredClone(data);
    }
    return JSON.parse(JSON.stringify(data));
};

const DEFAULT_STATE = {
    products: [
<<<<<<< HEAD
        { id: 'PROD001', name: 'Sac en cuir noir', category: 'Sacs', price: 13000, stock: 9, cost: 8000 },
        { id: 'PROD002', name: 'Chaussures dorées', category: 'Chaussures', price: 18000, stock: 8, cost: 11000 },
        { id: 'PROD003', name: 'Robe wax', category: 'Vêtements', price: 22000, stock: 4, cost: 15000 }
    ],
    sellers: [
        {
            id: 'VEN001',
            name: 'Aminata Koné',
            phone: '+225 07 55 11 22',
            notes: 'Marché de Cocody',
            assignments: [
                { productId: 'PROD001', quantity: 3, assignedAt: '2024-01-02T09:00:00.000Z' }
            ],
            history: []
        },
        {
            id: 'VEN002',
            name: 'Sali Diabaté',
            phone: '+225 05 44 33 77',
            notes: 'Tournée Abobo',
            assignments: [],
            history: []
        }
=======
        { id: 'PROD001', name: 'Sac en cuir noir', category: 'Sacs', price: 13000, stock: 12, supplier: 'FOUR001', cost: 8000 },
        { id: 'PROD002', name: 'Chaussures dorées', category: 'Chaussures', price: 18000, stock: 8, supplier: 'FOUR002', cost: 11000 },
        { id: 'PROD003', name: 'Robe wax', category: 'Vêtements', price: 22000, stock: 4, supplier: 'FOUR001', cost: 15000 }
    ],
    suppliers: [
        { id: 'FOUR001', name: 'Abidjan Import', phone: '+225 07 12 34 56', balance: 25000, advance: 5000, photo: '', history: [] },
        { id: 'FOUR002', name: 'Moda Paris', phone: '+33 6 11 22 33 44', balance: -8000, advance: 10000, photo: '', history: [] }
    ],
    clients: [
        { id: 'CLT001', name: 'Awa Koné', phone: '+225 05 44 32 10', credit: 15000, history: [] },
        { id: 'CLT002', name: 'Serge Traoré', phone: '+225 07 22 18 05', credit: 0, history: [] }
>>>>>>> main
    ],
    sales: [],
    finances: [],
    settings: {
        storeName: 'Boutique Jocelyne',
        currency: 'FCFA',
        tax: 0,
        theme: 'light',
<<<<<<< HEAD
        manualPricing: true
=======
        manualPricing: true,
        sellers: ['Aminata', 'Seydou', 'Default']
>>>>>>> main
    }
};

const POSApp = {
    state: cloneState(DEFAULT_STATE),
    currency() {
        return POSApp.state.settings.currency || 'FCFA';
    },
    formatCurrency(value) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(value).replace('XOF', POSApp.currency());
    },
    notify(message, type = 'info') {
        const existing = document.querySelector('.notification');
        existing?.remove();
        const div = document.createElement('div');
        div.className = `notification ${type}`;
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3500);
    },
    openModal(title, fields, onSubmit) {
        const modal = document.getElementById('modal');
        const form = document.getElementById('modal-form');
        form.innerHTML = '';
        const heading = document.createElement('h3');
        heading.textContent = title;
        form.appendChild(heading);
        fields.forEach(field => {
            const label = document.createElement('label');
            label.textContent = field.label;
            label.htmlFor = field.id;
            const input = field.type === 'textarea' ? document.createElement('textarea') : document.createElement(field.type === 'select' ? 'select' : 'input');
            input.id = field.id;
            input.name = field.id;
            if (field.type === 'select' && field.options) {
                field.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value ?? opt;
                    option.textContent = opt.label ?? opt;
                    input.appendChild(option);
                });
            }
            if (field.type !== 'select' && field.type !== 'textarea') {
                input.type = field.type || 'text';
            }
            if (field.value !== undefined) input.value = field.value;
            if (field.required) input.required = true;
            if (field.placeholder) input.placeholder = field.placeholder;
            if (field.min !== undefined) input.min = field.min;
            if (field.max !== undefined) input.max = field.max;
            if (field.step !== undefined) input.step = field.step;
            if (field.autofocus) input.autofocus = true;
            if (field.readonly) {
                input.readOnly = true;
                input.classList.add('readonly');
            }
            label.appendChild(input);
            if (field.helpText) {
                const hint = document.createElement('small');
                hint.className = 'field-hint';
                hint.textContent = field.helpText;
                label.appendChild(hint);
            }
            form.appendChild(label);
        });
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '0.75rem';
        actions.style.marginTop = '0.5rem';
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'secondary';
        cancelBtn.textContent = 'Annuler';
        cancelBtn.onclick = () => modal.close();
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Enregistrer';
        actions.append(cancelBtn, submitBtn);
        form.appendChild(actions);
        form.onsubmit = evt => {
            evt.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            onSubmit?.(data, modal.close.bind(modal));
        };
        modal.showModal();
    },
    refresh(section) {
        updateStoreBranding();
        document.dispatchEvent(new CustomEvent('pos:refresh', { detail: { section } }));
    }
};

// Stockage LocalStorage
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadData(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
}

function backupData() {
    const backup = {
        createdAt: new Date().toISOString(),
        data: POSApp.state
    };
    saveData('jk_backup', backup);
    saveData(STORAGE_KEYS.backupDate, new Date().toISOString());
    POSApp.notify('Sauvegarde locale effectuée', 'success');
    updateBackupInfo();
    return backup;
}

function restoreData(data) {
    POSApp.state = cloneState(data);
    ensureSettingsDefaults();
<<<<<<< HEAD
    ensureSellersDefaults();
=======
>>>>>>> main
    persistState();
    POSApp.notify('Base restaurée avec succès', 'success');
    POSApp.refresh();
}

function persistState() {
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        if (key === 'backupDate') return;
        saveData(storageKey, POSApp.state[key]);
    });
}

function loadStateFromStorage() {
    let initialized = false;
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        if (key === 'backupDate') return;
        const data = loadData(storageKey);
        if (data) {
            POSApp.state[key] = data;
            initialized = true;
        }
    });
    ensureSettingsDefaults();
<<<<<<< HEAD
    ensureSellersDefaults();
=======
>>>>>>> main
    if (!initialized) {
        persistState();
    }
}

function updateBackupInfo() {
    const last = loadData(STORAGE_KEYS.backupDate);
    if (last) {
        const info = document.getElementById('last-backup');
        const formatted = new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(last));
        info.textContent = `Dernière sauvegarde : ${formatted}`;
    }
}

function ensureSettingsDefaults() {
    const defaults = DEFAULT_STATE.settings;
    POSApp.state.settings = {
        ...defaults,
        ...POSApp.state.settings
    };
<<<<<<< HEAD
=======
    if (!Array.isArray(POSApp.state.settings.sellers) || !POSApp.state.settings.sellers.length) {
        POSApp.state.settings.sellers = [...defaults.sellers];
    }
>>>>>>> main
    if (typeof POSApp.state.settings.manualPricing !== 'boolean') {
        POSApp.state.settings.manualPricing = defaults.manualPricing;
    }
}

<<<<<<< HEAD
function ensureSellersDefaults() {
    if (!Array.isArray(POSApp.state.sellers) || !POSApp.state.sellers.length) {
        const legacyNames = Array.isArray(POSApp.state.settings?.sellers)
            ? POSApp.state.settings.sellers
            : [];
        if (legacyNames.length) {
            POSApp.state.sellers = legacyNames.map((name, index) => ({
                id: `VEN${String(index + 1).padStart(3, '0')}`,
                name,
                phone: '',
                notes: '',
                assignments: [],
                history: []
            }));
        } else {
            POSApp.state.sellers = cloneState(DEFAULT_STATE.sellers);
        }
    }
    POSApp.state.sellers = POSApp.state.sellers.map((seller, index) => ({
        id: seller.id || `VEN${String(index + 1).padStart(3, '0')}`,
        name: seller.name || `Vendeuse ${index + 1}`,
        phone: seller.phone || '',
        notes: seller.notes || '',
        assignments: Array.isArray(seller.assignments) ? seller.assignments : [],
        history: Array.isArray(seller.history) ? seller.history : []
    }));
    if (POSApp.state.settings?.sellers) {
        delete POSApp.state.settings.sellers;
    }
}

=======
>>>>>>> main
function updateOfflineStatus() {
    const status = document.getElementById('offline-status');
    if (!status) return;
    const online = navigator.onLine;
    status.querySelector('span').textContent = online ? 'En ligne (mode autonome)' : 'Hors ligne';
    status.querySelector('span').style.color = online ? 'var(--accent)' : 'var(--danger)';
    const topbarBadge = document.getElementById('topbar-status');
    if (topbarBadge) {
        topbarBadge.textContent = online ? 'En ligne' : 'Hors ligne';
        topbarBadge.classList.toggle('online', online);
    }
}

function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const section = btn.dataset.section;
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(section).classList.add('active');
            POSApp.refresh(section);
        });
    });
}

function initTheme() {
    const toggle = document.getElementById('toggle-theme');
    const applyTheme = () => {
        const theme = POSApp.state.settings.theme || 'light';
        document.body.classList.toggle('dark-theme', theme === 'dark');
        toggle.textContent = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
    };
    toggle.addEventListener('click', () => {
        POSApp.state.settings.theme = POSApp.state.settings.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        persistState();
    });
    applyTheme();
}

function initAutoBackup() {
    setInterval(() => {
        backupData();
    }, 10 * 60 * 1000);
}

function setupLoader() {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        const app = document.getElementById('app');
        app.classList.remove('hidden');
    }, 900);
}

function updateStoreBranding() {
    document.getElementById('store-name').textContent = POSApp.state.settings.storeName;
    document.title = `${POSApp.state.settings.storeName} - POS`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    setupLoader();
    initNavigation();
    initTheme();
    updateBackupInfo();
    updateOfflineStatus();
    updateStoreBranding();
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    document.getElementById('backup-btn').addEventListener('click', backupData);
    initAutoBackup();
    POSApp.refresh();
});

window.POSApp = POSApp;
window.saveData = saveData;
window.loadData = loadData;
window.backupData = backupData;
window.restoreData = restoreData;
window.persistState = persistState;
window.cloneState = cloneState;
