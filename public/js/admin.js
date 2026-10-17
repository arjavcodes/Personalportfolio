/**
 * ADMIN.JS
 * Client-side logic for the admin dashboard:
 *  - Auth verification
 *  - Page navigation
 *  - Dashboard stats
 *  - Messages CRUD
 *  - Projects CRUD
 *  - Site settings management
 *  - Toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  verifyAuth();
});

// ─── Global State ────────────────────────────────────────
let currentUser = null;
let messagesData = [];
let projectsData = [];

// ─── Auth Verification ───────────────────────────────────
async function verifyAuth() {
  try {
    const res = await fetch('/api/admin/me');
    if (!res.ok) throw new Error('Not authenticated');
    const data = await res.json();
    if (!data.success) throw new Error('Not authorized');

    currentUser = data.user;
    initDashboard();
  } catch {
    window.location.href = '/admin/login';
  }
}

// ─── Initialize Dashboard ────────────────────────────────
function initDashboard() {
  updateUserInfo();
  initNavigation();
  initSidebar();
  initLogout();
  loadDashboardData();
  hideLoader();
}

function hideLoader() {
  const loader = document.getElementById('admin-loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 300);
}

// ─── User Info ───────────────────────────────────────────
function updateUserInfo() {
  const nameEl = document.getElementById('sidebar-name');
  const emailEl = document.getElementById('sidebar-email');
  const avatarEl = document.getElementById('sidebar-avatar');

  if (nameEl) nameEl.textContent = currentUser.displayName || 'Admin';
  if (emailEl) emailEl.textContent = currentUser.email || '';
  if (avatarEl) {
    if (currentUser.avatar) {
      avatarEl.innerHTML = `<img src="${currentUser.avatar}" alt="Avatar" />`;
    } else {
      avatarEl.textContent = (currentUser.displayName || 'A').charAt(0).toUpperCase();
    }
  }
}

// ─── Navigation ──────────────────────────────────────────
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  const pages = document.querySelectorAll('.page');
  const topbarTitle = document.getElementById('topbar-title');

  const titles = {
    dashboard: 'Dashboard',
    messages: 'Messages',
    projects: 'Projects',
    settings: 'Settings',
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navigateTo(page);
    });
  });

  // "View All" and "Quick Action" goto buttons
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(btn.dataset.goto);
    });
  });

  window.navigateTo = function(pageName) {
    navItems.forEach(n => n.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));

    const targetNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
    const targetPage = document.getElementById(`page-${pageName}`);

    if (targetNav) targetNav.classList.add('active');
    if (targetPage) targetPage.classList.add('active');
    if (topbarTitle) topbarTitle.textContent = titles[pageName] || pageName;

    // Load data for the page
    if (pageName === 'messages') loadMessages();
    if (pageName === 'projects') loadProjects();
    if (pageName === 'settings') loadSettings();

    // Close mobile sidebar
    document.getElementById('sidebar')?.classList.remove('open');
  };
}

// ─── Sidebar ─────────────────────────────────────────────
function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle-btn');
  const mobile = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
    });
  }

  if (mobile) {
    mobile.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
    });
  }

  // Close on overlay click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar?.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !mobile?.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });
}

// ─── Logout ──────────────────────────────────────────────
function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/admin/login';
  });
}

// ─── Dashboard Data ──────────────────────────────────────
async function loadDashboardData() {
  try {
    const [statsRes, msgsRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/messages'),
    ]);

    const statsData = await statsRes.json();
    const msgsData = await msgsRes.json();

    // Update stats
    if (statsData.success) {
      const s = statsData.data;
      animateNumber('stat-total-messages', s.totalMessages);
      animateNumber('stat-unread-messages', s.unreadMessages);
      animateNumber('stat-total-projects', s.totalProjects);

      // Update nav badge
      const badge = document.getElementById('nav-msg-badge');
      if (badge && s.unreadMessages > 0) {
        badge.style.display = '';
        badge.textContent = s.unreadMessages;
      }
    }

    // Recent messages
    if (msgsData.success && msgsData.data.length > 0) {
      messagesData = msgsData.data;
      renderRecentMessages(msgsData.data.slice(0, 5));
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
  }
}

function animateNumber(elId, target) {
  const el = document.getElementById(elId);
  if (!el) return;
  const duration = 1200;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

function renderRecentMessages(msgs) {
  const container = document.getElementById('recent-messages-list');
  if (!container) return;

  if (!msgs.length) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>No messages yet</p></div>';
    return;
  }

  container.innerHTML = msgs.map(m => `
    <div class="recent-msg-item ${m.read ? '' : 'msg-unread'}" data-id="${m._id}">
      <div class="recent-msg-avatar">${(m.name || '?').charAt(0).toUpperCase()}</div>
      <div class="recent-msg-content">
        <div class="recent-msg-name">${escapeHtml(m.name)}</div>
        <div class="recent-msg-preview">${escapeHtml(m.message?.substring(0, 80) || '')}</div>
      </div>
      <div class="recent-msg-time">${formatTime(m.createdAt)}</div>
    </div>
  `).join('');

  container.querySelectorAll('.recent-msg-item').forEach(item => {
    item.addEventListener('click', () => {
      navigateTo('messages');
      setTimeout(() => showMessageDetail(item.dataset.id), 300);
    });
  });
}

// ─── Messages ────────────────────────────────────────────
async function loadMessages() {
  const container = document.getElementById('messages-list');
  const countEl = document.getElementById('messages-count');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/messages');
    const data = await res.json();

    messagesData = data.success ? data.data : [];

    if (countEl) countEl.textContent = `(${messagesData.length})`;

    if (!messagesData.length) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">📭</span><p>No messages yet</p><span class="empty-sub">Messages from your contact form will appear here.</span></div>';
      return;
    }

    container.innerHTML = messagesData.map(m => `
      <div class="message-item ${m.read ? '' : 'unread'}" data-id="${m._id}">
        <div class="msg-avatar">${(m.name || '?').charAt(0).toUpperCase()}</div>
        <div class="msg-body">
          <div class="msg-header">
            <span class="msg-name">${escapeHtml(m.name)}</span>
            <span class="msg-email">&lt;${escapeHtml(m.email)}&gt;</span>
          </div>
          <div class="msg-subject">${escapeHtml(m.subject || 'No Subject')}</div>
          <div class="msg-preview">${escapeHtml(m.message?.substring(0, 120) || '')}</div>
        </div>
        <div class="msg-meta">
          <span class="msg-time">${formatTime(m.createdAt)}</span>
          <div class="msg-actions">
            <button class="msg-action-btn msg-action-btn--delete" data-delete="${m._id}" title="Delete" aria-label="Delete message">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Click to open detail
    container.querySelectorAll('.message-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.msg-action-btn')) return;
        showMessageDetail(item.dataset.id);
      });
    });

    // Delete buttons
    container.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteMessage(btn.dataset.delete);
      });
    });
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">⚠️</span><p>Failed to load messages</p></div>';
  }
}

function showMessageDetail(id) {
  const msg = messagesData.find(m => m._id === id);
  if (!msg) return;

  const overlay = document.getElementById('message-modal-overlay');
  const detail = document.getElementById('message-detail');

  detail.innerHTML = `
    <div class="msg-detail-header">
      <div class="msg-detail-avatar">${(msg.name || '?').charAt(0).toUpperCase()}</div>
      <div class="msg-detail-from">
        <div class="msg-detail-name">${escapeHtml(msg.name)}</div>
        <div class="msg-detail-email"><a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a></div>
      </div>
      <div class="msg-detail-date">${new Date(msg.createdAt).toLocaleString()}</div>
    </div>
    <div class="msg-detail-subject">${escapeHtml(msg.subject || 'Portfolio Inquiry')}</div>
    <div class="msg-detail-body">${escapeHtml(msg.message)}</div>
    <div class="msg-detail-actions">
      <a href="mailto:${escapeHtml(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject || 'Portfolio Inquiry')}" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Reply via Email
      </a>
      <button class="btn-secondary" onclick="deleteMessage('${msg._id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        Delete
      </button>
    </div>
  `;

  overlay.classList.add('visible');

  // Mark as read
  if (!msg.read) {
    markAsRead(id);
  }
}

async function markAsRead(id) {
  try {
    await fetch(`/api/admin/messages/${id}/read`, { method: 'PATCH' });
    // Update local state
    const msg = messagesData.find(m => m._id === id);
    if (msg) msg.read = true;

    // Update UI
    const item = document.querySelector(`.message-item[data-id="${id}"]`);
    if (item) item.classList.remove('unread');

    // Update badge
    updateUnreadBadge();
  } catch {}
}

function updateUnreadBadge() {
  const unread = messagesData.filter(m => !m.read).length;
  const badge = document.getElementById('nav-msg-badge');
  if (badge) {
    if (unread > 0) {
      badge.style.display = '';
      badge.textContent = unread;
    } else {
      badge.style.display = 'none';
    }
  }
}

async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Message deleted', 'success');
      closeModal('message-modal-overlay');
      loadMessages();
      loadDashboardData();
    } else {
      showToast(data.message || 'Failed to delete', 'error');
    }
  } catch {
    showToast('Failed to delete message', 'error');
  }
}

// ─── Projects ────────────────────────────────────────────
async function loadProjects() {
  const container = document.getElementById('projects-admin-list');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/projects');
    const data = await res.json();

    projectsData = data.success ? data.data : [];

    if (!projectsData.length) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">📁</span><p>No projects yet</p><span class="empty-sub">Add your first project to showcase on your portfolio.</span></div>';
      return;
    }

    container.innerHTML = projectsData.map(p => `
      <div class="project-admin-item" data-id="${p._id}">
        <div class="proj-info">
          <div class="proj-title-row">
            <span class="proj-title">${escapeHtml(p.title)}</span>
            <span class="proj-category-badge">${p.category}</span>
            ${p.featured ? '<span class="proj-featured-badge">⭐ Featured</span>' : ''}
          </div>
          <div class="proj-desc">${escapeHtml(p.description?.substring(0, 100) || '')}</div>
          <div class="proj-tech">
            ${(p.techStack || []).map(t => `<span class="proj-tech-tag">${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>
        <div class="proj-actions">
          <button class="proj-action-btn" data-edit="${p._id}" title="Edit" aria-label="Edit project">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="proj-action-btn proj-action-btn--delete" data-proj-delete="${p._id}" title="Delete" aria-label="Delete project">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Edit buttons
    container.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => openProjectModal(btn.dataset.edit));
    });

    // Delete buttons
    container.querySelectorAll('[data-proj-delete]').forEach(btn => {
      btn.addEventListener('click', () => deleteProject(btn.dataset.projDelete));
    });
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><span class="empty-icon">⚠️</span><p>Failed to load projects</p></div>';
  }
}

// Project Modal
function initProjectModal() {
  const overlay = document.getElementById('project-modal-overlay');
  const closeBtn = document.getElementById('project-modal-close');
  const cancelBtn = document.getElementById('project-modal-cancel');
  const form = document.getElementById('project-form');

  if (closeBtn) closeBtn.addEventListener('click', () => closeModal('project-modal-overlay'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal('project-modal-overlay'));

  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal('project-modal-overlay');
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveProject();
    });
  }
}

function openProjectModal(editId = null) {
  const overlay = document.getElementById('project-modal-overlay');
  const title = document.getElementById('project-modal-title');
  const form = document.getElementById('project-form');
  const idField = document.getElementById('project-edit-id');

  form.reset();
  idField.value = '';

  if (editId) {
    const proj = projectsData.find(p => p._id === editId);
    if (!proj) return;

    title.textContent = 'Edit Project';
    idField.value = editId;
    document.getElementById('proj-title').value = proj.title || '';
    document.getElementById('proj-description').value = proj.description || '';
    document.getElementById('proj-category').value = proj.category || 'fullstack';
    document.getElementById('proj-featured').value = proj.featured ? 'true' : 'false';
    document.getElementById('proj-tech').value = (proj.techStack || []).join(', ');
    document.getElementById('proj-github').value = proj.githubUrl || '';
    document.getElementById('proj-live').value = proj.liveUrl || '';
  } else {
    title.textContent = 'Add Project';
  }

  overlay.classList.add('visible');
}

async function saveProject() {
  const editId = document.getElementById('project-edit-id').value;
  const body = {
    title: document.getElementById('proj-title').value.trim(),
    description: document.getElementById('proj-description').value.trim(),
    category: document.getElementById('proj-category').value,
    featured: document.getElementById('proj-featured').value === 'true',
    techStack: document.getElementById('proj-tech').value.split(',').map(t => t.trim()).filter(Boolean),
    githubUrl: document.getElementById('proj-github').value.trim(),
    liveUrl: document.getElementById('proj-live').value.trim(),
  };

  if (!body.title || !body.description) {
    showToast('Title and description are required', 'error');
    return;
  }

  const saveBtn = document.getElementById('project-modal-save');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const url = editId ? `/api/admin/projects/${editId}` : '/api/admin/projects';
    const method = editId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.success) {
      showToast(editId ? 'Project updated!' : 'Project created!', 'success');
      closeModal('project-modal-overlay');
      loadProjects();
      loadDashboardData();
    } else {
      showToast(data.message || 'Failed to save project', 'error');
    }
  } catch {
    showToast('Failed to save project', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Project';
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;

  try {
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast('Project deleted', 'success');
      loadProjects();
      loadDashboardData();
    } else {
      showToast(data.message || 'Failed to delete', 'error');
    }
  } catch {
    showToast('Failed to delete project', 'error');
  }
}

// Add project button
document.getElementById('add-project-btn')?.addEventListener('click', () => openProjectModal());

// Initialize project modal
initProjectModal();

// ─── Settings ────────────────────────────────────────────
async function loadSettings() {
  try {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    if (!data.success) return;

    const s = data.data;
    const form = document.getElementById('settings-form');
    if (!form) return;

    form.elements['ownerName'].value = s.ownerName || '';
    form.elements['role'].value = s.role || '';
    form.elements['bio'].value = s.bio || '';
    form.elements['heroSubtitle'].value = s.heroSubtitle || '';
    form.elements['email'].value = s.email || '';
    form.elements['location'].value = s.location || '';
    form.elements['availability'].value = s.availability || '';
    form.elements['githubUrl'].value = s.githubUrl || '';
    form.elements['linkedinUrl'].value = s.linkedinUrl || '';
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

// Settings form submit
document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const statusEl = document.getElementById('settings-status');
  const saveBtn = document.getElementById('save-settings-btn');

  saveBtn.disabled = true;

  const body = {
    ownerName: form.elements['ownerName'].value.trim(),
    role: form.elements['role'].value.trim(),
    bio: form.elements['bio'].value.trim(),
    heroSubtitle: form.elements['heroSubtitle'].value.trim(),
    email: form.elements['email'].value.trim(),
    location: form.elements['location'].value.trim(),
    availability: form.elements['availability'].value.trim(),
    githubUrl: form.elements['githubUrl'].value.trim(),
    linkedinUrl: form.elements['linkedinUrl'].value.trim(),
  };

  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (data.success) {
      statusEl.textContent = '✅ Settings saved successfully!';
      statusEl.className = 'settings-status success';
      showToast('Settings saved!', 'success');
    } else {
      throw new Error(data.message || 'Failed to save');
    }
  } catch (err) {
    statusEl.textContent = '❌ ' + (err.message || 'Failed to save settings');
    statusEl.className = 'settings-status error';
    showToast('Failed to save settings', 'error');
  } finally {
    saveBtn.disabled = false;
    setTimeout(() => { statusEl.textContent = ''; }, 4000);
  }
});

// ─── Modal Close (Message) ───────────────────────────────
document.getElementById('message-modal-close')?.addEventListener('click', () => {
  closeModal('message-modal-overlay');
});

document.getElementById('message-modal-overlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'message-modal-overlay') closeModal('message-modal-overlay');
});

function closeModal(overlayId) {
  document.getElementById(overlayId)?.classList.remove('visible');
}

// ─── Toast Notifications ─────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─── Utilities ───────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
