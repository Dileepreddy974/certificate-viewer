// Certificate checker function with backend API and auto-save
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
            
            // Auto-save the certificate result
            saveCertificateResult(domain, data.output);
        } else {
            outputDiv.innerHTML = '<p style="color: #ef4444;">No certificate information returned</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        outputDiv.innerHTML = '<p style="color: #ef4444;">Error: ' + escapeHtml(error.message) + '</p><p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">Make sure the backend server is running on port 3000</p>';
    }
}

// Auto-save certificate result to localStorage
function saveCertificateResult(domain, output) {
    try {
        // Get existing history from localStorage
        let history = JSON.parse(localStorage.getItem('certificateHistory')) || [];
        
        // Create new entry
        const entry = {
            id: Date.now().toString(),
            domain: domain,
            output: output,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleString()
        };
        
        // Add to beginning of array (most recent first)
        history.unshift(entry);
        
        // Keep only last 10 entries
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        // Save back to localStorage
        localStorage.setItem('certificateHistory', JSON.stringify(history));
        
        console.log(`✅ Certificate result for ${domain} saved automatically`);
        
        // Show a brief save notification
        showSaveNotification(domain);
        
        // Refresh history display
        refreshHistory();
    } catch (error) {
        console.error('Error saving certificate result:', error);
    }
}

// Show save notification
function showSaveNotification(message, color = '#10b981') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${color};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 0.875rem;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `✓ ${escapeHtml(message)}`;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// View saved certificate history
function viewHistory() {
    const history = JSON.parse(localStorage.getItem('certificateHistory')) || [];
    
    if (history.length === 0) {
        alert('No saved certificate checks yet');
        return;
    }
    
    console.log('Certificate Check History:', history);
    return history;
}

// Clear certificate history
function clearHistory() {
    if (confirm('Are you sure you want to clear all saved certificate checks?')) {
        localStorage.removeItem('certificateHistory');
        console.log('Certificate history cleared');
        refreshHistory();
        showSaveNotification('History cleared', '#ef4444');
    }
}

// Refresh and display history
function refreshHistory() {
    const historyList = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('certificateHistory')) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="history-empty">No certificate checks yet. Try checking a domain above!</p>';
        return;
    }
    
    historyList.innerHTML = history.map((entry, index) => `
        <div class="history-item" id="history-${entry.id}">
            <div class="history-item-header">
                <span class="history-domain">${escapeHtml(entry.domain)}</span>
                <span class="history-date">${escapeHtml(entry.date)}</span>
            </div>
            <div class="history-preview">
                ${escapeHtml(entry.output.substring(0, 100))}...
            </div>
            <div class="history-item-actions">
                <button onclick="toggleHistoryDetails('${entry.id}')" class="btn-view">
                    👁️ View Details
                </button>
                <button onclick="deleteHistoryItem('${entry.id}')" class="btn-delete">
                    🗑️ Delete
                </button>
            </div>
            <div id="details-${entry.id}" class="history-expanded" style="display: none;">
                ${escapeHtml(entry.output)}
            </div>
        </div>
    `).join('');
}

// Toggle history item details
function toggleHistoryDetails(id) {
    const detailsDiv = document.getElementById(`details-${id}`);
    const button = event.target;
    
    if (detailsDiv.style.display === 'none') {
        detailsDiv.style.display = 'block';
        button.textContent = '👁️ Hide Details';
    } else {
        detailsDiv.style.display = 'none';
        button.textContent = '👁️ View Details';
    }
}

// Delete individual history item
function deleteHistoryItem(id) {
    if (confirm('Delete this certificate check?')) {
        let history = JSON.parse(localStorage.getItem('certificateHistory')) || [];
        history = history.filter(entry => entry.id !== id);
        localStorage.setItem('certificateHistory', JSON.stringify(history));
        refreshHistory();
        showSaveNotification('Entry deleted', '#ef4444');
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
    
    // Load history on page load
    refreshHistory();

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
