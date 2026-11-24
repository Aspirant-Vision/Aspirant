import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { TopAnnouncementBar } from "@/components/layout/top-announcement-bar";
import { TopNavBar } from "@/components/layout/top-nav-bar";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { StickyConsultationTab } from "@/components/layout/sticky-consultation-tab";
import { CounselingModalProvider } from "@/components/forms/counseling-modal-context";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#0B2240",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://aspirantvision.com"),
  title: {
    default: "Aspirant Vision | Your Gateway to Academic Excellence",
    template: "%s | Aspirant Vision",
  },
  description:
    "Expert guidance for admission into premier institutions across India. Data-driven insights, college comparisons, and verified placement records.",
  keywords: [
    "Aspirant Vision",
    "College Admissions",
    "Bhubaneswar Engineering Colleges",
    "KIIT University",
    "SOA University",
    "Centurion University",
    "CV Raman Global",
    "Engineering Admissions 2025",
    "MBA Admissions",
    "Academic Counseling",
  ],
  authors: [{ name: "Aspirant Vision" }],
  openGraph: {
    title: "Aspirant Vision | Find Your Dream College",
    description:
      "Expert admission guidance, NIRF rankings, verified fees & placement analytics for India's leading universities.",
    url: "https://aspirantvision.com",
    siteName: "Aspirant Vision",
    images: [
      {
        url: "/images/hero/students-hero.png",
        width: 1536,
        height: 1024,
        alt: "Aspirant Vision - Empowering Student Academic Success",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: "/images/logo/monogram.png",
    apple: "/images/logo/monogram.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        {/* Prevent hydration mismatches caused by Chrome autofill and password manager extensions injecting fdprocessedid */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var clean = function(node) {
                  if (node && node.nodeType === 1) {
                    if (node.hasAttribute('fdprocessedid')) {
                      node.removeAttribute('fdprocessedid');
                    }
                    var children = node.querySelectorAll ? node.querySelectorAll('[fdprocessedid]') : [];
                    for (var i = 0; i < children.length; i++) {
                      children[i].removeAttribute('fdprocessedid');
                    }
                  }
                };
                if (typeof MutationObserver !== 'undefined') {
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'fdprocessedid') {
                        m.target.removeAttribute('fdprocessedid');
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          clean(m.addedNodes[j]);
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['fdprocessedid']
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F7F8FC] text-[#15182D] antialiased flex flex-col selection:bg-red-100 selection:text-red-700" suppressHydrationWarning>
        <CounselingModalProvider>
          <TopNavBar />
          <main className="flex-grow pt-[68px] sm:pt-[72px]">{children}</main>
          <Footer />
          <FloatingWhatsApp />
          <StickyConsultationTab />
        </CounselingModalProvider>
      </body>
    </html>
  );
}
