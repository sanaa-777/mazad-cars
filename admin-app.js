/* ===== ADMIN DASHBOARD JS ===== */

// ===== REAL-TIME CLOCK =====
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const el = document.getElementById('liveClock');
  if (el) el.textContent = time;
  const dateEl = document.getElementById('liveDate');
  if (dateEl) dateEl.textContent = date;
}
setInterval(updateClock, 1000);
updateClock();

// ===== SIMULATED LIVE STATS =====
let liveStats = {
  online: 47,
  todayVisits: 1284,
  totalUsers: 5630,
  activeAuctions: 12,
  todayRevenue: 2450000,
  pendingVerifications: 8,
  newMessages: 23,
  reports: 3
};

function updateLiveStats() {
  // Simulate small changes
  liveStats.online += Math.floor(Math.random() * 5) - 2;
  liveStats.todayVisits += Math.floor(Math.random() * 3);
  liveStats.todayRevenue += Math.floor(Math.random() * 100000);
  if (liveStats.online < 0) liveStats.online = 1;

  // Update DOM
  animateNumber('statOnline', liveStats.online);
  animateNumber('statVisits', liveStats.todayVisits);
  animateNumber('statUsers', liveStats.totalUsers);
  animateNumber('statAuctions', liveStats.activeAuctions);
  animateNumber('statRevenue', liveStats.todayRevenue);
  animateNumber('statPending', liveStats.pendingVerifications);
  animateNumber('statMessages', liveStats.newMessages);
  animateNumber('statReports', liveStats.reports);

  // Update live activity feed
  addLiveActivity();
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const current = parseInt(el.textContent.replace(/,/g, '')) || 0;
  if (current === target) return;
  
  const diff = target - current;
  const steps = 20;
  const increment = diff / steps;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const value = Math.round(current + increment * step);
    el.textContent = value.toLocaleString('en');
    if (step >= steps) {
      el.textContent = target.toLocaleString('en');
      clearInterval(timer);
    }
  }, 30);
}

// Update every 5 seconds
setInterval(updateLiveStats, 5000);

// ===== LIVE ACTIVITY FEED =====
const activityTypes = [
  { icon: 'fa-user-plus', text: 'مستخدم جديد انضم', color: 'si-blue', bg: '#EBF5FF' },
  { icon: 'fa-gavel', text: 'مزايدة جديدة', color: 'si-green', bg: '#ECFDF5' },
  { icon: 'fa-comment', text: 'رسالة جديدة', color: 'si-purple', bg: '#F5F3FF' },
  { icon: 'fa-car', text: 'إعلان جديد', color: 'si-orange', bg: '#FFFBEB' },
  { icon: 'fa-heart', text: 'إعجاب جديد', color: 'si-pink', bg: '#FDF2F8' },
  { icon: 'fa-check-circle', text: 'حساب موثق', color: 'si-cyan', bg: '#ECFEFF' },
  { icon: 'fa-flag', text: 'إبلاغ جديد', color: 'si-red', bg: '#FEF2F2' },
  { icon: 'fa-credit-card', text: 'عملية دفع', color: 'si-green', bg: '#ECFDF5' }
];

const names = ['أحمد', 'محمد', 'خالد', 'سالم', 'عمر', 'فهد', 'ناصر', 'عبدالله', 'يوسف', 'حسن'];

function addLiveActivity() {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;

  const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  const now = new Date();
  const time = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  const item = document.createElement('div');
  item.className = 'live-item';
  item.style.opacity = '0';
  item.style.transform = 'translateY(-10px)';
  item.innerHTML = `
    <div class="live-item-icon" style="background:${type.bg}">
      <i class="fas ${type.icon}" style="color:var(--admin-accent)"></i>
    </div>
    <div class="live-item-info">
      <div class="live-item-text">${name} - ${type.text}</div>
      <div class="live-item-time">${time}</div>
    </div>
  `;

  feed.insertBefore(item, feed.firstChild);
  
  // Animate in
  setTimeout(() => {
    item.style.transition = 'all 0.3s ease';
    item.style.opacity = '1';
    item.style.transform = 'translateY(0)';
  }, 50);

  // Remove old items
  while (feed.children.length > 8) {
    feed.removeChild(feed.lastChild);
  }
}

// ===== CHART BARS ANIMATION =====
function animateChartBars() {
  document.querySelectorAll('.chart-bar').forEach(bar => {
    const height = bar.dataset.height;
    bar.style.height = '0';
    setTimeout(() => {
      bar.style.transition = 'height 0.8s ease';
      bar.style.height = height + '%';
    }, 100);
  });
}

// ===== NAVIGATION =====
function setActiveNav(el) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
}

function navigateTo(page) {
  // Hide all pages
  document.querySelectorAll('.admin-page').forEach(p => p.style.display = 'none');
  // Show target page
  const target = document.getElementById(page);
  if (target) target.style.display = '';
  
  // Update nav
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.remove('active');
    if (l.dataset.page === page) l.classList.add('active');
  });

  // Update title
  const titles = {
    'page-dashboard': ['لوحة التحكم', 'نظرة عامة على المنصة'],
    'page-users': ['إدارة المستخدمين', 'عرض وإدارة جميع المستخدمين'],
    'page-auctions': ['إدارة المزادات', 'إدارة جميع المزادات والبيع المباشر'],
    'page-reports': ['التقارير والإحصائيات', 'تحليلات مفصلة عن أداء المنصة'],
    'page-verification': ['طلبات التوثيق', 'مراجعة وتوثيق الحسابات'],
    'page-settings': ['الإعدادات', 'إعدادات المنصة والنظام'],
    'page-logs': ['سجل العمليات', 'سجل جميع العمليات في النظام'],
    'page-content': ['إدارة المحتوى', 'إدارة الإعلانات والمحتوى'],
    'page-payments': ['المدفوعات', 'إدارة المدفوعات والمعاملات المالية'],
    'page-notifications': ['الإشعارات', 'إدارة إشعارات النظام']
  };

  const [title, desc] = titles[page] || ['لوحة التحكم', ''];
  const titleEl = document.getElementById('pageTitle');
  const descEl = document.getElementById('pageDesc');
  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  // Animate charts if dashboard
  if (page === 'page-dashboard') {
    setTimeout(animateChartBars, 200);
  }
}

// ===== MODAL =====
function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('show');
}

function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('show');
}

// ===== VERIFY USER =====
function verifyUser(userId) {
  const row = document.querySelector(`[data-user-id="${userId}"]`);
  if (row) {
    const badge = row.querySelector('.status-badge');
    if (badge) {
      badge.className = 'status-badge sb-verified';
      badge.innerHTML = '<i class="fas fa-check-circle"></i> موثق';
    }
  }
  showNotification('✅ تم توثيق الحساب بنجاح', 'success');
}

function rejectUser(userId) {
  showNotification('❌ تم رفض طلب التوثيق', 'danger');
}

// ===== BAN USER =====
function banUser(userId) {
  const row = document.querySelector(`[data-user-id="${userId}"]`);
  if (row) {
    const badge = row.querySelector('.status-badge');
    if (badge) {
      badge.className = 'status-badge sb-banned';
      badge.innerHTML = '<i class="fas fa-ban"></i> محظور';
    }
  }
  showNotification('🚫 تم حظر المستخدم', 'danger');
}

// ===== FEATURE AUCTION =====
function featureAuction(auctionId) {
  showNotification('⭐ تم تمييز المزاد', 'success');
}

// ===== TOGGLE SIDEBAR =====
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// ===== NOTIFICATIONS =====
function showNotification(text, type = 'info') {
  const container = document.getElementById('notifContainer');
  if (!container) return;

  const notif = document.createElement('div');
  notif.style.cssText = `
    padding: 14px 20px;
    border-radius: 10px;
    background: white;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    transform: translateX(100%);
    transition: all 0.3s ease;
    margin-bottom: 8px;
    border-right: 4px solid ${type === 'success' ? 'var(--admin-success)' : type === 'danger' ? 'var(--admin-danger)' : 'var(--admin-accent)'};
  `;
  notif.textContent = text;
  container.appendChild(notif);

  setTimeout(() => notif.style.transform = 'translateX(0)', 50);
  setTimeout(() => {
    notif.style.transform = 'translateX(100%)';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// ===== CHART TAB SWITCH =====
function switchChartTab(el, period) {
  el.parentElement.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  // Re-animate bars
  animateChartBars();
}

// ===== SEARCH =====
function initAdminSearch() {
  const searchInput = document.getElementById('adminSearch');
  if (!searchInput) return;
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('tbody tr').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

// ===== EXPORT TABLE =====
function exportTable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  let csv = [];
  const rows = table.querySelectorAll('tr');
  rows.forEach(row => {
    const cols = row.querySelectorAll('td, th');
    const rowData = Array.from(cols).map(col => col.textContent.trim());
    csv.push(rowData.join(','));
  });
  
  const blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'export.csv';
  link.click();
  showNotification('📥 تم تصدير البيانات بنجاح', 'success');
}

// ===== DONUT CHART =====
function drawDonut() {
  const canvas = document.getElementById('donutCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const data = [
    { value: 45, color: '#3B82F6', label: 'مزادات' },
    { value: 30, color: '#10B981', label: 'بيع مباشر' },
    { value: 15, color: '#F59E0B', label: 'قريباً' },
    { value: 10, color: '#EF4444', label: 'منتهية' }
  ];
  
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -Math.PI / 2;
  
  data.forEach(d => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(90, 90, 80, startAngle, startAngle + sliceAngle);
    ctx.arc(90, 90, 50, startAngle + sliceAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    startAngle += sliceAngle;
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  animateChartBars();
  drawDonut();
  initAdminSearch();
  
  // Add initial activities
  for (let i = 0; i < 5; i++) {
    setTimeout(() => addLiveActivity(), i * 200);
  }
});
