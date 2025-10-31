# Terminal Output Guide

This document explains the terminal output of the SSL/TLS Certificate Viewer application.

## Overview

When you run the Certificate Viewer application, it produces structured output that provides comprehensive information about the SSL/TLS certificate of a website. This guide explains each section of the output.

## Sample Output Structure

```
Successfully retrieved X certificates.

[Certificate Info]
Host: domain.com:443
Subject: [Subject Distinguished Name]
Issuer: [Issuer Distinguished Name]
Common Name (CN): domain.com
Valid From: [Date]
Valid To:   [Date]
Fingerprint (SHA-256): XX:XX:XX:...

[Subject Alternative Names]
DNS: domain.com
DNS: www.domain.com
...

[Validation Results]
[Status Indicator] Certificate is currently valid.
[Status Indicator] Hostname verified.
```

## Detailed Section Explanations

### 1. Certificate Retrieval Message

```
Successfully retrieved 3 certificates.
```

This indicates how many certificates were found in the certificate chain:
- Leaf certificate (server certificate)
- Intermediate certificates
- The number varies based on the CA's certificate chain structure

### 2. Certificate Information Section

**Host**: The domain name and port analyzed (443 is standard HTTPS)

**Subject**: The entity the certificate was issued to, in X.500 format:
- CN = Common Name
- O = Organization
- L = Locality
- ST = State
- C = Country

**Issuer**: The Certificate Authority that issued the certificate

**Common Name (CN)**: Extracted from Subject for easier reading

**Valid From/To**: Certificate validity period with timezone information

**Fingerprint (SHA-256)**: Unique cryptographic hash for certificate identification

### 3. Subject Alternative Names Section

Lists all domains covered by the certificate:
- DNS entries: Additional valid domain names
- IP entries: Valid IP addresses (if any)
- Wildcard patterns (e.g., *.example.com)

### 4. Validation Results Section

**Certificate Validity**:
- ✅ Currently valid: Active certificate
- ❌ Expired: Past expiration date
- ❌ Not yet valid: Future activation date

**Hostname Verification**:
- ✅ Verified: Domain matches certificate
- ❌ Does not match: No matching domain found

## Status Indicators

- ✅ Success/Valid
- ❌ Error/Invalid
- ⚠️ Warning

## Error Messages

- ❌ Unknown host: DNS resolution failure
- ❌ SSL error: Connection/handshake issues
- ❌ Certificate error: Parsing problems
- ❌ Unexpected error: Other exceptions

## Sample Outputs

See the [outputs](file:///c:/Users/dilee/OneDrive/Desktop/java%20project/docs/outputs) directory for examples from various domains.