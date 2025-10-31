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