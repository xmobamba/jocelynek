/**
 * Application shell utilities for JOCELYNE K POS SYSTEM
 * Handles localStorage interactions, theme, and shared helpers.
 */

(function () {
    const STORAGE_KEYS = {
        products: 'jk-pos-products',
        sales: 'jk-pos-sales',
        vendors: 'jk-pos-vendors',
        settings: 'jk-pos-settings',
        delegated: 'jk-pos-delegated',
        history: 'jk-pos-history'
    };

    const DEFAULT_SETTINGS = {
        stores: [
            {
                id: 'cocovico',
                name: 'Jocelyne K Cocovico',
                address: '',
                phone: ''
            },
            {
                id: 'djorobite',
                name: 'Jocelyne K Djorobité',
                address: '',
                phone: ''
            }
        ],
        users: [
            { id: 'user-1', name: 'Administrateur', role: 'Admin' }
        ],
        theme: 'light',
        logo: 'assets/img/logo.png'
    };

    function getData(key, fallback = []) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return Array.isArray(fallback) ? [...fallback] : { ...fallback };
            return JSON.parse(raw);
        } catch (error) {
            console.warn(`Impossible de récupérer la clé ${key}`, error);
            return Array.isArray(fallback) ? [...fallback] : { ...fallback };
        }
    }

    function setData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function ensureDefaults() {
        if (!localStorage.getItem(STORAGE_KEYS.products)) setData(STORAGE_KEYS.products, []);
        if (!localStorage.getItem(STORAGE_KEYS.sales)) setData(STORAGE_KEYS.sales, []);
        if (!localStorage.getItem(STORAGE_KEYS.vendors)) setData(STORAGE_KEYS.vendors, []);
        if (!localStorage.getItem(STORAGE_KEYS.delegated)) setData(STORAGE_KEYS.delegated, []);
        if (!localStorage.getItem(STORAGE_KEYS.history)) setData(STORAGE_KEYS.history, []);
        if (!localStorage.getItem(STORAGE_KEYS.settings)) setData(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(Number(value) || 0);
    }

    function formatDate(date) {
        return new Intl.DateTimeFormat('fr-FR').format(new Date(date));
    }

    function generateId(prefix) {
        const timestamp = Date.now().toString(36);
        return `${prefix}-${timestamp}`;
    }

    function generateProductReference(products) {
        const nextNumber = (products.length + 1).toString().padStart(4, '0');
        return `JK-${nextNumber}`;
    }

    function generateSaleId(sales) {
        const year = new Date().getFullYear();
        const nextNumber = (sales.length + 1).toString().padStart(3, '0');
        return `V-${year}-${nextNumber}`;
    }

    function showToast({ icon = 'success', title }) {
        Swal.fire({
            toast: true,
            icon,
            title,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
        });
    }

    function bindThemeToggle() {
        const settings = getData(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
        document.body.dataset.theme = settings.theme || 'light';

        const select = document.getElementById('themeToggle');
        if (select) {
            select.value = settings.theme || 'light';
            select.addEventListener('change', () => {
                settings.theme = select.value;
                setData(STORAGE_KEYS.settings, settings);
                document.body.dataset.theme = settings.theme;
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        ensureDefaults();
        bindThemeToggle();
    });

    window.JKPOS = {
        STORAGE_KEYS,
        DEFAULT_SETTINGS,
        getData,
        setData,
        ensureDefaults,
        formatCurrency,
        formatDate,
        generateId,
        generateProductReference,
        generateSaleId,
        showToast
    };
})();
