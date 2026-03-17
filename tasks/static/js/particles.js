/**
 * CampusTaskFlow Pro — Particle Canvas Engine v3
 *
 * Architecture:
 *  - Canvas is position:fixed (full viewport overlay)
 *  - Each particle has originX/Y (home) and x/y (current rendered position)
 *  - Idle: particles drift sinusoidally away from home
 *  - Mouse: repels particles; they ease back to home after the mouse leaves
 *  - Scroll: tracked so particles in lower virtual space scroll into view
 */
(function () {
  'use strict';

  // ─── Config ────────────────────────────────────────────────────────────────
  const MOUSE_RADIUS = 150;
  const FRICTION     = 0.85;
  const EASE         = 0.04;       // How fast particles spring back to origin
  const REPEL_FORCE  = 8;          // How hard the mouse pushes particles
  const IDLE_SPEED   = 0.8;        // Base floating speed multiplier
  // Darker, deeper shades for a stealthier feel on the pure black background
  const COLORS = ['#1E3A8A', '#581C87', '#9D174D', '#9A3412', '#164E63'];

  // ─── Particle ───────────────────────────────────────────────────────────────
  class Particle {
    constructor(w, h) {
      this.w = w;                // canvas width  (for wrapping)
      this.h = h;                // virtual height (for wrapping)

      // Fixed "home" position
      this.originX = Math.random() * w;
      this.originY = Math.random() * h;

      // Current rendered position — starts AT home
      this.x  = this.originX;
      this.y  = this.originY;

      // Velocity
      this.vx = 0;
      this.vy = 0;

      // Idle wave parameters (unique per particle for organic feel)
      this.angle     = Math.random() * Math.PI * 2;
      this.angleStep = (Math.random() * 0.02 + 0.008);    // rotation speed
      this.floatAmp  = Math.random() * 40 + 15;           // wave amplitude

      // Visuals
      this.size  = Math.random() * 1.0 + 0.5; // Decreased size: 0.5px - 1.5px per request
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    update(mouse, scrollY) {
      // 1. Advance the idle wave angle
      this.angle += this.angleStep;

      // 2. Compute the target position = home + sine‐wave offset
      const idleX = this.originX + Math.cos(this.angle) * this.floatAmp * IDLE_SPEED;
      const idleY = this.originY + Math.sin(this.angle * 0.7) * this.floatAmp * IDLE_SPEED;

      // 3. Mouse repulsion
      if (mouse.x !== null) {
        // Convert viewport mouse to virtual coords
        const mx = mouse.x;
        const my = mouse.y + scrollY;   // virtual Y

        const dx   = this.x - mx;
        const dy   = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          this.vx += (dx / dist) * force * REPEL_FORCE;
          this.vy += (dy / dist) * force * REPEL_FORCE;
        }
      }

      // 4. Ease current position toward idle target
      this.vx += (idleX - this.x) * EASE;
      this.vy += (idleY - this.y) * EASE;

      // 5. Apply friction & integrate
      this.vx *= FRICTION;
      this.vy *= FRICTION;
      this.x  += this.vx;
      this.y  += this.vy;

      // 6. Soft‐wrap at edges (so particles don't get stranded off‐screen)
      if (this.x < -50)   { this.x = this.w + 50;  this.originX += this.w; }
      if (this.x > this.w + 50) { this.x = -50;    this.originX -= this.w; }
    }

    /** Draw relative to current scroll offset */
    draw(ctx, scrollY) {
      const screenY = this.y - scrollY;

      // Skip if off‐screen (saves fillRect calls)
      if (screenY < -10 || screenY > 1200) return;

      ctx.beginPath();
      ctx.arc(this.x, screenY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // ─── Canvas Manager ─────────────────────────────────────────────────────────
  class ParticleCanvas {
    constructor() {
      this.canvas = document.getElementById('particleCanvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.mouse  = { x: null, y: null };
      this.scrollY = 0;

      this._resize();
      this._spawn();
      this._bind();
      this._loop();
    }

    _resize() {
      this.W = this.canvas.width  = window.innerWidth;
      this.H = this.canvas.height = window.innerHeight;

      // Virtual height: max of actual page height and 3× viewport
      this.virtualH = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight * 3
      );
    }

    _spawn() {
      this.particles = [];
      // Calculate dense stardust: base density ~1 per 250px², max 5000 particles
      const count = Math.min(5000, Math.max(1200, Math.floor((this.W * this.H) / 250)));
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.W, this.virtualH));
      }
    }

    _loop() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.W, this.H);

      for (const p of this.particles) {
        p.update(this.mouse, this.scrollY);
        p.draw(ctx, this.scrollY);
      }

      requestAnimationFrame(() => this._loop());
    }

    _bind() {
      window.addEventListener('resize', () => {
        this._resize();
        this._spawn();
      });

      // Use clientX/Y — correct for a fixed canvas
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      window.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });

      window.addEventListener('touchmove', (e) => {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });

      // Track scroll so particles slide in from below as user scrolls
      window.addEventListener('scroll', () => {
        this.scrollY = window.scrollY;
      }, { passive: true });
    }
  }

  document.addEventListener('DOMContentLoaded', () => new ParticleCanvas());
})();
