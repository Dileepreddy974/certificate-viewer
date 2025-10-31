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