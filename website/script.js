// Certificate checker function with backend API
async function checkCertificate() {
    const domainInput = document.getElementById('domainInput');
    const outputDiv = document.getElementById('demoOutput');
    const domain = domainInput.value.trim();

    if (!domain) {
        outputDiv.innerHTML = '<p style="color: #ef4444;">Please enter a domain name</p>';
        return;
    }

    // Show loading state
    outputDiv.innerHTML = '<div style="display: flex; align-items: center; gap: 1rem; color: #64748b;"><div class="loading"></div><p>Checking certificate for ' + domain + '...</p></div>';

    try {
        // Call the backend API
        const response = await fetch('http://localhost:3000/api/check-certificate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ domain: domain })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to retrieve certificate information');
        }

        if (data.success && data.output) {
            outputDiv.innerHTML = '<pre>' + escapeHtml(data.output) + '</pre>';
        } else {
            outputDiv.innerHTML = '<p style="color: #ef4444;">No certificate information returned</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        outputDiv.innerHTML = '<p style="color: #ef4444;">Error: ' + escapeHtml(error.message) + '</p><p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">Make sure the backend server is running on port 3000</p>';
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to get formatted dates
function getFormattedDate(daysOffset) {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Allow Enter key to trigger certificate check
document.addEventListener('DOMContentLoaded', () => {
    const domainInput = document.getElementById('domainInput');
    if (domainInput) {
        domainInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkCertificate();
            }
        });
    }

    // Add smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add navbar background on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
});

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and doc cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .doc-card, .download-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
