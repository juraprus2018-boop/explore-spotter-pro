import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Globe, Award } from "lucide-react";

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('about.title')}</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('about.subtitle')}
          </p>

          <div className="prose prose-lg max-w-none mb-12">
            <p>{t('about.intro')}</p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">{t('about.storyTitle')}</h2>
            <p>{t('about.story')}</p>

            <h2 className="text-2xl font-bold mt-8 mb-4">{t('about.offerTitle')}</h2>
            <p>{t('about.offer')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('about.globalCoverage')}</h3>
                <p className="text-muted-foreground">
                  {t('about.globalCoverageDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('about.communityDriven')}</h3>
                <p className="text-muted-foreground">
                  {t('about.communityDrivenDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Globe className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('about.multilingual')}</h3>
                <p className="text-muted-foreground">
                  {t('about.multilingualDesc')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">{t('about.qualityFirst')}</h3>
                <p className="text-muted-foreground">
                  {t('about.qualityFirstDesc')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">{t('about.joinTitle')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('about.joinDesc')}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
