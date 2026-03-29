// World Clock JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const timeZones = [
        { id: 'mumbai', name: 'Mumbai', offset: 5.5 },
        { id: 'newyork', name: 'New York', offset: -5 },
        { id: 'london', name: 'London', offset: 0 },
        { id: 'tokyo', name: 'Tokyo', offset: 9 },
        { id: 'sydney', name: 'Sydney', offset: 10 },
        { id: 'paris', name: 'Paris', offset: 1 },
        { id: 'berlin', name: 'Berlin', offset: 1 },
        { id: 'moscow', name: 'Moscow', offset: 3 },
        { id: 'beijing', name: 'Beijing', offset: 8 },
        { id: 'dubai', name: 'Dubai', offset: 4 },
        { id: 'local', name: 'Local Time', offset: 0 },
    ];

    function updateTimes() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const date = now.toLocaleDateString(undefined, options);

        timeZones.forEach(zone => {
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const localTime = new Date(utc + (zone.offset * 3600000));
            const timeString = localTime.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const element = document.getElementById(`${zone.id}-time`);
            if (element) {
                element.textContent = timeString;
            }

            const dateElement = document.getElementById(`${zone.id}-date`);
            if (dateElement) {
                dateElement.textContent = localTime.toLocaleDateString(undefined, options);
            }
        });
    }

    // Update times every second
    setInterval(updateTimes, 1000);
    updateTimes(); // Initial call

    // Add some interactive effects
    const timeCards = document.querySelectorAll('.time-card');
    timeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});