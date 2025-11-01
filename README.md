# SSL/TLS Certificate Viewer & Validator

A lightweight Java command-line application that connects to HTTPS servers, retrieves SSL/TLS certificates, displays comprehensive certificate information, and performs validation checks.

## 🔐 Features

- **Certificate Retrieval**: Connects to any HTTPS website and retrieves the complete certificate chain
- **Detailed Information Display**:
  - Subject and Issuer Distinguished Names
  - Common Name (CN)
  - Validity Period (Not Before/Not After dates)
  - SHA-256 Fingerprint
  - Subject Alternative Names (SANs)
  - Certificate chain information
- **Validation Checks**:
  - Certificate expiration status
  - Hostname verification against CN and SANs
  - Wildcard certificate support (*.example.com)
- **Multiple Interfaces**:
  - Command-line interface (CLI) for direct execution
  - Interactive mode with user prompts
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Zero Dependencies**: Uses only standard Java libraries

## 📋 Prerequisites

- Java 8 or higher
- Internet connection to retrieve certificates from remote servers

## 🚀 Installation

1. Clone this repository or download the project files
2. Ensure Java is installed on your system:
   ```bash
   java -version
   ```

## 💻 Usage

### Method 1: Using the JAR file (Recommended)

```bash
# View certificate for a domain
java -jar CertificateViewer.jar github.com

# Specify a custom port
java -jar CertificateViewer.jar example.com:8443

# Show help information
java -jar CertificateViewer.jar --help

# Show version
java -jar CertificateViewer.jar --version
```

### Method 2: Using compiled class files

**CLI Mode** (Direct command-line execution):
```bash
java -cp "src" CertificateCLI github.com
```

**Interactive Mode** (Prompts for domain input):
```bash
java -cp "src" CertificateViewer
```

### Method 3: Pipe input (Interactive mode)

```bash
echo "github.com" | java -cp "src" CertificateViewer
```

## 📊 Example Output

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

## 🏗️ Building from Source

### Compile the Java files

```bash
# Navigate to the project directory
cd "JAVA PROJECT 2025"

# Compile source files
javac src/*.java
```

### Create the JAR file

```bash
# Create executable JAR with main class CertificateCLI
jar cfe CertificateViewer.jar CertificateCLI -C src .
```

### Run the application

```bash
java -jar CertificateViewer.jar google.com
```

## 📁 Project Structure

```
JAVA PROJECT 2025/
├── src/
│   ├── CertificateCLI.java          # CLI interface implementation
│   ├── CertificateCLI.class         # Compiled CLI class
│   ├── CertificateViewer.java       # Interactive interface
│   └── CertificateViewer.class      # Compiled interactive class
├── website/                         # Web interface (optional)
├── CertificateViewer.jar            # Executable JAR file
├── MANIFEST.MF                      # JAR manifest file
└── README.md                        # This file
```

## 🔧 Technical Details

### Technologies Used

- **Language**: Java 8+
- **SSL/TLS**: `javax.net.ssl.SSLSocket`, `javax.net.ssl.SSLSocketFactory`
- **Certificate Parsing**: `java.security.cert.X509Certificate`
- **LDAP Name Parsing**: `javax.naming.ldap.LdapName`
- **Cryptography**: `java.security.MessageDigest` (SHA-256)

### Certificate Information Retrieved

| Field | Description |
|-------|-------------|
| **Subject** | Entity to which the certificate was issued |
| **Issuer** | Certificate Authority that issued the certificate |
| **Common Name (CN)** | Primary domain name for the certificate |
| **Validity Period** | Certificate start and end dates with timezone |
| **SHA-256 Fingerprint** | Unique cryptographic hash identifier |
| **Subject Alternative Names** | Additional domain names covered by certificate |

### Validation Logic

1. **Expiration Check**: Compares current date with certificate's validity period
2. **Hostname Verification**:
   - Matches against Common Name (CN) as fallback
   - Matches against Subject Alternative Names (SANs) - preferred method
   - Supports wildcard certificates (e.g., *.example.com matches subdomain.example.com)
3. **Certificate Chain**: Retrieves and displays the complete certificate chain

### Error Handling

The application handles various error scenarios gracefully:

- **UnknownHostException**: Domain name cannot be resolved
- **SSLException**: SSL/TLS handshake or connection failure
- **CertificateException**: Certificate parsing errors
- **General Exceptions**: Caught with descriptive error messages

## 🎯 Use Cases

- **Security Auditing**: Verify certificate validity for organizational websites
- **System Administration**: Monitor certificate expiration dates across multiple domains
- **Development & Testing**: Debug SSL/TLS connection issues
- **Educational**: Learn about SSL/TLS certificates and X.509 structure
- **Compliance Monitoring**: Ensure certificates meet security standards

## 🌐 Supported Certificate Types

- Standard SSL/TLS certificates
- Wildcard certificates (*.example.com)
- Certificates with Subject Alternative Names
- Self-signed certificates (displays warnings)
- Extended Validation (EV) certificates

## 🔒 Security Notes

- **Read-only**: This tool only reads certificate information; it never modifies or stores certificates
- **Secure Connections**: All connections use standard HTTPS/TLS protocols
- **No Data Storage**: No sensitive data is logged or persisted
- **System Trust Store**: Uses your system's default certificate trust store for validation

## 🎓 Learning Outcomes

This project demonstrates:

- SSL/TLS handshake process and certificate exchange
- X.509 certificate structure and field parsing
- Java security APIs (`javax.net.ssl`, `java.security.cert`)
- Hostname verification and wildcard matching
- Command-line application development in Java
- Error handling and user-friendly output formatting

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 👤 Author

**Dileep Reddy**  
Email: dileepreddy974@gmail.com  
GitHub: [Dileepreddy974](https://github.com/Dileepreddy974)

## 📄 License

This project is available for educational and personal use.

## 🔗 Additional Resources

- [Java SSL/TLS Documentation](https://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/JSSERefGuide.html)
- [X.509 Certificate Standard](https://www.itu.int/rec/T-REC-X.509)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)

---

**Version**: 1.0  
**Last Updated**: October 2025
