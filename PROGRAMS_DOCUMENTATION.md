# Certificate Viewer - Programs Documentation

Complete documentation for all programs in the Certificate Viewer project.

---

## Table of Contents

1. [Java Programs](#java-programs)
   - [CertificateCLI.java](#certificateclijava)
   - [CertificateViewer.java](#certificateviewerjava)
2. [Backend Server](#backend-server)
   - [server.js](#serverjs)
3. [Frontend Programs](#frontend-programs)
   - [index.html](#indexhtml)
   - [script.js](#scriptjs)
   - [styles.css](#stylescss)

---

## Java Programs

### CertificateCLI.java

**Purpose**: Command-line interface for SSL/TLS certificate retrieval and validation.

#### Description
CertificateCLI is the main command-line tool that allows users to check SSL/TLS certificates from the terminal. It provides direct domain input as an argument and displays comprehensive certificate information.

#### Key Features
- Direct command-line execution
- Support for custom port specification
- Certificate chain retrieval
- Hostname verification
- Wildcard certificate support

#### Main Components

**1. main(String[] args)**
- Entry point of the CLI application
- Handles command-line arguments
- Processes flags: `-h`, `--help`, `-v`, `--version`
- Parses domain and optional port number
- Invokes certificate viewing functionality

**2. printUsage()**
- Displays help information
- Shows usage examples
- Lists available command-line options

**3. viewCertificate(String host, int port)**
- Core certificate retrieval function
- Creates SSL socket connection
- Performs SSL handshake
- Retrieves certificate chain
- Extracts and displays certificate information:
  - Subject and Issuer
  - Common Name (CN)
  - Validity period
  - SHA-256 fingerprint
  - Subject Alternative Names (SANs)
- Performs validation checks

**4. verifyHostname(String hostname, X509Certificate cert, String cn, Collection<List<?>> sans)**
- Validates hostname against certificate
- Checks Common Name (CN)
- Checks Subject Alternative Names (SANs)
- Supports wildcard certificates (*.example.com)

#### Usage Examples

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

#### Dependencies
- `java.security.MessageDigest` - SHA-256 fingerprint generation
- `java.security.cert.Certificate` - Certificate handling
- `java.security.cert.X509Certificate` - X.509 certificate parsing
- `java.text.SimpleDateFormat` - Date formatting
- `javax.naming.ldap.LdapName` - LDAP name parsing for CN extraction
- `javax.net.ssl.SSLSocket` - SSL socket connection
- `javax.net.ssl.SSLSocketFactory` - SSL socket creation

#### Output Format
```
Successfully retrieved 3 certificates.

[Certificate Info]
Host: github.com:443
Subject: CN=github.com
Issuer: CN=Sectigo ECC Domain Validation Secure Server CA
Common Name (CN): github.com
Valid From: Wed Feb 05 05:30:00 IST 2025
Valid To:   Fri Feb 06 05:29:59 IST 2026
Fingerprint (SHA-256): B8:BB:81:87:...

[Subject Alternative Names]
DNS: github.com
DNS: www.github.com

[Validation Results]
✅ Certificate is currently valid.
✅ Hostname verified.
```

#### Error Handling
- Invalid port number
- Unknown host
- SSL handshake failures
- Certificate parsing errors
- Network connectivity issues

---

### CertificateViewer.java

**Purpose**: Interactive version of the certificate viewer with user prompts.

#### Description
CertificateViewer provides an interactive interface where users are prompted to enter a domain name. It offers the same certificate analysis capabilities as CertificateCLI but with a more user-friendly prompt-based interaction.

#### Key Features
- Interactive user input
- Prompt-based domain entry
- Automatic URL normalization
- Comprehensive error handling
- Same certificate analysis as CLI version

#### Main Components

**1. main(String[] args)**
- Creates Scanner for user input
- Prompts user for domain name
- Normalizes input (removes https:// prefix)
- Initiates certificate retrieval
- Handles exceptions with user-friendly messages

**2. verifyHostname(String hostname, X509Certificate cert, String cn, Collection<List<?>> sans)**
- Hostname verification logic
- Checks against CN and SANs
- Wildcard certificate support

#### Usage Examples

```bash
# Run interactive mode
java -cp "src" CertificateViewer

# Using pipe input
echo "github.com" | java -cp "src" CertificateViewer
```

#### Input Normalization
- Removes `https://` prefix if present
- Extracts domain from domain:port format
- Defaults to port 443

#### Error Handling
- UnknownHostException - Domain resolution failure
- SSLException - SSL/TLS connection issues
- CertificateException - Certificate parsing errors
- General Exception - Unexpected errors with stack trace

#### User Interaction Flow
```
1. Display prompt: "Enter domain name (e.g., example.com): "
2. Read user input
3. Normalize domain name
4. Connect to server
5. Retrieve certificate
6. Display information
7. Show validation results
8. Close scanner
```

---

## Backend Server

### server.js

**Purpose**: Node.js Express backend server for web interface integration.

#### Description
A lightweight Express.js server that provides a REST API for certificate checking. It acts as a bridge between the web frontend and the Java certificate viewer tool.

#### Key Features
- RESTful API endpoint
- CORS support for cross-origin requests
- Domain validation
- JAR file execution
- Health check endpoint
- Static file serving

#### Main Components

**1. Server Setup**
- Express application initialization
- Port configuration (3000)
- Middleware setup (CORS, JSON, static files)

**2. API Endpoints**

**POST /api/check-certificate**
- Accepts JSON body with domain
- Validates domain format
- Executes Java JAR file
- Returns certificate information

**Request Format:**
```json
{
  "domain": "github.com"
}
```

**Response Format (Success):**
```json
{
  "success": true,
  "domain": "github.com",
  "output": "Certificate information..."
}
```

**Response Format (Error):**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**GET /api/health**
- Health check endpoint
- Returns server status

**3. Domain Validation**
- Regex pattern: `/^[a-zA-Z0-9][a-zA-Z0-9-_.]*[a-zA-Z0-9](\:[0-9]+)?$/`
- Validates domain format
- Supports optional port specification

**4. JAR Execution**
- Locates JAR file in parent directory
- Builds command: `java -jar CertificateViewer.jar <domain>`
- Executes with 10-second timeout
- Captures stdout and stderr

#### Configuration
```javascript
const PORT = 3000;
const jarPath = path.join(__dirname, '..', 'CertificateViewer.jar');
const timeout = 10000; // 10 seconds
```

#### Dependencies
- `express` - Web framework
- `child_process` - Execute Java commands
- `path` - File path handling
- `cors` - CORS middleware

#### Usage
```bash
# Start server
cd website
npm start

# Or directly
node server.js
```

#### Error Handling
- Missing domain parameter (400)
- Invalid domain format (400)
- JAR execution failure (500)
- Certificate retrieval errors (500)

---

## Frontend Programs

### index.html

**Purpose**: Main web interface for certificate viewer.

#### Description
Single-page web application providing a clean, professional interface for SSL/TLS certificate checking.

#### Structure

**1. Navigation**
- Fixed navbar with brand logo
- Navigation links: Home, Features, Demo, Download, Docs
- Smooth scroll behavior

**2. Hero Section**
- Project title and description
- Call-to-action buttons
- Terminal preview with example output

**3. Features Section**
- 4 feature cards highlighting:
  - Certificate Details
  - Validation
  - Lightweight (zero dependencies)
  - Cross-Platform support

**4. Demo Section**
- Domain input field
- Check Certificate button
- Output display area
- Certificate history list with:
  - Recent checks display
  - Refresh and Clear buttons
  - Individual item actions (View/Delete)
  - Expandable certificate details

**5. Download Section (Get Started)**
- 3-column layout:
  - Download JAR file
  - Requirements list
  - Quick Start guide with code example

**6. Documentation Section**
- 3 documentation cards:
  - Usage Guide
  - Applications
  - Source Code (GitHub link)

**7. Footer**
- 3-column layout:
  - Project description
  - Quick Links
  - Resources
- Copyright information

#### Interactive Elements
- Smooth scroll navigation
- Button hover effects
- Input field focus states
- Expandable history items

---

### script.js

**Purpose**: Client-side JavaScript for interactive functionality and auto-save.

#### Description
Handles all frontend interactivity including certificate checking, auto-save to localStorage, and history management.

#### Main Functions

**1. checkCertificate()**
- Validates domain input
- Makes API call to backend
- Displays loading state
- Shows certificate results
- Triggers auto-save

**2. saveCertificateResult(domain, output)**
- Saves check to localStorage
- Creates entry with:
  - Unique ID
  - Domain name
  - Full output
  - Timestamp
  - Formatted date
- Maintains last 10 entries
- Refreshes history display
- Shows save notification

**3. refreshHistory()**
- Retrieves history from localStorage
- Generates HTML for history items
- Displays in history list
- Shows empty state if no history

**4. toggleHistoryDetails(id)**
- Expands/collapses certificate details
- Updates button text
- Toggles display state

**5. deleteHistoryItem(id)**
- Confirms deletion
- Removes from localStorage
- Refreshes display
- Shows deletion notification

**6. clearHistory()**
- Confirms bulk deletion
- Clears all saved history
- Updates display
- Shows notification

**7. showSaveNotification(message, color)**
- Creates notification popup
- Shows at bottom-right
- Auto-dismisses after 3 seconds
- Customizable color

**8. viewHistory()**
- Console logging function
- Returns history array
- For debugging purposes

#### Event Listeners
- Enter key to submit domain
- Smooth scroll for navigation
- Navbar shadow on scroll
- Page load history refresh

#### LocalStorage Structure
```javascript
{
  "certificateHistory": [
    {
      "id": "1234567890123",
      "domain": "github.com",
      "output": "Certificate information...",
      "timestamp": "2025-10-31T12:00:00.000Z",
      "date": "10/31/2025, 12:00:00 PM"
    }
  ]
}
```

#### Animations
- Fade-in for feature cards
- Slide-in for notifications
- Smooth scroll behavior
- Hover transformations

---

### styles.css

**Purpose**: Stylesheet for the web interface.

#### Description
Comprehensive CSS providing clean, modern styling with responsive design and smooth animations.

#### CSS Variables
```css
--primary-color: #2563eb
--secondary-color: #1e40af
--text-color: #1f2937
--text-light: #6b7280
--bg-color: #ffffff
--bg-light: #f9fafb
--border-color: #e5e7eb
--success-color: #10b981
--terminal-bg: #1e293b
--terminal-text: #e2e8f0
```

#### Key Components

**1. Layout**
- Container max-width: 1200px
- Responsive grid layouts
- Flexbox for navigation

**2. Navigation**
- Sticky positioning
- Backdrop blur effect
- Box shadow on scroll

**3. Buttons**
- Multiple variants: primary, secondary, outline
- Hover effects with transform
- Box shadows on interaction

**4. Terminal Preview**
- Dark background (#1e293b)
- Monospace font
- Syntax highlighting
- Scrollable content

**5. History Section**
- White card container
- Grid layout for items
- Expandable details
- Smooth transitions

**6. Responsive Design**
- Mobile breakpoint: 768px
- Stack layouts on mobile
- Adjusted font sizes
- Touch-friendly buttons

#### Animations
```css
@keyframes spin - Loading spinner
@keyframes slideIn - Notification enter
@keyframes slideOut - Notification exit
```

#### Typography
- Font family: System fonts (San Francisco, Segoe UI, etc.)
- Heading sizes: 3rem to 1.25rem
- Line height: 1.6 for readability

---

## Program Integration

### Data Flow

```
User Input → Frontend (HTML/JS)
    ↓
Backend API (server.js)
    ↓
Java JAR Execution (CertificateCLI)
    ↓
Certificate Retrieval & Analysis
    ↓
Results Return to Frontend
    ↓
Display + Auto-save to LocalStorage
```

### Execution Modes

**1. Standalone CLI**
```bash
java -jar CertificateViewer.jar github.com
```

**2. Interactive Mode**
```bash
java -cp "src" CertificateViewer
```

**3. Web Interface**
```bash
cd website && npm start
# Then open http://localhost:3000
```

---

## Building and Deployment

### Compiling Java Programs
```bash
# Compile source files
javac src/*.java

# Create JAR file
jar cfe CertificateViewer.jar CertificateCLI -C src .
```

### Starting Backend Server
```bash
cd website
npm install  # First time only
npm start
```

### Project Structure
```
JAVA PROJECT 2025/
├── src/
│   ├── CertificateCLI.java
│   ├── CertificateCLI.class
│   ├── CertificateViewer.java
│   └── CertificateViewer.class
├── website/
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   ├── server.js
│   └── package.json
├── CertificateViewer.jar
├── README.md
└── PROGRAMS_DOCUMENTATION.md
```

---

## Technical Requirements

### Java Programs
- Java 8 or higher
- Internet connectivity
- Standard Java libraries (no external dependencies)

### Backend Server
- Node.js (v12 or higher)
- npm packages:
  - express
  - cors

### Frontend
- Modern web browser
- JavaScript enabled
- LocalStorage support

---

## Author

**Dileep Reddy**  
Email: dileepreddy974@gmail.com  
GitHub: [Dileepreddy974](https://github.com/Dileepreddy974)

---

**Version**: 1.0  
**Last Updated**: October 2025  
**License**: Educational and Personal Use
