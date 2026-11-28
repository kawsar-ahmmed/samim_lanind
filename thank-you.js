(() => {
  const money = amount => `৳${Number(amount || 0).toLocaleString('bn-BD')}`;
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order');
  const summary = document.getElementById('order-summary');
  const addRow = (label, value, emphasized = false) => {
    const row = document.createElement('div');
    row.className = `summary-row${emphasized ? ' total-row' : ''}`;
    const title = document.createElement('span');
    title.textContent = label;
    const content = document.createElement('strong');
    content.textContent = value;
    row.append(title, content);
    summary.append(row);
  };

  async function showOrder() {
    if (!orderId) throw new Error('এই অর্ডারের তথ্য পাওয়া যায়নি।');
    const storedOrder = sessionStorage.getItem(`dressify-order-${orderId}`);
    if (!storedOrder) throw new Error('আপনার অর্ডার জমা হয়েছে। অর্ডারের সারাংশ দেখতে দোকানে যোগাযোগ করুন।');
    const order = JSON.parse(storedOrder);
    if (order.id !== orderId) throw new Error('অর্ডারের তথ্য পাওয়া যায়নি।');
    document.getElementById('order-reference').textContent = `অর্ডার নম্বর · ${order.id}`;
    summary.replaceChildren();
    addRow('পণ্য', order.product);
    addRow('সাইজ ও পরিমাণ', `${order.size} · ${order.quantity} টি`);
    addRow('ডেলিভারি ঠিকানা', order.address);
    addRow('পণ্যের মূল্য', money(order.subtotal));
    addRow('ডেলিভারি চার্জ', money(order.deliveryCharge));
    addRow('সর্বমোট', money(order.amount), true);
  }

  showOrder().catch(error => {
    document.getElementById('success-mark').textContent = 'i';
    document.getElementById('success-mark').classList.add('info-mark');
    document.getElementById('order-state').textContent = 'ORDER DETAILS';
    document.getElementById('thankyou-title').textContent = 'অর্ডারটি জমা হয়েছে';
    document.getElementById('thankyou-copy').textContent = error.message;
    summary.replaceChildren();
    document.getElementById('order-reference').textContent = orderId ? `অর্ডার নম্বর · ${orderId}` : '';
  });
})();
