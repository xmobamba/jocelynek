// Module Paramètres : configuration boutique, import/export base et thème

(function () {
    const form = () => document.getElementById('store-settings');
    const brandLogo = () => document.getElementById('brand-logo');

    function ensureBrandInitials() {
        const logo = brandLogo();
        if (logo && !logo.dataset.initials) {
            logo.dataset.initials = logo.textContent.trim() || 'JK';
        }
    }

    function applyLogo(src) {
        const logo = brandLogo();
        if (!logo) return;
        ensureBrandInitials();
        if (src) {
            logo.style.setProperty('--logo-image', `url(${src})`);
            logo.classList.add('has-image');
            logo.textContent = '';
        }
    }

    function resetLogo() {
        const logo = brandLogo();
        if (!logo) return;
        ensureBrandInitials();
        logo.classList.remove('has-image');
        logo.style.removeProperty('--logo-image');
        logo.textContent = logo.dataset.initials || 'JK';
    }

    function populateForm() {
        const settings = POSApp.state.settings;
        form()?.querySelectorAll('input').forEach(input => {
            if (input.id === 'setting-store-name') input.value = settings.storeName || '';
            if (input.id === 'setting-currency') input.value = settings.currency || 'FCFA';
            if (input.id === 'setting-tax') input.value = settings.tax ?? 0;
            if (input.id === 'setting-manual-pricing') input.checked = !!settings.manualPricing;
        });
    }

    function bindEvents() {
        form()?.addEventListener('submit', evt => {
            evt.preventDefault();
            const data = new FormData(form());
            POSApp.state.settings.storeName = data.get('setting-store-name');
            POSApp.state.settings.currency = data.get('setting-currency') || 'FCFA';
            POSApp.state.settings.tax = Number(data.get('setting-tax')) || 0;
            POSApp.state.settings.manualPricing = data.get('setting-manual-pricing') === 'on';
            persistState();
            POSApp.notify('Paramètres enregistrés', 'success');
            POSApp.refresh();
        });

        document.getElementById('download-backup')?.addEventListener('click', () => {
            const backup = backupData();
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'jk-backup.json';
            link.click();
            URL.revokeObjectURL(url);
        });

        document.getElementById('upload-backup')?.addEventListener('change', e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.data) {
                        restoreData(data.data);
                        POSApp.refresh();
                    } else {
                        restoreData(data);
                    }
                } catch (error) {
                    console.error(error);
                    POSApp.notify('Fichier invalide', 'error');
                }
            };
            reader.readAsText(file, 'utf-8');
        });

        document.getElementById('reset-data')?.addEventListener('click', () => {
            if (confirm('Réinitialiser toutes les données ?')) {
                POSApp.state = cloneState(DEFAULT_STATE);
                persistState();
                POSApp.refresh();
                POSApp.notify('Données réinitialisées', 'success');
                localStorage.removeItem('jk_logo');
                resetLogo();
            }
        });

        document.getElementById('setting-logo')?.addEventListener('change', e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                const dataUrl = event.target.result;
                localStorage.setItem('jk_logo', dataUrl);
                applyLogo(dataUrl);
                localStorage.setItem('jk_logo', event.target.result);
                document.querySelector('.brand img')?.setAttribute('src', event.target.result);
                POSApp.notify('Logo mis à jour', 'success');
            };
            reader.readAsDataURL(file);
        });
    }

    function loadLogo() {
        const stored = localStorage.getItem('jk_logo');
        if (stored) {
            applyLogo(stored);
        } else {
            resetLogo();
            document.querySelector('.brand img')?.setAttribute('src', stored);
        }
    }

    document.addEventListener('pos:refresh', ({ detail }) => {
        if (!detail?.section || detail.section === 'settings') {
            populateForm();
        }
        loadLogo();
    });

    document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
        populateForm();
        loadLogo();
    });
})();
