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
  {
    "intent": "GREETING",
    "category": "basics",
    "phrases": {
      "en": [
        "hello",
        "hi",
        "hey",
        "greetings",
        "hey partner",
        "hello partner",
        "hi partner"
      ],
      "ta": [
        "வணக்கம்",
        "ஹலோ",
        "ஹாய்",
        "ஹே பார்ட்னர்",
        "வணக்கம் பார்ட்னர்"
      ],
      "tanglish": [
        "vanakkam",
        "hello partner",
        "hai partner",
        "hai",
        "he",
        "hey partner"
      ],
      "mixed": [
        "vanakkam partner",
        "hello vanakkam"
      ]
    },
    "responses": {
      "en": [
        "Hello! How can I help you today?",
        "Hi there! I am ready.",
        "Greetings! What can I do for you?"
      ],
      "ta": [
        "வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?",
        "ஹலோ! நான் தயாராக இருக்கிறேன்."
      ]
    }
  },
  {
    "intent": "GOOD_MORNING",
    "category": "basics",
    "phrases": {
      "en": [
        "good morning",
        "morning partner",
        "good morning partner"
      ],
      "ta": [
        "காலை வணக்கம்",
        "குட் மார்னிங்"
      ],
      "tanglish": [
        "kaalai vanakkam",
        "good morning"
      ],
      "mixed": [
        "good morning partner",
        "kaalai vanakkam partner"
      ]
    },
    "responses": {
      "en": [
        "Good morning! I hope you have a great day.",
        "Morning! How can I assist you today?"
      ],
      "ta": [
        "காலை வணக்கம்! இன்றைய நாள் இனிய நாளாக அமையட்டும்.",
        "காலை வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?"
      ]
    }
  },
  {
    "intent": "GOOD_AFTERNOON",
    "category": "basics",
    "phrases": {
      "en": [
        "good afternoon",
        "afternoon partner"
      ],
      "ta": [
        "மதிய வணக்கம்",
        "குட் ஆஃப்டர்நூன்"
      ],
      "tanglish": [
        "mathiya vanakkam",
        "good afternoon"
      ],
      "mixed": [
        "good afternoon partner"
      ]
    },
    "responses": {
      "en": [
        "Good afternoon! How can I help?",
        "Good afternoon!"
      ],
      "ta": [
        "மதிய வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?",
        "மதிய வணக்கம்!"
      ]
    }
  },
  {
    "intent": "GOOD_EVENING",
    "category": "basics",
    "phrases": {
      "en": [
        "good evening",
        "evening partner"
      ],
      "ta": [
        "மாலை வணக்கம்",
        "குட் ஈவினிங்"
      ],
      "tanglish": [
        "maalai vanakkam",
        "good evening"
      ],
      "mixed": [
        "good evening partner"
      ]
    },
    "responses": {
      "en": [
        "Good evening! How was your day?",
        "Good evening!"
      ],
      "ta": [
        "மாலை வணக்கம்! உங்கள் நாள் எப்படி இருந்தது?",
        "மாலை வணக்கம்!"
      ]
    }
  },
  {
    "intent": "GOOD_NIGHT",
    "category": "basics",
    "phrases": {
      "en": [
        "good night",
        "night partner",
        "sleep well"
      ],
      "ta": [
        "இரவு வணக்கம்",
        "குட் நைட்",
        "நன்றாக தூங்கு"
      ],
      "tanglish": [
        "iravu vanakkam",
        "good night",
        "nalla thoongu"
      ],
      "mixed": [
        "good night partner"
      ]
    },
    "responses": {
      "en": [
        "Good night! Sleep well.",
        "Good night! See you tomorrow."
      ],
      "ta": [
        "இரவு வணக்கம்! நன்றாக தூங்குங்கள்.",
        "இரவு வணக்கம்! நாளை பார்க்கலாம்."
      ]
    }
  },
  {
    "intent": "HOW_ARE_YOU",
    "category": "basics",
    "phrases": {
      "en": [
        "how are you",
        "how are you doing",
        "how is it going",
        "are you doing well"
      ],
      "ta": [
        "எப்படி இருக்கிறாய்",
        "நீ எப்படி இருக்கிறாய்",
        "நலமா"
      ],
      "tanglish": [
        "epdi iruka",
        "eppadi iruka",
        "eppadi irukkiraai",
        "nalama"
      ],
      "mixed": [
        "how are you partner",
        "partner epdi iruka"
      ]
    },
    "responses": {
      "en": [
        "I am doing great, thank you for asking! How can I help you?",
        "I am just a program, but I am ready to help!"
      ],
      "ta": [
        "நான் நன்றாக இருக்கிறேன், கேட்டதற்கு நன்றி! உங்களுக்கு என்ன வேண்டும்?",
        "நான் ஒரு மென்பொருள், உங்களுக்கு உதவ தயாராக இருக்கிறேன்."
      ]
    }
  },
  {
    "intent": "ARE_YOU_THERE",
    "category": "basics",
    "phrases": {
      "en": [
        "are you there",
        "can you hear me",
        "are you listening",
        "partner are you there"
      ],
      "ta": [
        "நீ இருக்கிறாயா",
        "என்னைக் கேட்கிறாயா",
        "இருக்கிறாயா"
      ],
      "tanglish": [
        "nee irukkiya",
        "irukiya",
        "kekutha",
        "ennai kekuriya"
      ],
      "mixed": [
        "partner nee irukkiya",
        "can you hear me partner"
      ]
    },
    "responses": {
      "en": [
        "Yes, I am here and listening.",
        "I am always here for you."
      ],
      "ta": [
        "ஆம், நான் இங்கே இருக்கிறேன், கேட்கிறேன்.",
        "ஆம், நான் உங்களுக்காக தயாராக இருக்கிறேன்."
      ]
    }
  },
  {
    "intent": "IDENTITY",
    "category": "basics",
    "phrases": {
      "en": [
        "who are you",
        "what are you",
        "are you an ai",
        "are you ai",
        "who created you"
      ],
      "ta": [
        "நீ யார்",
        "நீ யார் என்று சொல்லு",
        "நீ ஒரு AI ஆ",
        "நீ செயற்கை நுண்ணறிவா"
      ],
      "tanglish": [
        "nee yaaru",
        "nee yaar",
        "nee oru AI ah",
        "nee AI ah",
        "nee enna"
      ],
      "mixed": [
        "who are you partner",
        "partner nee yaaru",
        "are you an ai partner"
      ]
    },
    "responses": {
      "en": [
        "I am Partner, an AI voice assistant created to help you with your daily tasks."
      ],
      "ta": [
        "நான் பார்ட்னர், உங்கள் அன்றாட வேலைகளுக்கு உதவும் ஒரு செயற்கை நுண்ணறிவு உதவியாளர்."
      ]
    }
  },
  {
    "intent": "YOUR_NAME",
    "category": "basics",
    "phrases": {
      "en": [
        "what is your name",
        "your name",
        "tell me your name"
      ],
      "ta": [
        "உன் பெயர் என்ன",
        "உன்னுடைய பெயர் என்ன"
      ],
      "tanglish": [
        "un peru enna",
        "unga peru enna",
        "un name enna"
      ],
      "mixed": [
        "what is your name partner",
        "partner un peru enna"
      ]
    },
    "responses": {
      "en": [
        "My name is Partner."
      ],
      "ta": [
        "என் பெயர் பார்ட்னர்."
      ]
    }
  },
  {
    "intent": "WHAT_CAN_YOU_DO",
    "category": "basics",
    "phrases": {
      "en": [
        "what can you do",
        "what do you do",
        "tell me what you can do",
        "capabilities"
      ],
      "ta": [
        "நீ என்ன செய்ய முடியும்",
        "உன்னால் என்ன செய்ய முடியும்",
        "என்ன செய்வாய்"
      ],
      "tanglish": [
        "nee enna panna mudiyum",
        "unnaala enna panna mudiyum",
        "enna panra"
      ],
      "mixed": [
        "what can you do partner",
        "partner nee enna panna mudiyum"
      ]
    },
    "responses": {
      "en": [
        "I can tell you the time, perform calculations, answer basic programming questions, and connect to Gemini for complex questions."
      ],
      "ta": [
        "என்னால் நேரம் சொல்ல முடியும், கணக்கிட முடியும், நிரலாக்க கேள்விகளுக்கு பதிலளிக்க முடியும். கடினமான கேள்விகளுக்கு ஜெமினியைப் பயன்படுத்துவேன்."
      ]
    }
  },
  {
    "intent": "HELP",
    "category": "basics",
    "phrases": {
      "en": [
        "help",
        "help me",
        "can you help me",
        "i need help"
      ],
      "ta": [
        "எனக்கு உதவி செய்",
        "உதவி வேண்டும்",
        "உன்னிடம் என்ன கேட்கலாம்"
      ],
      "tanglish": [
        "enakku help pannu",
        "help pannu",
        "un kitta enna kekalam",
        "udhavi venum"
      ],
      "mixed": [
        "partner enakku help pannu",
        "help me partner"
      ]
    },
    "responses": {
      "en": [
        "Sure! I can help you with time, math, coding basics, or general questions. Just ask!"
      ],
      "ta": [
        "கண்டிப்பாக! நேரம், கணக்கு, மற்றும் பொதுவான கேள்விகளுக்கு நான் உதவி செய்வேன். கேளுங்கள்!"
      ]
    }
  },
  {
    "intent": "THANKS",
    "category": "basics",
    "phrases": {
      "en": [
        "thanks",
        "thank you",
        "thank you so much",
        "thank you partner"
      ],
      "ta": [
        "நன்றி",
        "மிக்க நன்றி",
        "ரொம்ப நன்றி",
        "நன்றி பார்ட்னர்"
      ],
      "tanglish": [
        "nandri",
        "romba nandri",
        "thanks partner",
        "thank you partner"
      ],
      "mixed": [
        "nandri partner",
        "thank you romba nandri"
      ]
    },
    "responses": {
      "en": [
        "You are welcome!",
        "Glad I could help!",
        "Anytime!"
      ],
      "ta": [
        "வரவேற்கிறேன்!",
        "உதவியதில் மகிழ்ச்சி!",
        "எப்போது வேண்டுமானாலும் கேளுங்கள்!"
      ]
    }
  },
  {
    "intent": "GOODBYE",
    "category": "basics",
    "phrases": {
      "en": [
        "goodbye",
        "bye",
        "bye bye",
        "see you",
        "see you later"
      ],
      "ta": [
        "பை",
        "போய் வருகிறேன்",
        "பிறகு பேசலாம்",
        "விடைபெறுகிறேன்"
      ],
      "tanglish": [
        "bye partner",
        "poitu varen",
        "aprom pesalam",
        "bye"
      ],
      "mixed": [
        "bye partner poitu varen",
        "see you partner"
      ]
    },
    "responses": {
      "en": [
        "Goodbye! Have a great day!",
        "Bye! Feel free to call me if you need anything."
      ],
      "ta": [
        "போய் வாருங்கள்! உங்கள் நாள் இனிதாக அமையட்டும்.",
        "பை! பிறகு பேசலாம்."
      ]
    }
  },
  {
    "intent": "STOP_LISTENING",
    "category": "command",
    "phrases": {
      "en": [
        "stop listening",
        "stop",
        "quiet",
        "shut up",
        "enough"
      ],
      "ta": [
        "இப்போது போதும்",
        "நிறுத்து",
        "கேட்பதை நிறுத்து",
        "பேசுவதை நிறுத்து",
        "அமைதி"
      ],
      "tanglish": [
        "ippo pothum",
        "stop",
        "kekuratha niruthu",
        "pesuratha niruthu",
        "amaithi"
      ],
      "mixed": [
        "stop listening pannunga",
        "partner stop"
      ]
    },
    "responses": {
      "en": [
        "Stopping."
      ],
      "ta": [
        "நிறுத்துகிறேன்."
      ]
    }
  },
  {
    "intent": "GET_TIME",
    "category": "utility",
    "phrases": {
      "en": [
        "what time is it",
        "what is the time",
        "tell me the time",
        "current time",
        "time now",
        "can you tell me the time",
        "what is the current time"
      ],
      "ta": [
        "மணி என்ன",
        "நேரம் என்ன",
        "இப்போது மணி என்ன",
        "இப்போ மணி என்ன",
        "தற்போதைய நேரம் என்ன",
        "நேரத்தை சொல்லு",
        "இப்போது நேரம் சொல்லு"
      ],
      "tanglish": [
        "mani enna",
        "neram enna",
        "ippo mani enna",
        "ippo neram enna",
        "current time enna",
        "time enna",
        "time sollu",
        "enakku time sollu"
      ],
      "mixed": [
        "time enna partner",
        "partner ippo time sollu",
        "ippo current time enna"
      ]
    },
    "responses": {
      "en": [
        "[DYNAMIC_TIME]"
      ],
      "ta": [
        "[DYNAMIC_TIME]"
      ]
    }
  },
  {
    "intent": "GET_DATE",
    "category": "utility",
    "phrases": {
      "en": [
        "what is the date",
        "what is today's date",
        "tell me the date",
        "today's date",
        "what date is it"
      ],
      "ta": [
        "இன்று என்ன தேதி",
        "இன்றைய தேதி என்ன",
        "தேதி என்ன",
        "இன்றைய தேதியை சொல்லு"
      ],
      "tanglish": [
        "innaiku enna date",
        "indraya date enna",
        "date enna",
        "today enna date",
        "innaiki date enna"
      ],
      "mixed": [
        "today enna date",
        "innaiku what date",
        "partner innaiki date enna"
      ]
    },
    "responses": {
      "en": [
        "[DYNAMIC_DATE]"
      ],
      "ta": [
        "[DYNAMIC_DATE]"
      ]
    }
  },
  {
    "intent": "GET_DAY",
    "category": "utility",
    "phrases": {
      "en": [
        "what day is it",
        "what is today",
        "what day is today"
      ],
      "ta": [
        "இன்று என்ன கிழமை",
        "இன்றைக்கு என்ன கிழமை"
      ],
      "tanglish": [
        "innaiku enna kizhama",
        "today enna day",
        "innaiku enna day"
      ],
      "mixed": [
        "today enna kizhama",
        "innaiku what day"
      ]
    },
    "responses": {
      "en": [
        "[DYNAMIC_DAY]"
      ],
      "ta": [
        "[DYNAMIC_DAY]"
      ]
    }
  },
  {
    "intent": "CALCULATE",
    "category": "utility",
    "phrases": {
      "en": [
        "calculate",
        "what is plus",
        "what is minus",
        "divided by",
        "times",
        "multiplied by"
      ],
      "ta": [
        "கூட்டல்",
        "கழித்தால்",
        "பெருக்கல்",
        "வகுத்தால்",
        "எவ்வளவு"
      ],
      "tanglish": [
        "plus",
        "minus",
        "times",
        "divide by",
        "evlo",
        "calculate pannu"
      ],
      "mixed": [
        "calculate pannu",
        "evlo partner"
      ]
    },
    "responses": {
      "en": [
        "[DYNAMIC_CALC]"
      ],
      "ta": [
        "[DYNAMIC_CALC]"
      ]
    }
  },
  {
    "intent": "SPEAK_FASTER",
    "category": "command",
    "phrases": {
      "en": [
        "speak faster",
        "talk faster",
        "go faster"
      ],
      "ta": [
        "வேகமாக பேசு"
      ],
      "tanglish": [
        "fast ah pesu",
        "konjam fast ah pesu",
        "vegama pesu"
      ],
      "mixed": [
        "partner konjam fast ah pesu",
        "speak fast ah"
      ]
    },
    "responses": {
      "en": [
        "I will speak faster now."
      ],
      "ta": [
        "இப்போது வேகமாக பேசுகிறேன்."
      ]
    }
  },
  {
    "intent": "SPEAK_SLOWER",
    "category": "command",
    "phrases": {
      "en": [
        "speak slower",
        "talk slower",
        "go slower"
      ],
      "ta": [
        "மெதுவாக பேசு",
        "சற்று மெதுவாக பேசு"
      ],
      "tanglish": [
        "slow ah pesu",
        "konjam slow ah pesu",
        "medhuva pesu"
      ],
      "mixed": [
        "partner konjam slow ah pesu",
        "speak slow ah"
      ]
    },
    "responses": {
      "en": [
        "I will speak slower now."
      ],
      "ta": [
        "இப்போது மெதுவாக பேசுகிறேன்."
      ]
    }
  },
  {
    "intent": "REPEAT",
    "category": "command",
    "phrases": {
      "en": [
        "repeat that",
        "say that again",
        "what did you say"
      ],
      "ta": [
        "மீண்டும் சொல்",
        "இன்னொரு முறை சொல்"
      ],
      "tanglish": [
        "repeat pannu",
        "again sollu",
        "thirumba sollu",
        "innoru thadava sollu"
      ],
      "mixed": [
        "repeat pannu partner",
        "say it again"
      ]
    },
    "responses": {
      "en": [
        "[REPEAT]"
      ],
      "ta": [
        "[REPEAT]"
      ]
    }
  },
  {
    "intent": "CLEAR_CHAT",
    "category": "command",
    "phrases": {
      "en": [
        "clear chat",
        "clear conversation",
        "reset chat",
        "start over"
      ],
      "ta": [
        "உரையாடலை அழி",
        "புதிதாக தொடங்கு"
      ],
      "tanglish": [
        "clear pannu",
        "clear conversation pannu",
        "reset pannu",
        "first la irundhu"
      ],
      "mixed": [
        "clear chat pannu",
        "partner clear pannu"
      ]
    },
    "responses": {
      "en": [
        "I have cleared our conversation."
      ],
      "ta": [
        "நான் நமது உரையாடலை அழித்துவிட்டேன்."
      ]
    }
  },
  {
    "intent": "ONLINE_STATUS",
    "category": "utility",
    "phrases": {
      "en": [
        "are you online",
        "is the internet working",
        "am i online"
      ],
      "ta": [
        "நீ ஆன்லைனில் இருக்கிறாயா",
        "இணையம் வேலை செய்கிறதா"
      ],
      "tanglish": [
        "online la irukiya",
        "internet work aagudha"
      ],
      "mixed": [
        "internet irukka partner"
      ]
    },
    "responses": {
      "en": [
        "[DYNAMIC_ONLINE_STATUS]"
      ],
      "ta": [
        "[DYNAMIC_ONLINE_STATUS]"
      ]
    }
  },
  {
    "intent": "OFFLINE_STATUS",
    "category": "utility",
    "phrases": {
      "en": [
        "are you offline",
        "is the internet down",
        "am i offline"
      ],
      "ta": [
        "நீ ஆஃப்லைனில் இருக்கிறாயா"
      ],
      "tanglish": [
        "offline la irukiya",
        "internet down ah"
      ],
      "mixed": [
        "offline ah partner"
      ]
    },
    "responses": {
      "en": [
        "[DYNAMIC_ONLINE_STATUS]"
      ],
      "ta": [
        "[DYNAMIC_ONLINE_STATUS]"
      ]
    }
  }
];
