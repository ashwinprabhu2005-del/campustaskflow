class Particle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.originX = this.x;
        this.originY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.size = Math.random() * 2 + 1; // 1 to 3 px
        this.friction = 0.92;
        this.ease = 0.05;

        const colors = [
            'rgba(59, 130, 246, 0.8)',   // blue
            'rgba(168, 85, 247, 0.8)',   // purple
            'rgba(236, 72, 153, 0.8)',   // pink
            'rgba(249, 115, 22, 0.8)'    // orange
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Idle floating movement configuration
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.5 + 0.5; // Increased speed for faster animation
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        // Removed heavy shadowBlur to drastically improve Frame Rate (FPS)
        this.ctx.fill();
    }

    update(mouse) {
        // Idle floating
        this.originX += Math.cos(this.angle) * this.speed;
        this.originY += Math.sin(this.angle) * this.speed;
        
        // Bounce idle targets off edges safely
        if(this.originX < 0 || this.originX > this.canvas.width) this.speed *= -1;
        if(this.originY < 0 || this.originY > this.canvas.height) this.speed *= -1;

        // Mouse interaction physics
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let force = (mouse.radius - distance) / mouse.radius;
                
                // Increased repel force significantly for snappier interaction
                let directionX = forceDirectionX * force * -25; 
                let directionY = forceDirectionY * force * -25;

                this.vx += directionX;
                this.vy += directionY;
            }
        }

        // Apply friction and ease back to origin position
        this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease;
        this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease;
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) return; // Exit if not on the correct page

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        
        this.mouse = {
            x: null,
            y: null,
            radius: 150
        };

        this.init();
        this.addEventListeners();
        this.animate();
    }

    init() {
        this.resize();
        this.particles = [];
        
        // Calculate responsive particle count based on screen area (Roughly 1000 for standard 1080p desktop)
        const area = this.canvas.width * this.canvas.height;
        let numberOfParticles = Math.floor(area / 2000); 
        
        // Clamp bounds (800 - 1200 as requested)
        numberOfParticles = Math.max(800, Math.min(1200, numberOfParticles));

        for (let i = 0; i < numberOfParticles; i++) {
            this.particles.push(new Particle(this.canvas, this.ctx));
        }
    }

    resize() {
        // Use full document height instead of just the viewport height
        this.canvas.width = window.innerWidth;
        this.canvas.height = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight,
            document.body.clientHeight,
            document.documentElement.clientHeight
        );
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
            this.particles[i].update(this.mouse);
        }
        
        // Removed O(n^2) drawConnections loop to guarantee 60 FPS with 1000+ particles
        requestAnimationFrame(() => this.animate());
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.init());
        
        // Re-init if document height changes dynamically (e.g. after images load)
        const observer = new ResizeObserver(() => this.resize());
        observer.observe(document.body);

        window.addEventListener('mousemove', (event) => {
            this.mouse.x = event.pageX; // Use pageX to account for scroll
            this.mouse.y = event.pageY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = undefined;
            this.mouse.y = undefined;
        });
        
        window.addEventListener('touchmove', (event) => {
            if(event.touches.length > 0) {
                this.mouse.x = event.touches[0].clientX;
                this.mouse.y = event.touches[0].clientY;
            }
        });
    }
}

// Initialize system after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
