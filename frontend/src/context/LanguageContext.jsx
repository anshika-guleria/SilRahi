import { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);

export const translations = {
  en: {
    // Nav
    home: "Home",
    findTailors: "Find Tailors",
    customer: "Customer",
    tailor: "Tailor",
    admin: "Admin",
    logout: "Logout",
    login: "Login",

    // Auth Page
    loginTab: "Login",
    signupTab: "Sign Up",
    roleLabel: "Select Role",
    roleCustomer: "Customer",
    roleTailor: "Tailor",
    name: "Full Name",
    email: "Email",
    phone: "Phone Number",
    password: "Password",
    address: "Shop / Work Address",
    addressPlaceholder: "House, street, area, city",
    loginBtn: "Login",
    createAccountBtn: "Create Account",
    orDivider: "or",
    googleBtn: "Continue with Google",
    googleRoleNote: "Google sign-in uses the selected role:",
    pleaseWait: "Please wait...",

    // Auth errors / messages
    loginSuccess: "Logged in successfully",

    // Landing Hero
    badge: "Earn through tailoring — Women's Platform",
    heroTitle1: "Find a",
    heroTitle2: "trusted tailor",
    heroTitle3: "near you.",
    heroDesc:
      "Book blouse, suit, lehenga, alteration and embroidery work from verified women tailors on Silrahi — easy and secure.",
    findTailorBtn: "Find Tailors",
    customerLogin: "Customer Login",
    tailorLogin: "Tailor Login",
    trust1: "Verified Profiles",
    trust2: "Free to Join",
    trust3: "Hindi Friendly",
    activeTailors: "1,200+ tailors active",
    avgRating: "4.9 avg rating",
    cardBadge: "Women-led work",
    cardTitle: "Earn, grow, and manage orders — all in one place.",
    feat1: "Verified profiles",
    feat2: "Nearby map discovery",
    feat3: "Track your earnings",
    feat4: "Hindi / English friendly",
    joinTailorBtn: "Join as a Tailor",

    // Stats
    stat1Label: "Active Tailors",
    stat2Label: "Bookings Done",
    stat3Label: "Cities Covered",
    stat4Label: "Customer Satisfaction",

    // Services
    servicesTitle: "What are you looking for?",
    servicesSubtitle: "Every type of stitching available here",

    // How it works
    howTitle: "How does Silrahi work?",
    tabCustomer: "Customer",
    tabTailor: "Tailor",
    customerJourney: "Customer Journey",
    tailorJourney: "Tailor Journey",
    simpleSteps: "4 simple steps",
    findTailorMap: "Find Tailor on Map",
    findTailorMapDesc: "Turn on location and explore the map of verified nearby tailors.",
    viewProfile: "View Profile & Reviews",
    viewProfileDesc: "Check ratings, photos and services with confidence.",
    bookAppointment: "Book Appointment",
    bookAppointmentDesc: "Get an appointment in one click and share your requirements.",
    pickupClothes: "Clothes Ready — Pickup!",
    pickupClothesDesc: "You will get a notification from the tailor when the work is done.",
    createProfile: "Create a Free Profile",
    createProfileDesc: "Add your skills, photos and location and go live.",
    adminVerify: "Admin Verification",
    adminVerifyDesc: "Once verified, customers can find you on the map.",
    receiveOrders: "Receive Orders",
    receiveOrdersDesc: "View new bookings and customer details on your dashboard.",
    trackEarnings: "Track Your Earnings",
    trackEarningsDesc: "All monthly earnings and orders in one place.",
    cStep1C: "Open Tailor Map",
    cStep2C: "View Profile",
    cStep3C: "Book Appointment",
    cStep4C: "Collect Clothes",
    cStep1T: "Create Profile",
    cStep2T: "Get Verified",
    cStep3T: "Receive Orders",
    cStep4T: "Earn Money",
    findTailorCta: "Find Tailors",
    joinNowCta: "Join Now",

    // Features
    featuresTitle: "Why choose Silrahi?",
    f1Title: "Verified Tailors",
    f1Desc: "Every tailor is verified by our admin team — complete protection from fake profiles.",
    f2Title: "Women's Platform",
    f2Desc: "Earn from home, manage orders and grow your business.",
    f3Title: "Map-based Search",
    f3Desc: "View a live map of nearby tailors and book in one click.",
    f4Title: "Reviews & Ratings",
    f4Desc: "Read real customer reviews and choose the right tailor with confidence.",
    f5Title: "Earnings Dashboard",
    f5Desc: "Tailors can track monthly earnings and orders all in one place.",
    f6Title: "Hindi Friendly",
    f6Desc: "The interface is comfortable in both Hindi and English.",

    // Testimonials
    testimonialsTitle: "What people are saying",
    t1Quote: "Found a great tailor near my home. The booking process was very smooth.",
    t1Name: "Priya Sharma",
    t1Role: "Customer, Jaipur",
    t2Quote: "Now I get orders sitting at home. Silrahi has increased my income.",
    t2Name: "Rekha Devi",
    t2Role: "Tailor, Lucknow",
    t3Quote: "Tailors are verified, so I trusted it completely. The blouse came out perfect.",
    t3Name: "Sunita Mehra",
    t3Role: "Customer, Delhi",
    t4Quote: "Creating a profile was very simple. Customers find me on the map themselves.",
    t4Name: "Geeta Kumari",
    t4Role: "Tailor, Patna",

    // CTA Banner
    ctaTitle: "Start Today",
    ctaDesc: "Whether you are a customer or a tailor — you are welcome on Silrahi. Free, fast and trusted.",
    ctaCustomer: "Find Tailors",
    ctaTailor: "Become a Tailor",
  },

  hi: {
    // Nav
    home: "होम",
    findTailors: "दर्ज़ी खोजें",
    customer: "ग्राहक",
    tailor: "दर्ज़ी",
    admin: "एडमिन",
    logout: "लॉगआउट",
    login: "लॉगिन",

    // Auth Page
    loginTab: "लॉगिन",
    signupTab: "साइन अप",
    roleLabel: "भूमिका चुनें",
    roleCustomer: "ग्राहक",
    roleTailor: "दर्ज़ी",
    name: "पूरा नाम",
    email: "ईमेल",
    phone: "फोन नंबर",
    password: "पासवर्ड",
    address: "दुकान / काम का पता",
    addressPlaceholder: "मकान, गली, इलाका, शहर",
    loginBtn: "लॉगिन करें",
    createAccountBtn: "अकाउंट बनाएं",
    orDivider: "या",
    googleBtn: "Google से जारी रखें",
    googleRoleNote: "Google साइन-इन चुनी हुई भूमिका का उपयोग करता है:",
    pleaseWait: "कृपया प्रतीक्षा करें...",

    loginSuccess: "सफलतापूर्वक लॉगिन हो गए",

    // Landing Hero
    badge: "सिलाई से स्वरोज़गार — महिलाओं का मंच",
    heroTitle1: "अपने पास की",
    heroTitle2: "विश्वसनीय दर्ज़ी",
    heroTitle3: "खोजिए।",
    heroDesc:
      "Silrahi पर सत्यापित महिला दर्ज़ियों से ब्लाउज़, सूट, लहंगा, बदलाव और कढ़ाई का काम बुक करें — आसान और सुरक्षित।",
    findTailorBtn: "दर्ज़ी खोजें",
    customerLogin: "ग्राहक लॉगिन",
    tailorLogin: "दर्ज़ी लॉगिन",
    trust1: "सत्यापित प्रोफाइल",
    trust2: "मुफ्त जॉइन करें",
    trust3: "हिंदी फ्रेंडली",
    activeTailors: "1,200+ दर्ज़ी सक्रिय",
    avgRating: "4.9 औसत रेटिंग",
    cardBadge: "महिला-नेतृत्व वाला काम",
    cardTitle: "कमाएं, बढ़ें और ऑर्डर मैनेज करें — एक ही जगह।",
    feat1: "सत्यापित प्रोफाइल",
    feat2: "नज़दीकी मैप खोज",
    feat3: "अपनी कमाई ट्रैक करें",
    feat4: "हिंदी / अंग्रेज़ी अनुकूल",
    joinTailorBtn: "दर्ज़ी के रूप में जॉइन करें",

    // Stats
    stat1Label: "सक्रिय दर्ज़ी",
    stat2Label: "बुकिंग हुई",
    stat3Label: "शहर कवर",
    stat4Label: "ग्राहक संतुष्टि",

    // Services
    servicesTitle: "आपको क्या चाहिए?",
    servicesSubtitle: "हर तरह की सिलाई यहाँ मिलेगी",

    // How it works
    howTitle: "Silrahi कैसे काम करता है?",
    tabCustomer: "👤 ग्राहक",
    tabTailor: "✂️ दर्ज़ी",
    customerJourney: "ग्राहक की यात्रा",
    tailorJourney: "दर्ज़ी की यात्रा",
    simpleSteps: "4 आसान कदम",
    findTailorMap: "मैप पर दर्ज़ी खोजें",
    findTailorMapDesc: "लोकेशन चालू करें और नज़दीकी सत्यापित दर्ज़ियों का मैप देखें।",
    viewProfile: "प्रोफाइल और समीक्षाएं देखें",
    viewProfileDesc: "आत्मविश्वास के साथ रेटिंग, फोटो और सेवाएं जांचें।",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    bookAppointmentDesc: "एक क्लिक में अपॉइंटमेंट लें और अपनी जरूरतें साझा करें।",
    pickupClothes: "कपड़े तैयार — लेकर जाएं!",
    pickupClothesDesc: "काम पूरा होने पर दर्ज़ी की तरफ से सूचना आएगी।",
    createProfile: "मुफ्त प्रोफाइल बनाएं",
    createProfileDesc: "अपनी कला, फोटो और लोकेशन जोड़ें और लाइव हो जाएं।",
    adminVerify: "एडमिन सत्यापन",
    adminVerifyDesc: "एक बार सत्यापित होने पर ग्राहक मैप पर आपको खोज सकते हैं।",
    receiveOrders: "ऑर्डर प्राप्त करें",
    receiveOrdersDesc: "अपने डैशबोर्ड पर नई बुकिंग और ग्राहक विवरण देखें।",
    trackEarnings: "अपनी कमाई ट्रैक करें",
    trackEarningsDesc: "हर महीने की कमाई और ऑर्डर एक ही जगह।",
    cStep1C: "दर्ज़ी मैप खोलें",
    cStep2C: "प्रोफाइल देखें",
    cStep3C: "बुकिंग करें",
    cStep4C: "कपड़े लें",
    cStep1T: "प्रोफाइल बनाएं",
    cStep2T: "सत्यापित हों",
    cStep3T: "ऑर्डर लें",
    cStep4T: "कमाई करें",
    findTailorCta: "दर्ज़ी खोजें",
    joinNowCta: "अभी जॉइन करें",

    // Features
    featuresTitle: "Silrahi क्यों चुनें?",
    f1Title: "सत्यापित दर्ज़ी",
    f1Desc: "हर दर्ज़ी को हमारी एडमिन टीम सत्यापित करती है — नकली प्रोफाइल से पूरी सुरक्षा।",
    f2Title: "महिलाओं का मंच",
    f2Desc: "घर बैठे कमाएं, ऑर्डर मैनेज करें और अपना व्यवसाय बढ़ाएं।",
    f3Title: "मैप-आधारित खोज",
    f3Desc: "नज़दीकी दर्ज़ियों का लाइव मैप देखें और एक क्लिक में बुकिंग करें।",
    f4Title: "समीक्षाएं और रेटिंग",
    f4Desc: "असली ग्राहकों की समीक्षाएं पढ़ें और सही दर्ज़ी चुनें।",
    f5Title: "कमाई डैशबोर्ड",
    f5Desc: "दर्ज़ी मासिक कमाई और ऑर्डर एक ही जगह ट्रैक कर सकती हैं।",
    f6Title: "हिंदी फ्रेंडली",
    f6Desc: "इंटरफेस हिंदी और अंग्रेज़ी दोनों में सहज है।",

    // Testimonials
    testimonialsTitle: "लोग क्या कहते हैं?",
    t1Quote: "मेरे घर के पास एक बहुत अच्छी दर्ज़ी मिली। बुकिंग प्रक्रिया बहुत आसान रही।",
    t1Name: "प्रिया शर्मा",
    t1Role: "ग्राहक, जयपुर",
    t2Quote: "अब मुझे घर बैठे ऑर्डर मिलते हैं। Silrahi ने मेरी कमाई बढ़ा दी।",
    t2Name: "रेखा देवी",
    t2Role: "दर्ज़ी, लखनऊ",
    t3Quote: "दर्ज़ी सत्यापित हैं, इसलिए पूरा भरोसा था। ब्लाउज़ बिल्कुल परफेक्ट बना।",
    t3Name: "सुनीता मेहरा",
    t3Role: "ग्राहक, दिल्ली",
    t4Quote: "प्रोफाइल बनाना बहुत आसान था। ग्राहक खुद मैप से ढूंढकर आते हैं।",
    t4Name: "गीता कुमारी",
    t4Role: "दर्ज़ी, पटना",

    // CTA Banner
    ctaTitle: "आज ही शुरू करें",
    ctaDesc: "ग्राहक हों या दर्ज़ी — Silrahi पर आपका स्वागत है। मुफ्त, तेज़ और विश्वसनीय।",
    ctaCustomer: "दर्ज़ी खोजें",
    ctaTailor: "दर्ज़ी बनें",
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const t = translations[lang];
  const toggle = () => setLang((l) => (l === "en" ? "hi" : "en"));

  return (
    <LanguageContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
