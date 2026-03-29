// ドロワーメニュー
const hamburger = document.querySelector('.hamburger');
const drawerOverlay = document.querySelector('.drawer-overlay');
const drawerMenu = document.querySelector('.drawer-menu');
const drawerClose = document.querySelector('.drawer-close');

function openDrawer() {
  drawerOverlay.style.display = 'block';
  drawerMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawerOverlay.style.display = 'none';
  drawerMenu.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openDrawer);
if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

// スクロールでヘッダーにシャドウ
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
  } else {
    header.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
  }
});

// アクティブナビ
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.global-nav a, .drawer-menu a, .mobile-nav a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (currentPath === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ヒーロースライダー
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.querySelector('.slider-dots');
  const captionEl = document.querySelector('.slide-caption');
  if (!slides.length || !dotsContainer) return;

  let current = 0;
  let timer;

  // ドット生成
  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', '写真 ' + (i + 1));
    dot.addEventListener('click', () => { clearInterval(timer); goTo(i); startTimer(); });
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    slides[current].classList.remove('active');
    dotsContainer.children[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsContainer.children[current].classList.add('active');
    if (captionEl) captionEl.textContent = slides[current].dataset.label || '';
  }

  document.querySelector('.slider-prev')?.addEventListener('click', () => {
    clearInterval(timer); goTo(current - 1); startTimer();
  });
  document.querySelector('.slider-next')?.addEventListener('click', () => {
    clearInterval(timer); goTo(current + 1); startTimer();
  });

  function startTimer() { timer = setInterval(() => goTo(current + 1), 2000); }

  // ホバー中は停止
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', startTimer);
  }

  // 初期キャプション表示
  if (captionEl) captionEl.textContent = slides[0].dataset.label || '';

  startTimer();
})();
