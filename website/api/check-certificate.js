const https = require('https');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { domain } = req.body;

    if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9](\:[0-9]+)?$/;
    if (!domainRegex.test(domain)) {
        return res.status(400).json({ error: 'Invalid domain format' });
    }

    try {
        // Parse domain and port
        const [hostname, port] = domain.includes(':') ? domain.split(':') : [domain, 443];

        // Fetch certificate using Node.js HTTPS
        const options = {
            hostname: hostname,
            port: parseInt(port),
            method: 'GET',
            rejectUnauthorized: false,
            agent: false
        };

        const request = https.request(options, (response) => {
            const cert = response.socket.getPeerCertificate();
            
            if (!cert || Object.keys(cert).length === 0) {
                return res.status(500).json({ 
                    error: 'Could not retrieve certificate',
                    details: 'No certificate found for this domain'
                });
            }

            // Format certificate information
            const certInfo = formatCertificateInfo(domain, cert);
            
            res.status(200).json({
                success: true,
                domain: domain,
                output: certInfo
            });
        });

        request.on('error', (error) => {
            res.status(500).json({ 
                error: 'Failed to retrieve certificate information',
                details: error.message
            });
        });

        request.end();

    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to retrieve certificate information',
            details: error.message
        });
    }
};

function formatCertificateInfo(domain, cert) {
    const validFrom = new Date(cert.valid_from);
    const validTo = new Date(cert.valid_to);
    const now = new Date();
    const isValid = now >= validFrom && now <= validTo;
    
    // Extract subject alternative names
    const sans = cert.subjectaltname ? cert.subjectaltname.split(', ') : [];
    
    let output = `Certificate Information for: ${domain}\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    output += `Certificate Details:\n`;
    output += `  Subject: CN=${cert.subject.CN || domain}\n`;
    output += `  Issuer: CN=${cert.issuer.CN || 'Unknown'}\n`;
    output += `  Valid From: ${validFrom.toISOString().split('T')[0]}\n`;
    output += `  Valid To: ${validTo.toISOString().split('T')[0]}\n`;
    output += `  SHA-256 Fingerprint: ${cert.fingerprint256 || cert.fingerprint}\n`;
    
    if (sans.length > 0) {
        output += `\nSubject Alternative Names (SANs):\n`;
        sans.forEach(san => {
            output += `  - ${san.replace('DNS:', '')}\n`;
        });
    }
    
    output += `\nValidation Results:\n`;
    output += `  ${isValid ? '✓' : '✗'} Certificate is ${isValid ? 'valid' : 'invalid'}\n`;
    
    // Check hostname match
    const hostnameMatch = cert.subject.CN === domain || sans.some(san => san.includes(domain));
    output += `  ${hostnameMatch ? '✓' : '✗'} Hostname ${hostnameMatch ? 'matches' : 'does not match'}\n`;
    
    // Check expiration
    const notExpired = now < validTo;
    output += `  ${notExpired ? '✓' : '✗'} ${notExpired ? 'Not expired' : 'Expired'}\n`;
    
    output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    return output;
}
