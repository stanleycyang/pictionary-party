import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - DoodleMania',
  description: 'Terms of Service for DoodleMania app',
}

export default function Terms() {
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
          <h1 style={styles.title}>Terms of Service</h1>
          <p style={styles.date}>Last updated: February 3, 2026</p>
          
          <section style={styles.section}>
            <h2 style={styles.heading}>1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using DoodleMania ("the App"), you agree to be bound 
              by these Terms of Service. If you do not agree to these terms, please do not use the App.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>2. Description of Service</h2>
            <p>
              DoodleMania is a free-to-play multiplayer drawing and guessing game. The App allows 
              users to create or join game rooms, draw pictures, and guess words in a fun, 
              competitive environment.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>3. User Conduct</h2>
            <p>When using DoodleMania, you agree NOT to:</p>
            <ul style={styles.list}>
              <li>Draw or share inappropriate, offensive, or illegal content</li>
              <li>Harass, bully, or intimidate other players</li>
              <li>Use the App for any unlawful purpose</li>
              <li>Attempt to hack, disrupt, or exploit the App</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Use automated systems or bots to play</li>
            </ul>
            <p>
              We reserve the right to terminate access for users who violate these guidelines.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>4. User-Generated Content</h2>
            <p>
              You are solely responsible for any drawings or messages you create within the App. 
              All drawings are temporary and are deleted when game rooms close. We do not permanently 
              store or review user-generated content.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>5. Intellectual Property</h2>
            <p>
              DoodleMania, including its design, features, and content, is protected by copyright, 
              trademark, and other intellectual property laws. You may not copy, modify, distribute, 
              or create derivative works based on the App without our express written permission.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>6. Disclaimer of Warranties</h2>
            <p>
              The App is provided "as is" and "as available" without warranties of any kind, 
              either express or implied. We do not guarantee that the App will be uninterrupted, 
              error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, we shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising from your use of 
              the App, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>8. Age Requirements</h2>
            <p>
              DoodleMania is intended for users of all ages. Children under 13 should use the 
              App under parental supervision. We do not knowingly collect personal information 
              from children.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of 
              significant changes by updating the "Last updated" date. Continued use of the App 
              after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>10. Termination</h2>
            <p>
              We may terminate or suspend your access to the App at any time, without prior notice, 
              for conduct that we believe violates these Terms or is harmful to other users, us, 
              or third parties.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the 
              State of California, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
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
          <Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link>
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
