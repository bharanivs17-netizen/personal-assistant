export type ToolIntent = {
  intent: string;
  toolName: string;
  phrases: {
    en: string[];
    ta: string[];
    tanglish: string[];
    mixed: string[];
  };
};

export const SYSTEM_TOOLS: ToolIntent[] = [
  {
    intent: 'BRIGHTNESS_DOWN',
    toolName: 'brightness_down',
    phrases: {
      en: ['reduce brightness', 'brightness down', 'make screen darker', 'lower brightness', 'decrease brightness'],
      ta: ['பிரைட்னஸை குறை', 'ஸ்கிரீன் வெளிச்சத்தை குறை', 'ஸ்கிரீனை கொஞ்சம் டார்க் பண்ணு'],
      tanglish: ['brightness ah kammi pannu', 'screen dark pannu', 'brightness down pannu', 'screen brightness reduce pannu'],
      mixed: ['brightness reduce pannu partner']
    }
  },
  {
    intent: 'BRIGHTNESS_UP',
    toolName: 'brightness_up',
    phrases: {
      en: ['increase brightness', 'brightness up', 'make screen brighter', 'raise brightness'],
      ta: ['பிரைட்னஸை அதிகப்படுத்து', 'ஸ்கிரீன் வெளிச்சத்தை அதிகப்படுத்து'],
      tanglish: ['brightness increase pannu', 'screen bright pannu', 'brightness up pannu'],
      mixed: ['brightness increase pannu partner']
    }
  },
  {
    intent: 'VOLUME_DOWN',
    toolName: 'volume_down',
    phrases: {
      en: ['volume down', 'lower volume', 'make it quieter', 'decrease volume'],
      ta: ['வால்யூமை குறை', 'சத்தத்தை குறை'],
      tanglish: ['volume kammi pannu', 'sound kammi pannu'],
      mixed: ['volume down pannu partner']
    }
  },
  {
    intent: 'VOLUME_UP',
    toolName: 'volume_up',
    phrases: {
      en: ['volume up', 'make it louder', 'increase volume', 'raise volume'],
      ta: ['வால்யூமை அதிகப்படுத்து', 'சத்தத்தை அதிகப்படுத்து'],
      tanglish: ['volume increase pannu', 'sound increase pannu'],
      mixed: ['volume up pannu partner']
    }
  },
  {
    intent: 'VOLUME_MUTE',
    toolName: 'volume_mute',
    phrases: {
      en: ['mute volume', 'mute', 'silence'],
      ta: ['சத்தத்தை மியூட் செய்'],
      tanglish: ['mute pannu', 'sound mute pannu'],
      mixed: ['volume mute pannu']
    }
  },
  {
    intent: 'VOLUME_UNMUTE',
    toolName: 'volume_unmute',
    phrases: {
      en: ['unmute volume', 'unmute'],
      ta: ['சத்தத்தை அன்மியூட் செய்'],
      tanglish: ['unmute pannu'],
      mixed: ['volume unmute pannu']
    }
  },
  {
    intent: 'LOCK_COMPUTER',
    toolName: 'lock_computer',
    phrases: {
      en: ['lock my pc', 'lock computer', 'lock screen', 'lock the computer', 'lock my computer'],
      ta: ['கம்ப்யூட்டரை லாக் செய்'],
      tanglish: ['system ah lock pannu', 'pc lock pannu'],
      mixed: ['lock my pc partner']
    }
  },
  {
    intent: 'SLEEP_COMPUTER',
    toolName: 'sleep_computer',
    phrases: {
      en: ['put my pc to sleep', 'sleep my computer', 'sleep computer', 'put my computer to sleep'],
      ta: ['கம்ப்யூட்டரை ஸ்லீப் மோடில் வை'],
      tanglish: ['system sleep pannu', 'pc sleep pannu'],
      mixed: ['put pc to sleep']
    }
  },
  {
    intent: 'RESTART_COMPUTER',
    toolName: 'restart_computer',
    phrases: {
      en: ['restart my pc', 'restart computer', 'reboot my computer', 'restart my computer'],
      ta: ['கம்ப்யூட்டரை ரீஸ்டார்ட் பண்ணு'],
      tanglish: ['pc ah restart pannu', 'computer restart pannu'],
      mixed: ['restart my pc partner']
    }
  },
  {
    intent: 'SHUTDOWN_COMPUTER',
    toolName: 'shutdown_computer',
    phrases: {
      en: ['shut down my pc', 'shutdown computer', 'turn off my computer', 'power off my pc', 'shutdown my pc', 'shut down the computer'],
      ta: ['கம்ப்யூட்டரை ஆஃப் பண்ணு', 'கம்ப்யூட்டரை நிறுத்து'],
      tanglish: ['computer ah shutdown pannu', 'pc ah off pannu', 'computer off pannu', 'pc shutdown pannu'],
      mixed: ['shut down my pc partner']
    }
  },
  {
    intent: 'OPEN_CALCULATOR',
    toolName: 'open_whitelisted_app',
    phrases: {
      en: ['open calculator'],
      ta: ['கால்குலேட்டரை திற'],
      tanglish: ['calculator open pannu'],
      mixed: ['open calculator partner']
    }
  },
  {
    intent: 'OPEN_NOTEPAD',
    toolName: 'open_whitelisted_app',
    phrases: {
      en: ['open notepad'],
      ta: ['நோட்பேடை திற'],
      tanglish: ['notepad open pannu'],
      mixed: ['open notepad partner']
    }
  },
  {
    intent: 'OPEN_BROWSER',
    toolName: 'open_whitelisted_app',
    phrases: {
      en: ['open browser'],
      ta: ['பிரவுசரை திற'],
      tanglish: ['browser open pannu'],
      mixed: ['open browser partner']
    }
  },
  {
    intent: 'PARTNER_MICROPHONE_OFF',
    toolName: 'partner_microphone_off',
    phrases: {
      en: ['turn off your microphone', 'mic off', 'disable microphone', 'stop microphone', 'turn off your mic', 'dont listen'],
      ta: ['மைக் ஆஃப் பண்ணு', 'மைக்ரோஃபோனை ஆஃப் பண்ணு', 'கேட்பதை நிறுத்து'],
      tanglish: ['mic off pannu', 'microphone off pannu', 'kekuratha niruthu', 'listen pannatha'],
      mixed: ['mic off pannu partner']
    }
  },
  {
    intent: 'SYSTEM_STATUS',
    toolName: 'system_status',
    phrases: {
      en: ['are you listening', 'is your microphone on', 'what is the volume', 'what is the brightness', 'are you connected', 'system status'],
      ta: ['உன் மைக் ஆன்ல இருக்கா', 'வால்யூம் எவ்வளவு', 'பிரைட்னஸ் எவ்வளவு'],
      tanglish: ['mic on la irukka', 'volume evlo irukku', 'brightness evlo irukku'],
      mixed: ['system status enna']
    }
  }
];
