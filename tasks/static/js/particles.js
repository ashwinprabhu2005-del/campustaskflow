/**
 * Particle Canvas System for CampusTaskFlow Pro
 * Features: Mouse repel, vivid colors, 60fps, full-page coverage via scroll mapping
 * Strategy: Canvas is FIXED to viewport. Particles are distributed across
 * a virtual space 3x the page height. Scroll offset translates the view.
 **/

(function () {
    'use strict';

    const MOUSE_RADIUS = 140;
    const FRICTION    = 0.88;
    const EASE        = 0.06;
    const REPEL_FORCE = 30;

    // Vivid, dark-friendly colors (full opacity)
    const COLORS = [
        '#3B82F6',  // Bright Blue
        '#A855F7',  // Vivid Purple
        '#EC4899',  // Hot Pink
        '#F97316',  // Deep Orange
        '#06B6D4',  // Cyan
    ];

    class Particle {
        constructor(canvas) {
            this.canvas = canvas;
            this.reset(true);
        }

        reset(initial) {
            this.originX = Math.random() * this.canvas.width;
            // Distribute across full virtual height (3x viewport so scrolling reveals more)
            this.originY = Math.random() * this.canvas.virtualHeight;
            if (initial) {
                this.x = this.originX;
                this.y = this.originY;
            }
            this.vx    = 0;
            this.vy    = 0;
            this.size  = Math.random() * 2.5 + 1.5;  // 1.5–4px, bigger = more visible
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            // Idle float
            this.floatAngle = Math.random() * Math.PI * 2;
            this.floatSpeed = Math.random() * 0.6 + 0.3;
            this.floatRadius = Math.random() * 1.2 + 0.5;
        }

        draw(ctx, scrollY) {
            // Convert from virtual coords to screen coords using current scroll
            const screenY = this.y - scrollY;

            // Only draw particles visible on screen (80px buffer for smooth edge entry)
            if (screenY < -80 || screenY > this.canvas.height + 80) return;

            ctx.beginPath();
            ctx.arc(this.originX, screenY, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.92;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        update(mouse, scrollY) {
            // Gentle idle float
            this.floatAngle += 0.008;
            this.originX += Math.cos(this.floatAngle) * this.floatSpeed * this.floatRadius * 0.1;
            this.originY += Math.sin(this.floatAngle) * this.floatSpeed * this.floatRadius * 0.1;

            // Wrap particles at canvas edges
            if (this.originX < 0)  this.originX = this.canvas.width;
            if (this.originX > this.canvas.width) this.originX = 0;
            if (this.originY < 0)  this.originY = this.canvas.virtualHeight;
            if (this.originY > this.canvas.virtualHeight) this.originY = 0;

            // Mouse interaction — convert mouse viewport coords to virtual
            if (mouse.x !== null) {
                const mouseVirtualY = mouse.y + scrollY;
                const dx = mouse.x - this.originX;
                const dy = mouseVirtualY - this.originY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_RADIUS && dist > 0) {
                    const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                    this.vx -= (dx / dist) * force * REPEL_FORCE;
                    this.vy -= (dy / dist) * force * REPEL_FORCE;
                }
            }

            // Apply physics
            this.vx *= FRICTION;
            this.vy *= FRICTION;

            // Ease origin back (not x/y — origin IS the render position)
            this.originX += this.vx;
            this.originY += this.vy;
        }
    }

    class ParticleCanvas {
        constructor() {
            this.canvas = document.getElementById('particleCanvas');
            if (!this.canvas) return;

            this.ctx = this.canvas.getContext('2d');
            this.particles = [];
            this.mouse  = { x: null, y: null };
            this.scrollY = 0;
            this.raf = null;

            this.setupCanvas();
            this.buildParticles();
            this.bindEvents();
            this.loop();
        }

        setupCanvas() {
            this.canvas.width  = window.innerWidth;
            this.canvas.height = window.innerHeight;
            // Virtual height so particles can populate the scrollable area
            this.canvas.virtualHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                window.innerHeight * 3
            );
        }

        buildParticles() {
            this.particles = [];
            // Scale count to screen area; cap for performance
            const area   = this.canvas.width * this.canvas.height;
            const count  = Math.min(2500, Math.max(800, Math.floor(area / 600)));
            for (let i = 0; i < count; i++) {
                this.particles.push(new Particle(this.canvas));
            }
        }

        loop() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (const p of this.particles) {
                p.update(this.mouse, this.scrollY);
                p.draw(ctx, this.scrollY);
            }

            this.raf = requestAnimationFrame(() => this.loop());
        }

        bindEvents() {
            window.addEventListener('resize', () => {
                this.setupCanvas();
                this.buildParticles();
            });

            // clientX/Y — viewport coordinates (correct for fixed canvas)
            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });

            // Touch support
            window.addEventListener('touchmove', (e) => {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }, { passive: true });

            window.addEventListener('touchend', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });

            // Track scroll so particles in lower sections become visible
            window.addEventListener('scroll', () => {
                this.scrollY = window.scrollY;
            }, { passive: true });
        }
    }

    document.addEventListener('DOMContentLoaded', () => new ParticleCanvas());
})();
