export type Language = 'en' | 'hi' | 'te';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
    te: string;
  };
}

export const translations: Translations = {
  // Navigation & Header
  'nav.shop_all': { en: 'Shop All', hi: 'सभी उत्पाद', te: 'అన్ని ఉత్పత్తులు' },
  'nav.ceramics_kitchen': { en: 'Ceramics & Kitchen', hi: 'सिरेमिक्स और रसोई', te: 'సిరామిక్స్ & వంటగది' },
  'nav.school_workspace': { en: 'School & Workspace', hi: 'स्कूल और कार्यस्थल', te: 'పాఠశాల & వర్క్‌స్పేస్' },
  'nav.our_story': { en: 'Our Story', hi: 'हमारी कहानी', te: 'మా కథ' },
  'nav.contact_faq': { en: 'Contact & FAQ', hi: 'संपर्क और सवाल', te: 'సంప్రదించండి & FAQ' },
  'nav.search_placeholder': { en: 'Search artisanal bowls, jars, bottles, bento...', hi: 'हस्तनिर्मित कटोरे, जार, बोतलें खोजें...', te: 'చేతితో తయారు చేసిన బౌల్స్, జాడీలు శోధించండి...' },
  'nav.account': { en: 'My Account', hi: 'मेरा खाता', te: 'నా ఖాతా' },
  'nav.admin_portal': { en: 'Admin Console', hi: 'व्यापार एडमिन', te: 'అడ్మిన్ కన్సోల్' },
  'nav.sign_in': { en: 'Sign In', hi: 'साइन इन करें', te: 'సైన్ ఇన్ చేయండి' },
  'nav.logout': { en: 'Sign Out', hi: 'साइन आउट', te: 'సైన్ అవుట్' },
  'nav.cart': { en: 'Cart', hi: 'कार्ट', te: 'కార్ట్' },
  'nav.wishlist': { en: 'Wishlist', hi: 'विशलिस्ट', te: 'విష్‌లిస్ట్' },

  // Landing Page
  'landing.title': { en: 'Bowls \'N\' Jars', hi: 'बाउल्स एंड जार्स', te: 'బౌల్స్ అండ్ జార్స్' },
  'landing.subtitle': { en: 'Handcrafted Ceramics for Everyday Living', hi: 'दैनिक जीवन के लिए हस्तनिर्मित सिरेमिक्स', te: 'రోజువారీ జీవనం కోసం చేతితో చేసిన సిరామిక్స్' },
  'landing.story': { 
    en: 'We believe the vessels we drink from, eat our daily meals in, and carry to study or work should feel grounding, natural, and built to outlive fast-fashion consumption. Our ceramics are crafted with intention to bring warmth to your everyday rituals.', 
    hi: 'हम मानते हैं कि जिन बर्तनों में हम पीते हैं, रोजमर्रा का भोजन करते हैं, और जिन्हें हम पढ़ाई या काम के लिए ले जाते हैं, वे प्राकृतिक और टिकाऊ होने चाहिए। हमारे सिरेमिक आपके दैनिक अनुष्ठानों में गर्माहट लाने के इरादे से बनाए गए हैं।', 
    te: 'మనం తాగే, తినే, మరియు చదువు లేదా పనికి తీసుకువెళ్లే పాత్రలు సహజంగా మరియు మన్నికగా ఉండాలని మేము నమ్ముతున్నాము. మా సిరామిక్స్ మీ రోజువారీ ఆచారాలకు వెచ్చదనాన్ని తీసుకురావడానికి ఉద్దేశపూర్వకంగా రూపొందించబడ్డాయి.' 
  },
  'landing.enter': { en: 'Enter the Shop', hi: 'दुकान में प्रवेश करें', te: 'దుకాణంలోకి ప్రవేశించండి' },

  // Hero Section (Now part of Shop)
  'hero.badge': { en: 'Handcrafted in Jaipur & Khurja • 100% Pure Clay', hi: 'जयपुर और खुर्जा में हस्तनिर्मित • 100% शुद्ध मिट्टी', te: 'జైపూర్ & ఖుర్జాలో చేతితో రూపొందించబడింది • 100% స్వచ్ఛమైన మట్టి' },
  'hero.title_1': { en: 'Handcrafted Ceramics', hi: 'हस्तनिर्मित सिरेमिक्स', te: 'చేతితో చేసిన సిరామిక్స్' },
  'hero.title_2': { en: 'for Everyday Living', hi: 'दैनिक जीवन के लिए', te: 'రోజువారీ జీవనం కోసం' },
  'hero.description': { en: 'Mindfully crafted stoneware bowls, spice jars, and eco-friendly school essentials. Fired at 1200°C for lifelong strength, 100% lead-free, and proudly shaped in India.', hi: 'सुंदर ढंग से तैयार किए गए पत्थर के कटोरे, मसालों के जार और पर्यावरण के अनुकूल स्कूल का सामान। 1200°C पर पकाया गया मजबूत, सीसा-मुक्त और भारत में निर्मित।', te: 'ప్రత్యేకంగా రూపొందించబడిన స్టోన్‌వేర్ బౌల్స్, మసాలా జాడీలు మరియు పర్యావరణ అనుకూల స్కూల్ వస్తువులు. 1200°C వద్ద తయారు చేయబడినవి, 100% లెడ్ రహితం.' },
  'hero.cta_shop': { en: 'Explore Collection', hi: 'कलेक्शन देखें', te: 'కలెక్షన్‌ను చూడండి' },
  'hero.cta_story': { en: 'Our Craft Story', hi: 'कारीगरी की कहानी', te: 'మా చేతివృత్తి కథ' },

  // Trust Pillars
  'pillar.lead_free': { en: 'Lead-Free & Food Safe', hi: 'सीसा रहित और सुरक्षित', te: 'లెడ్ రహిత & సురక్షితం' },
  'pillar.lead_free_sub': { en: 'Certified natural mineral glazes', hi: 'प्रमाणित प्राकृतिक खनिज ग्लेज़', te: 'ధృవీకరించబడిన సహజ మెరుపు' },
  'pillar.high_fired': { en: '1200°C High-Fired', hi: '1200°C पर पकी मिट्टी', te: '1200°C అధిక ఉష్ణోగ్రత వద్ద పక్వం' },
  'pillar.high_fired_sub': { en: 'Chip resistant & dishwasher safe', hi: 'मजबूत और डिशवॉशर सुरक्षित', te: 'గట్టిదనం మరియు సురక్షితం' },
  'pillar.sustainable': { en: 'Zero Plastic Packaging', hi: 'शून्य प्लास्टिक पैकेजिंग', te: 'జీరో ప్లాస్టిక్ ప్యాకేజింగ్' },
  'pillar.sustainable_sub': { en: '100% Recycled honeycomb craft', hi: 'पुनर्चक्रित सुरक्षित पैकेजिंग', te: 'పునర్వినియోగ భద్రత' },
  'pillar.artisans': { en: 'Indian Artisan Guild', hi: 'भारतीय कुम्हार विरासत', te: 'భారతీయ చేతివృత్తుల వారు' },
  'pillar.artisans_sub': { en: 'Jaipur & Khurja master potters', hi: 'जयपुर और खुर्जा के कारीगर', te: 'జైపూర్ & ఖుర్జా కుమ్మరులు' },

  // Home Sections
  'home.curated_lines': { en: 'Curated Lines', hi: 'विशेष श्रेणियां', te: 'ప్రత్యేక విభాగాలు' },
  'home.curated_title': { en: 'Crafted for Mindful Routines', hi: 'सजग जीवनशैली के लिए निर्मित', te: 'శ్రద్ధాపూర్వక జీవనం కోసం రూపకల్పన' },
  'home.curated_sub': { en: 'Whether preparing a slow morning feast or packing your daily essentials for study and work.', hi: 'चाहे सुबह का भोजन बनाना हो या स्कूल और ऑफिस के लिए आवश्यक सामान पैक करना हो।', te: 'ఉదయపు భోజనం సిద్ధం చేయాలన్నా లేదా పాఠశాల మరియు కార్యాలయానికి అవసరమైన వస్తువులను ప్యాక్ చేయాలన్నా.' },
  'home.bestsellers': { en: 'Best Sellers', hi: 'सर्वाधिक लोकप्रिय', te: 'బెస్ట్ సెల్లర్స్' },
  'home.view_all_bestsellers': { en: 'View All Bestsellers', hi: 'सभी लोकप्रिय देखें', te: 'అన్ని బెస్ట్ సెల్లర్స్ చూడండి' },
  'home.new_additions': { en: 'New Studio Additions', hi: 'स्टूडियो के नए उत्पाद', te: 'స్టూడియో కొత్త చేరికలు' },
  'home.explore_shop': { en: 'Explore Complete Shop', hi: 'पूरी दुकान देखें', te: 'పూర్తి దుకాణాన్ని చూడండి' },

  // Product Actions & Details
  'product.add_to_cart': { en: 'Add to Cart', hi: 'कार्ट में जोड़ें', te: 'కార్ట్‌కి జోడించండి' },
  'product.added': { en: 'Added!', hi: 'जोड़ दिया गया!', te: 'చేర్చబడింది!' },
  'product.in_stock': { en: 'In Stock', hi: 'स्टॉक में उपलब्ध', te: 'స్టాక్‌లో ఉంది' },
  'product.out_of_stock': { en: 'Out of Stock', hi: 'स्टॉक समाप्त', te: 'స్టాక్ అయిపోయింది' },
  'product.description': { en: 'Description', hi: 'विवरण', te: 'వివరణ' },
  'product.dimensions': { en: 'Dimensions', hi: 'आयाम', te: 'కొలతలు' },
  'product.care': { en: 'Care Instructions', hi: 'देखभाल के निर्देश', te: 'సంరక్షణ సూచనలు' },
  'product.reviews': { en: 'Customer Reviews', hi: 'ग्राहक समीक्षाएं', te: 'కస్టమర్ సమీక్షలు' },

  // Cart & Checkout
  'cart.your_bag': { en: 'Your Shopping Bag', hi: 'आपका शॉपिंग बैग', te: 'మీ షాపింగ్ బ్యాగ్' },
  'cart.subtotal': { en: 'Subtotal', hi: 'उप-कुल', te: 'ఉప మొత్తం' },
  'cart.shipping': { en: 'Shipping', hi: 'शिपिंग', te: 'షిప్పింగ్' },
  'cart.free_shipping': { en: 'FREE', hi: 'मुफ्त', te: 'ఉచితం' },
  'cart.checkout_btn': { en: 'Proceed to Checkout', hi: 'चेकआउट पर आगे बढ़ें', te: 'చెక్‌అవుట్‌కు కొనసాగండి' },
  'cart.empty': { en: 'Your bag is empty', hi: 'आपका बैग खाली है', te: 'మీ బ్యాగ్ ఖాళీగా ఉంది' },
  'checkout.shipping_address': { en: 'Shipping Address', hi: 'शिपिंग पता', te: 'షిప్పింగ్ చిరునామా' },
  'checkout.payment_method': { en: 'Payment Method', hi: 'भुगतान का तरीका', te: 'చెల్లింపు పద్ధతి' },
  'checkout.place_order': { en: 'Place Order', hi: 'ऑर्डर करें', te: 'ఆదేశాన్ని ఉంచండి' },
  'checkout.full_name': { en: 'Full Name', hi: 'पूरा नाम', te: 'పూర్తి పేరు' },
  'checkout.street': { en: 'House/Flat No. & Street', hi: 'मकान संख्या और गली', te: 'ఇంటి నంబర్ & వీధి' },
  'checkout.city': { en: 'City', hi: 'शहर', te: 'నగరం' },
  'checkout.state': { en: 'State', hi: 'राज्य', te: 'రాష్ట్రం' },
  'checkout.pincode': { en: 'PIN Code', hi: 'पिन कोड', te: 'పిన్ కోడ్' },

  // Auth & Account
  'auth.login': { en: 'Login', hi: 'लॉगिन', te: 'లాగిన్' },
  'auth.register': { en: 'Create Account', hi: 'खाता बनाएं', te: 'ఖాతాను సృష్టించండి' },
  'auth.email': { en: 'Email Address', hi: 'ईमेल पता', te: 'ఇమెయిల్ చిరునామా' },
  'auth.password': { en: 'Password', hi: 'पासवर्ड', te: 'పాస్వర్డ్' },
  'auth.submit': { en: 'Submit', hi: 'जमा करें', te: 'సమర్పించండి' },
  'auth.no_account': { en: 'Don\'t have an account?', hi: 'क्या आपके पास खाता नहीं है?', te: 'ఖాతా లేదా?' },
  'auth.has_account': { en: 'Already have an account?', hi: 'क्या आपके पास पहले से खाता है?', te: 'ఇప్పటికే ఖాతా ఉందా?' },
  'account.order_history': { en: 'Order History', hi: 'ऑर्डर इतिहास', te: 'ఆర్డర్ చరిత్ర' },
  'account.profile': { en: 'Profile Details', hi: 'प्रोफ़ाइल विवरण', te: 'ప్రొఫైల్ వివరాలు' },

  // Admin Dashboard
  'admin.dashboard': { en: 'Business Console', hi: 'व्यापार कंसोल', te: 'బిజినెస్ కన్సోల్' },
  'admin.overview': { en: 'Overview', hi: 'अवलोकन', te: 'అవలోకనం' },
  'admin.orders': { en: 'Orders', hi: 'ऑर्डर', te: 'ఆర్డర్లు' },
  'admin.products': { en: 'Products', hi: 'उत्पाद', te: 'ఉత్పత్తులు' },
  'admin.settings': { en: 'Settings', hi: 'सेटिंग्स', te: 'సెట్టింగులు' },
  'admin.revenue': { en: 'Total Revenue', hi: 'कुल राजस्व', te: 'మొత్తం రాబడి' },
  'admin.total_orders': { en: 'Total Orders', hi: 'कुल ऑर्डर', te: 'మొత్తం ఆర్డర్లు' },
  'admin.avg_order': { en: 'Avg. Order Value', hi: 'औसत ऑर्डर मूल्य', te: 'సగటు ఆర్డర్ విలువ' },
  'admin.add_product': { en: 'Add Product', hi: 'उत्पाद जोड़ें', te: 'ఉత్పత్తిని జోడించండి' },
  'admin.edit_product': { en: 'Edit Product', hi: 'उत्पाद संपादित करें', te: 'ఉత్పత్తిని సవరించండి' },
  'admin.status': { en: 'Status', hi: 'स्थिति', te: 'స్థితి' },
  'admin.actions': { en: 'Actions', hi: 'कार्रवाई', te: 'చర్యలు' },
  'admin.save': { en: 'Save Changes', hi: 'परिवर्तन सहेजें', te: 'మార్పులను సేవ్ చేయండి' },
  'admin.cancel': { en: 'Cancel', hi: 'रद्द करें', te: 'రద్దు చేయండి' },

  // Shop / Filters
  'shop.filters': { en: 'Filters', hi: 'फ़िल्टर', te: 'ఫిల్టర్లు' },
  'shop.materials': { en: 'Materials', hi: 'सामग्री', te: 'మెటీరియల్స్' },
  'shop.colors': { en: 'Colors', hi: 'रंग', te: 'రంగులు' },
  'shop.sort_by': { en: 'Sort By', hi: 'क्रमबद्ध करें', te: 'దీని ద్వారా క్రమబద్ధీకరించండి' },
  'shop.clear_all': { en: 'Clear All', hi: 'सभी साफ करें', te: 'అన్నీ క్లియర్ చేయండి' },
};
