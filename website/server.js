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
