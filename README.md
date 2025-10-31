# SSL/TLS Certificate Viewer & Validator

A Java application that connects to websites via HTTPS, retrieves and parses server certificates, displays detailed certificate information, and performs validation checks.

## Features

- 🔐 **Certificate Retrieval**: Connects to any HTTPS website and retrieves the full certificate chain
- 📋 **Detailed Information**: Displays comprehensive certificate details including:
  - Subject and Issuer
  - Common Name (CN)
  - Validity Period (Not Before/Not After)
  - SHA-256 Fingerprint
  - Subject Alternative Names (SANs)
- ✅ **Validation Checks**:
  - Certificate expiration status
  - Hostname verification against CN and SANs
  - Support for wildcard certificates
- 🖥️ **Multiple Interfaces**:
  - Command-line interface (CLI) for direct execution
  - Interactive version with prompts
- 📦 **Portable**: Packaged as executable JAR file

## Prerequisites

- Java 8 or higher installed on your system
- Internet connection to retrieve certificates from remote servers

## Installation

1. Download the `CertificateViewer.jar` file from the project directory
2. Ensure Java is installed and accessible from your terminal/command prompt

## Usage

### Method 1: Using the JAR file (Recommended)

```bash
# View certificate information for a domain
java -jar CertificateViewer.jar github.com

# View certificate for a domain with specific port
java -jar CertificateViewer.jar google.com:443

# Show help information
java -jar CertificateViewer.jar --help

# Show version information
java -jar CertificateViewer.jar --version
```

### Method 2: Using class files directly

```bash
# Using the CLI interface
java -cp "src" CertificateCLI github.com

# Using the original interactive version
java -cp "src" CertificateViewer
```

Note: With the interactive version, you'll be prompted to enter the domain name after the application starts.

### Method 3: Using pipe input (for the interactive version)

```bash
echo "github.com" | java -cp "src" CertificateViewer
```

## Example Output

```
Successfully retrieved 3 certificates.

[Certificate Info]
Host: github.com:443
Subject: CN=github.com
Issuer: CN=Sectigo ECC Domain Validation Secure Server CA,O=Sectigo Limited,L=Salford,ST=Greater Manchester,C=GB
Common Name (CN): github.com
Valid From: Wed Feb 05 05:30:00 IST 2025
Valid To:   Fri Feb 06 05:29:59 IST 2026
Fingerprint (SHA-256): B8:BB:81:87:68:33:87:39:42:04:5A:8D:F8:F0:62:19:E0:06:02:EB:CB:43:84:C7:AB:C2:4F:18:37:9C:87:F5

[Subject Alternative Names]
DNS: github.com
DNS: www.github.com

[Validation Results]
✅ Certificate is currently valid.
✅ Hostname verified.
```

## Project Structure

```
java project/
├── CertificateViewer.jar     # Executable JAR file
├── README.md                 # This documentation file
└── src/                      # Source code directory
    ├── CertificateCLI.java   # Command-line interface implementation
    ├── CertificateCLI.class  # Compiled CLI class
    ├── CertificateViewer.java # Interactive version
    └── CertificateViewer.class # Compiled interactive class
```

## Building from Source

If you want to compile the project from source:

1. Navigate to the project directory
2. Compile the Java files:
   ```bash
   javac src/*.java
   ```
3. Run using one of the methods described above

To create the JAR file:
```bash
jar cfe CertificateViewer.jar CertificateCLI -C src .
```

## Technical Details

### Certificate Information Retrieved

- **Subject**: The entity to which the certificate was issued
- **Issuer**: The Certificate Authority that issued the certificate
- **Common Name (CN)**: The primary domain name associated with the certificate
- **Validity Period**: Certificate start and end dates
- **SHA-256 Fingerprint**: Unique identifier for the certificate
- **Subject Alternative Names**: Additional domain names covered by the certificate

### Validation Performed

1. **Expiration Check**: Verifies the certificate is currently valid
2. **Hostname Verification**: Ensures the domain matches either:
   - The Common Name (CN) in the certificate
   - One of the Subject Alternative Names (SANs)
   - Supports wildcard certificates (e.g., *.example.com)

### Error Handling

The application gracefully handles:
- UnknownHostException: When the domain cannot be resolved
- SSLException: When SSL/TLS connection fails
- CertificateException: When certificate parsing fails
- General exceptions with descriptive error messages

## Supported Certificate Types

- Standard SSL/TLS certificates
- Wildcard certificates
- Certificates with Subject Alternative Names
- Self-signed certificates (with appropriate warnings)

## Security Notes

- This tool only reads certificate information and does not modify or store any certificates
- All connections are made over standard HTTPS
- No sensitive data is logged or stored by the application
- For production use, always verify certificates through proper channels

## Learning Outcomes

This project demonstrates:
- Understanding of SSL/TLS handshake process
- Knowledge of X.509 certificate structure
- Experience with Java security APIs (javax.net.ssl, java.security.cert)
- Secure coding practices in Java
- Command-line interface development

## Author

Dileep Reddy <dileepreddy974@gmail.com>

## License

This project is available for educational and personal use.