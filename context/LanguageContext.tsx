"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

export const LANGUAGE_STORAGE_KEY = "nyaymitra_language";

export type AppLanguage =
  | "English"
  | "Hindi"
  | "Marathi"
  | "Bengali"
  | "Gujarati"
  | "Tamil"
  | "Telugu"
  | "Kannada"
  | "Malayalam"
  | "Punjabi"
  | "Urdu";

type TranslationMap = Record<string, string>;

const LABELS: Record<AppLanguage, string> = {
  English: "English",
  Hindi: "हिन्दी",
  Marathi: "मराठी",
  Bengali: "বাংলা",
  Gujarati: "ગુજરાતી",
  Tamil: "தமிழ்",
  Telugu: "తెలుగు",
  Kannada: "ಕನ್ನಡ",
  Malayalam: "മലയാളം",
  Punjabi: "ਪੰਜਾਬੀ",
  Urdu: "اردو",
};

const EN_DEFAULTS: TranslationMap = {
  "common.loading": "Loading...",
  "chat.processingError": "Sorry, I am having trouble processing your request. Please try again.",
  "chat.speechUnsupported": "Speech recognition is not supported in this browser. Please use Chrome.",
  "chat.signInRequired": "Please sign in to access chat...",
  "chat.addMobileTitle": "Add mobile number",
  "chat.addMobileSubtitle": "Please add your mobile number before starting chat. We save it in your Data Connect profile.",
  "chat.saveContinue": "Save and Continue",
  "chat.mobileValidation": "Please enter a valid mobile number (10 to 13 digits)",
  "chat.language": "Language",
  "chat.privacy": "Your conversations are private and protected by NyayMitra",
  "chat.selectIssue": "Select your issue type first:",
  "results.formRequired": "Please fill in all required fields",
  "results.formPhone": "Please enter a valid phone number",
  "results.formSubmitError": "Failed to book appointment. Please try again.",
  "results.formUnexpected": "An unexpected error occurred. Please try again.",
  "results.right1.title": "Right to Wages",
  "results.right1.desc": "You are entitled to be paid within 7 days of the wage period under the Payment of Wages Act.",
  "results.right2.title": "Protection from Unfair Dismissal",
  "results.right2.desc": "An employer must provide proper notice before termination under the Industrial Disputes Act.",
  "results.right3.title": "Right to Free Legal Aid",
  "results.right3.desc": "As a worker earning less than ₹3 Lakh/year, you qualify for entirely free legal representation.",
  "results.gatherEvidenceDesc": "Collect all employment contracts, ID cards, and WhatsApp messages with your employer.",
  "results.draftComplaintDesc": "Write a simple timeline of events in your preferred language.",
  "results.visitCenterDesc": "Book an appointment or walk into a Legal Aid center listed below.",
  "results.center": "Center",
  "results.yourName": "Your Name",
  "results.namePlaceholder": "Ramesh Kumar",
  "results.phoneNumber": "Phone Number",
  "results.phonePlaceholder": "9876543210",
  "results.preferredDate": "Preferred Date",
  "results.timeOptional": "Time (Optional)",
  "results.briefDescription": "Brief Description",
  "results.descriptionPlaceholder": "Explain your legal issue briefly (e.g., unpaid wages, harassment, contract dispute)...",
  "results.descriptionHelp": "This helps the legal advisor prepare for your consultation",
  "results.booking": "Booking...",
  "results.confirmBooking": "Confirm Booking",
  "results.bookConsultation": "Book Consultation",
  "results.confidential": "All information is kept completely confidential.",
  "results.requestSent": "Your appointment request has been sent!",
  "appointments.noneDesc": "Submit a legal query and book an appointment with a legal aid center to get started.",
  "appointments.awaiting": "Awaiting Confirmation",
  "appointments.status.confirmed": "confirmed",
  "appointments.status.completed": "completed",
  "appointments.status.cancelled": "cancelled",
  "appointments.legalCenter": "Legal Center",
  "appointments.dateTime": "Date & Time",
  "appointments.yourDetails": "Your Details",
  "appointments.issueSummary": "Issue Summary",
  "appointments.viewDetails": "View Details",
  "appointments.cancel": "Cancel",
  "appointments.bookedOn": "Booked on",
  "appointments.important": "Important Information",
  "appointments.tip1": "✓ Arrive 15 minutes before your scheduled time",
  "appointments.tip2": "✓ Bring relevant documents (employment contract, ID, etc.)",
  "appointments.tip3": "✓ All consultations are confidential and free",
  "appointments.tip4": "✓ Call the center ahead if you need to reschedule",
  "appointments.loadError": "Failed to load appointments. Please try again.",
  "appointments.noSummary": "No summary provided",
  "common.now": "Now",
  "admin.adminConsole": "Admin Console",
  "admin.protectedDashboard": "Protected dashboard for managing centers and monitoring live queries.",
  "admin.adminEmail": "Admin Email",
  "admin.password": "Password",
  "admin.systemStatus": "System Status",
  "admin.loadingLiveData": "Loading live data...",
  "admin.liveDataConnected": "Live data connected",
  "admin.centers": "Centers",
  "admin.liveRowsCenters": "Live rows from Firestore",
  "admin.queries": "Queries",
  "admin.recentQueryRecords": "Recent query records",
  "admin.appointments": "Appointments",
  "admin.bookedRows": "Booked rows from the database",
  "admin.recentQueries": "Recent Queries",
  "admin.recentAppointments": "Recent Appointments",
  "admin.live": "Live",
  "admin.timestamp": "Timestamp",
  "admin.category": "Category",
  "admin.language": "Language",
  "admin.urgency": "Urgency",
  "admin.noRecentQueries": "No recent queries found.",
  "admin.noRecentAppointments": "No recent appointments found.",
  "admin.noCentersFound": "No centers found in the database.",
  "admin.manageCenters": "Manage Centers",
  "admin.centerName": "Center Name",
  "admin.contactSetup": "Contact Setup",
  "admin.coordinatesAddress": "Coordinates & Address",
  "admin.fullAddress": "Full Address...",
  "admin.addToDatabase": "Add to Database",
  "admin.monitorDesc": "Monitor live queries and keep legal centers up to date from one place.",
};

const hi: TranslationMap = {
  "nav.ask": "पूछें",
  "nav.appointments": "अपॉइंटमेंट",
  "nav.signIn": "साइन इन",
  "nav.signOut": "साइन आउट",
  "nav.language": "भाषा",
  "home.badge": "मुफ्त और सुलभ कानूनी सहायता",
  "home.title1": "आपको अपनी",
  "home.title2": "कानूनी लड़ाई अकेले नहीं लड़नी",
  "home.subtitle": "हम कठिन कानूनी भाषा को सरल बनाते हैं, आपको अधिकृत कानूनी सहायता केंद्रों से जोड़ते हैं और आपके अधिकारों की रक्षा करते हैं।",
  "home.cta": "अपनी समस्या बताएं",
  "home.stat1": "नागरिक सक्षम",
  "home.stat2": "भारत में वकील",
  "home.stat3": "मुफ्त मार्गदर्शन",
  "auth.welcomeBack": "वापसी पर स्वागत है",
  "auth.signInContinue": "जारी रखने के लिए साइन इन करें",
  "auth.email": "ईमेल पता",
  "auth.password": "पासवर्ड",
  "auth.signingIn": "साइन इन हो रहा है...",
  "auth.signIn": "साइन इन",
  "auth.orContinue": "या जारी रखें",
  "auth.newTo": "NyayMitra में नए हैं?",
  "auth.createAccount": "खाता बनाएं",
  "signup.title": "खाता बनाएं",
  "signup.subtitle": "सुरक्षित कानूनी सहायता के लिए जुड़ें",
  "signup.fullName": "पूरा नाम",
  "signup.mobile": "मोबाइल नंबर",
  "signup.createPassword": "पासवर्ड बनाएं",
  "signup.creating": "खाता बनाया जा रहा है...",
  "chat.pickLanguage": "अपनी भाषा चुनें",
  "chat.pickSubtitle": "एक बार चुनें। NyayMitra पूरी तरह इसी भाषा में उत्तर देगा।",
  "chat.intakeTitle": "पहले अपनी समस्या का प्रकार चुनें:",
  "intake.labor.label": "काम / वेतन समस्या",
  "intake.domestic.label": "घरेलू हिंसा",
  "intake.tenancy.label": "किराया / आवास",
  "intake.consumer.label": "उपभोक्ता शिकायत",
  "intake.family.label": "परिवार / विवाह",
  "intake.land.label": "भूमि विवाद",
  "intake.labor.question": "क्या आप यहां 3 महीने से अधिक समय से कार्यरत हैं?",
  "intake.domestic.question": "क्या आप अभी सुरक्षित स्थान पर हैं?",
  "intake.tenancy.question": "क्या आपके पास लिखित किराया समझौता है?",
  "intake.consumer.question": "क्या आपके पास खरीद की रसीद या बिल है?",
  "intake.family.question": "क्या कोई कोर्ट केस पहले से दर्ज है?",
  "intake.land.question": "क्या आपके पास स्वामित्व दस्तावेज हैं?",
  "common.yes": "हाँ",
  "common.no": "नहीं",
  "chat.completeIntake": "पहले भाषा और प्रश्न पूरे करें",
  "chat.processingError": "क्षमा करें, मैं आपका अनुरोध प्रोसेस नहीं कर पा रहा हूं। कृपया फिर से प्रयास करें।",
  "chat.speechUnsupported": "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया Chrome का उपयोग करें।",
  "chat.signInRequired": "चैट उपयोग करने के लिए साइन इन करें...",
  "chat.addMobileTitle": "मोबाइल नंबर जोड़ें",
  "chat.addMobileSubtitle": "चैट शुरू करने से पहले मोबाइल नंबर जोड़ें। यह आपके Data Connect प्रोफाइल में सेव होगा।",
  "chat.saveContinue": "सेव करें और जारी रखें",
  "chat.mobileValidation": "कृपया वैध मोबाइल नंबर दर्ज करें (10 से 13 अंक)",
  "chat.language": "भाषा",
  "chat.privacy": "आपकी बातचीत निजी है और NyayMitra द्वारा सुरक्षित है",
  "chat.selectIssue": "पहले अपनी समस्या का प्रकार चुनें:",
  "results.title": "आपकी कानूनी मार्गदर्शिका",
  "results.nextSteps": "अगले कदम",
  "results.centers": "नजदीकी कानूनी केंद्र",
  "results.book": "बुक करें",
  "results.urgent": "तुरंत मदद चाहिए? महिला हेल्पलाइन: 181, पुलिस: 100",
  "results.category": "श्रेणी पहचानी गई",
  "results.rights": "अपने अधिकार जानें",
  "results.gatherEvidence": "सबूत एकत्र करें",
  "results.draftComplaint": "शिकायत का मसौदा बनाएं",
  "results.visitCenter": "मुफ्त केंद्र जाएं",
  "results.loadingCenters": "डेटाबेस से कानूनी केंद्र लोड हो रहे हैं...",
  "results.noCenters": "डेटाबेस में कोई कानूनी केंद्र नहीं मिला।",
  "results.formRequired": "कृपया सभी आवश्यक फ़ील्ड भरें",
  "results.formPhone": "कृपया वैध फोन नंबर दर्ज करें",
  "results.formSubmitError": "अपॉइंटमेंट बुक नहीं हो पाई। कृपया फिर से प्रयास करें।",
  "results.formUnexpected": "एक अप्रत्याशित त्रुटि हुई। कृपया फिर से प्रयास करें।",
  "results.right1.title": "वेतन का अधिकार",
  "results.right1.desc": "Payment of Wages Act के अनुसार आपको वेतन अवधि के 7 दिनों के भीतर भुगतान का अधिकार है।",
  "results.right2.title": "अनुचित बर्खास्तगी से सुरक्षा",
  "results.right2.desc": "Industrial Disputes Act के तहत समाप्ति से पहले उचित नोटिस देना अनिवार्य है।",
  "results.right3.title": "मुफ्त कानूनी सहायता का अधिकार",
  "results.right3.desc": "यदि आपकी आय ₹3 लाख/वर्ष से कम है, तो आप मुफ्त कानूनी सहायता के पात्र हैं।",
  "results.gatherEvidenceDesc": "रोजगार अनुबंध, आईडी कार्ड और नियोक्ता के साथ संदेश एकत्र करें।",
  "results.draftComplaintDesc": "अपनी पसंदीदा भाषा में घटनाओं की सरल टाइमलाइन लिखें।",
  "results.visitCenterDesc": "नीचे दिए गए कानूनी सहायता केंद्र में अपॉइंटमेंट बुक करें या सीधे जाएं।",
  "results.center": "केंद्र",
  "results.yourName": "आपका नाम",
  "results.phoneNumber": "फोन नंबर",
  "results.preferredDate": "पसंदीदा तिथि",
  "results.timeOptional": "समय (वैकल्पिक)",
  "results.briefDescription": "संक्षिप्त विवरण",
  "results.descriptionHelp": "इससे कानूनी सलाहकार आपकी बैठक की तैयारी कर सकता है",
  "results.booking": "बुक हो रहा है...",
  "results.confirmBooking": "बुकिंग की पुष्टि करें",
  "results.bookConsultation": "परामर्श बुक करें",
  "results.confidential": "सारी जानकारी पूरी तरह गोपनीय रखी जाती है।",
  "results.requestSent": "आपका अपॉइंटमेंट अनुरोध भेज दिया गया है!",
  "appointments.title": "आपकी अपॉइंटमेंट",
  "appointments.subtitle": "अपनी कानूनी सलाह अपॉइंटमेंट ट्रैक करें",
  "appointments.loading": "आपकी अपॉइंटमेंट लोड हो रही हैं...",
  "appointments.none": "अभी कोई अपॉइंटमेंट नहीं",
  "appointments.noneDesc": "शुरू करने के लिए कानूनी प्रश्न भेजें और किसी कानूनी सहायता केंद्र में अपॉइंटमेंट बुक करें।",
  "appointments.submitQuery": "कानूनी प्रश्न भेजें",
  "appointments.awaiting": "पुष्टि की प्रतीक्षा में",
  "appointments.legalCenter": "कानूनी केंद्र",
  "appointments.dateTime": "तारीख और समय",
  "appointments.yourDetails": "आपकी जानकारी",
  "appointments.issueSummary": "समस्या सारांश",
  "appointments.viewDetails": "विवरण देखें",
  "appointments.cancel": "रद्द करें",
  "appointments.bookedOn": "बुक किया गया",
  "appointments.important": "महत्वपूर्ण जानकारी",
  "appointments.tip1": "✓ निर्धारित समय से 15 मिनट पहले पहुंचें",
  "appointments.tip2": "✓ आवश्यक दस्तावेज साथ लाएं",
  "appointments.tip3": "✓ सभी परामर्श गोपनीय और मुफ्त हैं",
  "appointments.tip4": "✓ रीशेड्यूल के लिए केंद्र को पहले कॉल करें",
  "appointments.loadError": "अपॉइंटमेंट लोड नहीं हो सके। कृपया फिर से प्रयास करें।",
  "appointments.noSummary": "कोई सारांश उपलब्ध नहीं है",
  "common.now": "अभी",
  "admin.adminConsole": "एडमिन कंसोल",
  "admin.protectedDashboard": "केंद्र प्रबंधन और लाइव क्वेरी निगरानी के लिए सुरक्षित डैशबोर्ड।",
  "admin.adminEmail": "एडमिन ईमेल",
  "admin.password": "पासवर्ड",
  "admin.systemStatus": "सिस्टम स्थिति",
  "admin.loadingLiveData": "लाइव डेटा लोड हो रहा है...",
  "admin.liveDataConnected": "लाइव डेटा जुड़ा हुआ है",
  "admin.centers": "केंद्र",
  "admin.liveRowsCenters": "Firestore से लाइव पंक्तियाँ",
  "admin.queries": "प्रश्न",
  "admin.recentQueryRecords": "हाल की क्वेरी रिकॉर्ड",
  "admin.appointments": "अपॉइंटमेंट",
  "admin.bookedRows": "डेटाबेस से बुक की गई पंक्तियाँ",
  "admin.recentQueries": "हाल की क्वेरियाँ",
  "admin.recentAppointments": "हाल की अपॉइंटमेंट",
  "admin.live": "लाइव",
  "admin.timestamp": "समय",
  "admin.category": "श्रेणी",
  "admin.language": "भाषा",
  "admin.urgency": "तत्कालता",
  "admin.noRecentQueries": "कोई हाल की क्वेरी नहीं मिली।",
  "admin.noRecentAppointments": "कोई हाल की अपॉइंटमेंट नहीं मिली।",
  "admin.noCentersFound": "डेटाबेस में कोई केंद्र नहीं मिला।",
  "admin.manageCenters": "केंद्र प्रबंधित करें",
  "admin.centerName": "केंद्र का नाम",
  "admin.contactSetup": "संपर्क सेटअप",
  "admin.coordinatesAddress": "निर्देशांक और पता",
  "admin.fullAddress": "पूरा पता...",
  "admin.addToDatabase": "डेटाबेस में जोड़ें",
  "admin.monitorDesc": "एक ही जगह से लाइव क्वेरियाँ मॉनिटर करें और कानूनी केंद्र अपडेट रखें।",
  "admin.invalidCreds": "अमान्य एडमिन क्रेडेंशियल",
  "admin.checking": "एक्सेस जांच रहे हैं",
  "admin.verifying": "आपकी Firebase एडमिन पहुंच सत्यापित हो रही है।",
  "admin.access": "एडमिन एक्सेस",
  "admin.accessDashboard": "डैशबोर्ड खोलें",
  "admin.denied": "प्रवेश अस्वीकृत",
  "admin.overview": "डैशबोर्ड अवलोकन",
  "map.title": "नजदीकी कानूनी केंद्र",
  "map.subtitle": "Google Map यहाँ प्रदर्शित होगा",
};

const mr: TranslationMap = {
  "nav.ask": "विचारा",
  "nav.appointments": "अपॉइंटमेंट",
  "nav.signIn": "साइन इन",
  "nav.signOut": "साइन आउट",
  "nav.language": "भाषा",
  "home.badge": "मोफत आणि सुलभ कायदेशीर मदत",
  "home.title1": "तुम्हाला तुमची",
  "home.title2": "कायदेशीर लढाई एकट्याने लढावी लागणार नाही",
  "home.subtitle": "आम्ही गुंतागुंतीची कायदेशीर भाषा सोपी करतो, अधिकृत केंद्रांशी जोडतो आणि तुमचे हक्क जपतो.",
  "home.cta": "तुमची समस्या सांगा",
  "home.stat1": "सक्षम नागरिक",
  "home.stat2": "भारतामधील वकील",
  "home.stat3": "मोफत मार्गदर्शन",
  "auth.welcomeBack": "पुन्हा स्वागत",
  "auth.signInContinue": "पुढे जाण्यासाठी साइन इन करा",
  "auth.email": "ईमेल पत्ता",
  "auth.password": "पासवर्ड",
  "auth.signingIn": "साइन इन सुरू आहे...",
  "auth.signIn": "साइन इन",
  "auth.orContinue": "किंवा पुढे जा",
  "auth.newTo": "NyayMitra मध्ये नवीन आहात?",
  "auth.createAccount": "खाते तयार करा",
  "signup.title": "खाते तयार करा",
  "signup.subtitle": "सुरक्षित कायदेशीर मदतीसाठी सामील व्हा",
  "signup.fullName": "पूर्ण नाव",
  "signup.mobile": "मोबाइल नंबर",
  "signup.createPassword": "पासवर्ड तयार करा",
  "signup.creating": "खाते तयार होत आहे...",
  "chat.pickLanguage": "तुमची भाषा निवडा",
  "chat.pickSubtitle": "एकदा निवडा. NyayMitra पूर्णपणे याच भाषेत उत्तर देईल.",
  "chat.intakeTitle": "प्रथम तुमच्या समस्येचा प्रकार निवडा:",
  "intake.labor.label": "काम / पगार समस्या",
  "intake.domestic.label": "घरगुती हिंसा",
  "intake.tenancy.label": "भाडे / निवास",
  "intake.consumer.label": "ग्राहक तक्रार",
  "intake.family.label": "कुटुंब / विवाह",
  "intake.land.label": "जमीन वाद",
  "intake.labor.question": "तुम्ही येथे 3 महिन्यांपेक्षा जास्त काळ काम करत आहात का?",
  "intake.domestic.question": "तुम्ही सध्या सुरक्षित ठिकाणी आहात का?",
  "intake.tenancy.question": "तुमच्याकडे लिखित भाडेकरार आहे का?",
  "intake.consumer.question": "खरेदीची पावती किंवा बिल आहे का?",
  "intake.family.question": "कोर्टात आधीच केस दाखल आहे का?",
  "intake.land.question": "तुमच्याकडे मालकीचे कागदपत्र आहेत का?",
  "common.yes": "होय",
  "common.no": "नाही",
  "chat.completeIntake": "आधी भाषा आणि प्रश्न पूर्ण करा",
  "chat.processingError": "क्षमस्व, तुमची विनंती प्रक्रिया करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.",
  "chat.speechUnsupported": "या ब्राउझरमध्ये स्पीच सपोर्ट नाही. कृपया Chrome वापरा.",
  "chat.signInRequired": "चॅट वापरण्यासाठी साइन इन करा...",
  "chat.addMobileTitle": "मोबाइल नंबर जोडा",
  "chat.addMobileSubtitle": "चॅट सुरू करण्यापूर्वी मोबाइल नंबर जोडा. तो Data Connect प्रोफाइलमध्ये जतन केला जाईल.",
  "chat.saveContinue": "जतन करा आणि पुढे चला",
  "chat.mobileValidation": "वैध मोबाइल नंबर टाका (10 ते 13 अंक)",
  "chat.language": "भाषा",
  "chat.privacy": "तुमचे संभाषण खाजगी आणि सुरक्षित आहे",
  "chat.selectIssue": "आधी तुमच्या समस्येचा प्रकार निवडा:",
  "results.title": "तुमचे कायदेशीर मार्गदर्शन",
  "results.nextSteps": "पुढील पावले",
  "results.centers": "जवळची कायदेशीर केंद्रे",
  "results.book": "बुक करा",
  "results.urgent": "तत्काळ मदत हवी आहे? महिला हेल्पलाइन: 181, पोलिस: 100",
  "results.category": "ओळखलेली श्रेणी",
  "results.rights": "तुमचे हक्क जाणून घ्या",
  "results.gatherEvidence": "पुरावे गोळा करा",
  "results.draftComplaint": "तक्रार मसुदा तयार करा",
  "results.visitCenter": "मोफत केंद्राला भेट द्या",
  "results.loadingCenters": "डेटाबेसमधून केंद्रे लोड होत आहेत...",
  "results.noCenters": "डेटाबेसमध्ये कोणतीही केंद्रे आढळली नाहीत.",
  "results.formRequired": "कृपया सर्व आवश्यक फील्ड भरा",
  "results.formPhone": "कृपया वैध फोन नंबर टाका",
  "results.formSubmitError": "अपॉइंटमेंट बुक करण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
  "results.formUnexpected": "अनपेक्षित त्रुटी झाली. कृपया पुन्हा प्रयत्न करा.",
  "results.right1.title": "वेतनाचा हक्क",
  "results.right1.desc": "Payment of Wages Act नुसार वेतन 7 दिवसांत मिळण्याचा तुम्हाला हक्क आहे.",
  "results.right2.title": "अन्यायकारक कामावरून काढण्यापासून संरक्षण",
  "results.right2.desc": "Industrial Disputes Act नुसार कामावरून काढताना योग्य नोटीस आवश्यक आहे.",
  "results.right3.title": "मोफत कायदेशीर मदतीचा हक्क",
  "results.right3.desc": "तुमची वार्षिक कमाई ₹3 लाखांपेक्षा कमी असल्यास तुम्ही मोफत मदतीस पात्र आहात.",
  "results.gatherEvidenceDesc": "रोजगार करार, ओळखपत्रे आणि नियोक्त्यासोबतचे संदेश जमा करा.",
  "results.draftComplaintDesc": "तुमच्या पसंतीच्या भाषेत घटनांची साधी टाइमलाइन लिहा.",
  "results.visitCenterDesc": "खालील कायदेशीर केंद्रात अपॉइंटमेंट बुक करा किंवा थेट भेट द्या.",
  "results.center": "केंद्र",
  "results.yourName": "तुमचे नाव",
  "results.phoneNumber": "फोन नंबर",
  "results.preferredDate": "पसंतीची तारीख",
  "results.timeOptional": "वेळ (ऐच्छिक)",
  "results.briefDescription": "संक्षिप्त वर्णन",
  "results.descriptionHelp": "यामुळे सल्लागाराला तुमच्या सल्लामसलतीची तयारी करणे सोपे जाते",
  "results.booking": "बुक होत आहे...",
  "results.confirmBooking": "बुकिंग पुष्टी करा",
  "results.bookConsultation": "सल्लामसलत बुक करा",
  "results.confidential": "सर्व माहिती पूर्णपणे गोपनीय ठेवली जाते.",
  "results.requestSent": "तुमची अपॉइंटमेंट विनंती पाठवली गेली आहे!",
  "appointments.title": "तुमच्या अपॉइंटमेंट",
  "appointments.subtitle": "तुमच्या कायदेशीर सल्लामसलतींचा मागोवा घ्या",
  "appointments.loading": "तुमच्या अपॉइंटमेंट लोड होत आहेत...",
  "appointments.none": "अजून अपॉइंटमेंट नाही",
  "appointments.noneDesc": "सुरुवात करण्यासाठी कायदेशीर प्रश्न पाठवा आणि केंद्रात अपॉइंटमेंट बुक करा.",
  "appointments.submitQuery": "कायदेशीर प्रश्न पाठवा",
  "appointments.awaiting": "पुष्टीची प्रतीक्षा",
  "appointments.legalCenter": "कायदेशीर केंद्र",
  "appointments.dateTime": "तारीख आणि वेळ",
  "appointments.yourDetails": "तुमची माहिती",
  "appointments.issueSummary": "समस्येचा सारांश",
  "appointments.viewDetails": "तपशील पहा",
  "appointments.cancel": "रद्द करा",
  "appointments.bookedOn": "बुक केले",
  "appointments.important": "महत्त्वाची माहिती",
  "appointments.tip1": "✓ ठरलेल्या वेळेच्या 15 मिनिटे आधी या",
  "appointments.tip2": "✓ आवश्यक कागदपत्रे सोबत आणा",
  "appointments.tip3": "✓ सर्व सल्लामसलती गोपनीय आणि मोफत आहेत",
  "appointments.tip4": "✓ वेळ बदलायची असल्यास आधी केंद्राशी संपर्क करा",
  "appointments.loadError": "अपॉइंटमेंट लोड होऊ शकल्या नाहीत. कृपया पुन्हा प्रयत्न करा.",
  "appointments.noSummary": "सारांश उपलब्ध नाही",
  "common.now": "आत्ता",
  "admin.adminConsole": "अॅडमिन कन्सोल",
  "admin.protectedDashboard": "केंद्र व्यवस्थापन आणि लाइव्ह क्वेरी देखरेखीसाठी सुरक्षित डॅशबोर्ड.",
  "admin.adminEmail": "अॅडमिन ईमेल",
  "admin.password": "पासवर्ड",
  "admin.systemStatus": "सिस्टम स्थिती",
  "admin.loadingLiveData": "लाइव्ह डेटा लोड होत आहे...",
  "admin.liveDataConnected": "लाइव्ह डेटा जोडलेला आहे",
  "admin.centers": "केंद्रे",
  "admin.liveRowsCenters": "Firestore मधील लाइव्ह पंक्ती",
  "admin.queries": "प्रश्न",
  "admin.recentQueryRecords": "अलीकडील क्वेरी नोंदी",
  "admin.appointments": "अपॉइंटमेंट",
  "admin.bookedRows": "डेटाबेसमधील बुक केलेल्या पंक्ती",
  "admin.recentQueries": "अलीकडील क्वेर्या",
  "admin.recentAppointments": "अलीकडील अपॉइंटमेंट",
  "admin.live": "लाइव्ह",
  "admin.timestamp": "वेळ",
  "admin.category": "श्रेणी",
  "admin.language": "भाषा",
  "admin.urgency": "तातडी",
  "admin.noRecentQueries": "अलीकडील क्वेर्या सापडल्या नाहीत.",
  "admin.noRecentAppointments": "अलीकडील अपॉइंटमेंट सापडल्या नाहीत.",
  "admin.noCentersFound": "डेटाबेसमध्ये कोणतीही केंद्रे सापडली नाहीत.",
  "admin.manageCenters": "केंद्रे व्यवस्थापित करा",
  "admin.centerName": "केंद्राचे नाव",
  "admin.contactSetup": "संपर्क सेटअप",
  "admin.coordinatesAddress": "निर्देशांक आणि पत्ता",
  "admin.fullAddress": "पूर्ण पत्ता...",
  "admin.addToDatabase": "डेटाबेसमध्ये जोडा",
  "admin.monitorDesc": "एकाच ठिकाणी लाइव्ह क्वेर्या पहा आणि कायदेशीर केंद्रे अद्ययावत ठेवा.",
  "admin.invalidCreds": "अवैध अॅडमिन माहिती",
  "admin.checking": "प्रवेश तपासत आहोत",
  "admin.verifying": "तुमचा Firebase अॅडमिन प्रवेश पडताळत आहोत.",
  "admin.access": "अॅडमिन प्रवेश",
  "admin.accessDashboard": "डॅशबोर्ड उघडा",
  "admin.denied": "प्रवेश नाकारला",
  "admin.overview": "डॅशबोर्ड आढावा",
  "map.title": "जवळची कायदेशीर केंद्रे",
  "map.subtitle": "Google नकाशा येथे दिसेल",
};

const TRANSLATIONS: Partial<Record<AppLanguage, TranslationMap>> = {
  Hindi: hi,
  Marathi: mr,
};

const LANGUAGE_LISTENERS = new Set<() => void>();

function notifyLanguageListeners() {
  for (const listener of LANGUAGE_LISTENERS) {
    listener();
  }
}

function subscribeToLanguageStore(callback: () => void) {
  LANGUAGE_LISTENERS.add(callback);
  return () => {
    LANGUAGE_LISTENERS.delete(callback);
  };
}

function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "English";
  }

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as AppLanguage | null;
  return saved && LABELS[saved] ? saved : "English";
}

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  label: string;
  languages: AppLanguage[];
  t: (key: string, fallback: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [runtimeTranslations, setRuntimeTranslations] = useState<Partial<Record<AppLanguage, TranslationMap>>>({});

  const language = useSyncExternalStore<AppLanguage>(
    subscribeToLanguageStore,
    readStoredLanguage,
    () => "English",
  );

  useEffect(() => {
    const shouldAutoTranslate = language !== "English" && language !== "Hindi" && language !== "Marathi";
    if (!shouldAutoTranslate || runtimeTranslations[language]) {
      return;
    }

    const loadTranslations = async () => {
      try {
        const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";
        const response = await fetch(`${BACKEND_BASE_URL}/api/query/translate-ui`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetLanguage: language,
            entries: Object.entries(EN_DEFAULTS).map(([key, text]) => ({ key, text })),
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const translatedMap: TranslationMap = {};
        for (const item of data?.translations || []) {
          if (item?.key && item?.text) {
            translatedMap[item.key] = item.text;
          }
        }

        setRuntimeTranslations((prev) => ({ ...prev, [language]: translatedMap }));
      } catch {
        // Keep fallback text if translation service is unavailable.
      }
    };

    void loadTranslations();
  }, [language, runtimeTranslations]);

  const setLanguage = (next: AppLanguage) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    notifyLanguageListeners();
  };

  const value = useMemo<LanguageContextValue>(() => {
    const staticMap = TRANSLATIONS[language] || {};
    const dynamicMap = runtimeTranslations[language] || {};
    const map = { ...dynamicMap, ...staticMap };
    return {
      language,
      setLanguage,
      label: LABELS[language],
      languages: Object.keys(LABELS) as AppLanguage[],
      t: (key: string, fallback: string) => map[key] || fallback,
    };
  }, [language, runtimeTranslations]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
