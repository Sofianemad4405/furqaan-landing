// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    smooth: true,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Initialize AOS
AOS.init({
    once: true,
    offset: 50,
    duration: 800,
    easing: 'ease-out-cubic',
});

// Initialize Vanilla Tilt
VanillaTilt.init(document.querySelectorAll(".feature-card"), {
    max: 15,
    speed: 400,
    glare: true,
    "max-glare": 0.1,
    scale: 1.02
});

VanillaTilt.init(document.querySelector(".phone-mockup"), {
    max: 5,
    speed: 1000,
    glare: true,
    "max-glare": 0.2,
    scale: 1.0
});

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
        ctx.scale(dpr, dpr);
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
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.visibility = 'hidden';
        }, 500);
    }, 1500);
});

// Mobile Menu
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileToggle.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

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
backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(0);
});

// Connect Lenis to anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) lenis.scrollTo(targetElement);
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
        } else {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });
}
