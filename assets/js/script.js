// Mobile and accessibility detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

// Initialize Lenis Smooth Scroll (skip on mobile or reduced motion)
let lenis;
if (typeof Lenis !== 'undefined' && !isMobile && !prefersReducedMotion) {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true,
    });

    function raf(time) {
        if (lenis) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
    }
    requestAnimationFrame(raf);
}

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

// Particle & Shooting Star Canvas Effect
const canvas = document.getElementById('hero-canvas');
if (canvas) {
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
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.visibility = 'hidden';
            }, 500);
        }, 1500);
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

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
        backToTop.classList.add('visible');
    } else {
        header.classList.remove('scrolled');
        backToTop.classList.remove('visible');
    }
});

// Smooth Scroll for Back to Top
if (backToTop) {
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        if (lenis) {
            lenis.scrollTo(0);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Connect Lenis to anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                if (lenis) {
                    lenis.scrollTo(targetElement);
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
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
        this.element.textContent = '';
        this.element.style.borderRight = '2px solid var(--primary)';
        this.element.style.whiteSpace = 'nowrap';
        this.element.style.overflow = 'hidden';

        let i = 0;
        const typeWriter = () => {
            if (i < this.options.text.length) {
                this.element.textContent += this.options.text.charAt(i);
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
    // Typewriter effect for hero title
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const typewriterText = heroTitle.getAttribute('data-typewriter') || heroTitle.textContent;
        new TextReveal(heroTitle, {
            type: 'typewriter',
            delay: 500,
            text: typewriterText
        });
    }

    // Reveal animations for other text elements
    const heroParagraph = document.querySelector('.hero p');
    if (heroParagraph) {
        new TextReveal(heroParagraph, { delay: 2000, duration: 800 });
    }

    const sectionHeaders = document.querySelectorAll('.section-header h2');
    sectionHeaders.forEach((header, index) => {
        new TextReveal(header, { delay: 200 + (index * 200), duration: 600 });
    });

    const featureTitles = document.querySelectorAll('.feature-card h3');
    featureTitles.forEach((title, index) => {
        new TextReveal(title, { delay: 300 + (index * 100), duration: 500 });
    });
});

// Responsive Font Scaling
class ResponsiveTypography {
    constructor() {
        this.init();
        this.bindEvents();
    }

    init() {
        this.updateFontSizes();
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.debounce(this.updateFontSizes.bind(this), 250);
        });
    }

    updateFontSizes() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate responsive font scale based on viewport
        const scale = Math.min(viewportWidth / 1920, viewportHeight / 1080, 1);

        document.documentElement.style.setProperty('--font-scale', scale);

        // Update specific elements
        this.updateHeroTypography(scale);
        this.updateSectionTypography(scale);
    }

    updateHeroTypography(scale) {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            const baseSize = 4; // rem
            const scaledSize = Math.max(baseSize * scale, 2.5); // Minimum 2.5rem
            heroTitle.style.fontSize = `${scaledSize}rem`;
        }

        const heroParagraph = document.querySelector('.hero p');
        if (heroParagraph) {
            const baseSize = 1.35; // rem
            const scaledSize = Math.max(baseSize * scale, 1); // Minimum 1rem
            heroParagraph.style.fontSize = `${scaledSize}rem`;
        }
    }

    updateSectionTypography(scale) {
        const sectionTitles = document.querySelectorAll('.section-header h2');
        sectionTitles.forEach(title => {
            const baseSize = 3; // rem
            const scaledSize = Math.max(baseSize * scale, 2); // Minimum 2rem
            title.style.fontSize = `${scaledSize}rem`;
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize responsive typography
new ResponsiveTypography();

// Text Shadow Effects for Depth
class TextShadowEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addTextShadows();
        this.bindScrollEffects();
    }

    addTextShadows() {
        // Add depth to hero title
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            heroTitle.style.textShadow = `
                0 2px 4px rgba(10, 92, 62, 0.1),
                0 4px 8px rgba(10, 92, 62, 0.05),
                0 8px 16px rgba(10, 92, 62, 0.03)
            `;
        }

        // Add subtle shadows to section headers
        const sectionHeaders = document.querySelectorAll('.section-header h2');
        sectionHeaders.forEach(header => {
            header.style.textShadow = `
                0 1px 2px rgba(10, 92, 62, 0.1),
                0 2px 4px rgba(10, 92, 62, 0.05)
            `;
        });

        // Add glow effect to feature titles on hover
        const featureTitles = document.querySelectorAll('.feature-card h3');
        featureTitles.forEach(title => {
            title.addEventListener('mouseenter', () => {
                title.style.textShadow = `
                    0 0 10px rgba(212, 175, 55, 0.3),
                    0 0 20px rgba(212, 175, 55, 0.2),
                    0 0 30px rgba(212, 175, 55, 0.1)
                `;
            });

            title.addEventListener('mouseleave', () => {
                title.style.textShadow = 'none';
            });
        });
    }

    bindScrollEffects() {
        window.addEventListener('scroll', () => {
            this.updateScrollShadows();
        });
    }

    updateScrollShadows() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            heroTitle.style.transform = `translateY(${rate * 0.1}px)`;
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
        this.bindScrollEvents();
        this.checkInitialVisibility();
    }

    bindScrollEvents() {
        window.addEventListener('scroll', () => {
            this.checkVisibility();
        });
    }

    checkInitialVisibility() {
        this.checkVisibility();
    }

    checkVisibility() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollTop + windowHeight * 0.8 > sectionTop &&
                scrollTop < sectionTop + sectionHeight) {
                section.classList.add('visible');
            }
        });
    }
}

// Initialize section transitions
new SectionTransitions();

// Skeleton Loading Animations for Images and Content
class SkeletonLoader {
    constructor() {
        this.init();
    }

    init() {
        this.addSkeletonToImages();
        this.addSkeletonToContent();
        this.bindLoadEvents();
    }

    addSkeletonToImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            const wrapper = document.createElement('div');
            wrapper.className = 'progressive-image skeleton-image';
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);

            // Add blur class initially
            img.classList.add('blur');
        });
    }

    addSkeletonToContent() {
        // Add skeleton to feature cards initially
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.classList.add('skeleton-loading');
            const skeletonContent = `
                <div class="skeleton skeleton-card">
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            `;
            card.innerHTML = skeletonContent;
        });
    }

    bindLoadEvents() {
        // Handle image loading
        const images = document.querySelectorAll('.progressive-image img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.classList.remove('blur');
                img.classList.add('loaded');
                img.parentNode.classList.remove('skeleton-image');
            });
        });

        // Handle content loading (simulate with timeout for demo)
        setTimeout(() => {
            this.removeSkeletonFromContent();
        }, 2000);
    }

    removeSkeletonFromContent() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.classList.remove('skeleton-loading');
            // Restore original content (this would normally be done with actual content)
            card.innerHTML = card.getAttribute('data-original-content') || card.innerHTML;
        });
    }
}

// Initialize skeleton loader
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

// Micro-interactions during Page Transitions
class PageTransitions {
    constructor() {
        this.transitionElement = null;
        this.init();
    }

    init() {
        this.createTransitionElement();
        this.bindNavigationEvents();
    }

    createTransitionElement() {
        this.transitionElement = document.createElement('div');
        this.transitionElement.className = 'page-transition';
        this.transitionElement.innerHTML = `
            <div class="islamic-loader">
                <div class="rub-el-hizb">
                    <div class="square square-1"></div>
                    <div class="square square-2"></div>
                </div>
                <div class="loader-text">الفرقان</div>
            </div>
        `;
        document.body.appendChild(this.transitionElement);
    }

    bindNavigationEvents() {
        // Handle anchor link clicks
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    this.startTransition(href);
                }
            });
        });
    }

    startTransition(targetHref) {
        this.transitionElement.classList.add('active');

        setTimeout(() => {
            // Navigate to target
            if (lenis) {
                const targetElement = document.querySelector(targetHref);
                if (targetElement) {
                    lenis.scrollTo(targetElement);
                }
            } else {
                window.location.hash = targetHref;
            }

            this.endTransition();
        }, 600);
    }

    endTransition() {
        setTimeout(() => {
            this.transitionElement.classList.add('fade-out');
            setTimeout(() => {
                this.transitionElement.classList.remove('active', 'fade-out');
            }, 600);
        }, 300);
    }
}

// Initialize page transitions
new PageTransitions();

// Magnetic Button Effects that Follow Cursor Movement
class MagneticButtons {
    constructor() {
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

// Ripple Effects on Button Clicks
class RippleEffects {
    constructor() {
        this.buttons = document.querySelectorAll('.btn, .store-btn, button');
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

// Subtle Parallax Scrolling Effects
class ParallaxEffects {
    constructor() {
        this.elements = document.querySelectorAll('.parallax-element');
        this.init();
    }

    init() {
        this.bindScrollEvents();
        this.updateParallax();
    }

    bindScrollEvents() {
        window.addEventListener('scroll', () => {
            this.updateParallax();
        });
    }

    updateParallax() {
        const scrolled = window.pageYOffset;

        this.elements.forEach(element => {
            const rate = element.getAttribute('data-parallax-rate') || 0.5;
            const yPos = -(scrolled * rate);
            element.style.setProperty('--parallax-y', `${yPos}px`);
        });

        // Update specific elements
        this.updateHeroParallax(scrolled);
        this.updateBackgroundParallax(scrolled);
    }

    updateHeroParallax(scrolled) {
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            const yPos = -(scrolled * 0.2);
            heroTitle.style.transform = `translateY(${yPos}px)`;
        }

        const heroImage = document.querySelector('.phone-mockup');
        if (heroImage) {
            const yPos = -(scrolled * 0.1);
            heroImage.style.transform = `translateY(${yPos}px) rotateY(-10deg) rotateX(5deg)`;
        }
    }

    updateBackgroundParallax(scrolled) {
        const hero = document.querySelector('.hero');
        if (hero) {
            const yPos = -(scrolled * 0.3);
            hero.style.backgroundPosition = `center ${yPos}px`;
        }
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
        window.addEventListener('scroll', () => {
            this.updateProgress();
        });

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

// Advanced Scroll-Triggered Animations
class ScrollAnimations {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.findAnimatableElements();
        this.bindScrollEvents();
        this.updateAnimations();
    }

    findAnimatableElements() {
        // Find elements with data attributes for scroll animations
        this.elements = document.querySelectorAll('[data-scroll-animate]');
    }

    bindScrollEvents() {
        window.addEventListener('scroll', () => {
            this.updateAnimations();
        });

        window.addEventListener('resize', () => {
            this.updateAnimations();
        });
    }

    updateAnimations() {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Update text color/size based on scroll
        this.updateTextAnimations(scrolled, documentHeight);

        // Update background gradients
        this.updateBackgroundGradients(scrolled, documentHeight);

        // Update element transformations
        this.updateElementTransformations(scrolled, windowHeight);
    }

    updateTextAnimations(scrolled, documentHeight) {
        const scrollProgress = scrolled / (documentHeight - window.innerHeight);

        // Hero title color shift
        const heroTitle = document.querySelector('.hero h1');
        if (heroTitle) {
            const hue = 120 + (scrollProgress * 60); // Green to yellow shift
            heroTitle.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue + 30}, 70%, 45%))`;
            heroTitle.style.backgroundClip = 'text';
            heroTitle.style.webkitBackgroundClip = 'text';
        }

        // Section titles size animation
        const sectionTitles = document.querySelectorAll('.section-header h2');
        sectionTitles.forEach((title, index) => {
            const titleRect = title.getBoundingClientRect();
            const titleCenter = titleRect.top + titleRect.height / 2;
            const distanceFromCenter = Math.abs(window.innerHeight / 2 - titleCenter);
            const scale = Math.max(0.8, 1 - distanceFromCenter / (window.innerHeight / 2) * 0.2);
            title.style.transform = `scale(${scale})`;
        });
    }

    updateBackgroundGradients(scrolled, documentHeight) {
        const scrollProgress = scrolled / (documentHeight - window.innerHeight);

        // Dynamic hero background
        const hero = document.querySelector('.hero');
        if (hero) {
            const hue1 = 120 + (scrollProgress * 30);
            const hue2 = 200 + (scrollProgress * 20);
            hero.style.background = `
                linear-gradient(135deg,
                    rgba(${Math.floor(hue1 * 0.5)}, ${Math.floor(hue1 * 0.3)}, ${Math.floor(hue1 * 0.2)}, 0.05) 0%,
                    rgba(${Math.floor(hue2 * 0.3)}, ${Math.floor(hue2 * 0.4)}, ${Math.floor(hue2 * 0.6)}, 0.03) 100%
                ),
                var(--pattern-islamic-stars)
            `;
        }

        // Dynamic body background
        const body = document.body;
        const opacity1 = 0.05 + (scrollProgress * 0.1);
        const opacity2 = 0.05 + (scrollProgress * 0.05);
        body.style.backgroundImage = `
            radial-gradient(circle at 10% ${20 + scrollProgress * 30}%, rgba(212, 175, 55, ${opacity1}) 0%, transparent 20%),
            radial-gradient(circle at 90% ${80 - scrollProgress * 20}%, rgba(10, 92, 62, ${opacity2}) 0%, transparent 20%)
        `;
    }

    updateElementTransformations(scrolled, windowHeight) {
        // Transform feature cards based on scroll position
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.top + cardRect.height / 2;
            const distanceFromCenter = cardCenter - windowHeight / 2;
            const rotation = distanceFromCenter * 0.02; // Subtle rotation
            const scale = 1 - Math.abs(distanceFromCenter) / windowHeight * 0.1;

            card.style.transform = `
                translateY(${Math.sin(scrolled * 0.001 + index) * 10}px)
                rotateX(${rotation}deg)
                scale(${Math.max(0.9, scale)})
            `;
        });

        // Transform phone mockup
        const phoneMockup = document.querySelector('.phone-mockup');
        if (phoneMockup) {
            const phoneRect = phoneMockup.getBoundingClientRect();
            const phoneCenter = phoneRect.top + phoneRect.height / 2;
            const distanceFromCenter = phoneCenter - windowHeight / 2;
            const tilt = distanceFromCenter * 0.005;

            phoneMockup.style.transform = `
                rotateY(${-10 + tilt}deg)
                rotateX(${5 + tilt * 0.5}deg)
                translateY(${scrolled * 0.1}px)
            `;
        }
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

// Breathing/Pulsing Background Elements
class BreathingElements {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.findBreathingElements();
        this.startBreathing();
    }

    findBreathingElements() {
        // Add breathing class to specific elements
        const heroBlobs = document.querySelectorAll('.blob');
        const featureIcons = document.querySelectorAll('.icon-box');

        this.elements = [...heroBlobs, ...featureIcons];
        this.elements.forEach(el => el.classList.add('breathing'));
    }

    startBreathing() {
        this.elements.forEach((element, index) => {
            element.style.animation = `breathe ${2 + index * 0.5}s ease-in-out infinite ${index * 0.2}s`;
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

// Advanced Hover States with Micro-interactions
class AdvancedHoverStates {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.findInteractiveElements();
        this.bindHoverEvents();
    }

    findInteractiveElements() {
        this.elements = document.querySelectorAll('.btn, .store-btn, .feature-card, .icon-box, .logo');
    }

    bindHoverEvents() {
        this.elements.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, element));
            element.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, element));
            element.addEventListener('mousemove', (e) => this.handleMouseMove(e, element));
        });
    }

    handleMouseEnter(e, element) {
        // Add micro-interaction classes
        element.classList.add('hover-active');

        // Create floating particles effect
        this.createFloatingParticles(e, element);

        // Add subtle sound effect (if supported)
        if ('vibrate' in navigator && isMobile) {
            navigator.vibrate(10);
        }
    }

    handleMouseLeave(e, element) {
        element.classList.remove('hover-active');

        // Add exit animation
        element.style.animation = 'hoverExit 0.3s ease-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }

    handleMouseMove(e, element) {
        if (element.classList.contains('hover-active')) {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Subtle 3D tilt effect
            const tiltX = y * 0.01;
            const tiltY = -x * 0.01;

            element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
        }
    }

    createFloatingParticles(e, element) {
        if (isMobile) return; // Skip on mobile for performance

        const rect = element.getBoundingClientRect();
        const particleCount = 3;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'hover-particle';
            particle.style.cssText = `
                position: absolute;
                top: ${e.clientY - rect.top}px;
                left: ${e.clientX - rect.left}px;
                width: 4px;
                height: 4px;
                background: var(--secondary);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                animation: particleFloat 0.8s ease-out forwards;
                animation-delay: ${i * 0.1}s;
            `;

            element.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 800);
        }
    }
}

// Initialize morphing and advanced effects
new MorphingElements();
new LiquidButtons();
new AdvancedHoverStates();
