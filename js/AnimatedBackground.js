/**
 * AnimatedBackground - Interactive particle background animation
 * Creates a canvas-based particle system that responds to mouse movement
 */

import { CONFIG, PARTICLE_COLORS } from './constants.js';

export class AnimatedBackground {
    /**
     * Initialize the animated background
     */
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        if (!this.canvas) {
            console.warn('Background canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: CONFIG.MOUSE_RADIUS };
        this.animationId = null;
        
        this.init();
    }

    /**
     * Initialize the animation system
     */
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    /**
     * Resize canvas to match window dimensions
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Set up event listeners for interaction and resize
     */
    setupEventListeners() {
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseout', () => this.handleMouseOut());
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.resizeCanvas();
        this.particles = [];
        this.createParticles();
    }

    /**
     * Handle mouse movement
     */
    handleMouseMove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }

    /**
     * Handle mouse leaving the window
     */
    handleMouseOut() {
        this.mouse.x = null;
        this.mouse.y = null;
    }

    /**
     * Create initial particle array
     */
    createParticles() {
        const sizeRange = CONFIG.PARTICLE_SIZE_MAX - CONFIG.PARTICLE_SIZE_MIN;
        
        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const size = Math.random() * sizeRange + CONFIG.PARTICLE_SIZE_MIN;
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const speedX = (Math.random() - 0.5) * CONFIG.PARTICLE_SPEED_MAX;
            const speedY = (Math.random() - 0.5) * CONFIG.PARTICLE_SPEED_MAX;
            
            this.particles.push({
                x,
                y,
                size,
                speedX,
                speedY,
                baseX: x,
                baseY: y
            });
        }
    }

    /**
     * Calculate distance between two points
     */
    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Update particle position based on mouse interaction
     */
    updateParticle(particle) {
        // Mouse interaction
        if (this.mouse.x !== null && this.mouse.y !== null) {
            const distance = this.calculateDistance(
                this.mouse.x, 
                this.mouse.y, 
                particle.x, 
                particle.y
            );
            
            // Push particles away from mouse
            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const angle = Math.atan2(
                    this.mouse.y - particle.y, 
                    this.mouse.x - particle.x
                );
                particle.x -= Math.cos(angle) * force * CONFIG.PARTICLE_FORCE_MULTIPLIER;
                particle.y -= Math.sin(angle) * force * CONFIG.PARTICLE_FORCE_MULTIPLIER;
            }
        }
        
        // Gradually return to base position
        const dxBase = particle.baseX - particle.x;
        const dyBase = particle.baseY - particle.y;
        particle.x += dxBase * CONFIG.PARTICLE_RETURN_SPEED + particle.speedX;
        particle.y += dyBase * CONFIG.PARTICLE_RETURN_SPEED + particle.speedY;
        
        // Wrap around screen edges
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
    }

    /**
     * Draw a single particle
     */
    drawParticle(particle) {
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
        );
        gradient.addColorStop(0, PARTICLE_COLORS.PRIMARY);
        gradient.addColorStop(0.5, PARTICLE_COLORS.SECONDARY);
        gradient.addColorStop(1, PARTICLE_COLORS.TRANSPARENT);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    /**
     * Draw all particles and update their positions
     */
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const particle of this.particles) {
            this.updateParticle(particle);
            this.drawParticle(particle);
        }
        
        this.connectParticles();
    }

    /**
     * Draw connections between nearby particles
     */
    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const distance = this.calculateDistance(
                    this.particles[i].x,
                    this.particles[i].y,
                    this.particles[j].x,
                    this.particles[j].y
                );
                
                if (distance < CONFIG.CONNECTION_DISTANCE) {
                    const opacity = (CONFIG.CONNECTION_DISTANCE - distance) / 
                                  CONFIG.CONNECTION_DISTANCE * CONFIG.CONNECTION_OPACITY;
                    
                    this.ctx.strokeStyle = PARTICLE_COLORS.CONNECTION.replace('{{opacity}}', opacity);
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    /**
     * Main animation loop
     */
    animate() {
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Stop the animation and clean up
     */
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseout', this.handleMouseOut);
    }
}
