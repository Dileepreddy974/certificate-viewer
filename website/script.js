// Demo certificate checker function
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
        // Simulated certificate check (in real implementation, this would call your Java backend)
        await simulateCertificateCheck(domain);
    } catch (error) {
        outputDiv.innerHTML = '<p style="color: #ef4444;">Error: ' + error.message + '</p>';
    }
}

// Simulate certificate checking (replace with actual API call to your Java backend)
function simulateCertificateCheck(domain) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const outputDiv = document.getElementById('demoOutput');
            
            // This is a demo simulation - in production, you'd call your Java backend
            const mockResult = `Certificate Information for: ${domain}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Certificate Details:
  Subject: CN=${domain}
  Issuer: CN=DigiCert TLS Hybrid ECC SHA384 2020 CA1
  Valid From: ${getFormattedDate(-180)}
  Valid To: ${getFormattedDate(185)}
  SHA-256 Fingerprint: 4A:5E:DB:4F:9E:2F:6E:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF

Subject Alternative Names (SANs):
  - ${domain}
  - www.${domain}

Validation Results:
  ✓ Certificate is valid
  ✓ Hostname matches
  ✓ Not expired
  ✓ Certificate chain verified

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Note: This is a demo simulation. Download the tool to check real certificates!`;

            outputDiv.innerHTML = '<pre>' + mockResult + '</pre>';
            resolve();
        }, 1500);
    });
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
