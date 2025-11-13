import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const { t } = useTranslation();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    if (!recaptchaToken) {
      toast({
        title: t('contact.verificationRequired'),
        description: t('contact.verificationRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          ...data,
          recaptchaToken,
        },
      });

      if (error) throw error;

      toast({
        title: t('contact.messageSent'),
        description: t('contact.messageSentDesc'),
      });

      form.reset();
      setRecaptchaToken(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: t('contact.error'),
        description: t('contact.errorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t('contact.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t('contact.email')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">info@eatnavigator.com</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t('contact.location')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('contact.locationText')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Phone className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t('contact.support')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('contact.supportText')}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('contact.sendMessage')}</CardTitle>
              <CardDescription>{t('contact.sendMessageDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.name')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('contact.namePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contact.emailLabel')}</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('contact.emailPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.subject')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('contact.subjectPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('contact.message')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('contact.messagePlaceholder')}
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-center">
                    <ReCAPTCHA
                      sitekey="6LcliQssAAAAAAsxwMRSx2rRsvaG4iMLgsYh0s-K"
                      onChange={(token) => setRecaptchaToken(token)}
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? t('contact.sending') : t('contact.sendButton')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
