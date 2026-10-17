/**
 * MAIN.JS
 * Orchestrates all UI interactions:
 *  - Loader hide
 *  - Custom cursor
 *  - Navbar scroll behavior + active link
 *  - Mobile hamburger menu
 *  - Typewriter effect
 *  - Counter animations
 *  - GSAP ScrollTrigger reveal animations
 *  - Contact form submission
 *  - Back-to-top button
 *  - Footer year
 *  - Skills tear-stack interaction
 */

// ─── Wait for DOM ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Init 3D scenes first
  if (typeof Portfolio3D !== 'undefined') Portfolio3D.init();

  // Init projects module
  if (typeof ProjectsModule !== 'undefined') ProjectsModule.init();

  initLoader();
  initCursor();
  initNavbar();
  initHamburger();
  initTypewriter();
  initScrollAnimations();
  initCounters();
  initContactForm();
  initBackToTop();
  initFooterYear();
  initDynamicSkills();
});

// ─── 1. Loader ──────────────────────────────────────────
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  // Give Three.js a moment to initialize, then fade out
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 1200);
  document.body.style.overflow = 'hidden';
}

// ─── 2. Custom Cursor ────────────────────────────────────
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring follows with lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state on interactive elements
  const hoverTargets = 'a, button, input, textarea, .filter-btn, .skill-tag, .project-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = ''; ring.style.opacity = ''; });
}

// ─── 3. Navbar ───────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll → add .scrolled class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateActiveNavLink();
  }, { passive: true });

  // Smooth-scroll nav links
  document.querySelectorAll('.nav-link, .hero-scroll-hint a, .footer-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Close mobile menu if open
          closeMobileMenu();
        }
      }
    });
  });
}

function updateActiveNavLink() {
  const sections = ['hero', 'about', 'skills', 'projects', 'contact'];
  const scrollY = window.scrollY + 100;
  let current = 'hero';

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

// ─── 4. Mobile Hamburger ─────────────────────────────────
function initHamburger() {
  const btn   = document.getElementById('hamburger-btn');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });
}

function closeMobileMenu() {
  const btn   = document.getElementById('hamburger-btn');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;
  links.classList.remove('open');
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
}

// ─── 5. Typewriter Effect ────────────────────────────────
function initTypewriter() {
  const roleEl = document.getElementById('typed-role');
  if (!roleEl) return;

  const roles = [
    'Software Engineer',
    'Full-Stack Developer',
    'Java & MySQL Developer',
    'Node.js & Express Specialist',
    'AI Integrations (Gemini API)',
    'Computer Science Undergraduate',
  ];

  let roleIndex = 0, charIndex = 0, isDeleting = false;

  function type() {
    const current = roles[roleIndex];
    const displayed = isDeleting
      ? current.substring(0, charIndex - 1)
      : current.substring(0, charIndex + 1);

    roleEl.textContent = displayed;

    if (!isDeleting && charIndex === current.length) {
      setTimeout(() => { isDeleting = true; type(); }, 2200);
      return;
    }
    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }

    charIndex += isDeleting ? -1 : 1;
    setTimeout(type, isDeleting ? 55 : 95);
  }

  // Add blinking cursor to role
  roleEl.style.borderRight = '2px solid var(--clr-secondary)';
  roleEl.style.paddingRight = '2px';
  setInterval(() => { roleEl.style.borderColor = roleEl.style.borderColor === 'transparent' ? 'var(--clr-secondary)' : 'transparent'; }, 530);

  setTimeout(type, 800);
}

// ─── 6. GSAP ScrollTrigger Reveals ───────────────────────
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Reveal up
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Reveal left
  gsap.utils.toArray('.reveal-left').forEach((el) => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Reveal right
  gsap.utils.toArray('.reveal-right').forEach((el) => {
    gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Stagger skill category cards
  gsap.utils.toArray('.skill-category').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 30, scale: 0.95,
      duration: 0.6, delay: i * 0.1,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
      },
    });
  });
}

// ─── 7. Animated Counters ────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  };

  // Use IntersectionObserver to trigger once visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ─── 8. Contact Form ─────────────────────────────────────
function initContactForm() {
  const form   = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors/status
    status.textContent = '';
    status.className = '';
    clearFormErrors();

    const name    = form.elements['name'].value.trim();
    const email   = form.elements['email'].value.trim();
    const subject = form.elements['subject'].value.trim();
    const message = form.elements['message'].value.trim();

    // Client-side validation
    let hasError = false;
    if (!name) { showError('name-error', form.elements['name'], 'Name is required'); hasError = true; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email-error', form.elements['email'], 'Enter a valid email address'); hasError = true;
    }
    if (!message) { showError('message-error', form.elements['message'], 'Message is required'); hasError = true; }
    if (hasError) return;

    // Submit
    const submitBtn  = document.getElementById('contact-submit-btn');
    const btnText    = document.getElementById('contact-btn-text');
    const btnIcon    = document.getElementById('contact-btn-icon');

    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';
    if (btnIcon) btnIcon.style.animation = 'loader-spin 0.8s linear infinite';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        status.innerHTML = `<span>🚀 <strong>Message delivered!</strong> Thanks for reaching out, ${escapeHtml(name)}. Your email was sent directly to Arjav's inbox (<em>aryay0108@gmail.com</em>).</span>`;
        status.className = 'success';
        form.reset();
      } else {
        throw new Error(data.message || 'Something went wrong while dispatching email');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      const mailtoUrl = `mailto:aryay0108@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Inquiry from ' + name)}&body=${encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message)}`;
      status.innerHTML = `<span>⚠️ ${escapeHtml(err.message)}.<br/><a href="${mailtoUrl}" style="color:var(--clr-secondary);font-weight:600;text-decoration:underline;display:inline-block;margin-top:6px;">Click here to email directly: aryay0108@gmail.com &rarr;</a></span>`;
      status.className = 'error';
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      if (btnIcon) btnIcon.style.animation = '';
    }
  });

  // Live validation on blur
  ['name', 'email', 'message'].forEach(field => {
    const el = form.elements[field];
    if (!el) return;
    el.addEventListener('blur', () => {
      if (el.value.trim()) {
        el.classList.remove('error');
        const errEl = document.getElementById(`${field}-error`);
        if (errEl) errEl.textContent = '';
      }
    });
  });
}

function showError(errorId, inputEl, msg) {
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = msg;
  if (inputEl) inputEl.classList.add('error');
}

function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-group input.error, .form-group textarea.error')
    .forEach(el => el.classList.remove('error'));
}

// ─── 9. Back To Top ──────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── 10. Footer Year ─────────────────────────────────────
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

// ─── 11. Dynamic Skills System ───────────────────────────
function initDynamicSkills() {
  const panel = document.getElementById('skills-panel');
  const tabsContainer = document.getElementById('skills-tabs');
  const ink = document.getElementById('s-tab-ink');
  if (!panel || !tabsContainer) return;

  const tabs = Array.from(tabsContainer.querySelectorAll('.s-tab'));

  // Skills Data Store - Aligned with Arjav Upadhyay's Resume
  const SKILLS_DATA = {
    languages: [
      { name: 'Java', level: 92, badge: 'Proficient', icon: '☕', tags: ['Core Java', 'OOP', 'JDBC', 'PreparedStatements', 'JUnit'] },
      { name: 'JavaScript', level: 90, badge: 'Proficient', icon: '⚡', tags: ['ES6+', 'Async / Await', 'DOM API', 'Node Runtime', 'REST Integration'] },
      { name: 'HTML5 & CSS3', level: 88, badge: 'Advanced', icon: '🎨', tags: ['Semantic Layouts', 'Flexbox / Grid', 'Lighthouse 95+ Score', 'Responsive UI'] }
    ],
    backend: [
      { name: 'Node.js', level: 88, badge: 'Advanced', icon: '🟢', tags: ['Event Loop', 'Async I/O', 'REST Routing', 'Express Integration'] },
      { name: 'Express.js', level: 86, badge: 'Advanced', icon: '🚂', tags: ['12+ REST Endpoints', 'Middleware', 'Input Validation', 'Error Handling'] },
      { name: 'REST APIs & Razorpay', level: 88, badge: 'Experienced', icon: '🔗', tags: ['Order Creation', 'Server-side Verification', 'Postman Testing', 'JSON Specs'] },
      { name: 'Gemini API', level: 85, badge: 'Specialist', icon: '✨', tags: ['AI Chatbots', 'Prompt Engineering', 'Task & Medicine Reminders', 'Disclaimers'] }
    ],
    databases: [
      { name: 'MySQL', level: 88, badge: 'Advanced', icon: '🐬', tags: ['Relational Schemas', 'CRUD Operations', 'Complex Queries', 'PreparedStatements', 'Indexing'] },
      { name: 'DBMS Fundamentals', level: 85, badge: 'Core', icon: '🗄️', tags: ['Normalization', 'ACID Properties', 'ER Modeling', 'Database Design'] },
      { name: 'MongoDB', level: 80, badge: 'Intermediate', icon: '🍃', tags: ['Document Collections', 'Mongoose ODM', 'Aggregation Pipelines'] }
    ],
    tools: [
      { name: 'Git & GitHub', level: 88, badge: 'Advanced', icon: '🐙', tags: ['Feature Branches', '12+ Pull Requests', 'Collaborative Workflows', 'CI/CD'] },
      { name: 'Postman', level: 86, badge: 'Advanced', icon: '🚀', tags: ['API Testing', '25+ Request Suites', 'Regression & Bug Verification'] },
      { name: 'JUnit', level: 82, badge: 'Proficient', icon: '🧪', tags: ['Unit Testing', 'DAO / Service Layers', 'Assertions', '8+ Test Suites'] },
      { name: 'Netlify & DevTools', level: 86, badge: 'Advanced', icon: '⚡', tags: ['Serverless Functions', 'Chrome DevTools', 'Performance & Accessibility'] }
    ],
    cs: [
      { name: 'Data Structures & Algorithms', level: 88, badge: '100+ Solved', icon: '🧩', tags: ['Arrays & Strings', 'Trees & Graphs', 'LeetCode 100+', '10+ Hackathons'] },
      { name: 'Object-Oriented Programming', level: 90, badge: 'Core', icon: '🏛️', tags: ['Java OOP', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Clean Architecture'] },
      { name: 'Computer Networks', level: 82, badge: 'Core', icon: '🌐', tags: ['TCP / IP', 'HTTP / HTTPS', 'DNS', 'Socket Communication', 'REST Protocols'] },
      { name: 'Operating Systems', level: 82, badge: 'Core', icon: '💻', tags: ['Processes & Threads', 'CPU Scheduling', 'Concurrency', 'Memory Management'] }
    ]
  };

  // Move the sliding ink indicator to match active tab
  function updateInk(activeTab) {
    if (!ink || !activeTab) return;
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    const left = tabRect.left - containerRect.left;
    const width = tabRect.width;

    ink.style.transform = `translateX(${left}px)`;
    ink.style.width = `${width}px`;
  }

  // Render cards for category
  function renderSkills(category) {
    const skills = SKILLS_DATA[category] || SKILLS_DATA.languages;

    panel.innerHTML = skills.map(skill => `
      <div class="skill-card">
        <div class="skill-card-head">
          <div class="skill-title-wrap">
            <span class="skill-icon" aria-hidden="true">${skill.icon}</span>
            <h3 class="skill-name">${skill.name}</h3>
          </div>
          <span class="skill-badge">${skill.badge}</span>
        </div>
        <div class="skill-progress-wrap">
          <div class="skill-progress-meta">
            <span>Proficiency</span>
            <span>${skill.level}%</span>
          </div>
          <div class="skill-track">
            <div class="skill-fill" data-level="${skill.level}" style="transform: scaleX(0);"></div>
          </div>
        </div>
        <div class="skill-subtags">
          ${skill.tags.map(t => `<span class="skill-subtag">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');

    // Trigger animations
    const cards = Array.from(panel.querySelectorAll('.skill-card'));
    const fills = Array.from(panel.querySelectorAll('.skill-fill'));

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }

    // Animate progress bars after slight delay
    setTimeout(() => {
      fills.forEach(fill => {
        const level = fill.getAttribute('data-level');
        fill.style.transform = `scaleX(${level / 100})`;
      });
    }, 100);
  }

  // Tab Click Listeners
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('active')) return;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const cat = tab.getAttribute('data-cat');
      updateInk(tab);
      renderSkills(cat);
    });
  });

  // Initial render on page load
  const initialActive = tabsContainer.querySelector('.s-tab.active') || tabs[0];
  updateInk(initialActive);
  renderSkills(initialActive.getAttribute('data-cat') || 'languages');

  // Handle window resize for sliding ink pill alignment
  window.addEventListener('resize', () => {
    const currentActive = tabsContainer.querySelector('.s-tab.active');
    if (currentActive) updateInk(currentActive);
  }, { passive: true });
}
