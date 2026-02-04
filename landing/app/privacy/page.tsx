import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - DoodleMania',
  description: 'Privacy Policy for DoodleMania app',
}

export default function Privacy() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          <span style={styles.logoEmoji}>🎨</span>
          <span style={styles.logoText}>DoodleMania</span>
        </Link>
      </header>
      
      <main style={styles.main}>
        <article style={styles.content}>
          <h1 style={styles.title}>Privacy Policy</h1>
          <p style={styles.date}>Last updated: February 3, 2026</p>
          
          <section style={styles.section}>
            <h2 style={styles.heading}>Overview</h2>
            <p>
              DoodleMania ("we", "our", or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we handle information when you use our mobile application.
            </p>
            <p>
              DoodleMania is designed for entertainment and fun. We believe in minimal data collection 
              and maximum privacy protection.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Information We Collect</h2>
            <p>We collect minimal information necessary to provide our services:</p>
            <ul style={styles.list}>
              <li>
                <strong>Player Names:</strong> Temporary nicknames you choose during gameplay. 
                These are not permanently stored and are deleted when you leave the game room.
              </li>
              <li>
                <strong>Game Data:</strong> Room codes, drawings, and game state information. 
                This data is temporary and is deleted when the game room closes.
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Information We Do NOT Collect</h2>
            <p>We want to be clear about what we don't collect:</p>
            <ul style={styles.list}>
              <li>Email addresses</li>
              <li>Phone numbers</li>
              <li>Precise location data</li>
              <li>Payment or financial information</li>
              <li>Advertising identifiers</li>
              <li>Contacts or address book data</li>
              <li>Photos or media (except drawings you create in-app)</li>
              <li>Health or fitness data</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Third-Party Services</h2>
            <p>DoodleMania uses the following third-party services:</p>
            <ul style={styles.list}>
              <li>
                <strong>Supabase:</strong> We use Supabase for real-time multiplayer functionality. 
                Supabase processes game data according to their privacy policy. No personal information 
                is shared with Supabase.
              </li>
              <li>
                <strong>Expo:</strong> We use Expo's services for app updates. Expo may collect 
                anonymous analytics data. See Expo's privacy policy for details.
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your data. 
              All communications between the app and our servers are encrypted using industry-standard 
              protocols.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Children's Privacy</h2>
            <p>
              DoodleMania is suitable for all ages and does not knowingly collect personal information 
              from children under 13 years of age. If you believe we have inadvertently collected 
              information from a child, please contact us immediately.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Your Rights</h2>
            <p>You have the right to:</p>
            <ul style={styles.list}>
              <li>Know what data we collect about you</li>
              <li>Request deletion of your data</li>
              <li>Opt out of any data collection</li>
            </ul>
            <p>
              Since we collect minimal temporary data, most rights are automatically fulfilled. 
              When you leave a game room, all associated data is deleted.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p style={styles.contact}>
              <strong>Email:</strong> stanley@stanleycyang.com
            </p>
          </section>
        </article>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <Link href="/" style={styles.footerLink}>Home</Link>
          <Link href="/terms" style={styles.footerLink}>Terms of Service</Link>
          <Link href="/support" style={styles.footerLink}>Support</Link>
        </div>
        <p style={styles.copyright}>© 2026 Stanley Yang. All rights reserved.</p>
      </footer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: '#f8f8f8',
  },
  header: {
    background: '#6B4EE6',
    padding: '20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  logoEmoji: {
    fontSize: '32px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#fff',
  },
  main: {
    padding: '40px 20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  content: {
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px',
  },
  date: {
    color: '#666',
    marginBottom: '40px',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: '30px',
  },
  heading: {
    fontSize: '22px',
    color: '#6B4EE6',
    marginBottom: '15px',
  },
  list: {
    paddingLeft: '20px',
    lineHeight: 1.8,
  },
  contact: {
    background: '#f0f0f0',
    padding: '15px',
    borderRadius: '8px',
  },
  footer: {
    background: '#2a2a2a',
    padding: '40px 20px',
    color: '#fff',
    textAlign: 'center',
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '20px',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
  },
  copyright: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
  },
}
