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
});
