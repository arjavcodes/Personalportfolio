/**
 * PROJECTS.JS
 * Fetches projects from the Express API and renders project cards.
 * Falls back to embedded data if the API is unreachable.
 */

const ProjectsModule = (() => {
  const API_URL = '/api/projects';
  let allProjects = [];
  let activeFilter = 'all';

  // ── Category badge classes ─────────────────────────────
  const badgeClass = {
    fullstack: 'badge-fullstack',
    backend:   'badge-backend',
    frontend:  'badge-frontend',
    other:     'badge-other',
  };

  const categoryLabel = {
    fullstack: 'Full Stack',
    backend:   'Backend',
    frontend:  'Frontend',
    other:     'Other',
  };

  // ── Build one project card HTML ────────────────────────
  function buildCard(project, index) {
    const techTags = (project.techStack || [])
      .map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`)
      .join('');

    const links = [];
    if (project.githubUrl) {
      links.push(`
        <a href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer"
           class="project-link" aria-label="View ${escapeHtml(project.title)} on GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>`);
    }
    if (project.liveUrl) {
      links.push(`
        <a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer"
           class="project-link" aria-label="View live demo of ${escapeHtml(project.title)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Live Demo
        </a>`);
    }

    const category = project.category || 'other';
    const delay = (index % 6) * 80;

    return `
      <article
        class="project-card"
        data-category="${escapeHtml(category)}"
        data-id="${escapeHtml(String(project._id))}"
        style="animation-delay:${delay}ms"
        aria-label="Project: ${escapeHtml(project.title)}"
      >
        <div class="project-card-header">
          <span class="project-category-badge ${badgeClass[category] || 'badge-other'}">
            ${categoryLabel[category] || category}
          </span>
          ${project.featured ? '<span class="project-featured-badge">⭐ Featured</span>' : ''}
        </div>
        <div class="project-card-body">
          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-description">${escapeHtml(project.description)}</p>
        </div>
        <div class="project-tech">${techTags}</div>
        ${links.length ? `<div class="project-card-footer">${links.join('')}</div>` : ''}
      </article>`;
  }

  // ── Render projects into the grid ──────────────────────
  function render(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    if (!projects.length) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--clr-text-muted)">
          <p style="font-size:2rem">🗂️</p>
          <p>No projects found in this category.</p>
        </div>`;
      return;
    }

    grid.innerHTML = projects.map((p, i) => buildCard(p, i)).join('');

    // Add hover 3D tilt to cards
    grid.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 12;
        const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -12;
        card.style.transform = `translateY(-8px) rotateX(${y}deg) rotateY(${x}deg)`;
        card.style.transition = 'transform 0.1s ease';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1), border-color 0.3s, box-shadow 0.3s';
      });
    });
  }

  // ── Filter logic ───────────────────────────────────────
  function applyFilter(filter) {
    activeFilter = filter;
    const filtered = filter === 'all'
      ? allProjects
      : allProjects.filter(p => p.category === filter);
    render(filtered);

    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
  }

  // ── Fetch from API ─────────────────────────────────────
  async function fetchProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    try {
      const res  = await fetch(API_URL, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      allProjects = json.data || [];
    } catch (err) {
      console.warn('[Projects] API fetch failed, using fallback data:', err.message);
      allProjects = getFallbackProjects();
    }

    render(activeFilter === 'all' ? allProjects : allProjects.filter(p => p.category === activeFilter));
  }

  // ── Filter button event listeners ─────────────────────
  function bindFilters() {
    const filtersEl = document.getElementById('project-filters');
    if (!filtersEl) return;
    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (btn) applyFilter(btn.dataset.filter);
    });
  }

  // ── HTML escape utility ────────────────────────────────
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Client-side fallback data (mirrors server fallback) ─
  function getFallbackProjects() {
    return [
      {
        _id: '1',
        title: 'E-Commerce Platform with Razorpay',
        description: 'A 40-product e-commerce web platform across 6 categories with live search, filters, cart and checkout. Built 12 REST API endpoints using Node.js and Express with MySQL, and integrated Razorpay server-side payment verification.',
        techStack: ['Node.js', 'Express', 'MySQL', 'Razorpay', 'REST APIs', 'Postman'],
        githubUrl: 'https://github.com/arjavcodes',
        liveUrl: '',
        category: 'fullstack',
        featured: true
      },
      {
        _id: '2',
        title: 'AI Chatbot for Elderly Care',
        description: 'An AI-powered companion and assistance chatbot featuring 3 reminder categories (daily tasks, medicines, birthdays) powered by Google Gemini API. Tested with seniors with accessibility optimizations and doctor guidance disclaimers.',
        techStack: ['JavaScript', 'Gemini API', 'HTML5', 'CSS3', 'UI Design'],
        githubUrl: 'https://github.com/arjavcodes',
        liveUrl: '',
        category: 'frontend',
        featured: true
      },
      {
        _id: '3',
        title: 'Java & MySQL Expense Tracker',
        description: 'Robust financial management application with 6 expense categories and monthly spending summaries tested on 50 sample records. Features PreparedStatement SQL injection defense, DAO/service architecture, and 8 JUnit unit tests.',
        techStack: ['Java', 'JDBC', 'MySQL', 'JUnit', 'OOP'],
        githubUrl: 'https://github.com/arjavcodes',
        liveUrl: '',
        category: 'backend',
        featured: true
      },
      {
        _id: '4',
        title: 'Responsive Gym & Fitness Website',
        description: 'A responsive fitness portal with 5 comprehensive sections (programs, plans, trainers, gallery, contact) across 3 breakpoints. Scored 95 in Performance and 92 in Accessibility on Google Lighthouse, deployed on Netlify.',
        techStack: ['HTML5', 'CSS3', 'JavaScript', 'Netlify', 'Lighthouse'],
        githubUrl: 'https://github.com/arjavcodes',
        liveUrl: 'https://personalportfoliobyau.netlify.app',
        category: 'frontend',
        featured: false
      }
    ];
  }

  // ── Public init ────────────────────────────────────────
  function init() {
    bindFilters();
    fetchProjects();
  }

  return { init };
})();
