// Mobile and accessibility detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

// Lenis removed — it hijacks native scroll and makes it feel sluggish
// Native browser scroll + CSS scroll-behavior is sufficient

// Initialize AOS (skip on reduced motion)
if (typeof AOS !== 'undefined' && typeof AOS.init === 'function' && !prefersReducedMotion) {
    AOS.init({
        once: true,
        offset: 50,
        duration: 800,
        easing: 'ease-out-cubic',
    });
}

// Initialize Vanilla Tilt (skip on mobile or reduced motion)
if (typeof VanillaTilt !== 'undefined' && !isMobile && !prefersReducedMotion) {
    VanillaTilt.init(document.querySelectorAll(".feature-card"), {
        max: 15,
        speed: 400,
        glare: true,
        "max-glare": 0.1,
        scale: 1.02
    });

    const phoneMockup = document.querySelector(".phone-mockup");
    if (phoneMockup) {
        VanillaTilt.init(phoneMockup, {
            max: 5,
            speed: 1000,
            glare: true,
            "max-glare": 0.2,
            scale: 1.0
        });
    }
}

// Particle & Shooting Star Canvas Effect - skip on mobile for battery
const canvas = document.getElementById('hero-canvas');
if (canvas && !isMobile) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let shootingStars = [];

    // Interaction State
    let mouse = { x: null, y: null };

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
    }

    // Event Listeners for Interaction
    window.addEventListener('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', function () {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('touchmove', function (e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: true });

    window.addEventListener('touchend', function () {
        mouse.x = null;
        mouse.y = null;
    });

    // Floating Particle Class (Interactive)
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 2 + 0.5;
            this.baseOpacity = Math.random() * 0.5 + 0.1;
            this.opacity = this.baseOpacity;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Interaction: Connect to mouse
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(212, 175, 55, ${0.2 * (1 - distance / 150)})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();

                    // Slight attraction
                    this.vx += dx * 0.0001;
                    this.vy += dy * 0.0001;
                }
            }

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            // Limit Speed
            const speedLimit = 0.5;
            if (this.vx > speedLimit) this.vx = speedLimit;
            if (this.vx < -speedLimit) this.vx = -speedLimit;
            if (this.vy > speedLimit) this.vy = speedLimit;
            if (this.vy < -speedLimit) this.vy = -speedLimit;
        }

        draw() {
            ctx.fillStyle = `rgba(10, 92, 62, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Shooting Star Class (New)
    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height * 0.5; // Start in top half
            this.len = Math.random() * 80 + 10;
            this.speed = Math.random() * 10 + 6;
            this.size = Math.random() * 1 + 0.1;
            // Angle between 30 and 60 degrees (falling right) or 120-150 (falling left) mostly
            // Let's make them fall like rain/meteors: -45 deg or similar
            this.angle = Math.PI / 4; // 45 degrees
            this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
            this.active = false;
        }

        update() {
            if (this.active) {
                this.x -= this.speed * Math.cos(this.angle);
                this.y += this.speed * Math.sin(this.angle);

                // If out of bounds, reset
                if (this.x < -this.len || this.x > width + this.len || this.y > height + this.len) {
                    this.active = false;
                    this.waitTime = new Date().getTime() + Math.random() * 3000 + 500;
                }
            } else {
                if (new Date().getTime() > this.waitTime) {
                    this.active = true;
                    this.x = Math.random() * width + 200; // Start offset to allow travel
                    this.y = -50;
                }
            }
        }

        draw() {
            if (!this.active) return;

            ctx.strokeStyle = 'rgba(212, 175, 55, ' + (Math.random() * 0.5 + 0.1) + ')'; // Gold tint
            ctx.lineWidth = this.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.len * Math.cos(this.angle), this.y - this.len * Math.sin(this.angle));
            ctx.stroke();
        }
    }

    function initParticles() {
        particles = [];
        // Mobile optimization
        const count = width < 768 ? 20 : 40;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }

        shootingStars = [];
        for (let i = 0; i < 3; i++) { // Max 3 shooting stars at once
            shootingStars.push(new ShootingStar());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        shootingStars.forEach(s => {
            s.update();
            s.draw();
        });

        requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    resize();
    initParticles();
    animateParticles();
}

// Loader
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        const delay = isMobile ? 500 : 1500;
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.visibility = 'hidden';
            }, 400);
        }, delay);
    }
});

// Mobile Menu with enhanced accessibility
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

if (mobileToggle && mobileMenu) {
    // Click handler
    mobileToggle.addEventListener('click', () => {
        toggleMobileMenu();
    });

    // Keyboard support
    mobileToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileMenu();
        }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target) && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // Handle mobile menu links
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Focus management
    mobileMenu.addEventListener('transitionend', () => {
        if (mobileMenu.classList.contains('active')) {
            // Focus first link when menu opens
            const firstLink = mobileMenu.querySelector('a');
            if (firstLink) firstLink.focus();
        } else {
            // Return focus to toggle when menu closes
            mobileToggle.focus();
        }
    });
}

function toggleMobileMenu() {
    const isActive = mobileMenu.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';

    // Announce to screen readers
    const announcement = isActive ? 'تم فتح القائمة' : 'تم إغلاق القائمة';
    announceToScreenReader(announcement);
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Screen reader announcements
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Header scroll effect
const header = document.getElementById('header');
const backToTop = document.getElementById('back-to-top');

let headerTicking = false;
window.addEventListener('scroll', () => {
    if (!headerTicking) {
        requestAnimationFrame(() => {
            if (header) {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
            if (backToTop) {
                if (window.scrollY > 50) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }
            headerTicking = false;
        });
        headerTicking = true;
    }
}, { passive: true });

// Scroll behavior respecting reduced motion preference
const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

// Smooth Scroll for Back to Top
if (backToTop) {
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: scrollBehavior });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: scrollBehavior });
            }
        }
    });
});

// Dark Mode Logic
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Toggle Event
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = html.getAttribute('data-theme') === 'dark';
        if (isDark) {
            html.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.setAttribute('aria-pressed', 'false');
        } else {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.setAttribute('aria-pressed', 'true');
        }
    });
}

// Animated Text Reveals and Typewriter Effects
class TextReveal {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            delay: options.delay || 0,
            duration: options.duration || 1000,
            type: options.type || 'reveal', // 'reveal' or 'typewriter'
            text: options.text || element.textContent,
            ...options
        };
        this.init();
    }

    init() {
        if (this.options.type === 'typewriter') {
            this.setupTypewriter();
        } else {
            this.setupReveal();
        }
    }

    setupReveal() {
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateY(30px)';
        this.element.style.transition = `all ${this.options.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

        setTimeout(() => {
            this.element.style.opacity = '1';
            this.element.style.transform = 'translateY(0)';
        }, this.options.delay);
    }

    setupTypewriter() {
        const originalText = this.options.text;
        this.element.textContent = '';
        this.element.style.borderRight = '2px solid var(--primary)';

        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                this.element.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                this.element.style.borderRight = 'none';
            }
        };

        setTimeout(typeWriter, this.options.delay);
    }
}

// Initialize text animations
document.addEventListener('DOMContentLoaded', () => {
    // Typewriter effect for hero title - only on desktop
    if (!isMobile && !prefersReducedMotion) {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            const typewriterText = heroTitle.getAttribute('data-typewriter') || heroTitle.textContent;
            new TextReveal(heroTitle, {
                type: 'typewriter',
                delay: 500,
                text: typewriterText
            });
        }
    }

    // Reveal animations for other text elements - only on desktop
    if (!isMobile && !prefersReducedMotion) {
        const heroParagraph = document.querySelector('.hero p');
        if (heroParagraph) {
            new TextReveal(heroParagraph, { delay: 2000, duration: 800 });
        }
    }
});

// Responsive Font Scaling - disabled, using CSS clamp() instead
class ResponsiveTypography {
    constructor() {
        // No-op: CSS clamp() handles responsive sizing now
    }
}
new ResponsiveTypography();

// Text Shadow Effects for Depth - desktop only
class TextShadowEffects {
    constructor() {
        if (!isMobile) this.init();
    }

    init() {
        this.addTextShadows();
    }

    addTextShadows() {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            heroTitle.style.textShadow = `
                0 2px 4px rgba(10, 92, 62, 0.1),
                0 4px 8px rgba(10, 92, 62, 0.05)
            `;
        }
    }
}

// Initialize text shadow effects
new TextShadowEffects();

// Smooth Section Transitions with Fade Effects
class SectionTransitions {
    constructor() {
        this.sections = document.querySelectorAll('section');
        this.init();
    }

    init() {
        // Enable animation only after JS is ready (progressive enhancement)
        document.documentElement.classList.add('js-loaded');
        // Make hero visible immediately
        const hero = document.querySelector('.hero, #main-content');
        if (hero) hero.classList.add('visible');
        this.setupObserver();

        // Safety net: force all sections visible after a timeout
        // Prevents sections staying invisible if observer misses them
        const fallbackDelay = isMobile ? 2000 : 4000;
        setTimeout(() => {
            this.sections.forEach(section => {
                if (!section.classList.contains('visible')) {
                    section.classList.add('visible');
                }
            });
        }, fallbackDelay);
    }

    setupObserver() {
        if ('IntersectionObserver' in window) {
            // Lower threshold on mobile so sections appear sooner during fast scrolls
            const threshold = isMobile ? 0.01 : 0.15;
            const rootMargin = isMobile ? '0px 0px 50px 0px' : '0px 0px -50px 0px';
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold, rootMargin });
            this.sections.forEach(section => observer.observe(section));
        } else {
            // Fallback: show everything
            this.sections.forEach(section => section.classList.add('visible'));
        }
    }
}

// Initialize section transitions
new SectionTransitions();

// Skeleton Loading - disabled (was destroying feature card content)
// Progressive image loading is handled by native loading="lazy" attribute
class SkeletonLoader {
    constructor() {
        // No-op: removed because it was replacing feature card HTML with skeletons
        // and never restoring the original content
    }
}

new SkeletonLoader();

// Progressive Image Loading with Blur-to-Sharp Transitions
class ProgressiveImageLoader {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => this.loadImage(img));
        }
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        img.src = src;
        img.classList.add('blur');

        img.addEventListener('load', () => {
            img.classList.remove('blur');
            img.classList.add('loaded');
        });

        img.removeAttribute('data-src');
    }
}

// Initialize progressive image loader
new ProgressiveImageLoader();

// Page Transitions - removed (was adding 900ms delay to all anchor navigation)
// Anchor links scroll smoothly via native scrollIntoView

// Magnetic Button Effects that Follow Cursor Movement
class MagneticButtons {
    constructor() {
        if (isMobile) return; // Skip on mobile - no cursor
        this.buttons = document.querySelectorAll('.btn, .store-btn');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.classList.add('magnetic-btn');
            this.bindEvents(button);
        });
    }

    bindEvents(button) {
        button.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e, button);
        });

        button.addEventListener('mouseleave', () => {
            this.resetPosition(button);
        });
    }

    handleMouseMove(e, button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = 50;

        if (distance < maxDistance) {
            const strength = (maxDistance - distance) / maxDistance;
            const moveX = x * strength * 0.3;
            const moveY = y * strength * 0.3;

            button.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    }

    resetPosition(button) {
        button.style.transform = 'translate(0, 0)';
    }
}

// Initialize magnetic buttons
new MagneticButtons();

// Ripple Effects on Button Clicks - desktop only
class RippleEffects {
    constructor() {
        if (isMobile) return;
        this.buttons = document.querySelectorAll('.btn, .store-btn');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.classList.add('btn-ripple');
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });
    }

    createRipple(e, button) {
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        button.style.setProperty('--ripple-x', `${x}px`);
        button.style.setProperty('--ripple-y', `${y}px`);

        // Reset animation
        button.style.animation = 'none';
        button.offsetHeight; // Trigger reflow
        button.style.animation = 'ripple 0.6s ease-out';
    }
}

// Initialize ripple effects
new RippleEffects();

// Subtle Parallax Scrolling Effects - desktop only
class ParallaxEffects {
    constructor() {
        if (isMobile || prefersReducedMotion) return; // Skip on mobile
        this.elements = document.querySelectorAll('.parallax-element');
        this.init();
    }

    init() {
        this.bindScrollEvents();
    }

    bindScrollEvents() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateParallax();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateParallax() {
        const scrolled = window.pageYOffset;

        this.elements.forEach(element => {
            const rate = element.getAttribute('data-parallax-rate') || 0.5;
            const yPos = -(scrolled * rate);
            element.style.setProperty('--parallax-y', `${yPos}px`);
        });
    }
}

// Initialize parallax effects
new ParallaxEffects();

// Mini Progress Bar for Scroll Position
class ScrollProgressBar {
    constructor() {
        this.progressBar = null;
        this.init();
    }

    init() {
        this.createProgressBar();
        this.bindEvents();
        this.updateProgress();
    }

    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.id = 'scroll-progress';
        this.progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            z-index: 9999;
            transition: width 0.1s ease-out;
            box-shadow: 0 0 10px rgba(10, 92, 62, 0.3);
        `;
        document.body.appendChild(this.progressBar);
    }

    bindEvents() {
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    this.updateProgress();
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            this.updateProgress();
        });
    }

    updateProgress() {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        this.progressBar.style.width = `${Math.min(scrolled, 100)}%`;
    }
}

// Initialize scroll progress bar
new ScrollProgressBar();

// Advanced Scroll-Triggered Animations - simplified, desktop only
class ScrollAnimations {
    constructor() {
        if (isMobile || prefersReducedMotion) return;
        this.init();
    }

    init() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateAnimations() {
        const windowHeight = window.innerHeight;

        // Gentle scale on section titles as they enter viewport
        const sectionTitles = document.querySelectorAll('.section-header h2');
        sectionTitles.forEach(title => {
            const titleRect = title.getBoundingClientRect();
            const titleCenter = titleRect.top + titleRect.height / 2;
            const distanceFromCenter = Math.abs(windowHeight / 2 - titleCenter);
            const scale = Math.max(0.92, 1 - distanceFromCenter / (windowHeight / 2) * 0.08);
            title.style.transform = `scale(${scale})`;
        });
    }
}

// Initialize scroll animations
new ScrollAnimations();

// Interactive Background Effects
class InteractiveBackground {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.orbs = [];
        this.mouse = { x: null, y: null };
        this.init();
    }

    init() {
        this.createCanvas();
        this.createOrbs();
        this.bindEvents();
        this.animate();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'interactive-bg';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.6;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
    }

    createOrbs() {
        const orbCount = isMobile ? 3 : 5;
        for (let i = 0; i < orbCount; i++) {
            this.orbs.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 100 + 50,
                baseRadius: Math.random() * 100 + 50,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                hue: Math.random() * 60 + 120, // Green to yellow range
                opacity: Math.random() * 0.3 + 0.1,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateOrbs();
        this.drawOrbs();
        requestAnimationFrame(() => this.animate());
    }

    updateOrbs() {
        this.orbs.forEach(orb => {
            // Breathing effect
            orb.pulsePhase += 0.02;
            orb.radius = orb.baseRadius + Math.sin(orb.pulsePhase) * 20;

            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = this.mouse.x - orb.x;
                const dy = this.mouse.y - orb.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 200;

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    orb.vx += (dx / distance) * force * 0.01;
                    orb.vy += (dy / distance) * force * 0.01;
                    orb.hue += force * 2; // Color shift on interaction
                }
            }

            // Movement
            orb.x += orb.vx;
            orb.y += orb.vy;

            // Boundary collision
            if (orb.x < 0 || orb.x > window.innerWidth) orb.vx *= -0.8;
            if (orb.y < 0 || orb.y > window.innerHeight) orb.vy *= -0.8;

            // Friction
            orb.vx *= 0.99;
            orb.vy *= 0.99;

            // Keep within bounds
            orb.x = Math.max(0, Math.min(window.innerWidth, orb.x));
            orb.y = Math.max(0, Math.min(window.innerHeight, orb.y));

            // Color cycling
            orb.hue = (orb.hue + 0.1) % 360;
        });
    }

    drawOrbs() {
        this.orbs.forEach(orb => {
            const gradient = this.ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, orb.radius
            );

            gradient.addColorStop(0, `hsla(${orb.hue}, 70%, 60%, ${orb.opacity})`);
            gradient.addColorStop(0.5, `hsla(${orb.hue}, 70%, 50%, ${orb.opacity * 0.5})`);
            gradient.addColorStop(1, `hsla(${orb.hue}, 70%, 40%, 0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}

// Dynamic Geometric Patterns
class DynamicPatterns {
    constructor() {
        this.patterns = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.createPatterns();
        this.bindEvents();
        this.animate();
    }

    createPatterns() {
        // Create floating geometric shapes
        const patternCount = isMobile ? 8 : 12;
        for (let i = 0; i < patternCount; i++) {
            this.patterns.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 30 + 10,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                type: Math.floor(Math.random() * 4), // 0: circle, 1: square, 2: triangle, 3: star
                opacity: Math.random() * 0.1 + 0.05,
                hue: Math.random() * 60 + 120,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2
            });
        }
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('resize', () => {
            this.patterns.forEach(pattern => {
                pattern.x = Math.min(pattern.x, window.innerWidth);
                pattern.y = Math.min(pattern.y, window.innerHeight);
            });
        });
    }

    animate() {
        this.updatePatterns();
        this.drawPatterns();
        requestAnimationFrame(() => this.animate());
    }

    updatePatterns() {
        this.patterns.forEach(pattern => {
            // Rotation
            pattern.rotation += pattern.rotationSpeed;

            // Mouse interaction
            const dx = this.mouse.x - pattern.x;
            const dy = this.mouse.y - pattern.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                pattern.vx += (dx / distance) * force * 0.01;
                pattern.vy += (dy / distance) * force * 0.01;
                pattern.rotationSpeed += force * 0.001;
            }

            // Movement
            pattern.x += pattern.vx;
            pattern.y += pattern.vy;

            // Boundary wrapping
            if (pattern.x < -50) pattern.x = window.innerWidth + 50;
            if (pattern.x > window.innerWidth + 50) pattern.x = -50;
            if (pattern.y < -50) pattern.y = window.innerHeight + 50;
            if (pattern.y > window.innerHeight + 50) pattern.y = -50;

            // Friction
            pattern.vx *= 0.995;
            pattern.vy *= 0.995;
            pattern.rotationSpeed *= 0.995;
        });
    }

    drawPatterns() {
        // We'll use CSS transforms instead of canvas for better performance
        this.patterns.forEach((pattern, index) => {
            const element = document.querySelector(`.dynamic-pattern-${index}`);
            if (element) {
                element.style.transform = `
                    translate(${pattern.x}px, ${pattern.y}px)
                    rotate(${pattern.rotation}rad)
                    scale(${1 + Math.sin(Date.now() * 0.001 + index) * 0.1})
                `;
                element.style.opacity = pattern.opacity + Math.sin(Date.now() * 0.002 + index) * 0.05;
            }
        });
    }
}

// Breathing/Pulsing Background Elements - simplified, only blobs
class BreathingElements {
    constructor() {
        if (prefersReducedMotion || isMobile) return;
        this.init();
    }

    init() {
        // Only add breathing to background blobs, not interactive icon-boxes
        const heroBlobs = document.querySelectorAll('.blob');
        heroBlobs.forEach((el, index) => {
            el.classList.add('breathing');
            el.style.animation = `breathe ${3 + index * 0.5}s ease-in-out infinite ${index * 0.2}s`;
        });
    }
}

// Initialize interactive background effects
if (!isMobile) { // Skip on mobile for performance
    new InteractiveBackground();
    new DynamicPatterns();
}
new BreathingElements();

// Morphing Shapes and Advanced Animations
class MorphingElements {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.createMorphingLogo();
        this.createMorphingShapes();
        this.startMorphing();
    }

    createMorphingLogo() {
        const logo = document.querySelector('.logo img');
        if (logo) {
            logo.classList.add('morphing-logo');
            logo.addEventListener('mouseenter', () => this.morphLogo(logo, true));
            logo.addEventListener('mouseleave', () => this.morphLogo(logo, false));
        }
    }

    createMorphingShapes() {
        // Create morphing shape containers
        const morphingContainer = document.createElement('div');
        morphingContainer.className = 'morphing-shapes-container';
        morphingContainer.innerHTML = `
            <div class="morphing-shape shape-1"></div>
            <div class="morphing-shape shape-2"></div>
            <div class="morphing-shape shape-3"></div>
        `;
        document.body.appendChild(morphingContainer);

        // Add morphing behavior to shapes
        const shapes = document.querySelectorAll('.morphing-shape');
        shapes.forEach((shape, index) => {
            shape.addEventListener('mouseenter', () => this.morphShape(shape, index));
            shape.addEventListener('mouseleave', () => this.resetShape(shape));
        });
    }

    morphLogo(logo, isHovering) {
        if (isHovering) {
            logo.style.animation = 'logoMorph 0.6s ease-in-out';
            logo.style.filter = 'hue-rotate(45deg) brightness(1.2)';
        } else {
            logo.style.animation = 'logoMorphReverse 0.6s ease-in-out';
            logo.style.filter = 'none';
        }
    }

    morphShape(shape, index) {
        const morphs = [
            'polygon(50% 0%, 0% 100%, 100% 100%)', // Triangle
            'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', // Hexagon
            'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' // Diamond
        ];

        shape.style.clipPath = morphs[index % morphs.length];
        shape.style.transform = 'scale(1.2) rotate(180deg)';
        shape.style.background = `linear-gradient(45deg, hsl(${120 + index * 40}, 70%, 60%), hsl(${160 + index * 40}, 70%, 50%))`;
    }

    resetShape(shape) {
        shape.style.clipPath = 'circle(50%)';
        shape.style.transform = 'scale(1) rotate(0deg)';
        shape.style.background = 'var(--primary)';
    }

    startMorphing() {
        // Auto-morph shapes periodically
        setInterval(() => {
            const shapes = document.querySelectorAll('.morphing-shape');
            shapes.forEach((shape, index) => {
                if (!shape.matches(':hover')) {
                    setTimeout(() => {
                        this.morphShape(shape, (index + Math.floor(Date.now() / 3000)) % 3);
                        setTimeout(() => {
                            if (!shape.matches(':hover')) {
                                this.resetShape(shape);
                            }
                        }, 1000);
                    }, index * 200);
                }
            });
        }, 5000);
    }
}

// Liquid Button Effects
class LiquidButtons {
    constructor() {
        this.buttons = document.querySelectorAll('.btn, .store-btn');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.classList.add('liquid-btn');
            this.addLiquidEffect(button);
        });
    }

    addLiquidEffect(button) {
        button.addEventListener('mouseenter', (e) => this.createLiquidEffect(e, button));
        button.addEventListener('mouseleave', () => this.removeLiquidEffect(button));
    }

    createLiquidEffect(e, button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create liquid blob effect
        const liquidBlob = document.createElement('div');
        liquidBlob.className = 'liquid-blob';
        liquidBlob.style.cssText = `
            position: absolute;
            top: ${y}px;
            left: ${x}px;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            animation: liquidSpread 0.6s ease-out forwards;
        `;

        button.appendChild(liquidBlob);

        // Remove after animation
        setTimeout(() => {
            if (liquidBlob.parentNode) {
                liquidBlob.remove();
            }
        }, 600);
    }

    removeLiquidEffect(button) {
        // Add a subtle ripple effect on mouse leave
        const ripple = document.createElement('div');
        ripple.className = 'liquid-ripple';
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1;
            animation: liquidRipple 0.4s ease-out forwards;
        `;

        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 400);
    }
}

// Advanced Hover States - desktop only
class AdvancedHoverStates {
    constructor() {
        if (isMobile) return; // No hover on mobile
    }
}

// Initialize morphing and advanced effects
if (!isMobile) {
    new MorphingElements();
    new LiquidButtons();
}
new AdvancedHoverStates();

// Gesture Support - simplified, non-blocking
// Removed: pull-to-refresh (reloads page unexpectedly), horizontal swipe navigation
// (blocks normal scrolling), pinch-to-zoom on all images (conflicts with native zoom)
// Kept: basic touch feedback only

class GestureSupport {
    constructor() {
        // No-op: removed gesture handlers that were blocking normal mobile scrolling
        // Native browser gestures work correctly now
    }
}

// Initialize gesture support
new GestureSupport();
