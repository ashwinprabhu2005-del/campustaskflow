document.addEventListener('DOMContentLoaded', () => {
    console.log('CampusTaskFlow loaded successfully.');

    // Countdown Timer Logic
    const timerElement = document.getElementById('countdown-timer');
    if (timerElement) {
        const dueDateString = timerElement.getAttribute('data-due');
        const dueDate = new Date(dueDateString);
        // Due date is usually at midnight, so let's set it to end of day for a fairer countdown
        dueDate.setHours(23, 59, 59, 999);

        function updateTimer() {
            const now = new Date();
            const diff = dueDate - now;

            if (diff <= 0) {
                timerElement.textContent = "Task overdue";
                timerElement.style.color = "red";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            if (days > 0) {
                timerElement.textContent = `${days} days, ${hours} hours remaining`;
            } else if (hours > 0) {
                timerElement.textContent = `${hours} hours, ${minutes} minutes remaining`;
            } else {
                timerElement.textContent = `${minutes} minutes remaining`;
            }
        }

        updateTimer();
        setInterval(updateTimer, 60000); // Update every minute
    }

    // Live Task List Progress Bars
    const progressBars = document.querySelectorAll('.time-progress-bar');
    if (progressBars.length > 0) {
        function updateProgressBars() {
            const now = new Date();
            
            progressBars.forEach(bar => {
                const createdDate = new Date(bar.getAttribute('data-created'));
                const dueDate = new Date(bar.getAttribute('data-due'));
                dueDate.setHours(23, 59, 59, 999);
                
                const totalDuration = dueDate.getTime() - createdDate.getTime();
                const elapsedDuration = now.getTime() - createdDate.getTime();
                
                let percentage = 100 - ((elapsedDuration / totalDuration) * 100);
                
                // Clamp between 0 and 100
                percentage = Math.max(0, Math.min(100, percentage));
                
                bar.style.width = percentage + '%';
                
                // Color scaling based on urgency
                if (percentage < 20) {
                    bar.classList.remove('bg-electric', 'bg-warning');
                    bar.classList.add('bg-danger');
                } else if (percentage < 50) {
                    bar.classList.remove('bg-electric', 'bg-danger');
                    bar.classList.add('bg-warning');
                }
            });
        }
        
        updateProgressBars();
        // Update bars every 5 seconds for a "live" feel without thrashing CPU
        setInterval(updateProgressBars, 5000);
    }

    // Scroll Reveal Animation Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-scroll').forEach((elem) => {
        observer.observe(elem);
    });

    // Custom Glowing Cursor Logic
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', e => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Add expansion effect when hovering clickable elements
        const clickables = document.querySelectorAll('a, button, input, select, textarea, .glass-card');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });

        // Hide custom cursor completely off-screen
        document.addEventListener('mouseleave', () => cursor.style.display = 'none');
        document.addEventListener('mouseenter', () => cursor.style.display = 'block');
    }
});
