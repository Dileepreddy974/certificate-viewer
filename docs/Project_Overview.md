# SSL/TLS Certificate Viewer & Validator - Project Overview

## Project Description

The SSL/TLS Certificate Viewer & Validator is a Java-based application designed to analyze SSL/TLS certificates of websites. It establishes secure connections to HTTPS servers, retrieves certificate chains, parses detailed certificate information, and performs validation checks to ensure certificate integrity and security compliance.

This tool serves as both an educational resource for understanding SSL/TLS security mechanisms and a practical utility for system administrators, security professionals, and developers who need to verify certificate information.

## Core Functionality

### 1. Certificate Retrieval
- Establishes SSL/TLS connections to remote servers using Java's SSLSocket API
- Retrieves complete certificate chains from the server
- Handles standard HTTPS port (443) with configurable port support

### 2. Certificate Parsing
- Parses X.509 certificate format using Java's security APIs
- Extracts key certificate attributes:
  - Subject and Issuer Distinguished Names
  - Common Name (CN)
  - Validity Period (Not Before/Not After dates)
  - SHA-256 Fingerprint
  - Subject Alternative Names (SANs)
  - Certificate chain information

### 3. Validation & Analysis
- Certificate expiration checking
- Hostname verification against CN and SANs
- Support for wildcard certificate matching
- Certificate chain integrity verification

### 4. User Interface
- Command-line interface for direct execution
- Interactive mode with user prompts
- Structured, readable output formatting
- Error handling and user feedback

## Technical Architecture

### Programming Language & Platform
- **Language**: Java SE 8+
- **Platform**: Cross-platform compatibility (Windows, macOS, Linux)
- **Dependencies**: Standard Java libraries only (no external dependencies)

### Key Components
1. **CertificateCLI.java**: Command-line interface implementation
2. **CertificateViewer.java**: Interactive version with user prompts
3. **SSL Connection Manager**: Handles secure socket creation and handshake
4. **Certificate Parser**: Extracts and formats certificate information
5. **Validator**: Performs certificate validation checks

### Java APIs Utilized
- `javax.net.ssl`: SSL/TLS socket implementation
- `java.security.cert`: X.509 certificate handling
- `javax.naming.ldap`: LDAP name parsing for certificate subjects
- `java.security.MessageDigest`: Cryptographic hashing for fingerprints
- `java.text.SimpleDateFormat`: Date formatting

## Use Cases & Applications

### 1. Security Auditing
- Verify certificate validity for organizational websites
- Check expiration dates for proactive renewal planning
- Validate hostname matching to prevent security warnings

### 2. System Administration
- Monitor certificate status across multiple domains
- Troubleshoot SSL/TLS connection issues
- Validate certificate deployment after updates

### 3. Development & Testing
- Debug SSL/TLS connection problems during development
- Verify certificate configuration in testing environments
- Test certificate behavior with different domain configurations

### 4. Educational Purposes
- Learn about SSL/TLS certificate structure
- Understand certificate chain of trust
- Study hostname verification mechanisms
- Explore Java security APIs

### 5. Compliance & Monitoring
- Ensure certificates meet organizational security standards
- Monitor certificate lifecycles for compliance requirements
- Verify certificate authorities against approved lists

## Detailed Features

### Certificate Information Display
- **Subject Information**: Full distinguished name of certificate holder
- **Issuer Information**: Certificate authority details
- **Common Name**: Primary domain name associated with certificate
- **Validity Period**: Start and end dates with timezone information
- **Fingerprint**: Unique SHA-256 hash for certificate identification
- **Subject Alternative Names**: All domains covered by the certificate

### Validation Capabilities
- **Expiration Checking**: Real-time validation against current date
- **Hostname Verification**: Matches queried domain against certificate names
- **Wildcard Support**: Proper handling of *.example.com patterns
- **Chain Validation**: Verification of certificate chain integrity

### Error Handling
- Network connectivity issues (UnknownHostException)
- SSL/TLS handshake failures (SSLException)
- Certificate parsing errors (CertificateException)
- General exception handling with descriptive messages

### User Experience
- Multiple interface options (CLI and interactive)
- Clear, structured output formatting
- Status indicators (✅, ❌) for quick result interpretation
- Help and version information
- Cross-platform compatibility

## Implementation Details

### SSL Connection Process
1. Create SSLSocketFactory using default security providers
2. Establish connection to specified host and port
3. Initiate SSL handshake to trigger certificate exchange
4. Retrieve peer certificates from the established session

### Certificate Parsing Process
1. Cast certificates to X509Certificate for detailed access
2. Extract subject and issuer using X.500 principal names
3. Parse Common Name from subject using LDAP name parsing
4. Retrieve validity dates (Not Before/Not After)
5. Generate SHA-256 fingerprint using MessageDigest
6. Extract Subject Alternative Names with type identification

### Validation Logic
1. **Expiration Check**: Compare current date with certificate validity period
2. **Hostname Verification**: 
   - Match against Common Name (fallback mechanism)
   - Match against Subject Alternative Names (preferred method)
   - Support for wildcard certificates (*.example.com)
3. **Chain Validation**: Verify certificate chain integrity (future enhancement)

## Security Considerations

### Safe Practices Implemented
- Read-only certificate analysis (no modifications)
- Secure SSL/TLS connection establishment
- Proper exception handling to prevent information leakage
- No storage or logging of sensitive certificate data

### Limitations & Precautions
- Does not modify or store certificates
- Relies on system's default trust store for validation
- No private key access or manipulation
- Designed for analysis only, not for production security decisions

## Educational Value

### Learning Outcomes
- Understanding of SSL/TLS handshake process
- Knowledge of X.509 certificate structure and fields
- Experience with Java security APIs and networking
- Certificate validation and verification techniques
- Command-line interface development in Java

### Target Audience
- Computer science students
- Security professionals
- System administrators
- Software developers
- Network engineers

## Performance & Efficiency

### Resource Usage
- Minimal memory footprint
- Efficient certificate parsing algorithms
- Single-threaded execution model
- No persistent background processes

### Execution Speed
- Fast certificate retrieval (network dependent)
- Immediate parsing and validation
- Responsive user interface
- Optimized output formatting

## Compatibility

### Supported Environments
- Java 8 and higher versions
- Windows, macOS, and Linux operating systems
- Standard SSL/TLS implementations
- IPv4 and IPv6 network stacks

### Certificate Types Supported
- Standard SSL/TLS certificates
- Wildcard certificates
- Certificates with Subject Alternative Names
- Self-signed certificates (with appropriate warnings)
- Extended Validation (EV) certificates