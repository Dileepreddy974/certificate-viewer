const tls = require('tls');
const { URL } = require('url');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  try {
    const result = await checkCertificate(domain);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

function checkCertificate(domain) {
  return new Promise((resolve, reject) => {
    let hostname = domain;
    let port = 443;

    // Parse domain and port
    if (domain.includes(':')) {
      const parts = domain.split(':');
      hostname = parts[0];
      port = parseInt(parts[1]) || 443;
    }

    // Remove protocol if present
    hostname = hostname.replace(/^https?:\/\//, '');
    hostname = hostname.replace(/\/.*$/, '');

    const options = {
      host: hostname,
      port: port,
      servername: hostname,
      rejectUnauthorized: false
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate(true);
      
      if (!cert || Object.keys(cert).length === 0) {
        socket.destroy();
        return reject(new Error('No certificate found'));
      }

      const certChain = [];
      let currentCert = cert;
      
      while (currentCert && Object.keys(currentCert).length > 0) {
        const certInfo = {
          subject: formatSubject(currentCert.subject),
          issuer: formatSubject(currentCert.issuer),
          commonName: currentCert.subject?.CN || 'N/A',
          validFrom: currentCert.valid_from,
          validTo: currentCert.valid_to,
          fingerprint: currentCert.fingerprint256 || currentCert.fingerprint,
          subjectAltNames: currentCert.subjectaltname || 'N/A'
        };
        
        certChain.push(certInfo);
        
        if (currentCert.issuerCertificate && 
            currentCert.issuerCertificate !== currentCert &&
            currentCert.fingerprint !== currentCert.issuerCertificate.fingerprint) {
          currentCert = currentCert.issuerCertificate;
        } else {
          break;
        }
      }

      // Validation
      const now = new Date();
      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      
      const isExpired = now > validTo;
      const isNotYetValid = now < validFrom;
      const hostnameValid = validateHostname(hostname, cert);

      const validation = {
        isExpired,
        isNotYetValid,
        hostnameValid,
        message: getValidationMessage(isExpired, isNotYetValid, hostnameValid)
      };

      socket.destroy();
      resolve({
        domain: hostname,
        port: port,
        certificates: certChain,
        validation
      });
    });

    socket.on('error', (error) => {
      reject(new Error(`Connection failed: ${error.message}`));
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

function formatSubject(subject) {
  if (!subject) return 'N/A';
  
  const parts = [];
  if (subject.CN) parts.push(`CN=${subject.CN}`);
  if (subject.O) parts.push(`O=${subject.O}`);
  if (subject.OU) parts.push(`OU=${subject.OU}`);
  if (subject.L) parts.push(`L=${subject.L}`);
  if (subject.ST) parts.push(`ST=${subject.ST}`);
  if (subject.C) parts.push(`C=${subject.C}`);
  
  return parts.join(', ') || 'N/A';
}

function validateHostname(hostname, cert) {
  const cn = cert.subject?.CN;
  const sans = cert.subjectaltname;
  
  const hostnamesToCheck = [hostname];
  
  // Check CN
  if (cn && matchesHostname(hostname, cn)) {
    return true;
  }
  
  // Check SANs
  if (sans) {
    const sanList = sans.split(', ').map(san => san.replace(/^DNS:/, ''));
    for (const san of sanList) {
      if (matchesHostname(hostname, san)) {
        return true;
      }
    }
  }
  
  return false;
}

function matchesHostname(hostname, pattern) {
  if (hostname === pattern) {
    return true;
  }
  
  // Wildcard matching
  if (pattern.startsWith('*.')) {
    const baseDomain = pattern.substring(2);
    const hostParts = hostname.split('.');
    
    if (hostParts.length >= 2) {
      const hostBaseDomain = hostParts.slice(1).join('.');
      return hostBaseDomain === baseDomain;
    }
  }
  
  return false;
}

function getValidationMessage(isExpired, isNotYetValid, hostnameValid) {
  const messages = [];
  
  if (isExpired) {
    messages.push('Certificate has expired');
  }
  
  if (isNotYetValid) {
    messages.push('Certificate is not yet valid');
  }
  
  if (!hostnameValid) {
    messages.push('Hostname does not match certificate');
  }
  
  if (messages.length === 0) {
    return 'Certificate is valid';
  }
  
  return messages.join('; ');
}
