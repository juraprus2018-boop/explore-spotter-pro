import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>Introduction</h2>
          <p>
            EatNavigator ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>

          <h2>Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Register for an account</li>
            <li>Submit a restaurant review</li>
            <li>Claim a restaurant listing</li>
            <li>Contact us through our contact form</li>
            <li>Subscribe to our newsletter</li>
          </ul>
          <p>This information may include your name, email address, and any other information you choose to provide.</p>

          <h3>Automatically Collected Information</h3>
          <p>When you visit our website, we may automatically collect certain information about your device, including:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Referring website</li>
            <li>Pages visited and time spent on our site</li>
            <li>Location data (if you grant permission)</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process and manage your account</li>
            <li>Display your reviews and ratings</li>
            <li>Respond to your comments and questions</li>
            <li>Send you technical notices and support messages</li>
            <li>Communicate with you about products, services, and events</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, prevent, and address technical issues and fraud</li>
          </ul>

          <h2>Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data that are sent to your browser from a website and stored on your device.
          </p>
          <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.</p>

          <h2>Third-Party Services</h2>
          <p>We may use third-party services that collect, monitor, and analyze user behavior to improve our services. These third parties have their own privacy policies addressing how they use such information.</p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>Your Data Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul>
            <li>The right to access your personal data</li>
            <li>The right to rectification of inaccurate data</li>
            <li>The right to erasure of your data</li>
            <li>The right to restrict processing</li>
            <li>The right to data portability</li>
            <li>The right to object to processing</li>
          </ul>

          <h2>Children's Privacy</h2>
          <p>
            Our services are not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us.
          </p>

          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: info@eatnavigator.com
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
