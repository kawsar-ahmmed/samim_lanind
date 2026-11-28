(() => {
  const statuses = ['pending', 'active', 'delivered'];
  const statusLabels = { pending: 'Pending', active: 'Active', delivered: 'Delivered' };
  const formatMoney = amount => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;
  const formatDate = value => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  const byId = id => document.getElementById(id);
  const tbody = byId('orders-body');
  let orders = [];

  function addCell(row, content, className = '') {
    const cell = document.createElement('td');
    if (className) cell.className = className;
    if (content instanceof Node) cell.append(content);
    else cell.textContent = content;
    row.append(cell);
    return cell;
  }

  function renderStats() {
    byId('stat-total').textContent = orders.length.toLocaleString('en-US');
    for (const status of statuses) {
      byId(`stat-${status}`).textContent = orders.filter(order => order.status === status).length.toLocaleString('en-US');
    }
    const deliveredAmount = orders.filter(order => order.status === 'delivered').reduce((sum, order) => sum + Number(order.amount || 0), 0);
    byId('stat-amount').textContent = formatMoney(deliveredAmount);
  }

  function renderOrders() {
    const query = byId('order-search').value.trim().toLocaleLowerCase();
    const filter = byId('status-filter').value;
    const filtered = orders.filter(order => {
      const matchesStatus = filter === 'all' || order.status === filter;
      const matchesText = `${order.id} ${order.customer} ${order.phone} ${order.product} ${order.address}`.toLocaleLowerCase().includes(query);
      return matchesStatus && matchesText;
    });
    tbody.replaceChildren();

    for (const order of filtered) {
      const row = document.createElement('tr');
      addCell(row, order.id, 'order-id');
      const customer = document.createElement('div');
      customer.className = 'customer-cell';
      const customerName = document.createElement('strong');
      customerName.textContent = order.customer;
      const phone = document.createElement('small');
      phone.textContent = order.phone;
      const address = document.createElement('small');
      address.className = 'address-line';
      address.textContent = order.address;
      address.title = order.address;
      customer.append(customerName, phone, address);
      addCell(row, customer);

      const product = document.createElement('div');
      product.className = 'product-cell';
      product.textContent = order.product;
      const details = document.createElement('small');
      const area = order.deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka';
      details.textContent = `${order.size} · Qty ${order.quantity} · ${area}`;
      product.append(details);
      addCell(row, product);
      addCell(row, formatDate(order.createdAt));
      addCell(row, formatMoney(order.amount), 'amount-cell');

      const statusSelect = document.createElement('select');
      statusSelect.className = `status-select ${order.status}`;
      statusSelect.setAttribute('aria-label', `Status for ${order.id}`);
      for (const status of statuses) {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = statusLabels[status];
        option.selected = order.status === status;
        statusSelect.append(option);
      }
      statusSelect.addEventListener('change', () => updateStatus(order, statusSelect));
      addCell(row, statusSelect);
      addCell(row, '');
      tbody.append(row);
    }

    const noOrders = orders.length === 0;
    byId('empty-state').hidden = !noOrders;
    byId('no-results').hidden = noOrders || filtered.length > 0;
    byId('order-count').textContent = `${filtered.length.toLocaleString('en-US')} ${filtered.length === 1 ? 'order' : 'orders'}`;
    byId('table-wrap').classList.toggle('is-empty', noOrders);
  }

  function render() {
    renderStats();
    renderOrders();
  }

  async function loadOrders() {
    const note = byId('connection-note');
    note.textContent = 'Loading shared order data…';
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result)) throw new Error(result.error || 'Could not load orders.');
      orders = result;
      note.textContent = 'Order data is saved on the store server and shared with this dashboard.';
      render();
    } catch {
      orders = [];
      note.textContent = 'Could not connect to the order server. Start the site with “npm start” and refresh this page.';
      render();
    }
  }

  async function updateStatus(order, select) {
    const nextStatus = select.value;
    select.disabled = true;
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Status update failed.');
      order.status = result.order.status;
      render();
    } catch {
      await loadOrders();
    }
  }

  byId('refresh-orders').addEventListener('click', loadOrders);
  byId('order-search').addEventListener('input', renderOrders);
  byId('status-filter').addEventListener('change', renderOrders);
  loadOrders();
  window.setInterval(loadOrders, 15000);
})();
