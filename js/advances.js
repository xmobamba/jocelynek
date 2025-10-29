import { todayISO } from './utils.js';

export function initAdvances(context) {
  const table = document.getElementById('advancesTable');
  const formWrapper = document.getElementById('advanceFormWrapper');
  const form = document.getElementById('advanceForm');
  const sellerSelect = document.getElementById('advanceSeller');
  const addBtn = document.querySelector('[data-action="add-advance"]');
  const cancelBtn = document.querySelector('[data-action="cancel-advance"]');

  function toggleForm(show = true) {
    formWrapper.hidden = !show;
    if (show) {
      populateSellers();
      form.reset();
      form.querySelector('input[name="amount"]').value = '';
      form.querySelector('input[name="date"]').value = todayISO();
      sellerSelect.focus();
    }
  }

  function populateSellers() {
    const { sellers } = context.getData();
    sellerSelect.innerHTML = sellers.map((seller) => `<option value="${seller.id}">${seller.name}</option>`).join('');
  }

  addBtn.addEventListener('click', () => toggleForm(true));
  cancelBtn.addEventListener('click', () => toggleForm(false));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const sellerId = formData.get('sellerId');
    const amount = Number(formData.get('amount')) || 0;
    const date = formData.get('date') || todayISO();
    const notes = (formData.get('notes') || '').trim();
    if (!sellerId || !amount) return;

    context.updateData((draft) => {
      draft.advances.push({
        id: crypto.randomUUID(),
        sellerId,
        amount,
        date,
        notes
      });
    });

    toggleForm(false);
  });

  function render() {
    const { advances, sellers, settings } = context.getData();
    populateSellers();

    if (!advances.length) {
      table.innerHTML = '<tr><td colspan="4" class="empty-state">Aucune avance enregistrée.</td></tr>';
      return;
    }

    table.innerHTML = advances
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((advance) => {
        const seller = sellers.find((sel) => sel.id === advance.sellerId);
        return `
          <tr>
            <td>${new Date(advance.date).toLocaleDateString('fr-FR')}</td>
            <td>${seller ? seller.name : '—'}</td>
            <td>${context.formatCurrency(advance.amount, settings.currency)}</td>
            <td>${advance.notes || '—'}</td>
          </tr>
        `;
      })
      .join('');
  }

  return { render };
}
