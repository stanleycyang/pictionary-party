import Link from 'next/link'

export const metadata = {
  title: 'Support - DoodleMania',
  description: 'Get help and support for DoodleMania app',
}

export default function Support() {
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
          <h1 style={styles.title}>Support</h1>
          <p style={styles.subtitle}>
            We're here to help! Find answers to common questions or get in touch with us.
          </p>

          <section style={styles.section}>
            <h2 style={styles.heading}>📱 Frequently Asked Questions</h2>
            
            <div style={styles.faq}>
              <h3 style={styles.question}>How do I create a multiplayer game?</h3>
              <p style={styles.answer}>
                Tap "Online Multiplayer" on the home screen, then "Create Room". 
                Share the room code with your friends so they can join!
              </p>
            </div>

            <div style={styles.faq}>
              <h3 style={styles.question}>How do I join someone else's game?</h3>
              <p style={styles.answer}>
                Tap "Online Multiplayer" then "Join Room". Enter the room code your 
                friend shared with you and you'll be connected to their game.
              </p>
            </div>

            <div style={styles.faq}>
              <h3 style={styles.question}>Can I play without internet?</h3>
              <p style={styles.answer}>
                Yes! Use "Local Party" mode to play on a single device. Perfect for 
                in-person gatherings where you pass the phone around.
              </p>
            </div>

            <div style={styles.faq}>
              <h3 style={styles.question}>How many players can join a game?</h3>
              <p style={styles.answer}>
                Online multiplayer supports up to 8 players. Local party mode supports 
                2-4 teams with unlimited players per team.
              </p>
            </div>

            <div style={styles.faq}>
              <h3 style={styles.question}>What if I get disconnected?</h3>
              <p style={styles.answer}>
                DoodleMania remembers your session! If you get disconnected, just 
                reopen the app and you'll be asked if you want to rejoin your game.
              </p>
            </div>

            <div style={styles.faq}>
              <h3 style={styles.question}>How do I change difficulty?</h3>
              <p style={styles.answer}>
                In Local Party mode, tap the settings icon to choose between Easy, 
                Medium, Hard, or Mixed difficulty levels.
              </p>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>📧 Contact Us</h2>
            <p>
              Still need help? We'd love to hear from you!
            </p>
            <div style={styles.contactCard}>
              <div style={styles.contactItem}>
                <span style={styles.contactIcon}>✉️</span>
                <div>
                  <strong>Email Support</strong>
                  <p style={styles.contactDetail}>stanley@stanleycyang.com</p>
                </div>
              </div>
              <p style={styles.responseTime}>
                We typically respond within 24-48 hours.
              </p>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>🐛 Report a Bug</h2>
            <p>
              Found something not working right? Please email us with:
            </p>
            <ul style={styles.list}>
              <li>What you were trying to do</li>
              <li>What happened instead</li>
              <li>Your device type (iPhone, Android, etc.)</li>
              <li>App version (found in app settings)</li>
              <li>Screenshots if possible</li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>💡 Feature Requests</h2>
            <p>
              Have an idea to make DoodleMania even better? We love hearing from our 
              players! Send your suggestions to our email and we'll consider them for 
              future updates.
            </p>
          </section>
        </article>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <Link href="/" style={styles.footerLink}>Home</Link>
          <Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link>
          <Link href="/terms" style={styles.footerLink}>Terms of Service</Link>
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
  subtitle: {
    color: '#666',
    fontSize: '18px',
    marginBottom: '40px',
  },
  section: {
    marginBottom: '40px',
  },
  heading: {
    fontSize: '24px',
    color: '#6B4EE6',
    marginBottom: '20px',
  },
  faq: {
    background: '#f8f8f8',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '15px',
  },
  question: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px',
  },
  answer: {
    color: '#666',
    margin: 0,
    lineHeight: 1.6,
  },
  contactCard: {
    background: 'linear-gradient(135deg, #6B4EE6 0%, #8B6CE6 100%)',
    padding: '30px',
    borderRadius: '16px',
    color: '#fff',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
  },
  contactIcon: {
    fontSize: '32px',
  },
  contactDetail: {
    margin: '5px 0 0 0',
    opacity: 0.9,
  },
  responseTime: {
    opacity: 0.8,
    fontSize: '14px',
    margin: 0,
  },
  list: {
    paddingLeft: '20px',
    lineHeight: 1.8,
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
