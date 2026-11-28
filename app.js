const STORE_WHATSAPP = '8801983930599';
const DELIVERY_CHARGES = { dhaka: 80, outside: 150 };

const products = [
  {id:'gulabi-garden', name:'Embroidered Kameez', category:'প্রতিদিনের কালেকশন', tagline:'ফুলেল নকশায় মিষ্টি সাজ।', price:1499, badge:'সবচেয়ে জনপ্রিয়', color:'গোলাপি · আইভরি', fabric:'নরম সুতি মিশ্রণ', image:'Img/1.webp', position:'center 28%', intro:'নরম গোলাপি রং আর সূক্ষ্ম ফুলেল নকশার এই থ্রি-পিসটি প্রতিদিনের সাজে এনে দেবে নতুন আনন্দ। সুন্দর ছোট ছোট ডিটেইলস—যা আপনার দৈনন্দিন মুহূর্তকে করে তুলবে আরও রঙিন।'},
  {id:'nil-nodi', name:'Beige Floral Readymade 3-Piece', category:'সহজ দিনের কালেকশন', tagline:'যেখানেই যান, থাকুক নীলের ছোঁয়া।', price:1299, badge:'নতুন এসেছে', color:'নীল · আকাশি', fabric:'প্রিন্ট করা লন কাপড়', image:'Img/2.webp', position:'center 27%', intro:'সতেজ নীল রঙের ছোঁয়া আর আরামদায়ক নকশা। দুপুরের আড্ডা, বেড়ানো কিংবা ব্যস্ত দিনের জন্য নীল নদী হতে পারে আপনার সহজ পছন্দ।'},
  {id:'shonar-roddur', name:'Royal Purple Readymade 3-Piece', category:'উৎসবের কালেকশন', tagline:'সোনালি বিকেলের মতো সুন্দর।', price:1299, badge:'সীমিত কালেকশন', color:'গাঁদা · ক্রিম', fabric:'টেক্সচার করা সুতি', image:'Img/3.webp', position:'center 25%', intro:'উষ্ণ গাঁদা রং আর যত্নের নকশায় সোনার রোদ্দুর নিয়ে আসুক আপনার সাজে উৎসবের আমেজ। দাওয়াত কিংবা সাধারণ দিনে—রঙের উজ্জ্বলতায় নিজেকে সাজান।'},
  {id:'joba-bagan', name:'Navy Blue Readymade 3-Piece', category:'প্রতিদিনের কালেকশন', tagline:'আপনার রঙিন দিনগুলোর সঙ্গী।', price:1299, badge:'সবার পছন্দ', color:'কোরাল · হালকা গোলাপি', fabric:'প্রিন্ট করা সুতি', image:'Img/4.webp', position:'center 24%', intro:'প্রাণবন্ত কোরাল রং আর আরামদায়ক কাটের এই থ্রি-পিসটি পরুন যখন আপনার সাজে চাই একটু বাড়তি রঙ।'},
  {id:'megh-mala', name:'Blue Readymade 3-Piece', category:'স্নিগ্ধ দিনের কালেকশন', tagline:'প্রতিদিনের সাজে স্নিগ্ধতার ছোঁয়া।', price:1099, badge:'প্রিয় পছন্দ', color:'সেজ · হালকা ধূসর', fabric:'আরামদায়ক লন কাপড়', image:'Img/5.webp', position:'center 25%', intro:'স্নিগ্ধ সেজ রং আর হালকা কাপড়ে মেঘমালা গরম দিনের জন্য আরামদায়ক পছন্দ। তিনটি পোশাক একসঙ্গে, আপনার মতো করে সাজিয়ে নিন।'},
  {id:'raat-rani', name:'Black & White Readymade 3-Piece', category:'উৎসবের কালেকশন', tagline:'সাজে থাকুক একটু আভিজাত্য।', price:1099, badge:'বিশেষ দিনের সাজ', color:'বেরি · প্লাম', fabric:'নকশা করা সুতি মিশ্রণ', image:'Img/6.webp', position:'center 25%', intro:'গাঢ় বেরি রং আর সূক্ষ্ম নকশায় রাতরানি বিশেষ দিনের সাজে এনে দেবে আভিজাত্য। মনে রাখার মতো সন্ধ্যার জন্য সুন্দর একটি থ্রি-পিস।'}
];

const money = value => `৳${value.toLocaleString('bn-BD')}`;
const whatsappNumber = STORE_WHATSAPP.replace(/\D/g, '');
const pageProduct = products.find(p => p.id === new URLSearchParams(location.search).get('item'));
const whatsappMessage = pageProduct
  ? `আসসালামু আলাইকুম, ${pageProduct.name} থ্রি-পিসটি অর্ডার করতে চাই।`
  : 'আসসালামু আলাইকুম, Dressify-এর থ্রি-পিস সম্পর্কে জানতে চাই।';
document.querySelectorAll('[data-whatsapp-cta]').forEach(link => {
  link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
});

const cardGrid = document.querySelector('#product-grid');
if (cardGrid) {
  cardGrid.innerHTML = products.map((p, i) => `
    <article class="product-card">
      <a class="product-image-wrap" href="product.html?item=${p.id}" aria-label="${p.name} দেখুন">
        <img class="product-image" src="${p.image}" alt="${p.name} থ্রি-পিস" style="object-position:${p.position}" loading="lazy">
      </a>
      <div class="product-meta"><a class="product-name" href="product.html?item=${p.id}">${p.name}</a><span class="product-price">${money(p.price)}</span></div>
      <a class="product-order button button-dark" href="product.html?item=${p.id}">অর্ডার করুন <span>↗</span></a>
    </article>`).join('');
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear().toLocaleString('bn-BD');

const productPage = document.querySelector('.product-page');
if (productPage) {
  const id = new URLSearchParams(location.search).get('item');
  const product = products.find(p => p.id === id) || products[0];
  document.title = `Dressify | ${product.name} থ্রি-পিস`;
  document.querySelector('#crumb-name').textContent = product.name;
  document.querySelector('#detail-category').textContent = product.category;
  document.querySelector('#detail-name').textContent = product.name;
  document.querySelector('#detail-price').textContent = money(product.price);
  document.querySelector('#detail-intro').textContent = product.intro;
  const deliverySelect = document.querySelector('#delivery-area');
  const deliverySummary = document.querySelector('#delivery-summary');
  const quantityInput = document.querySelector('#quantity');
  const updateDeliverySummary = () => {
    const charge = DELIVERY_CHARGES[deliverySelect.value];
    const quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);
    deliverySummary.textContent = charge
      ? `পণ্যের মূল্য: ${money(product.price * quantity)} · ডেলিভারি চার্জ: ${money(charge)} · সর্বমোট: ${money(product.price * quantity + charge)}`
      : `পণ্যের মূল্য: ${money(product.price * quantity)} · ডেলিভারি চার্জ ও সর্বমোট দেখতে এলাকা বেছে নিন।`;
  };
  deliverySelect.addEventListener('change', updateDeliverySummary);
  quantityInput.addEventListener('input', updateDeliverySummary);
  updateDeliverySummary();
  const detailImage = document.querySelector('#detail-image');
  detailImage.style.backgroundImage = `url("${product.image}")`;
  detailImage.style.backgroundPosition = product.position;
  detailImage.setAttribute('role', 'img');
  detailImage.setAttribute('aria-label', `${product.name} থ্রি-পিস`);
  const form = document.querySelector('#order-form');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const feedback = document.querySelector('#form-feedback');
    const size = document.querySelector('#size').value;
    const deliveryArea = deliverySelect.value;
    const quantity = Number.parseInt(quantityInput.value, 10);
    if (!size) {
      feedback.textContent = 'আপনার জন্য সঠিক মাপটি পাঠাতে সাইজ বেছে নিন।';
      document.querySelector('#size').focus();
      return;
    }
    if (!deliveryArea) {
      feedback.textContent = 'ডেলিভারি এলাকা বেছে নিন।';
      deliverySelect.focus();
      return;
    }
    const data = new FormData(form);
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    feedback.textContent = 'আপনার অর্ডার জমা হচ্ছে…';
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size,
          deliveryArea,
          name: data.get('name'),
          phone: data.get('phone'),
          address: data.get('address')
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'অর্ডার জমা করা যায়নি।');
      try { sessionStorage.setItem(`dressify-order-${result.order.id}`, JSON.stringify(result.order)); } catch {}
      window.location.assign(`thank-you.html?order=${encodeURIComponent(result.order.id)}`);
    } catch (error) {
      feedback.textContent = error.message || 'অর্ডার জমা হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।';
      submitButton.disabled = false;
    }
  });
}
