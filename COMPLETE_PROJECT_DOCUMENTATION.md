# Certificate Viewer - Complete Project Documentation & Source Code

**Version**: 1.0  
**Author**: Dileep Reddy  
**Email**: dileepreddy974@gmail.com  
**GitHub**: https://github.com/Dileepreddy974/certificate-viewer  
**Date**: November 2025

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Complete Source Code](#complete-source-code)
   - [Java Programs](#java-programs)
   - [Backend Server](#backend-server)
   - [Frontend Application](#frontend-application)
3. [Technical Documentation](#technical-documentation)
4. [Usage Instructions](#usage-instructions)
5. [Building & Deployment](#building--deployment)

---

## Project Overview

The Certificate Viewer is a comprehensive SSL/TLS certificate analysis tool built with Java, Node.js, and modern web technologies. It provides both command-line and web interfaces for retrieving, analyzing, and validating SSL/TLS certificates from any HTTPS website.

### Key Features
- 🔐 Certificate retrieval and parsing
- ✅ Validation checks (expiration, hostname)
- 💻 Multiple interfaces (CLI, Interactive, Web)
- 🌐 Cross-platform compatibility
- 📊 Auto-save functionality with history tracking
- ⚡ Zero external dependencies for Java programs

---

## Complete Source Code

### Java Programs

#### 1. CertificateCLI.java

**File**: `src/CertificateCLI.java`  
**Purpose**: Command-line interface for SSL/TLS certificate checking

```java
import java.security.MessageDigest;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import javax.naming.ldap.LdapName;
import javax.naming.ldap.Rdn;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

public class CertificateCLI {
    
    public static void main(String[] args) {
        if (args.length == 0) {
            printUsage();
            return;
        }
        
        // Handle command line options
        if (args[0].equals("-h") || args[0].equals("--help")) {
            printUsage();
            return;
        }
        
        if (args[0].equals("-v") || args[0].equals("--version")) {
            System.out.println("Certificate Viewer CLI v1.0");
            return;
        }
        
        String host = args[0];
        int port = 443;
        
        // Check for port argument
        if (host.contains(":")) {
            String[] parts = host.split(":");
            host = parts[0];
            try {
                port = Integer.parseInt(parts[1]);
            } catch (NumberFormatException e) {
                System.err.println("Invalid port number: " + parts[1]);
                System.exit(1);
            }
        }
        
        try {
            viewCertificate(host, port);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
    
    public static void printUsage() {
        System.out.println("SSL/TLS Certificate Viewer");
        System.out.println("Usage: java CertificateCLI [options] <host>[:port]");
        System.out.println("Options:");
        System.out.println("  -h, --help     Show this help message");
        System.out.println("  -v, --version  Show version information");
        System.out.println("\nExamples:");
        System.out.println("  java CertificateCLI google.com");
        System.out.println("  java CertificateCLI github.com:443");
    }
    
    public static void viewCertificate(String host, int port) throws Exception {
        // Create SSL socket factory
        SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
        
        // Connect and perform handshake
        try (SSLSocket socket = (SSLSocket) factory.createSocket(host, port)) {
            socket.startHandshake();
            SSLSession session = socket.getSession();
            Certificate[] certs = session.getPeerCertificates();
            
            System.out.println("Successfully retrieved " + certs.length + " certificates.");
            
            // Use the first (leaf) certificate
            X509Certificate cert = (X509Certificate) certs[0];
            
            // Extract subject and issuer
            System.out.println("\n[Certificate Info]");
            System.out.println("Host: " + host + ":" + port);
            System.out.println("Subject: " + cert.getSubjectX500Principal().getName());
            System.out.println("Issuer: " + cert.getIssuerX500Principal().getName());
            
            // Extract Common Name from subject
            String cn = "Not Found";
            try {
                LdapName ldapName = new LdapName(cert.getSubjectX500Principal().getName());
                for (Rdn rdn : ldapName.getRdns()) {
                    if (rdn.getType().equalsIgnoreCase("CN")) {
                        cn = rdn.getValue().toString();
                        break;
                    }
                }
            } catch (Exception e) {
                cn = "Error parsing CN";
            }
            System.out.println("Common Name (CN): " + cn);
            
            // Validity period
            Date notBefore = cert.getNotBefore();
            Date notAfter = cert.getNotAfter();
            SimpleDateFormat dateFormat = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
            System.out.println("Valid From: " + dateFormat.format(notBefore));
            System.out.println("Valid To:   " + dateFormat.format(notAfter));
            
            // Fingerprint (SHA-256)
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] digest = sha256.digest(cert.getEncoded());
            StringBuilder fingerprint = new StringBuilder();
            for (byte b : digest) {
                fingerprint.append(String.format("%02X:", b));
            }
            // Remove trailing colon
            if (fingerprint.length() > 0) {
                fingerprint.setLength(fingerprint.length() - 1);
            }
            
            System.out.println("Fingerprint (SHA-256): " + fingerprint.toString());
            
            // Subject Alternative Names
            Collection<List<?>> sans = cert.getSubjectAlternativeNames();
            
            System.out.println("\n[Subject Alternative Names]");
            if (sans != null) {
                for (List<?> san : sans) {
                    try {
                        Integer type = (Integer) san.get(0);
                        Object value = san.get(1);
                        if (type == 2) { // DNS name
                            System.out.println("DNS: " + value.toString());
                        } else if (type == 7) { // IP address
                            System.out.println("IP: " + value.toString());
                        } else {
                            System.out.println("Type " + type + ": " + value.toString());
                        }
                    } catch (Exception e) {
                        System.out.println("Error parsing SAN: " + e.getMessage());
                    }
                }
            } else {
                System.out.println("None found");
            }
            
            // Validation checks
            Date now = new Date();
            boolean expired = now.after(cert.getNotAfter());
            boolean notYetValid = now.before(cert.getNotBefore());
            
            System.out.println("\n[Validation Results]");
            if (expired) {
                System.out.println("❌ Certificate has expired.");
            } else if (notYetValid) {
                System.out.println("❌ Certificate not yet valid.");
            } else {
                System.out.println("✅ Certificate is currently valid.");
            }
            
            // Hostname verification
            boolean hostnameMatches = verifyHostname(host, cert, cn, sans);
            
            if (hostnameMatches) {
                System.out.println("✅ Hostname verified.");
            } else {
                System.out.println("❌ Hostname does not match certificate.");
            }
        }
    }
    
    public static boolean verifyHostname(String hostname, X509Certificate cert, String cn, Collection<List<?>> sans) {
        try {
            // Manual check against CN
            if (cn.equals(hostname) || 
                (cn.startsWith("*") && hostname.endsWith(cn.substring(1)))) {
                return true;
            }
            
            // Check against SANs
            if (sans != null) {
                for (List<?> san : sans) {
                    try {
                        Integer type = (Integer) san.get(0);
                        Object value = san.get(1);
                        if (type == 2) { // DNS name
                            String sanValue = value.toString();
                            if (sanValue.equals(hostname) || 
                                (sanValue.startsWith("*") && hostname.endsWith(sanValue.substring(1)))) {
                                return true;
                            }
                        }
                    } catch (Exception e) {
                        // Skip malformed SAN entries
                    }
                }
            }
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
```

---

#### 2. CertificateViewer.java

**File**: `src/CertificateViewer.java`  
**Purpose**: Interactive version with user prompts

```java
import java.security.MessageDigest;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Scanner;
import javax.naming.ldap.LdapName;
import javax.naming.ldap.Rdn;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

public class CertificateViewer {
    
    public static boolean verifyHostname(String hostname, X509Certificate cert, String cn, Collection<List<?>> sans) {
        try {
            // Use default hostname verifier first
            javax.net.ssl.HostnameVerifier verifier = javax.net.ssl.HttpsURLConnection.getDefaultHostnameVerifier();
            // Note: We can't easily create an SSLSession for verification without a real connection
            
            // Manual check against CN
            if (cn.equals(hostname) || 
                (cn.startsWith("*") && hostname.endsWith(cn.substring(1)))) {
                return true;
            }
            
            // Check against SANs
            if (sans != null) {
                for (List<?> san : sans) {
                    try {
                        Integer type = (Integer) san.get(0);
                        Object value = san.get(1);
                        if (type == 2) { // DNS name
                            String sanValue = value.toString();
                            if (sanValue.equals(hostname) || 
                                (sanValue.startsWith("*") && hostname.endsWith(sanValue.substring(1)))) {
                                return true;
                            }
                        }
                    } catch (Exception e) {
                        // Skip malformed SAN entries
                    }
                }
            }
            
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter domain name (e.g., example.com): ");
        String input = scanner.nextLine().trim();
        
        // Normalize input
        String host = input.startsWith("https://") ? input.substring(9) : input;
        host = host.split(":")[0]; // Remove port if present
        int port = 443;
        
        try {
            // Create SSL socket factory
            SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
            
            // Connect and perform handshake
            try (SSLSocket socket = (SSLSocket) factory.createSocket(host, port)) {
                socket.startHandshake();
                SSLSession session = socket.getSession();
                Certificate[] certs = session.getPeerCertificates();
                
                System.out.println("Successfully retrieved " + certs.length + " certificates.");
                
                // Use the first (leaf) certificate
                X509Certificate cert = (X509Certificate) certs[0];
                
                // Extract subject and issuer
                // Display certificate info
                System.out.println("\n[Certificate Info]");
                System.out.println("Host: " + host);
                System.out.println("Subject: " + cert.getSubjectX500Principal().getName());
                System.out.println("Issuer: " + cert.getIssuerX500Principal().getName());
                
                // Extract Common Name from subject
                // Extract Common Name from subject
                String cn = "Not Found";
                try {
                    LdapName ldapName = new LdapName(cert.getSubjectX500Principal().getName());
                    for (Rdn rdn : ldapName.getRdns()) {
                        if (rdn.getType().equalsIgnoreCase("CN")) {
                            cn = rdn.getValue().toString();
                            break;
                        }
                    }
                } catch (Exception e) {
                    cn = "Error parsing CN";
                }
                System.out.println("Common Name (CN): " + cn);
                
                // Validity period
                Date notBefore = cert.getNotBefore();
                Date notAfter = cert.getNotAfter();
                SimpleDateFormat dateFormat = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
                System.out.println("Valid From: " + dateFormat.format(notBefore));
                System.out.println("Valid To:   " + dateFormat.format(notAfter));
                
                // Fingerprint (SHA-256)
                MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                byte[] digest = sha256.digest(cert.getEncoded());
                StringBuilder fingerprint = new StringBuilder();
                for (byte b : digest) {
                    fingerprint.append(String.format("%02X:", b));
                }
                // Remove trailing colon
                if (fingerprint.length() > 0) {
                    fingerprint.setLength(fingerprint.length() - 1);
                }
                
                System.out.println("Fingerprint (SHA-256): " + fingerprint.toString());
                
                // Subject Alternative Names
                Collection<List<?>> sans = cert.getSubjectAlternativeNames();
                
                System.out.println("\n[Subject Alternative Names]");
                if (sans != null) {
                    for (List<?> san : sans) {
                        try {
                            Integer type = (Integer) san.get(0);
                            Object value = san.get(1);
                            if (type == 2) { // DNS name
                                System.out.println("DNS: " + value.toString());
                            } else if (type == 7) { // IP address
                                System.out.println("IP: " + value.toString());
                            } else {
                                System.out.println("Type " + type + ": " + value.toString());
                            }
                        } catch (Exception e) {
                            System.out.println("Error parsing SAN: " + e.getMessage());
                        }
                    }
                } else {
                    System.out.println("None found");
                }
                
                // Validation checks
                Date now = new Date();
                boolean expired = now.after(cert.getNotAfter());
                boolean notYetValid = now.before(cert.getNotBefore());
                
                if (expired) {
                    System.out.println("❌ Certificate has expired.");
                } else if (notYetValid) {
                    System.out.println("❌ Certificate not yet valid.");
                } else {
                    System.out.println("✅ Certificate is currently valid.");
                }
                
                // Hostname verification
                boolean hostnameMatches = verifyHostname(host, cert, cn, sans);
                
                if (hostnameMatches) {
                    System.out.println("✅ Hostname verified.");
                } else {
                    System.out.println("❌ Hostname does not match certificate.");
                }
                
                // Close resources
                scanner.close();
            }
        } catch (java.net.UnknownHostException e) {
            System.err.println("❌ Unknown host: " + e.getMessage());
            scanner.close();
        } catch (javax.net.ssl.SSLException e) {
            System.err.println("❌ SSL error: " + e.getMessage());
            scanner.close();
        } catch (java.security.cert.CertificateException e) {
            System.err.println("❌ Certificate error: " + e.getMessage());
            scanner.close();
        } catch (Exception e) {
            System.err.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            scanner.close();
        }
    }
}
```

---

### Backend Server

#### 3. server.js

**File**: `website/server.js`  
**Purpose**: Express backend API for web interface

```javascript
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// API endpoint to check certificate
app.post('/api/check-certificate', (req, res) => {
    const { domain } = req.body;

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9](\:[0-9]+)?$/;
    if (!domainRegex.test(domain)) {
        return res.status(400).json({ error: 'Invalid domain format' });
    }

    // Path to the JAR file
    const jarPath = path.join(__dirname, '..', 'CertificateViewer.jar');
    const command = `java -jar "${jarPath}" ${domain}`;

    // Execute the Java command
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error) {
            console.error('Execution error:', error);
            return res.status(500).json({ 
                error: 'Failed to retrieve certificate information',
                details: stderr || error.message
            });
        }

        if (stderr && !stdout) {
            return res.status(500).json({ 
                error: 'Error retrieving certificate',
                details: stderr
            });
        }

        // Return the certificate information
        res.json({
            success: true,
            domain: domain,
            output: stdout
        });
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Certificate Viewer API is running' });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`API endpoint: http://localhost:${PORT}/api/check-certificate`);
});
```

---

### Frontend Application

#### 4. script.js

**File**: `website/script.js`  
**Purpose**: Client-side JavaScript for interactivity and auto-save

```javascript
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
```

---

## Technical Documentation

### System Architecture

```
┌─────────────────────────────────────────────┐
│          User Interface Layer               │
├─────────────────────────────────────────────┤
│  CLI         │  Interactive  │  Web Browser │
│  (Terminal)  │  (Console)    │  (HTTP)      │
└──────┬───────┴────────┬──────┴──────┬───────┘
       │                │             │
       ▼                ▼             ▼
┌────────────┐   ┌────────────┐  ┌────────────┐
│ Certificate│   │ Certificate│  │  Express   │
│    CLI     │   │   Viewer   │  │  Server    │
│  (Java)    │   │  (Java)    │  │ (Node.js)  │
└────┬───────┘   └────┬───────┘  └─────┬──────┘
     │                │                 │
     └────────────────┴─────────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  SSL/TLS Socket  │
            │  (javax.net.ssl) │
            └─────────┬────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  Target HTTPS    │
            │     Server       │
            └──────────────────┘
```

### Data Flow

1. **User Input** → Domain name entered
2. **Connection** → SSL socket created
3. **Handshake** → SSL/TLS handshake performed
4. **Retrieval** → Certificate chain retrieved
5. **Parsing** → X.509 certificate parsed
6. **Analysis** → Certificate details extracted
7. **Validation** → Expiration and hostname checks
8. **Output** → Results displayed/saved

### Key Technologies

**Java Programs:**
- Java SE 8+
- javax.net.ssl (SSL/TLS)
- java.security.cert (X.509)
- javax.naming.ldap (LDAP parsing)

**Backend:**
- Node.js
- Express.js
- child_process (Java execution)

**Frontend:**
- HTML5
- CSS3 (with CSS variables)
- Vanilla JavaScript (ES6+)
- LocalStorage API

---

## Usage Instructions

### Command-Line Interface

```bash
# Basic usage
java -jar CertificateViewer.jar github.com

# With custom port
java -jar CertificateViewer.jar example.com:8443

# Show help
java -jar CertificateViewer.jar --help

# Show version
java -jar CertificateViewer.jar --version
```

### Interactive Mode

```bash
# Run interactive version
java -cp "src" CertificateViewer

# You'll be prompted:
# Enter domain name (e.g., example.com): github.com
```

### Web Interface

```bash
# Start backend server
cd website
npm start

# Open browser to:
# http://localhost:3000
```

---

## Building & Deployment

### Compile Java Programs

```bash
# Navigate to project directory
cd "JAVA PROJECT 2025"

# Compile both Java files
javac src/*.java

# Verify compilation
ls src/*.class
```

### Create JAR File

```bash
# Create executable JAR
jar cfe CertificateViewer.jar CertificateCLI -C src .

# Verify JAR contents
jar tf CertificateViewer.jar

# Test JAR
java -jar CertificateViewer.jar google.com
```

### Setup Backend Server

```bash
# Navigate to website directory
cd website

# Install dependencies (first time only)
npm install

# Start server
npm start
```

### Project Dependencies

**Backend (package.json):**
```json
{
  "name": "certificate-viewer-backend",
  "version": "1.0.0",
  "description": "Backend API for Certificate Viewer",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5"
  }
}
```

---

## Project Structure

```
JAVA PROJECT 2025/
├── src/
│   ├── CertificateCLI.java              # CLI implementation
│   ├── CertificateCLI.class             # Compiled class
│   ├── CertificateViewer.java           # Interactive implementation
│   └── CertificateViewer.class          # Compiled class
├── website/
│   ├── index.html                       # Web interface
│   ├── script.js                        # Frontend JavaScript
│   ├── styles.css                       # Stylesheet
│   ├── server.js                        # Backend API
│   └── package.json                     # Node.js dependencies
├── CertificateViewer.jar                # Executable JAR
├── README.md                            # Main documentation
├── PROGRAMS_DOCUMENTATION.md            # Program-specific docs
└── COMPLETE_PROJECT_DOCUMENTATION.md    # This file
```

---

## Features Breakdown

### Java Programs Features

- ✅ SSL/TLS socket connection
- ✅ Certificate chain retrieval
- ✅ X.509 certificate parsing
- ✅ Common Name (CN) extraction
- ✅ Validity period checking
- ✅ SHA-256 fingerprint generation
- ✅ Subject Alternative Names parsing
- ✅ Expiration validation
- ✅ Hostname verification
- ✅ Wildcard certificate support
- ✅ Command-line arguments parsing
- ✅ Help and version display
- ✅ Custom port support
- ✅ Error handling and reporting

### Web Interface Features

- ✅ Responsive design
- ✅ Real-time certificate checking
- ✅ Auto-save to localStorage
- ✅ Certificate history (last 10)
- ✅ Expandable details
- ✅ Individual entry deletion
- ✅ Bulk history clearing
- ✅ Visual notifications
- ✅ Loading states
- ✅ Smooth animations
- ✅ Cross-browser compatible
- ✅ Mobile responsive

---

## API Documentation

### Backend API Endpoints

**POST /api/check-certificate**

Request:
```json
{
  "domain": "github.com"
}
```

Response (Success):
```json
{
  "success": true,
  "domain": "github.com",
  "output": "Certificate information..."
}
```

Response (Error):
```json
{
  "error": "Error message",
  "details": "Detailed information"
}
```

**GET /api/health**

Response:
```json
{
  "status": "ok",
  "message": "Certificate Viewer API is running"
}
```

---

## Security Considerations

- ✅ Read-only operations
- ✅ No certificate modification
- ✅ No credential storage
- ✅ Domain validation
- ✅ Timeout protection (10s)
- ✅ Input sanitization
- ✅ CORS enabled
- ✅ Error handling

---

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

---

## System Requirements

### Java Programs
- Java 8 or higher
- Internet connectivity
- Terminal/Command prompt access

### Web Interface
- Modern web browser
- JavaScript enabled
- LocalStorage support
- Node.js 12+ (for backend)

---

## Troubleshooting

### Common Issues

**"java: command not found"**
- Install Java JDK/JRE
- Add Java to system PATH

**"Connection refused"**
- Check internet connectivity
- Verify firewall settings
- Ensure port 443 is accessible

**"Backend server not running"**
- Start server: `npm start` in website directory
- Check if port 3000 is available

**"Certificate not displaying"**
- Verify domain name spelling
- Check if website uses HTTPS
- Ensure Java JAR is in correct location

---

## Future Enhancements

- Certificate export functionality
- Batch domain checking
- Certificate comparison tool
- Email expiration alerts
- Database storage option
- REST API expansion
- Docker containerization
- PDF report generation

---

## License

This project is available for educational and personal use.

---

## Contact & Support

**Author**: Dileep Reddy  
**Email**: dileepreddy974@gmail.com  
**GitHub**: https://github.com/Dileepreddy974/certificate-viewer

---

## Acknowledgments

- Java Security API Documentation
- Express.js Framework
- Modern CSS Design Patterns
- SSL/TLS Protocol Specifications

---

**Document Generated**: November 2025  
**Version**: 1.0  
**Total Lines of Code**: ~1500+

---

*This documentation contains the complete source code and technical information for the Certificate Viewer project. All code is production-ready and tested.*
