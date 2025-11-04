const ParametresModule = (function () {
    const FORM_ID = 'settings-form';

    function renderBoutiqueInputs(boutiques) {
        const container = document.getElementById('boutique-inputs');
        if (!container) return;
        container.innerHTML = boutiques
            .map(boutique => `
                <div class="boutique-card" data-boutique="${boutique.id}">
                    <h4>${boutique.name}</h4>
                    <label>Nom de la boutique</label>
                    <input type="text" data-field="name" value="${boutique.name}" />
                    <label>Couleur dédiée</label>
                    <input type="color" data-field="color" value="${boutique.color || '#ff7a00'}" />
                    <label>Logo (URL)</label>
                    <input type="url" data-field="logo" value="${(boutique.logo && boutique.logo !== POSApp.DEFAULT_LOGO) ? boutique.logo : ''}" placeholder="https://" />
                </div>
            `)
            .join('');
    }

    function populateForm() {
        const data = POSApp.getData();
        const mainLogo = data.settings.logo && data.settings.logo !== POSApp.DEFAULT_LOGO ? data.settings.logo : '';
        document.getElementById('settings-logo').value = mainLogo;
        document.getElementById('settings-theme-primary').value = data.settings.theme.primary;
        document.getElementById('settings-theme-accent').value = data.settings.theme.accent;
        document.getElementById('settings-tax').value = data.settings.taxRate || 0;
        document.getElementById('settings-ai-key').value = data.settings.aiKey || '';
        renderBoutiqueInputs(data.settings.boutiques);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const logo = document.getElementById('settings-logo').value.trim();
        const primary = document.getElementById('settings-theme-primary').value;
        const accent = document.getElementById('settings-theme-accent').value;
        const taxRate = Number(document.getElementById('settings-tax').value) || 0;
        const newPassword = document.getElementById('settings-password').value;
        const aiKey = document.getElementById('settings-ai-key').value.trim();
        const boutiqueNodes = document.querySelectorAll('.boutique-card');
        const updatedBoutiques = [];
        let hasError = false;

        boutiqueNodes.forEach(node => {
            const id = node.dataset.boutique;
            const name = node.querySelector('[data-field="name"]').value.trim();
            const color = node.querySelector('[data-field="color"]').value;
            const logoUrl = node.querySelector('[data-field="logo"]').value.trim();
            if (!name) {
                hasError = true;
            }
            updatedBoutiques.push({ id, name: name || id, color, logo: logoUrl || POSApp.DEFAULT_LOGO });
        });

        if (hasError) {
            alert('Le nom de la boutique ne peut pas être vide.');
            return;
        }

        try {
            POSApp.updateData(store => {
                store.settings.logo = logo || POSApp.DEFAULT_LOGO;
                store.settings.theme = { primary, accent };
                store.settings.taxRate = taxRate;
                store.settings.aiKey = aiKey;
                store.settings.boutiques = updatedBoutiques;
                if (newPassword) {
                    store.password = newPassword;
                }
            });
            POSApp.setTheme(primary, accent);
            document.getElementById('settings-password').value = '';
            alert('Paramètres enregistrés avec succès.');
        } catch (error) {
            console.error(error);
        }
    }

    function handleExport() {
        const dataStr = JSON.stringify(POSApp.getData(), null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().toISOString().split('T')[0];
        link.download = `jocelynek-pos-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function handleImport(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target.result);
                if (!content.products || !content.sales) {
                    alert('Fichier invalide.');
                    return;
                }
                const current = POSApp.getData();
                const sanitized = {
                    products: content.products || [],
                    sales: content.sales || [],
                    sellers: content.sellers || [],
                    settings: {
                        ...current.settings,
                        ...(content.settings || {}),
                        theme: {
                            ...current.settings.theme,
                            ...((content.settings && content.settings.theme) || {})
                        },
                        boutiques: ((content.settings && content.settings.boutiques) || current.settings.boutiques).map(b => ({
                            ...b,
                            logo: b.logo || POSApp.DEFAULT_LOGO
                        }))
                    },
                    password: content.password || current.password
                };
                sanitized.settings.logo = sanitized.settings.logo || POSApp.DEFAULT_LOGO;
                POSApp.saveData(sanitized);
                populateForm();
                alert('Importation réussie.');
            } catch (error) {
                alert('Impossible de lire le fichier.');
            }
        };
        reader.readAsText(file);
    }

    function handleReset() {
        if (confirm('Voulez-vous vraiment réinitialiser toutes les données ?')) {
            localStorage.removeItem('jk_pos_data');
            location.reload();
        }
    }

    function attachEvents() {
        const form = document.getElementById(FORM_ID);
        const exportBtn = document.getElementById('export-data');
        const importInput = document.getElementById('import-data');
        const resetBtn = document.getElementById('reset-data');

        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        if (exportBtn) {
            exportBtn.addEventListener('click', handleExport);
        }
        if (importInput) {
            importInput.addEventListener('change', handleImport);
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', handleReset);
        }
    }

    function init() {
        populateForm();
        attachEvents();
        POSApp.eventTarget.addEventListener('pos-data-updated', populateForm);
    }

    return { init };
})();
