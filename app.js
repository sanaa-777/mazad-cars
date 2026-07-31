/* ===== MAZEED CARS - GLOBAL JS ===== */

// ===== COUNTDOWN TIMERS =====
function initTimers() {
  document.querySelectorAll('.timer-value').forEach(el => {
    let seconds = parseInt(el.dataset.time);
    function tick() {
      if (seconds <= 0) return;
      seconds--;
      el.dataset.time = seconds;
      const d = Math.floor(seconds / 86400);
      const h = Math.floor((seconds % 86400) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (d > 0) {
        el.textContent = `${d}ي ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      } else {
        el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      }
    }
    tick();
    setInterval(tick, 1000);
  });
}

// ===== FILTER CHIPS =====
function initFilters() {
  const chips = document.querySelectorAll('.chip[data-filter]');
  const cards = document.querySelectorAll('.auction-card[data-status]');
  
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.status === filter) {
          card.style.display = '';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ===== SCROLL ANIMATION =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
}

// ===== TOGGLE SWITCHES =====
function initToggles() {
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });
}

// ===== IMAGE UPLOAD PREVIEW =====
function initImageUpload() {
  const uploadArea = document.querySelector('.upload-area');
  if (!uploadArea) return;
  
  uploadArea.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.click();
    
    input.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      const previewGrid = document.querySelector('.img-preview-grid');
      if (!previewGrid) {
        const grid = document.createElement('div');
        grid.className = 'img-preview-grid';
        uploadArea.parentNode.insertBefore(grid, uploadArea.nextSibling);
      }
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const div = document.createElement('div');
          div.className = 'img-preview';
          div.innerHTML = `
            <img src="${ev.target.result}" alt="preview">
            <button class="remove-img" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
          `;
          document.querySelector('.img-preview-grid').appendChild(div);
        };
        reader.readAsDataURL(file);
      });
    });
  });
}

// ===== PAYMENT SELECTION =====
function selectPayment(el) {
  document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
  el.classList.add('selected');
}

// ===== FAVORITE TOGGLE =====
function toggleFav(btn) {
  if (!btn) btn = document.getElementById('favBtn');
  if (!btn) return;
  btn.classList.toggle('liked');
  const icon = btn.querySelector('i');
  if (icon) {
    icon.classList.toggle('far');
    icon.classList.toggle('fas');
  }
}

// ===== FILTER PANEL TOGGLE =====
function toggleFilterPanel() {
  const panel = document.querySelector('.filter-panel');
  const btn = document.querySelector('.filter-toggle-btn');
  if (panel) {
    panel.classList.toggle('show');
    if (btn) btn.classList.toggle('active');
  }
}

// ===== FILTER OPTIONS =====
function initFilterOptions() {
  document.querySelectorAll('.filter-options').forEach(group => {
    group.querySelectorAll('.filter-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        opt.classList.toggle('active');
      });
    });
  });
}

// ===== SORT TOGGLE =====
let sortAsc = true;
function toggleSort() {
  sortAsc = !sortAsc;
  const grid = document.getElementById('auctionGrid');
  if (!grid) return;
  const cards = Array.from(grid.children);
  cards.reverse();
  cards.forEach(card => grid.appendChild(card));
}

// ===== TABS =====
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.tabs');
      parent.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const target = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.add('active');
    });
  });
}

// ===== CAROUSEL DOTS =====
function initCarouselDots(carouselId, dotsSelector) {
  const carousel = document.getElementById(carouselId);
  const dots = document.querySelectorAll(dotsSelector);
  if (!carousel || !dots.length) return;
  
  carousel.addEventListener('scroll', () => {
    const scrollPos = carousel.scrollLeft;
    const slideWidth = carousel.children[0]?.offsetWidth || 300;
    const active = Math.round(scrollPos / (slideWidth + 14));
    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  });
}

// ===== SHARE =====
function share(title, url) {
  if (navigator.share) {
    navigator.share({ title: title || document.title, url: url || window.location.href });
  }
}

// ===== FORMAT PRICE =====
function formatPrice(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ===== NOTIFICATION BADGE =====
function updateNotifBadge(count) {
  const badge = document.querySelector('.notif-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ===== NAV ACTIVE STATE =====
function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === page) {
      item.classList.add('active');
    }
  });
}

// ===== INIT ALL =====
document.addEventListener('DOMContentLoaded', () => {
  initTimers();
  initFilters();
  initScrollAnimations();
  initToggles();
  initImageUpload();
  initFilterOptions();
  initTabs();
  initCarouselDots('heroCarousel', '.hero-dot');
  initCarouselDots('featuredCarousel', '.carousel-dots .dot');
});
