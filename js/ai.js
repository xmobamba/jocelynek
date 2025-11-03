// Module Assistant IA : réponses contextuelles hors ligne

(function () {
    const responses = [
        { keywords: ['vente', 'journalier'], answer: 'Les ventes du jour apparaissent dans la carte "Ventes du jour". Utilisez le module Ventes pour enregistrer une transaction.' },
        { keywords: ['stock', 'faible'], answer: 'Le système déclenche une alerte lorsque le stock est inférieur ou égal à 3 unités. Consultez la section Inventaire.' },
        { keywords: ['paramètre', 'taxe'], answer: 'Rendez-vous dans Paramètres pour définir la TVA, la devise et le nom de la boutique.' },
        { keywords: ['vendeuse'], answer: 'Dans Vendeuses, cliquez sur "Ajouter une vendeuse" pour suivre les stocks confiés et leurs retours.' },
        { keywords: ['retour', 'stock'], answer: 'Ouvrez l\'onglet Vendeuses et utilisez "Retour stock" pour remettre les articles invendus en boutique.' },
        { keywords: ['backup', 'sauvegarde'], answer: 'Cliquez sur "Sauvegarder" ou utilisez Paramètres > Exporter la base JSON pour créer une sauvegarde locale.' }
    ];

    const aiMessages = () => document.getElementById('ai-messages');

    function addMessage(text, type) {
        const message = document.createElement('div');
        message.className = `ai-message ${type}`;
        message.textContent = text;
        aiMessages().appendChild(message);
        aiMessages().scrollTop = aiMessages().scrollHeight;
    }

    function getResponse(question) {
        const lower = question.toLowerCase();
        const match = responses.find(entry => entry.keywords.every(keyword => lower.includes(keyword)));
        if (match) return match.answer;
        if (lower.includes('bénéfice') || lower.includes('profit')) {
            return `Le bénéfice net du mois est de ${document.getElementById('monthly-profit').textContent}.`;
        }
        if (lower.includes('vente')) {
            return `Vous avez réalisé ${document.getElementById('daily-sales-count').textContent} pour un total de ${document.getElementById('daily-sales').textContent}.`;
        }
        return 'Je suis un assistant hors ligne. Posez-moi des questions sur les ventes, l\'inventaire, les vendeuses ou les paramètres.';
    }

    function togglePanel(show) {
        document.querySelector('.ai-panel').classList.toggle('hidden', !show);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('ai-toggle');
        const closeBtn = document.getElementById('ai-close');
        const form = document.getElementById('ai-form');
        toggle?.addEventListener('click', () => togglePanel(true));
        closeBtn?.addEventListener('click', () => togglePanel(false));
        form?.addEventListener('submit', evt => {
            evt.preventDefault();
            const input = document.getElementById('ai-input');
            const value = input.value.trim();
            if (!value) return;
            addMessage(value, 'user');
            setTimeout(() => {
                addMessage(getResponse(value), 'bot');
            }, 400);
            input.value = '';
        });
        addMessage('Bonjour ! Je suis votre assistante IA hors ligne. Comment puis-je aider ?', 'bot');
    });
})();
