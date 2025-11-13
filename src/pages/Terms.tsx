import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t('terms.seoTitle')}</title>
        <meta name="description" content={t('terms.seoDescription')} />
        <meta property="og:title" content={t('terms.seoTitle')} />
        <meta property="og:description" content={t('terms.seoDescription')} />
        <meta name="twitter:title" content={t('terms.seoTitle')} />
        <meta name="twitter:description" content={t('terms.seoDescription')} />
      </Helmet>
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h1 className="text-4xl font-bold text-foreground mb-8">{t('terms.title')}</h1>
          <p className="text-muted-foreground mb-8">
            {t('terms.lastUpdated')} {new Date().toLocaleDateString()}
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>{t('terms.acceptance')}</p>

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
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use any automated system to access the Service</li>
            <li>Collect information about other users without their consent</li>
          </ul>

          <h2>7. Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, secure, or error-free.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, EatNavigator shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
          </p>

          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date.
          </p>

          <h2>10. Contact Information</h2>
          <p>For questions about these Terms, please contact us at:</p>
          <p>Email: info@eatnavigator.com</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
