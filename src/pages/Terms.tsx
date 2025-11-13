import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using EatNavigator ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms & Conditions, please do not use the Service.
          </p>

          <h2>2. Use of Service</h2>
          <h3>2.1 Eligibility</h3>
          <p>
            You must be at least 13 years old to use this Service. By using the Service, you represent and warrant that you meet this age requirement.
          </p>

          <h3>2.2 Account Registration</h3>
          <p>
            To access certain features of the Service, you may need to register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
          </p>

          <h3>2.3 Account Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2>3. User Content</h2>
          <h3>3.1 Your Content</h3>
          <p>
            You retain ownership of any content you submit, post, or display on or through the Service ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display, and distribute such content.
          </p>

          <h3>3.2 Content Standards</h3>
          <p>You agree not to post User Content that:</p>
          <ul>
            <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
            <li>Infringes any patent, trademark, trade secret, copyright, or other proprietary rights</li>
            <li>Contains software viruses or any other computer code designed to interrupt, destroy, or limit functionality</li>
            <li>Is spam or unsolicited advertising</li>
            <li>Impersonates any person or entity</li>
          </ul>

          <h2>4. Restaurant Listings and Reviews</h2>
          <h3>4.1 Accuracy of Information</h3>
          <p>
            While we strive to provide accurate and up-to-date restaurant information, we cannot guarantee the accuracy, completeness, or reliability of any listing or review. Restaurant details, including hours, menu items, and prices, are subject to change.
          </p>

          <h3>4.2 Reviews and Ratings</h3>
          <p>
            Reviews and ratings reflect the opinions of individual users and do not represent the views of EatNavigator. We reserve the right to remove reviews that violate our content standards.
          </p>

          <h3>4.3 Restaurant Owner Claims</h3>
          <p>
            Restaurant owners may claim their listings and update certain information. By claiming a listing, owners agree to provide accurate information and comply with our verification process.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by EatNavigator and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2>6. Prohibited Activities</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorized access to any portion of the Service</li>
            <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
            <li>Use any automated means to access the Service or collect data</li>
            <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Service without permission</li>
          </ul>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL EATNAVIGATOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF THE SERVICE.
          </p>

          <h2>9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless EatNavigator and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the Service or violation of these Terms.
          </p>

          <h2>10. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms & Conditions.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Netherlands, without regard to its conflict of law provisions.
          </p>

          <h2>13. Contact Information</h2>
          <p>
            If you have any questions about these Terms & Conditions, please contact us at:
            <br />
            Email: info@eatnavigator.com
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
