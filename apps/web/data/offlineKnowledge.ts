export type OfflineIntent = {
  intent: string;
  category: string;
  phrases: {
    en: string[];
    ta: string[];
    tanglish: string[];
    mixed: string[];
  };
  responses: {
    en: string[];
    ta: string[];
  };
};

export const OFFLINE_KNOWLEDGE: OfflineIntent[] = [
  // --- GREETINGS & BASICS ---
  {
    intent: 'GREETING',
    category: 'basics',
    phrases: {
      en: ['hello', 'hi', 'hey', 'greetings', 'hey partner', 'hello partner', 'hi partner'],
      ta: ['வணக்கம்', 'ஹலோ', 'ஹாய்', 'ஹே பார்ட்னர்', 'வணக்கம் பார்ட்னர்'],
      tanglish: ['vanakkam', 'hello partner', 'hai partner', 'hai', 'he', 'hey partner'],
      mixed: ['vanakkam partner', 'hello vanakkam']
    },
    responses: {
      en: ['Hello! How can I help you today?', 'Hi there! I am ready.', 'Greetings! What can I do for you?'],
      ta: ['வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?', 'ஹலோ! நான் தயாராக இருக்கிறேன்.']
    }
  },
  {
    intent: 'GOOD_MORNING',
    category: 'basics',
    phrases: {
      en: ['good morning', 'morning partner', 'good morning partner'],
      ta: ['காலை வணக்கம்', 'குட் மார்னிங்'],
      tanglish: ['kaalai vanakkam', 'good morning'],
      mixed: ['good morning partner', 'kaalai vanakkam partner']
    },
    responses: {
      en: ['Good morning! I hope you have a great day.', 'Morning! How can I assist you today?'],
      ta: ['காலை வணக்கம்! இன்றைய நாள் இனிய நாளாக அமையட்டும்.', 'காலை வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?']
    }
  },
  {
    intent: 'GOOD_AFTERNOON',
    category: 'basics',
    phrases: {
      en: ['good afternoon', 'afternoon partner'],
      ta: ['மதிய வணக்கம்', 'குட் ஆஃப்டர்நூன்'],
      tanglish: ['mathiya vanakkam', 'good afternoon'],
      mixed: ['good afternoon partner']
    },
    responses: {
      en: ['Good afternoon! How can I help?', 'Good afternoon!'],
      ta: ['மதிய வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?', 'மதிய வணக்கம்!']
    }
  },
  {
    intent: 'GOOD_EVENING',
    category: 'basics',
    phrases: {
      en: ['good evening', 'evening partner'],
      ta: ['மாலை வணக்கம்', 'குட் ஈவினிங்'],
      tanglish: ['maalai vanakkam', 'good evening'],
      mixed: ['good evening partner']
    },
    responses: {
      en: ['Good evening! How was your day?', 'Good evening!'],
      ta: ['மாலை வணக்கம்! உங்கள் நாள் எப்படி இருந்தது?', 'மாலை வணக்கம்!']
    }
  },
  {
    intent: 'GOOD_NIGHT',
    category: 'basics',
    phrases: {
      en: ['good night', 'night partner', 'sleep well'],
      ta: ['இரவு வணக்கம்', 'குட் நைட்', 'நன்றாக தூங்கு'],
      tanglish: ['iravu vanakkam', 'good night', 'nalla thoongu'],
      mixed: ['good night partner']
    },
    responses: {
      en: ['Good night! Sleep well.', 'Good night! See you tomorrow.'],
      ta: ['இரவு வணக்கம்! நன்றாக தூங்குங்கள்.', 'இரவு வணக்கம்! நாளை பார்க்கலாம்.']
    }
  },
  {
    intent: 'HOW_ARE_YOU',
    category: 'basics',
    phrases: {
      en: ['how are you', 'how are you doing', 'how is it going', 'are you doing well'],
      ta: ['எப்படி இருக்கிறாய்', 'நீ எப்படி இருக்கிறாய்', 'நலமா'],
      tanglish: ['epdi iruka', 'eppadi iruka', 'eppadi irukkiraai', 'nalama'],
      mixed: ['how are you partner', 'partner epdi iruka']
    },
    responses: {
      en: ['I am doing great, thank you for asking! How can I help you?', 'I am just a program, but I am ready to help!'],
      ta: ['நான் நன்றாக இருக்கிறேன், கேட்டதற்கு நன்றி! உங்களுக்கு என்ன வேண்டும்?', 'நான் ஒரு மென்பொருள், உங்களுக்கு உதவ தயாராக இருக்கிறேன்.']
    }
  },
  {
    intent: 'ARE_YOU_THERE',
    category: 'basics',
    phrases: {
      en: ['are you there', 'can you hear me', 'are you listening', 'partner are you there'],
      ta: ['நீ இருக்கிறாயா', 'என்னைக் கேட்கிறாயா', 'இருக்கிறாயா'],
      tanglish: ['nee irukkiya', 'irukiya', 'kekutha', 'ennai kekuriya'],
      mixed: ['partner nee irukkiya', 'can you hear me partner']
    },
    responses: {
      en: ['Yes, I am here and listening.', 'I am always here for you.'],
      ta: ['ஆம், நான் இங்கே இருக்கிறேன், கேட்கிறேன்.', 'ஆம், நான் உங்களுக்காக தயாராக இருக்கிறேன்.']
    }
  },
  {
    intent: 'IDENTITY',
    category: 'basics',
    phrases: {
      en: ['who are you', 'what are you', 'are you an ai', 'are you ai', 'who created you'],
      ta: ['நீ யார்', 'நீ யார் என்று சொல்லு', 'நீ ஒரு AI ஆ', 'நீ செயற்கை நுண்ணறிவா'],
      tanglish: ['nee yaaru', 'nee yaar', 'nee oru AI ah', 'nee AI ah', 'nee enna'],
      mixed: ['who are you partner', 'partner nee yaaru', 'are you an ai partner']
    },
    responses: {
      en: ['I am Partner, an AI voice assistant created to help you with your daily tasks.'],
      ta: ['நான் பார்ட்னர், உங்கள் அன்றாட வேலைகளுக்கு உதவும் ஒரு செயற்கை நுண்ணறிவு உதவியாளர்.']
    }
  },
  {
    intent: 'YOUR_NAME',
    category: 'basics',
    phrases: {
      en: ['what is your name', 'your name', 'tell me your name'],
      ta: ['உன் பெயர் என்ன', 'உன்னுடைய பெயர் என்ன'],
      tanglish: ['un peru enna', 'unga peru enna', 'un name enna'],
      mixed: ['what is your name partner', 'partner un peru enna']
    },
    responses: {
      en: ['My name is Partner.'],
      ta: ['என் பெயர் பார்ட்னர்.']
    }
  },
  {
    intent: 'WHAT_CAN_YOU_DO',
    category: 'basics',
    phrases: {
      en: ['what can you do', 'what do you do', 'tell me what you can do', 'capabilities'],
      ta: ['நீ என்ன செய்ய முடியும்', 'உன்னால் என்ன செய்ய முடியும்', 'என்ன செய்வாய்'],
      tanglish: ['nee enna panna mudiyum', 'unnaala enna panna mudiyum', 'enna panra'],
      mixed: ['what can you do partner', 'partner nee enna panna mudiyum']
    },
    responses: {
      en: ['I can tell you the time, perform calculations, answer basic programming questions, and connect to Gemini for complex questions.'],
      ta: ['என்னால் நேரம் சொல்ல முடியும், கணக்கிட முடியும், நிரலாக்க கேள்விகளுக்கு பதிலளிக்க முடியும். கடினமான கேள்விகளுக்கு ஜெமினியைப் பயன்படுத்துவேன்.']
    }
  },
  {
    intent: 'HELP',
    category: 'basics',
    phrases: {
      en: ['help', 'help me', 'can you help me', 'i need help'],
      ta: ['எனக்கு உதவி செய்', 'உதவி வேண்டும்', 'உன்னிடம் என்ன கேட்கலாம்'],
      tanglish: ['enakku help pannu', 'help pannu', 'un kitta enna kekalam', 'udhavi venum'],
      mixed: ['partner enakku help pannu', 'help me partner']
    },
    responses: {
      en: ['Sure! I can help you with time, math, coding basics, or general questions. Just ask!'],
      ta: ['கண்டிப்பாக! நேரம், கணக்கு, மற்றும் பொதுவான கேள்விகளுக்கு நான் உதவி செய்வேன். கேளுங்கள்!']
    }
  },
  {
    intent: 'THANKS',
    category: 'basics',
    phrases: {
      en: ['thanks', 'thank you', 'thank you so much', 'thank you partner'],
      ta: ['நன்றி', 'மிக்க நன்றி', 'ரொம்ப நன்றி', 'நன்றி பார்ட்னர்'],
      tanglish: ['nandri', 'romba nandri', 'thanks partner', 'thank you partner'],
      mixed: ['nandri partner', 'thank you romba nandri']
    },
    responses: {
      en: ['You are welcome!', 'Glad I could help!', 'Anytime!'],
      ta: ['வரவேற்கிறேன்!', 'உதவியதில் மகிழ்ச்சி!', 'எப்போது வேண்டுமானாலும் கேளுங்கள்!']
    }
  },
  {
    intent: 'GOODBYE',
    category: 'basics',
    phrases: {
      en: ['goodbye', 'bye', 'bye bye', 'see you', 'see you later'],
      ta: ['பை', 'போய் வருகிறேன்', 'பிறகு பேசலாம்', 'விடைபெறுகிறேன்'],
      tanglish: ['bye partner', 'poitu varen', 'aprom pesalam', 'bye'],
      mixed: ['bye partner poitu varen', 'see you partner']
    },
    responses: {
      en: ['Goodbye! Have a great day!', 'Bye! Feel free to call me if you need anything.'],
      ta: ['போய் வாருங்கள்! உங்கள் நாள் இனிதாக அமையட்டும்.', 'பை! பிறகு பேசலாம்.']
    }
  },
  {
    intent: 'STOP_LISTENING',
    category: 'command',
    phrases: {
      en: ['stop listening', 'stop', 'quiet', 'shut up', 'enough'],
      ta: ['இப்போது போதும்', 'நிறுத்து', 'கேட்பதை நிறுத்து', 'பேசுவதை நிறுத்து', 'அமைதி'],
      tanglish: ['ippo pothum', 'stop', 'kekuratha niruthu', 'pesuratha niruthu', 'amaithi'],
      mixed: ['stop listening pannunga', 'partner stop']
    },
    responses: {
      en: ['Stopping.'],
      ta: ['நிறுத்துகிறேன்.']
    }
  },
  
  // --- UTILITIES ---
  {
    intent: 'GET_TIME',
    category: 'utility',
    phrases: {
      en: ['what time is it', 'what is the time', 'tell me the time', 'current time', 'time now', 'can you tell me the time', 'what is the current time'],
      ta: ['மணி என்ன', 'நேரம் என்ன', 'இப்போது மணி என்ன', 'இப்போ மணி என்ன', 'தற்போதைய நேரம் என்ன', 'நேரத்தை சொல்லு', 'இப்போது நேரம் சொல்லு'],
      tanglish: ['mani enna', 'neram enna', 'ippo mani enna', 'ippo neram enna', 'current time enna', 'time enna', 'time sollu', 'enakku time sollu'],
      mixed: ['time enna partner', 'partner ippo time sollu', 'ippo current time enna']
    },
    responses: {
      en: ['[DYNAMIC_TIME]'],
      ta: ['[DYNAMIC_TIME]']
    }
  },
  {
    intent: 'GET_DATE',
    category: 'utility',
    phrases: {
      en: ['what is the date', 'what is today\'s date', 'tell me the date', 'today\'s date', 'what date is it'],
      ta: ['இன்று என்ன தேதி', 'இன்றைய தேதி என்ன', 'தேதி என்ன', 'இன்றைய தேதியை சொல்லு'],
      tanglish: ['innaiku enna date', 'indraya date enna', 'date enna', 'today enna date', 'innaiki date enna'],
      mixed: ['today enna date', 'innaiku what date', 'partner innaiki date enna']
    },
    responses: {
      en: ['[DYNAMIC_DATE]'],
      ta: ['[DYNAMIC_DATE]']
    }
  },
  {
    intent: 'GET_DAY',
    category: 'utility',
    phrases: {
      en: ['what day is it', 'what is today', 'what day is today'],
      ta: ['இன்று என்ன கிழமை', 'இன்றைக்கு என்ன கிழமை'],
      tanglish: ['innaiku enna kizhama', 'today enna day', 'innaiku enna day'],
      mixed: ['today enna kizhama', 'innaiku what day']
    },
    responses: {
      en: ['[DYNAMIC_DAY]'],
      ta: ['[DYNAMIC_DAY]']
    }
  },
  {
    intent: 'CALCULATE',
    category: 'utility',
    phrases: {
      en: ['calculate', 'what is plus', 'what is minus', 'divided by', 'times', 'multiplied by', 'what is'],
      ta: ['கூட்டல்', 'கழித்தால்', 'பெருக்கல்', 'வகுத்தால்', 'எவ்வளவு'],
      tanglish: ['plus', 'minus', 'times', 'divide by', 'evlo', 'calculate pannu'],
      mixed: ['calculate pannu', 'evlo partner']
    },
    responses: {
      en: ['[DYNAMIC_CALC]'],
      ta: ['[DYNAMIC_CALC]']
    }
  },
  
  // --- SYSTEM CONTROL ---
  {
    intent: 'SPEAK_FASTER',
    category: 'command',
    phrases: {
      en: ['speak faster', 'talk faster', 'go faster'],
      ta: ['வேகமாக பேசு'],
      tanglish: ['fast ah pesu', 'konjam fast ah pesu', 'vegama pesu'],
      mixed: ['partner konjam fast ah pesu', 'speak fast ah']
    },
    responses: {
      en: ['I will speak faster now.'],
      ta: ['இப்போது வேகமாக பேசுகிறேன்.']
    }
  },
  {
    intent: 'SPEAK_SLOWER',
    category: 'command',
    phrases: {
      en: ['speak slower', 'talk slower', 'go slower'],
      ta: ['மெதுவாக பேசு', 'சற்று மெதுவாக பேசு'],
      tanglish: ['slow ah pesu', 'konjam slow ah pesu', 'medhuva pesu'],
      mixed: ['partner konjam slow ah pesu', 'speak slow ah']
    },
    responses: {
      en: ['I will speak slower now.'],
      ta: ['இப்போது மெதுவாக பேசுகிறேன்.']
    }
  },
  {
    intent: 'REPEAT',
    category: 'command',
    phrases: {
      en: ['repeat that', 'say that again', 'what did you say'],
      ta: ['மீண்டும் சொல்', 'இன்னொரு முறை சொல்'],
      tanglish: ['repeat pannu', 'again sollu', 'thirumba sollu', 'innoru thadava sollu'],
      mixed: ['repeat pannu partner', 'say it again']
    },
    responses: {
      en: ['[REPEAT]'],
      ta: ['[REPEAT]']
    }
  },
  {
    intent: 'CLEAR_CHAT',
    category: 'command',
    phrases: {
      en: ['clear chat', 'clear conversation', 'reset chat', 'start over'],
      ta: ['உரையாடலை அழி', 'புதிதாக தொடங்கு'],
      tanglish: ['clear pannu', 'clear conversation pannu', 'reset pannu', 'first la irundhu'],
      mixed: ['clear chat pannu', 'partner clear pannu']
    },
    responses: {
      en: ['I have cleared our conversation.'],
      ta: ['நான் நமது உரையாடலை அழித்துவிட்டேன்.']
    }
  },

  // --- PROGRAMMING FAQ ---
  {
    intent: 'WHAT_IS_HTML',
    category: 'faq',
    phrases: {
      en: ['what is html', 'explain html', 'tell me about html'],
      ta: ['HTML என்றால் என்ன', 'HTML பற்றி சொல்'],
      tanglish: ['HTML na enna', 'HTML pathi sollu'],
      mixed: ['HTML na enna partner']
    },
    responses: {
      en: ['HTML stands for HyperText Markup Language. It is the standard language used to create and design websites.'],
      ta: ['HTML என்பது இணையதளங்களை உருவாக்கப் பயன்படும் ஒரு அடிப்படை மொழியாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_CSS',
    category: 'faq',
    phrases: {
      en: ['what is css', 'explain css', 'tell me about css'],
      ta: ['CSS என்றால் என்ன', 'CSS பற்றி சொல்'],
      tanglish: ['CSS na enna', 'CSS pathi sollu'],
      mixed: ['CSS na enna partner']
    },
    responses: {
      en: ['CSS stands for Cascading Style Sheets. It is used to style and layout web pages.'],
      ta: ['CSS என்பது இணையதளங்களை அழகாக வடிவமைக்க பயன்படும் ஒரு மொழியாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_JAVASCRIPT',
    category: 'faq',
    phrases: {
      en: ['what is javascript', 'what is js', 'explain javascript'],
      ta: ['JavaScript என்றால் என்ன', 'ஜாவாஸ்கிரிப்ட் என்றால் என்ன'],
      tanglish: ['JavaScript na enna', 'JS na enna', 'JavaScript pathi sollu'],
      mixed: ['JavaScript na enna partner']
    },
    responses: {
      en: ['JavaScript is a programming language that allows you to implement complex features and interactivity on web pages.'],
      ta: ['JavaScript என்பது இணையதளங்களில் ஊடாடும் அம்சங்களை சேர்க்க பயன்படும் ஒரு நிரலாக்க மொழியாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_JAVA',
    category: 'faq',
    phrases: {
      en: ['what is java', 'explain java'],
      ta: ['Java என்றால் என்ன', 'ஜாவா என்றால் என்ன'],
      tanglish: ['Java na enna', 'Java pathi sollu'],
      mixed: ['Java na enna partner']
    },
    responses: {
      en: ['Java is a high-level, class-based, object-oriented programming language used to build many types of applications.'],
      ta: ['Java என்பது பல வகையான பயன்பாடுகளை உருவாக்க பயன்படுத்தப்படும் ஒரு பிரபலமான நிரலாக்க மொழி.']
    }
  },
  {
    intent: 'WHAT_IS_PYTHON',
    category: 'faq',
    phrases: {
      en: ['what is python', 'explain python'],
      ta: ['Python என்றால் என்ன', 'பைதான் என்றால் என்ன'],
      tanglish: ['Python na enna', 'Python pathi sollu'],
      mixed: ['Python na enna partner']
    },
    responses: {
      en: ['Python is a popular programming language known for its simplicity and readability. It is widely used in data science and web development.'],
      ta: ['Python என்பது படிக்க எளிதான ஒரு பிரபலமான நிரலாக்க மொழி. இது தரவு அறிவியல் மற்றும் இணைய மேம்பாட்டில் அதிகம் பயன்படுத்தப்படுகிறது.']
    }
  },
  {
    intent: 'WHAT_IS_REACT',
    category: 'faq',
    phrases: {
      en: ['what is react', 'what is react js', 'explain react'],
      ta: ['React என்றால் என்ன', 'ரியாக்ட் என்றால் என்ன'],
      tanglish: ['React na enna', 'React JS na enna', 'React pathi sollu'],
      mixed: ['React na enna partner']
    },
    responses: {
      en: ['React is a JavaScript library used for building user interfaces, mostly for single-page applications.'],
      ta: ['React என்பது வலைத்தளங்களின் பயனர் இடைமுகங்களை உருவாக்க பயன்படும் ஒரு JavaScript லைப்ரரி ஆகும்.']
    }
  },
  {
    intent: 'WHAT_IS_NEXTJS',
    category: 'faq',
    phrases: {
      en: ['what is next js', 'what is nextjs', 'explain next js'],
      ta: ['Next.js என்றால் என்ன'],
      tanglish: ['Next js na enna', 'Next js pathi sollu'],
      mixed: ['Nextjs na enna partner']
    },
    responses: {
      en: ['Next.js is a React framework that gives you building blocks to create web applications with features like server-side rendering.'],
      ta: ['Next.js என்பது React-ஐ அடிப்படையாகக் கொண்ட ஒரு கட்டமைப்பு. இது இணையதளங்களை வேகமாக உருவாக்க உதவுகிறது.']
    }
  },
  {
    intent: 'WHAT_IS_API',
    category: 'faq',
    phrases: {
      en: ['what is an api', 'what is api', 'explain api'],
      ta: ['API என்றால் என்ன'],
      tanglish: ['API na enna', 'API pathi sollu'],
      mixed: ['API na enna partner']
    },
    responses: {
      en: ['API stands for Application Programming Interface. It is a way for two or more computer programs to communicate with each other.'],
      ta: ['API என்பது இரண்டு வெவ்வேறு மென்பொருள்கள் ஒன்றுடன் ஒன்று தொடர்புகொள்ள உதவும் ஒரு வழியாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_AI',
    category: 'faq',
    phrases: {
      en: ['what is ai', 'what is artificial intelligence', 'explain ai'],
      ta: ['செயற்கை நுண்ணறிவு என்றால் என்ன', 'AI என்றால் என்ன'],
      tanglish: ['AI na enna', 'artificial intelligence na enna'],
      mixed: ['AI na enna partner']
    },
    responses: {
      en: ['AI, or Artificial Intelligence, is the simulation of human intelligence in machines that are programmed to think and learn like humans.'],
      ta: ['செயற்கை நுண்ணறிவு என்பது இயந்திரங்கள் மனிதர்களைப் போல சிந்திக்கவும் செயல்படவும் உருவாக்கப்பட்ட ஒரு தொழில்நுட்பமாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_MACHINE_LEARNING',
    category: 'faq',
    phrases: {
      en: ['what is machine learning', 'what is ml', 'explain machine learning'],
      ta: ['இயந்திர கற்றல் என்றால் என்ன', 'Machine learning என்றால் என்ன'],
      tanglish: ['Machine learning na enna', 'ML na enna'],
      mixed: ['Machine learning na enna partner']
    },
    responses: {
      en: ['Machine learning is a branch of AI that focuses on building systems that learn from data, instead of being explicitly programmed.'],
      ta: ['இயந்திர கற்றல் என்பது தரவுகளை பயன்படுத்தி தானாகவே கற்றுக்கொள்ளும் ஒரு செயற்கை நுண்ணறிவு தொழில்நுட்பம்.']
    }
  },
  {
    intent: 'WHAT_IS_GEMINI',
    category: 'faq',
    phrases: {
      en: ['what is gemini', 'explain gemini'],
      ta: ['Gemini என்றால் என்ன', 'ஜெமினி என்றால் என்ன'],
      tanglish: ['Gemini na enna', 'Gemini pathi sollu'],
      mixed: ['Gemini na enna partner']
    },
    responses: {
      en: ['Gemini is a highly capable AI model developed by Google.'],
      ta: ['ஜெமினி என்பது கூகுள் உருவாக்கிய மிகவும் மேம்பட்ட ஒரு செயற்கை நுண்ணறிவு மாதிரி.']
    }
  },
  {
    intent: 'WHAT_IS_PROGRAMMING',
    category: 'faq',
    phrases: {
      en: ['what is programming', 'what is coding', 'explain programming'],
      ta: ['நிரலாக்கம் என்றால் என்ன', 'புரோகிராமிங் என்றால் என்ன'],
      tanglish: ['programming na enna', 'coding na enna'],
      mixed: ['programming na enna partner']
    },
    responses: {
      en: ['Programming is the process of writing instructions that a computer can understand and execute to perform a specific task.'],
      ta: ['புரோகிராமிங் என்பது ஒரு குறிப்பிட்ட பணியை செய்ய கணினிக்கு கட்டளைகளை வழங்கும் முறையாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_ALGORITHM',
    category: 'faq',
    phrases: {
      en: ['what is an algorithm', 'explain algorithm'],
      ta: ['அல்காரிதம் என்றால் என்ன'],
      tanglish: ['algorithm na enna', 'algorithm pathi sollu'],
      mixed: ['algorithm na enna partner']
    },
    responses: {
      en: ['An algorithm is a step-by-step set of instructions designed to perform a specific task or solve a problem.'],
      ta: ['அல்காரிதம் என்பது ஒரு சிக்கலைத் தீர்ப்பதற்கான படிப்படியான வழிமுறையாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_VARIABLE',
    category: 'faq',
    phrases: {
      en: ['what is a variable', 'explain variable'],
      ta: ['மாறி என்றால் என்ன', 'வேரியபிள் என்றால் என்ன'],
      tanglish: ['variable na enna'],
      mixed: ['variable na enna partner']
    },
    responses: {
      en: ['A variable is a container for storing data values in a computer program.'],
      ta: ['வேரியபிள் என்பது நிரலாக்கத்தில் தரவுகளை சேமித்து வைக்கும் ஒரு கொள்கலன் ஆகும்.']
    }
  },
  {
    intent: 'WHAT_IS_FUNCTION',
    category: 'faq',
    phrases: {
      en: ['what is a function', 'explain function'],
      ta: ['சார்பு என்றால் என்ன', 'பங்க்ஷன் என்றால் என்ன'],
      tanglish: ['function na enna'],
      mixed: ['function na enna partner']
    },
    responses: {
      en: ['A function is a block of reusable code designed to perform a particular task.'],
      ta: ['பங்க்ஷன் என்பது மீண்டும் பயன்படுத்தக்கூடிய ஒரு குறிப்பிட்ட வேலையை செய்யும் குறியீட்டு தொகுதி ஆகும்.']
    }
  },
  {
    intent: 'WHAT_IS_LOOP',
    category: 'faq',
    phrases: {
      en: ['what is a loop', 'explain loop'],
      ta: ['லூப் என்றால் என்ன'],
      tanglish: ['loop na enna'],
      mixed: ['loop na enna partner']
    },
    responses: {
      en: ['A loop is a programming structure that repeats a sequence of instructions until a specific condition is met.'],
      ta: ['லூப் என்பது ஒரு நிபந்தனை நிறைவேறும் வரை ஒரே வேலையை மீண்டும் மீண்டும் செய்யும் அமைப்பாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_ARRAY',
    category: 'faq',
    phrases: {
      en: ['what is an array', 'explain array'],
      ta: ['அரே என்றால் என்ன'],
      tanglish: ['array na enna'],
      mixed: ['array na enna partner']
    },
    responses: {
      en: ['An array is a data structure used to store a collection of elements, usually of the same data type.'],
      ta: ['அரே என்பது பல தரவுகளை ஒரே இடத்தில் வரிசையாக சேமிக்க உதவும் ஒரு அமைப்பு.']
    }
  },
  {
    intent: 'WHAT_IS_OBJECT',
    category: 'faq',
    phrases: {
      en: ['what is an object', 'explain object in programming'],
      ta: ['ஆப்ஜெக்ட் என்றால் என்ன'],
      tanglish: ['object na enna'],
      mixed: ['object na enna partner']
    },
    responses: {
      en: ['In programming, an object is a structure that contains data and functions that operate on that data.'],
      ta: ['நிரலாக்கத்தில், ஆப்ஜெக்ட் என்பது தரவுகளையும் அந்த தரவுகளை கையாளும் பண்புகளையும் கொண்ட ஒரு அமைப்பாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_CLASS',
    category: 'faq',
    phrases: {
      en: ['what is a class', 'explain class'],
      ta: ['கிளாஸ் என்றால் என்ன'],
      tanglish: ['class na enna'],
      mixed: ['class na enna partner']
    },
    responses: {
      en: ['A class is a blueprint or template for creating objects in object-oriented programming.'],
      ta: ['கிளாஸ் என்பது ஆப்ஜெக்ட்களை உருவாக்குவதற்கான ஒரு வரைபடம் அல்லது டெம்ப்ளேட் ஆகும்.']
    }
  },
  {
    intent: 'WHAT_IS_INHERITANCE',
    category: 'faq',
    phrases: {
      en: ['what is inheritance', 'explain inheritance'],
      ta: ['இன்ஹெரிட்டன்ஸ் என்றால் என்ன'],
      tanglish: ['inheritance na enna'],
      mixed: ['inheritance na enna partner']
    },
    responses: {
      en: ['Inheritance is a mechanism where a new class derives properties and characteristics from an existing class.'],
      ta: ['இன்ஹெரிட்டன்ஸ் என்பது ஒரு புதிய கிளாஸ் ஏற்கனவே உள்ள கிளாஸின் பண்புகளை பெற்றுக்கொள்ளும் முறையாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_DATABASE',
    category: 'faq',
    phrases: {
      en: ['what is a database', 'explain database'],
      ta: ['தரவுத்தளம் என்றால் என்ன', 'டேட்டாபேஸ் என்றால் என்ன'],
      tanglish: ['database na enna', 'db na enna'],
      mixed: ['database na enna partner']
    },
    responses: {
      en: ['A database is an organized collection of structured information or data, typically stored electronically.'],
      ta: ['டேட்டாபேஸ் என்பது தகவல்களை பாதுகாப்பாகவும் முறையாகவும் சேமித்து வைக்கும் ஒரு அமைப்பாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_FRONTEND',
    category: 'faq',
    phrases: {
      en: ['what is frontend', 'explain frontend'],
      ta: ['பிரண்ட் எண்ட் என்றால் என்ன'],
      tanglish: ['frontend na enna'],
      mixed: ['frontend na enna partner']
    },
    responses: {
      en: ['Frontend is the part of a website or application that users interact with directly, including the design and layout.'],
      ta: ['பிரண்ட் எண்ட் என்பது இணையதளத்தில் பயனர்கள் நேரடியாக பார்க்கும் மற்றும் பயன்படுத்தும் பகுதியாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_BACKEND',
    category: 'faq',
    phrases: {
      en: ['what is backend', 'explain backend'],
      ta: ['பேக் எண்ட் என்றால் என்ன'],
      tanglish: ['backend na enna'],
      mixed: ['backend na enna partner']
    },
    responses: {
      en: ['Backend is the server side of an application. It stores and arranges data, and ensures everything on the client side works fine.'],
      ta: ['பேக் எண்ட் என்பது இணையதளத்தின் பின்னணியில் இயங்கும் சர்வர் மற்றும் டேட்டாபேஸ் பகுதியாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_GITHUB',
    category: 'faq',
    phrases: {
      en: ['what is github', 'explain github'],
      ta: ['கிட்ஹப் என்றால் என்ன'],
      tanglish: ['github na enna'],
      mixed: ['github na enna partner']
    },
    responses: {
      en: ['GitHub is a platform where developers host, share, and collaborate on software projects.'],
      ta: ['கிட்ஹப் என்பது மென்பொருள் உருவாக்குநர்கள் தங்கள் குறியீடுகளை சேமிக்கவும் மற்றவர்களுடன் இணைந்து பணியாற்றவும் உதவும் ஒரு தளம்.']
    }
  },
  {
    intent: 'HOW_SPEECH_RECOGNITION_WORKS',
    category: 'faq',
    phrases: {
      en: ['how does speech recognition work', 'how do you hear me'],
      ta: ['பேச்சு அங்கீகாரம் எப்படி வேலை செய்கிறது', 'நீ என்னை எப்படி கேட்கிறாய்'],
      tanglish: ['speech recognition epdi work aagudhu', 'epdi kekura'],
      mixed: ['partner speech recognition epdi work aagudhu']
    },
    responses: {
      en: ['I use the Web Speech API provided by your browser to listen to your voice and convert it into text.'],
      ta: ['உங்கள் பிரவுசரில் உள்ள Web Speech API தொழில்நுட்பத்தை பயன்படுத்தி உங்கள் பேச்சை எழுத்தாக மாற்றுகிறேன்.']
    }
  },
  {
    intent: 'HOW_TTS_WORKS',
    category: 'faq',
    phrases: {
      en: ['how does text to speech work', 'how do you speak'],
      ta: ['நீ எப்படி பேசுகிறாய்'],
      tanglish: ['tts epdi work aagudhu', 'epdi pesura'],
      mixed: ['partner tts epdi work aagudhu']
    },
    responses: {
      en: ['I use the browser\'s Speech Synthesis API to read text out loud using built-in voices.'],
      ta: ['பிரவுசரில் உள்ள Speech Synthesis தொழில்நுட்பத்தை பயன்படுத்தி நான் பேசுகிறேன்.']
    }
  },
  {
    intent: 'OFFLINE_CAPABILITY',
    category: 'faq',
    phrases: {
      en: ['do you work offline', 'can you work without internet', 'offline mode'],
      ta: ['இணையம் இல்லாமல் வேலை செய்வாயா', 'ஆஃப்லைனில் வேலை செய்வாயா'],
      tanglish: ['internet illama work aaguviya', 'offline la work aaguviya'],
      mixed: ['offline la work aaguviya partner']
    },
    responses: {
      en: ['Yes, I can answer basic questions, tell you the time, and perform calculations even without an internet connection!'],
      ta: ['ஆம், இணையம் இல்லாவிட்டாலும் என்னால் நேரம் சொல்லவும், கணக்கிடவும், சில அடிப்படை கேள்விகளுக்கு பதிலளிக்கவும் முடியும்!']
    }
  },
  {
    intent: 'ONLINE_STATUS',
    category: 'utility',
    phrases: {
      en: ['are you online', 'is the internet working', 'am i online'],
      ta: ['நீ ஆன்லைனில் இருக்கிறாயா', 'இணையம் வேலை செய்கிறதா'],
      tanglish: ['online la irukiya', 'internet work aagudha'],
      mixed: ['internet irukka partner']
    },
    responses: {
      en: ['[DYNAMIC_ONLINE_STATUS]'],
      ta: ['[DYNAMIC_ONLINE_STATUS]']
    }
  },
  {
    intent: 'OFFLINE_STATUS',
    category: 'utility',
    phrases: {
      en: ['are you offline', 'is the internet down', 'am i offline'],
      ta: ['நீ ஆஃப்லைனில் இருக்கிறாயா'],
      tanglish: ['offline la irukiya', 'internet down ah'],
      mixed: ['offline ah partner']
    },
    responses: {
      en: ['[DYNAMIC_ONLINE_STATUS]'],
      ta: ['[DYNAMIC_ONLINE_STATUS]']
    }
  },
  {
    intent: 'TELL_JOKE',
    category: 'fun',
    phrases: {
      en: ['tell me a joke', 'make me laugh', 'say a joke'],
      ta: ['ஒரு ஜோக் சொல்லு', 'என்னை சிரிக்க வை'],
      tanglish: ['joke sollu', 'sirikka vai'],
      mixed: ['tell me a joke partner']
    },
    responses: {
      en: ['Why do programmers prefer dark mode? Because light attracts bugs.', 'I\'ll try my best! Why did the computer go to the doctor? Because it had a virus.'],
      ta: ['கம்ப்யூட்டருக்கு காய்ச்சல் வந்தால் எங்கே போகும்? வைரஸ் டாக்டரிடம்!']
    }
  },
  {
    intent: 'TELL_FACT',
    category: 'fun',
    phrases: {
      en: ['tell me something interesting', 'tell me a fun fact', 'fun fact'],
      ta: ['சுவாரஸ்யமான தகவல் சொல்லு', 'உண்மை தகவல் சொல்லு'],
      tanglish: ['interesting ah edhavathu sollu', 'fun fact sollu'],
      mixed: ['tell me something interesting partner']
    },
    responses: {
      en: ['Here\'s something interesting: honey never spoils when properly stored.', 'A group of flamingos is called a flamboyance.'],
      ta: ['தேன் ஒருபோதும் கெட்டுப்போகாது தெரியுமா?']
    }
  },
  {
    intent: 'WHAT_IS_INTERNET',
    category: 'faq',
    phrases: {
      en: ['what is the internet', 'explain internet'],
      ta: ['இணையம் என்றால் என்ன'],
      tanglish: ['internet na enna'],
      mixed: ['internet na enna partner']
    },
    responses: {
      en: ['The internet is a worldwide network that allows computers and devices to communicate.'],
      ta: ['இணையம் என்பது உலகம் முழுவதும் உள்ள கணினிகளை இணைக்கும் ஒரு வலைப்பின்னல்.']
    }
  },
  {
    intent: 'WHAT_IS_WIFI',
    category: 'faq',
    phrases: {
      en: ['what is wifi', 'explain wifi'],
      ta: ['வைஃபை என்றால் என்ன'],
      tanglish: ['wifi na enna'],
      mixed: ['wifi na enna partner']
    },
    responses: {
      en: ['WiFi is a wireless networking technology used to connect devices to a network.'],
      ta: ['வைஃபை என்பது கம்பியில்லாமல் இணையத்துடன் இணைக்க உதவும் ஒரு தொழில்நுட்பம்.']
    }
  },
  {
    intent: 'WHAT_IS_BLUETOOTH',
    category: 'faq',
    phrases: {
      en: ['what is bluetooth', 'explain bluetooth'],
      ta: ['ப்ளூடூத் என்றால் என்ன'],
      tanglish: ['bluetooth na enna'],
      mixed: ['bluetooth na enna partner']
    },
    responses: {
      en: ['Bluetooth is a short-range wireless communication technology.'],
      ta: ['ப்ளூடூத் என்பது குறுகிய தூரத்திற்குள் சாதனங்களை இணைக்கும் ஒரு வயர்லெஸ் தொழில்நுட்பம்.']
    }
  },
  {
    intent: 'WHAT_IS_COMPUTER',
    category: 'faq',
    phrases: {
      en: ['what is a computer', 'explain computer'],
      ta: ['கணினி என்றால் என்ன'],
      tanglish: ['computer na enna'],
      mixed: ['computer na enna partner']
    },
    responses: {
      en: ['A computer is an electronic device that processes data and performs instructions.'],
      ta: ['கணினி என்பது தரவுகளை கையாளும் மற்றும் கட்டளைகளை நிறைவேற்றும் ஒரு மின்னணு சாதனம்.']
    }
  },
  {
    intent: 'WHAT_IS_CPU',
    category: 'faq',
    phrases: {
      en: ['what is a cpu', 'explain cpu'],
      ta: ['சிபியு என்றால் என்ன'],
      tanglish: ['cpu na enna'],
      mixed: ['cpu na enna partner']
    },
    responses: {
      en: ['A CPU is the main processor that executes instructions and performs calculations.'],
      ta: ['சிபியு என்பது கணினியின் மூளை போன்றது, இது அனைத்து கட்டளைகளையும் நிறைவேற்றுகிறது.']
    }
  },
  {
    intent: 'WHAT_IS_RAM',
    category: 'faq',
    phrases: {
      en: ['what is ram', 'explain ram'],
      ta: ['ரேம் என்றால் என்ன'],
      tanglish: ['ram na enna'],
      mixed: ['ram na enna partner']
    },
    responses: {
      en: ['RAM is temporary memory used by a computer while programs are running.'],
      ta: ['ரேம் என்பது கணினியில் இயங்கும் நிரல்களுக்கான தற்காலிக நினைவகம் ஆகும்.']
    }
  },
  {
    intent: 'WHAT_IS_GPU',
    category: 'faq',
    phrases: {
      en: ['what is a gpu', 'explain gpu'],
      ta: ['ஜிபியு என்றால் என்ன'],
      tanglish: ['gpu na enna'],
      mixed: ['gpu na enna partner']
    },
    responses: {
      en: ['A GPU is a processor designed especially for graphics and highly parallel computations.'],
      ta: ['ஜிபியு என்பது கிராபிக்ஸ் மற்றும் வீடியோக்களை கையாளும் ஒரு பிரத்யேக செயலி.']
    }
  },
  {
    intent: 'WHAT_IS_OS',
    category: 'faq',
    phrases: {
      en: ['what is an operating system', 'what is os', 'explain operating system'],
      ta: ['இயக்க முறைமை என்றால் என்ன', 'ஓஎஸ் என்றால் என்ன'],
      tanglish: ['os na enna', 'operating system na enna'],
      mixed: ['operating system na enna partner']
    },
    responses: {
      en: ['An operating system manages computer hardware and provides services for applications.'],
      ta: ['ஓஎஸ் என்பது கணினியின் வன்பொருளையும் மென்பொருளையும் நிர்வகிக்கும் ஒரு முக்கிய நிரலாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_WINDOWS',
    category: 'faq',
    phrases: {
      en: ['what is windows', 'explain windows os'],
      ta: ['விண்டோஸ் என்றால் என்ன'],
      tanglish: ['windows na enna'],
      mixed: ['windows na enna partner']
    },
    responses: {
      en: ['Windows is an operating system developed by Microsoft.'],
      ta: ['விண்டோஸ் என்பது மைக்ரோசாப்ட் நிறுவனம் உருவாக்கிய ஒரு பிரபலமான ஓஎஸ்.']
    }
  },
  {
    intent: 'WHAT_IS_LINUX',
    category: 'faq',
    phrases: {
      en: ['what is linux', 'explain linux'],
      ta: ['லினக்ஸ் என்றால் என்ன'],
      tanglish: ['linux na enna'],
      mixed: ['linux na enna partner']
    },
    responses: {
      en: ['Linux is a family of open-source operating systems.'],
      ta: ['லினக்ஸ் என்பது இலவசமாக கிடைக்கும் ஒரு ஓபன் சோர்ஸ் இயக்க முறைமை.']
    }
  },
  {
    intent: 'WHAT_IS_ANDROID',
    category: 'faq',
    phrases: {
      en: ['what is android', 'explain android'],
      ta: ['ஆண்ட்ராய்டு என்றால் என்ன'],
      tanglish: ['android na enna'],
      mixed: ['android na enna partner']
    },
    responses: {
      en: ['Android is a mobile operating system developed primarily by Google.'],
      ta: ['ஆண்ட்ராய்டு என்பது ஸ்மார்ட்போன்களுக்காக கூகுள் உருவாக்கிய ஒரு ஓஎஸ்.']
    }
  },
  {
    intent: 'WHAT_IS_IP',
    category: 'faq',
    phrases: {
      en: ['what is an ip address', 'what is ip address'],
      ta: ['ஐபி முகவரி என்றால் என்ன'],
      tanglish: ['ip address na enna'],
      mixed: ['ip address na enna partner']
    },
    responses: {
      en: ['An IP address identifies a device or network interface on an IP network.'],
      ta: ['ஐபி முகவரி என்பது இணையத்தில் ஒரு சாதனத்தை அடையாளம் காண பயன்படும் ஒரு எண்.']
    }
  },
  {
    intent: 'WHAT_IS_ROUTER',
    category: 'faq',
    phrases: {
      en: ['what is a router'],
      ta: ['ரவுட்டர் என்றால் என்ன'],
      tanglish: ['router na enna'],
      mixed: ['router na enna partner']
    },
    responses: {
      en: ['A router forwards network traffic between different networks.'],
      ta: ['ரவுட்டர் என்பது பல்வேறு நெட்வொர்க்குகளுக்கு இடையே தரவுகளை அனுப்பும் ஒரு சாதனம்.']
    }
  },
  {
    intent: 'WHAT_IS_SWITCH_NET',
    category: 'faq',
    phrases: {
      en: ['what is a switch', 'what is a network switch'],
      ta: ['நெட்வொர்க் ஸ்விட்ச் என்றால் என்ன'],
      tanglish: ['network switch na enna'],
      mixed: ['network switch na enna partner']
    },
    responses: {
      en: ['A network switch connects devices within a local network and forwards Ethernet frames between them.'],
      ta: ['நெட்வொர்க் ஸ்விட்ச் என்பது லோக்கல் நெட்வொர்க்கில் உள்ள பல சாதனங்களை இணைக்க பயன்படும் சாதனம்.']
    }
  },
  {
    intent: 'WHAT_IS_FIREWALL',
    category: 'faq',
    phrases: {
      en: ['what is a firewall'],
      ta: ['ஃபயர்வால் என்றால் என்ன'],
      tanglish: ['firewall na enna'],
      mixed: ['firewall na enna partner']
    },
    responses: {
      en: ['A firewall controls network traffic according to security rules.'],
      ta: ['ஃபயர்வால் என்பது நெட்வொர்க் பாதுகாப்பை உறுதி செய்யும் ஒரு அமைப்பு.']
    }
  },
  {
    intent: 'WHAT_IS_PORT',
    category: 'faq',
    phrases: {
      en: ['what is a port', 'what is a network port'],
      ta: ['நெட்வொர்க் போர்ட் என்றால் என்ன'],
      tanglish: ['port na enna'],
      mixed: ['port na enna partner']
    },
    responses: {
      en: ['A port is a logical endpoint used by network services to communicate.'],
      ta: ['போர்ட் என்பது மென்பொருள்கள் தரவுகளை பரிமாறிக் கொள்ள பயன்படுத்தும் ஒரு வழியமைப்பு.']
    }
  },
  {
    intent: 'WHAT_IS_PROTOCOL',
    category: 'faq',
    phrases: {
      en: ['what is a protocol'],
      ta: ['புரோட்டோகால் என்றால் என்ன'],
      tanglish: ['protocol na enna'],
      mixed: ['protocol na enna partner']
    },
    responses: {
      en: ['A protocol is a set of rules that devices use to communicate.'],
      ta: ['புரோட்டோகால் என்பது சாதனங்கள் ஒன்றோடொன்று பேசிக்கொள்ளும் போது பின்பற்றப்படும் விதிகளாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_HTTP',
    category: 'faq',
    phrases: {
      en: ['what is http'],
      ta: ['எச்டிடிபி என்றால் என்ன'],
      tanglish: ['http na enna'],
      mixed: ['http na enna partner']
    },
    responses: {
      en: ['HTTP is a protocol used to transfer information between web clients and servers.'],
      ta: ['எச்டிடிபி என்பது இணையதள தரவுகளை பரிமாறிக் கொள்ள பயன்படும் ஒரு புரோட்டோகால்.']
    }
  },
  {
    intent: 'WHAT_IS_HTTPS',
    category: 'faq',
    phrases: {
      en: ['what is https'],
      ta: ['எச்டிடிபிஎஸ் என்றால் என்ன'],
      tanglish: ['https na enna'],
      mixed: ['https na enna partner']
    },
    responses: {
      en: ['HTTPS is HTTP protected using encryption through TLS.'],
      ta: ['எச்டிடிபிஎஸ் என்பது பாதுகாப்பான முறையில் தரவுகளை பரிமாறும் ஒரு முறை.']
    }
  },
  {
    intent: 'WHAT_IS_DNS',
    category: 'faq',
    phrases: {
      en: ['what is dns'],
      ta: ['டிஎன்எஸ் என்றால் என்ன'],
      tanglish: ['dns na enna'],
      mixed: ['dns na enna partner']
    },
    responses: {
      en: ['DNS translates domain names into IP addresses and other network information.'],
      ta: ['டிஎன்எஸ் என்பது இணையதள பெயர்களை ஐபி முகவரியாக மாற்றும் ஒரு அமைப்பு.']
    }
  },
  {
    intent: 'WHAT_IS_SERVER',
    category: 'faq',
    phrases: {
      en: ['what is a server'],
      ta: ['சர்வர் என்றால் என்ன'],
      tanglish: ['server na enna'],
      mixed: ['server na enna partner']
    },
    responses: {
      en: ['A server is a computer or software system that provides services or resources to other devices.'],
      ta: ['சர்வர் என்பது மற்ற சாதனங்களுக்கு சேவைகளை வழங்கும் ஒரு கணினி அமைப்பு.']
    }
  },
  {
    intent: 'WHAT_IS_CLOUD',
    category: 'faq',
    phrases: {
      en: ['what is cloud computing', 'what is cloud'],
      ta: ['க்ளவுட் கம்ப்யூட்டிங் என்றால் என்ன'],
      tanglish: ['cloud computing na enna', 'cloud na enna'],
      mixed: ['cloud computing na enna partner']
    },
    responses: {
      en: ['Cloud computing provides computing resources such as storage and servers over a network.'],
      ta: ['க்ளவுட் கம்ப்யூட்டிங் என்பது இணையம் மூலமாக சர்வர் மற்றும் ஸ்டோரேஜ் சேவைகளை பெறுவதாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_CYBERSECURITY',
    category: 'faq',
    phrases: {
      en: ['what is cybersecurity', 'what is cyber security'],
      ta: ['சைபர் செக்யூரிட்டி என்றால் என்ன'],
      tanglish: ['cybersecurity na enna'],
      mixed: ['cybersecurity na enna partner']
    },
    responses: {
      en: ['Cybersecurity involves protecting computers, networks, applications, and data from unauthorized access and attacks.'],
      ta: ['சைபர் செக்யூரிட்டி என்பது கணினி மற்றும் இணைய பாதுகாப்பை உறுதி செய்யும் ஒரு துறையாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_ENCRYPTION',
    category: 'faq',
    phrases: {
      en: ['what is encryption'],
      ta: ['என்கிரிப்ஷன் என்றால் என்ன'],
      tanglish: ['encryption na enna'],
      mixed: ['encryption na enna partner']
    },
    responses: {
      en: ['Encryption transforms readable data into a protected form that requires the appropriate key to recover.'],
      ta: ['என்கிரிப்ஷன் என்பது தரவுகளை ரகசிய குறியீடுகளாக மாற்றி பாதுகாக்கும் ஒரு முறை.']
    }
  },
  {
    intent: 'WHAT_IS_AUTHENTICATION',
    category: 'faq',
    phrases: {
      en: ['what is authentication'],
      ta: ['அத்தண்டிகேஷன் என்றால் என்ன'],
      tanglish: ['authentication na enna'],
      mixed: ['authentication na enna partner']
    },
    responses: {
      en: ['Authentication verifies who a user or system is.'],
      ta: ['அத்தண்டிகேஷன் என்பது ஒரு நபர் யார் என்பதை உறுதி செய்யும் முறையாகும்.']
    }
  },
  {
    intent: 'WHAT_IS_AUTHORIZATION',
    category: 'faq',
    phrases: {
      en: ['what is authorization'],
      ta: ['ஆதரைசேஷன் என்றால் என்ன'],
      tanglish: ['authorization na enna'],
      mixed: ['authorization na enna partner']
    },
    responses: {
      en: ['Authorization determines what an authenticated user or system is allowed to access.'],
      ta: ['ஆதரைசேஷன் என்பது ஒரு நபர் எதையெல்லாம் பயன்படுத்த முடியும் என்பதை தீர்மானிக்கும் முறை.']
    }
  },
  {
    intent: 'WHAT_IS_PASSWORD',
    category: 'faq',
    phrases: {
      en: ['what is a password'],
      ta: ['பாஸ்வேர்ட் என்றால் என்ன', 'கடவுச்சொல் என்றால் என்ன'],
      tanglish: ['password na enna'],
      mixed: ['password na enna partner']
    },
    responses: {
      en: ['A password is a secret used to authenticate access to an account or system.'],
      ta: ['பாஸ்வேர்ட் என்பது உங்கள் கணக்கை பாதுகாக்கும் ஒரு ரகசிய குறியீடு.']
    }
  },
  {
    intent: 'WHAT_IS_STRONG_PASSWORD',
    category: 'faq',
    phrases: {
      en: ['what is a strong password'],
      ta: ['ஸ்ட்ராங் பாஸ்வேர்ட் என்றால் என்ன'],
      tanglish: ['strong password na enna'],
      mixed: ['strong password na enna partner']
    },
    responses: {
      en: ['A strong password is long, unique, and difficult to guess.'],
      ta: ['ஸ்ட்ராங் பாஸ்வேர்ட் என்பது யாராலும் எளிதில் கண்டுபிடிக்க முடியாத ஒரு கடினமான கடவுச்சொல்.']
    }
  },
  {
    intent: 'WHAT_IS_VIRUS',
    category: 'faq',
    phrases: {
      en: ['what is a virus', 'what is computer virus'],
      ta: ['கம்ப்யூட்டர் வைரஸ் என்றால் என்ன', 'வைரஸ் என்றால் என்ன'],
      tanglish: ['virus na enna', 'computer virus na enna'],
      mixed: ['virus na enna partner']
    },
    responses: {
      en: ['A computer virus is malicious software that can replicate or spread and may damage or disrupt systems.'],
      ta: ['கம்ப்யூட்டர் வைரஸ் என்பது கணினியை பாதிக்கக்கூடிய ஒரு ஆபத்தான மென்பொருள்.']
    }
  },
  {
    intent: 'WHAT_IS_MALWARE',
    category: 'faq',
    phrases: {
      en: ['what is malware'],
      ta: ['மால்வேர் என்றால் என்ன'],
      tanglish: ['malware na enna'],
      mixed: ['malware na enna partner']
    },
    responses: {
      en: ['Malware is software designed to perform harmful or unwanted actions.'],
      ta: ['மால்வேர் என்பது கணினிக்கு தீங்கு விளைவிக்க உருவாக்கப்பட்ட ஒரு மென்பொருள்.']
    }
  },
  {
    intent: 'WHAT_IS_DEBUGGING',
    category: 'faq',
    phrases: {
      en: ['what is debugging'],
      ta: ['டீபக்கிங் என்றால் என்ன'],
      tanglish: ['debugging na enna'],
      mixed: ['debugging na enna partner']
    },
    responses: {
      en: ['Debugging is the process of finding and fixing problems in software.'],
      ta: ['டீபக்கிங் என்பது மென்பொருளில் உள்ள பிழைகளை கண்டுபிடித்து சரிசெய்யும் முறை.']
    }
  },
  {
    intent: 'WHAT_IS_DATA_STRUCTURE',
    category: 'faq',
    phrases: {
      en: ['what is a data structure', 'explain data structure'],
      ta: ['டேட்டா ஸ்ட்ரக்சர் என்றால் என்ன'],
      tanglish: ['data structure na enna'],
      mixed: ['data structure na enna partner']
    },
    responses: {
      en: ['A data structure organizes data so it can be stored and accessed efficiently.'],
      ta: ['டேட்டா ஸ்ட்ரக்சர் என்பது தரவுகளை முறையாக சேமித்து கையாள உதவும் ஒரு அமைப்பு.']
    }
  },
  {
    intent: 'WHAT_IS_OOP',
    category: 'faq',
    phrases: {
      en: ['what is oop', 'explain oop', 'what is object oriented programming'],
      ta: ['ஓஓபி என்றால் என்ன', 'ஆப்ஜெக்ட் ஓரியண்டட் புரோகிராமிங் என்றால் என்ன'],
      tanglish: ['oop na enna'],
      mixed: ['oop na enna partner']
    },
    responses: {
      en: ['OOP stands for Object-Oriented Programming, a programming approach based around objects and classes.'],
      ta: ['ஓஓபி என்பது ஆப்ஜெக்ட்களை அடிப்படையாக கொண்ட ஒரு நிரலாக்க முறை.']
    }
  },
  {
    intent: 'WHAT_IS_POLYMORPHISM',
    category: 'faq',
    phrases: {
      en: ['what is polymorphism', 'explain polymorphism'],
      ta: ['பாலிமார்பிசம் என்றால் என்ன'],
      tanglish: ['polymorphism na enna'],
      mixed: ['polymorphism na enna partner']
    },
    responses: {
      en: ['Polymorphism allows the same interface or operation to work with different types.'],
      ta: ['பாலிமார்பிசம் என்பது ஒரே செயல்பாடு வெவ்வேறு வடிவங்களில் செயல்பட உதவும் ஒரு முறை.']
    }
  },
  {
    intent: 'WHAT_IS_ENCAPSULATION',
    category: 'faq',
    phrases: {
      en: ['what is encapsulation', 'explain encapsulation'],
      ta: ['என்கேப்சுலேஷன் என்றால் என்ன'],
      tanglish: ['encapsulation na enna'],
      mixed: ['encapsulation na enna partner']
    },
    responses: {
      en: ['Encapsulation groups data and related operations together while controlling access to internal details.'],
      ta: ['என்கேப்சுலேஷன் என்பது தரவுகளையும் செயல்பாடுகளையும் ஒன்றாக இணைத்து பாதுகாக்கும் முறை.']
    }
  },
  {
    intent: 'WHAT_IS_ABSTRACTION',
    category: 'faq',
    phrases: {
      en: ['what is abstraction', 'explain abstraction'],
      ta: ['அப்ஸ்ட்ராக்ஷன் என்றால் என்ன'],
      tanglish: ['abstraction na enna'],
      mixed: ['abstraction na enna partner']
    },
    responses: {
      en: ['Abstraction hides unnecessary implementation details and exposes the important functionality.'],
      ta: ['அப்ஸ்ட்ராக்ஷன் என்பது தேவையற்ற விவரங்களை மறைத்து முக்கியமானவற்றை மட்டும் காண்பிக்கும் முறை.']
    }
  },
  {
    intent: 'REMEMBER_ME',
    category: 'faq',
    phrases: {
      en: ['do you remember me', 'what can you remember'],
      ta: ['உனக்கு என்னை நியாபகம் இருக்கா'],
      tanglish: ['enna niyabagam irukka', 'enna marandhutiya'],
      mixed: ['do you remember me partner']
    },
    responses: {
      en: ['I can remember information that you choose to save when memory is enabled.', 'I can show you the information you\'ve chosen to save.'],
      ta: ['நீங்கள் சேமிக்க விரும்பும் தகவல்களை என்னால் நினைவில் வைத்துக்கொள்ள முடியும்.']
    }
  },
  {
    intent: 'TAKE_NOTE',
    category: 'faq',
    phrases: {
      en: ['take a note', 'set a reminder', 'remember this', 'note this down'],
      ta: ['இதை குறித்துக்கொள்', 'ரிமைண்டர் வை'],
      tanglish: ['note panniko', 'reminder vai', 'idha niyabagam vechuko'],
      mixed: ['note panniko partner']
    },
    responses: {
      en: ['Sure. Tell me what you\'d like me to save or remember.', 'Sure. Tell me what you want to be reminded about and when.'],
      ta: ['சரி. நீங்கள் எதை சேமிக்க விரும்புகிறீர்கள் என்று சொல்லுங்கள்.']
    }
  }
];
