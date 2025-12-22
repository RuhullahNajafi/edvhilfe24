document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Functionality
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Hero Canvas Particle Effect
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray;
        let isMobile = false;

        // Check if we are in mobile view
        function checkMobile() {
            if (hamburger) {
                isMobile = window.getComputedStyle(hamburger).display !== 'none';
            } else {
                isMobile = window.innerWidth < 768;
            }
        }

        // Set canvas size
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        checkMobile();

        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            checkMobile();
            init();
        });

        // Mouse position
        const mouse = {
            x: null,
            y: null,
            radius: 150
        }

        // Track mouse movement relative to canvas
        document.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });
        
        // Reset mouse when leaving window/canvas area
        document.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        // Particle Class
        class Particle {
            constructor(x, y, directionX, directionY, size, color) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
            }

            // Draw particle
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            // Update particle position
            update() {
                // Check if particle is still within canvas
                if (this.x > canvas.width || this.x < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.y > canvas.height || this.y < 0) {
                    this.directionY = -this.directionY;
                }

                // Check collision detection - mouse position / particle position
                if (!isMobile) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance < mouse.radius + this.size) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const maxDistance = mouse.radius;
                        const force = (maxDistance - distance) / maxDistance;
                        const directionX = forceDirectionX * force * 3; // Speed factor
                        const directionY = forceDirectionY * force * 3;

                        if (this.x - directionX > 0 && this.x - directionX < canvas.width) {
                            this.x -= directionX;
                        }
                        if (this.y - directionY > 0 && this.y - directionY < canvas.height) {
                            this.y -= directionY;
                        }
                    }
                }

                // Move particle
                this.x += this.directionX;
                this.y += this.directionY;

                // Draw particle
                this.draw();
            }
        }

        // Create particle array
        function init() {
            particlesArray = [];isMobile
            // Increase particle density on smaller screens
            let densityDivisor = (canvas.width < 768) ? 4000 : 9000;
            let numberOfParticles = (canvas.height * canvas.width) / densityDivisor;
            
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2) + 1;
                let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                let color = '#cacacaff';

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        }

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }

        // Check if particles are close enough to draw line
        function connect() {
            let opacityValue = 1;
            
            // Adjust connection distance based on screen size
            // On mobile, we want connections to span a larger relative portion of the screen
            let connectionDivisor = isMobile ? 4.5 : 7;
            const maxDistance = (canvas.width/connectionDivisor) * (canvas.height/connectionDivisor);

            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                    + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                    
                    if (distance < maxDistance) {
                        opacityValue = 1 - (distance / maxDistance);
                        ctx.globalAlpha = opacityValue;
                        ctx.strokeStyle = particlesArray[a].color;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                        ctx.globalAlpha = 1; // Reset alpha
                    }
                }
                
                // Connect to mouse
                if (!isMobile && mouse.x !== null && mouse.y !== null) {
                    let dx = particlesArray[a].x - mouse.x;
                    let dy = particlesArray[a].y - mouse.y;
                    let distance = (dx * dx) + (dy * dy);
                    
                    if (distance < maxDistance) {
                        opacityValue = 1 - (distance / maxDistance);
                        ctx.globalAlpha = opacityValue;
                        ctx.strokeStyle = particlesArray[a].color;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1; // Reset alpha
                    }
                }
            }
        }

        init();
        animate();
    }

    // Cookie Banner Functionality
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const declineBtn = document.getElementById('decline-cookies');

    // Check if user has already made a choice
    if (!localStorage.getItem('cookieConsent')) {
        // Show banner after a short delay
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('show');
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            cookieBanner.classList.remove('show');
        });
    }
});
