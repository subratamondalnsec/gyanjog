/* ==========================================================================
   GYANJOG GROUP ? Main Interactive Engine
   Vanilla JS + GSAP 3 + Lenis Smooth Scroll
   ========================================================================== */

(function () {
  'use strict';

  // Constants
  const EASE = 'power3.out';
  const DUR = 0.85;
  const STAGGER = 0.08;

  let lenisInstance = null;

  // 1. Library Waiter & Initialization
  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof Lenis === 'undefined') {
      setTimeout(init, 50);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (typeof Draggable !== 'undefined') {
      gsap.registerPlugin(Draggable);
    }

    // Initialize all modules
    initLenis();
    initScrollProgress();
    initNavbar();
    initPreloader();
    initRevealAnimations();
    initCounters();
    initCoursesScroll();
    initTabs();
    initBranchFilter();
    initTeamFilter();
    initTestimonialsCarousel();
    initGalleryLightbox();
    initContactForm();
    initCursorAndMagnetic();
    initBackToTop();

    // Refresh triggers after fonts and resources settle
    document.fonts.ready.then(() => {
      ScrollTrigger.refresh();
    });
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  }

  // 2. Lenis Smooth Scroll
  function initLenis() {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisInstance.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Anchor Link Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#top') {
          e.preventDefault();
          lenisInstance.scrollTo(0, { offset: 0, duration: 1.2 });
          return;
        }
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const navOffset = window.innerWidth >= 1024 ? 90 : 70;
          lenisInstance.scrollTo(target, { offset: -navOffset, duration: 1.2 });
          
          // Close mobile nav if open
          const mobileNav = document.getElementById('mobile-nav');
          const hamburger = document.querySelector('.hamburger');
          if (mobileNav && mobileNav.classList.contains('is-open')) {
            mobileNav.classList.remove('is-open');
            hamburger.classList.remove('is-active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }
        }
      });
    });
  }

  // 3. Scroll Progress Indicator
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    gsap.to(bar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
  }

  // 4. Preloader with SessionStorage Skip
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const counterEl = document.getElementById('preloader-count');
    const fillEl = document.querySelector('.preloader__fill');
    const curtain = document.querySelector('.preloader__curtain');

    if (!preloader) {
      startHeroIntro();
      return;
    }

    const hasVisited = sessionStorage.getItem('gyanjog_visited');
    if (hasVisited) {
      preloader.style.display = 'none';
      startHeroIntro();
      return;
    }

    sessionStorage.setItem('gyanjog_visited', '1');

    const progressObj = { count: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(curtain, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            startHeroIntro();
          },
        });
      },
    });

    tl.to(progressObj, {
      count: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        const val = Math.round(progressObj.count);
        if (counterEl) counterEl.textContent = val;
        if (fillEl) fillEl.style.width = val + '%';
      },
    });
  }

  // 5. Floating Navbar Behavior
  function initNavbar() {
    const header = document.querySelector('.site-header');
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileClose = document.querySelector('.mobile-nav__close');

    if (!header || !navbar) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      if (currentScrollY > 300 && currentScrollY > lastScrollY && !mobileNav.classList.contains('is-open')) {
        header.classList.add('nav-hidden');
      } else {
        header.classList.remove('nav-hidden');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });

    // Mobile Hamburger Toggle
    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        hamburger.classList.toggle('is-active', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      if (mobileClose) {
        mobileClose.addEventListener('click', () => {
          mobileNav.classList.remove('is-open');
          hamburger.classList.remove('is-active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      }

      // Escape key to close mobile nav
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
          mobileNav.classList.remove('is-open');
          hamburger.classList.remove('is-active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }
  }

  // 6. Hero Slideshow & Entrance Animation
  let currentSlide = 0;
  let slideTimer = null;

  function startHeroIntro() {
    const headline = document.querySelector('.hero__headline');
    const lines = document.querySelectorAll('.hero__line');
    const sub = document.querySelector('.hero__sub');
    const ctas = document.querySelector('.hero__ctas');
    const stats = document.querySelectorAll('.hero__stat-card');
    const scrollHint = document.querySelector('.hero__scroll-hint');

    const tl = gsap.timeline({ defaults: { ease: EASE, duration: DUR } });

    if (headline) headline.classList.remove('js-hidden');
    if (sub) sub.classList.remove('js-hidden');
    if (ctas) ctas.classList.remove('js-hidden');
    if (scrollHint) scrollHint.classList.remove('js-hidden');
    stats.forEach((s) => s.classList.remove('js-hidden'));

    tl.fromTo(
      lines,
      { y: '115%', opacity: 0 },
      { y: '0%', opacity: 1, duration: 1, stagger: 0.15, ease: 'power4.out' }
    )
      .fromTo(sub, { y: 24, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.6')
      .fromTo(ctas, { y: 24, opacity: 0 }, { y: 0, opacity: 1 }, '-=0.6')
      .fromTo(stats, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1 }, '-=0.5')
      .fromTo(scrollHint, { opacity: 0 }, { opacity: 0.8 }, '-=0.4');

    initHeroSlideshow();
  }

  function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero__slide');
    const dots = document.querySelectorAll('.hero__dot');
    if (slides.length <= 1) return;

    function goToSlide(index) {
      if (index === currentSlide) return;
      slides[currentSlide].classList.remove('hero__slide--active');
      dots[currentSlide].classList.remove('hero__dot--active');
      dots[currentSlide].setAttribute('aria-selected', 'false');

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('hero__slide--active');
      dots[currentSlide].classList.add('hero__dot--active');
      dots[currentSlide].setAttribute('aria-selected', 'true');
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        clearInterval(slideTimer);
        goToSlide(idx);
        startAutoSlide();
      });
    });

    function startAutoSlide() {
      slideTimer = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 5500);
    }

    startAutoSlide();
  }

  // 7. Scroll Batch Reveals
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.js-reveal');
    if (!reveals.length) return;

    ScrollTrigger.batch(reveals, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        gsap.fromTo(
          batch,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: DUR, ease: EASE, stagger: STAGGER, overwrite: 'auto' }
        );
      },
    });
  }

  // 8. Statistics Counter Animation
  function initCounters() {
    const counters = document.querySelectorAll('.counter-num');
    counters.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-target')) || 0;
      const suffix = el.getAttribute('data-suffix') || '';

      const counterObj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(counterObj, {
            val: target,
            duration: 2,
            ease: 'power3.out',
            onUpdate: () => {
              if (target >= 1000) {
                el.textContent = Math.round(counterObj.val).toLocaleString() + suffix;
              } else {
                el.textContent = Math.round(counterObj.val) + suffix;
              }
            },
          });
        },
      });
    });
  }

  // 9. Courses Horizontal Scroll (Pinned on Desktop)
  function initCoursesScroll() {
    const scrollWrap = document.getElementById('courses-scroll-wrap');
    const track = document.getElementById('courses-track');
    const progressFill = document.getElementById('courses-progress-fill');

    if (!scrollWrap || !track) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 80);

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
      });

      ScrollTrigger.create({
        trigger: scrollWrap,
        start: 'top 15%',
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (progressFill) {
            progressFill.style.width = Math.round(self.progress * 100) + '%';
          }
        },
      });
    });
  }
  // 10. Tabs for Govt. Courses & Associate Schools
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('aria-controls');

        tabBtns.forEach((b) => {
          b.classList.remove('tab-btn--active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanels.forEach((p) => {
          p.classList.remove('tab-panel--active');
          p.setAttribute('hidden', '');
        });

        btn.classList.add('tab-btn--active');
        btn.setAttribute('aria-selected', 'true');

        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('tab-panel--active');
          targetPanel.removeAttribute('hidden');
          gsap.fromTo(targetPanel, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: EASE });
        }
      });
    });
  }

  // 11. Branches Search & Filter
  function initBranchFilter() {
    const input = document.getElementById('branch-search');
    const chips = document.querySelectorAll('.branch-chip');
    const noResults = document.getElementById('branches-no-results');
    const querySpan = document.getElementById('no-results-query');

    if (!input || !chips.length) return;

    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      let matchCount = 0;

      chips.forEach((chip) => {
        const text = chip.getAttribute('data-branch') || chip.textContent.toLowerCase();
        if (text.includes(query)) {
          chip.classList.remove('is-hidden');
          matchCount++;
        } else {
          chip.classList.add('is-hidden');
        }
      });

      if (matchCount === 0 && query.length > 0) {
        if (noResults) {
          noResults.removeAttribute('hidden');
          if (querySpan) querySpan.textContent = query;
        }
      } else {
        if (noResults) noResults.setAttribute('hidden', '');
      }
    });
  }

  // 12. Team Role Filter
  function initTeamFilter() {
    const filterBtns = document.querySelectorAll('.filter-chip');
    const teamCards = document.querySelectorAll('.team-card');

    if (!filterBtns.length || !teamCards.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => {
          b.classList.remove('filter-chip--active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('filter-chip--active');
        btn.setAttribute('aria-pressed', 'true');

        const role = btn.getAttribute('data-filter');

        teamCards.forEach((card) => {
          const cardRole = card.getAttribute('data-role');
          if (role === 'all' || cardRole === role) {
            card.classList.remove('is-hidden');
            gsap.fromTo(card, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.35, ease: EASE });
          } else {
            card.classList.add('is-hidden');
          }
        });

        ScrollTrigger.refresh();
      });
    });
  }

  // 13. Testimonials Carousel
  function initTestimonialsCarousel() {
    const track = document.getElementById('testimonials-track');
    const slides = document.querySelectorAll('.review-slide');
    const prevBtn = document.getElementById('rev-prev');
    const nextBtn = document.getElementById('rev-next');
    const dots = document.querySelectorAll('.testimonials__dot');

    if (!track || slides.length === 0) return;

    let activeIndex = 0;

    function updateCarousel(index) {
      activeIndex = (index + slides.length) % slides.length;
      const offset = activeIndex * -100;
      gsap.to(track, {
        xPercent: offset,
        duration: 0.6,
        ease: 'power3.out',
      });

      dots.forEach((dot, idx) => {
        const isCurrent = idx === activeIndex;
        dot.classList.toggle('testimonials__dot--active', isCurrent);
        dot.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => updateCarousel(activeIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => updateCarousel(activeIndex + 1));
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        updateCarousel(idx);
      });
    });

    // Keyboard support
    track.parentElement.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') updateCarousel(activeIndex - 1);
      if (e.key === 'ArrowRight') updateCarousel(activeIndex + 1);
    });
  }

  // 14. Gallery & Lightbox
  function initGalleryLightbox() {
    const items = document.querySelectorAll('.gallery__item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const bg = document.getElementById('lightbox-bg');

    if (!items.length || !lightbox) return;

    let currentIndex = 0;
    let lastFocusedElement = null;

    function openLightbox(index) {
      lastFocusedElement = document.activeElement;
      currentIndex = index;
      updateLightboxImage();
      lightbox.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.setAttribute('hidden', '');
      document.body.style.overflow = '';
      if (lastFocusedElement) lastFocusedElement.focus();
    }

    function updateLightboxImage() {
      const item = items[currentIndex];
      const src = item.getAttribute('data-src');
      const caption = item.getAttribute('data-caption') || '';

      if (lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = caption;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = caption;
      }
    }

    items.forEach((item, idx) => {
      item.addEventListener('click', () => openLightbox(idx));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (bg) bg.addEventListener('click', closeLightbox);

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateLightboxImage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % items.length;
        updateLightboxImage();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
  }

  // 15. Contact Form Validation & Submission
  function initContactForm() {
    const form = document.getElementById('enquiry-form');
    const successBox = document.getElementById('form-success');
    if (!form) return;

    const nameInput = document.getElementById('f-name');
    const emailInput = document.getElementById('f-email');
    const phoneInput = document.getElementById('f-phone');

    function validateField(input, errorId, validator, message) {
      const errSpan = document.getElementById(errorId);
      const val = input.value.trim();
      const isValid = validator(val);

      if (!isValid) {
        input.classList.add('has-error');
        if (errSpan) errSpan.textContent = message;
      } else {
        input.classList.remove('has-error');
        if (errSpan) errSpan.textContent = '';
      }
      return isValid;
    }

    if (nameInput) {
      nameInput.addEventListener('blur', () => {
        validateField(nameInput, 'f-name-err', (v) => v.length >= 2, 'Please enter at least 2 characters.');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        validateField(emailInput, 'f-email-err', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email address.');
      });
    }

    if (phoneInput) {
      phoneInput.addEventListener('blur', () => {
        validateField(phoneInput, 'f-phone-err', (v) => v.replace(/\D/g, '').length >= 7, 'Please enter a valid phone number (min 7 digits).');
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, 'f-name-err', (v) => v.length >= 2, 'Please enter at least 2 characters.');
      const isEmailValid = validateField(emailInput, 'f-email-err', (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email address.');
      const isPhoneValid = validateField(phoneInput, 'f-phone-err', (v) => v.replace(/\D/g, '').length >= 7, 'Please enter a valid phone number.');

      if (isNameValid && isEmailValid && isPhoneValid) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
          submitBtn.querySelector('.btn__label').textContent = 'Submitting...';
        }

        // Simulated submission
        setTimeout(() => {
          form.style.display = 'none';
          if (successBox) {
            successBox.removeAttribute('hidden');
            gsap.fromTo(successBox, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: EASE });
          }
        }, 900);
      }
    });
  }

  // 16. Custom Cursor & Magnetic Buttons (pointer: fine only)
  function initCursorAndMagnetic() {
    if (!window.matchMedia('(pointer: fine) and (hover: hover)').matches) return;

    const cursor = document.querySelector('.cursor');
    const dot = document.querySelector('.cursor-dot');
    if (!cursor || !dot) return;

    window.addEventListener('mousemove', (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'none' });
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
    });

    const interactiveEls = document.querySelectorAll('a, button, input, textarea, .course-card, .team-card, .gallery__item');
    interactiveEls.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
    });

    // Magnetic Buttons
    const magneticBtns = document.querySelectorAll('[data-magnetic]');
    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // 17. Back to Top
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Self-start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
