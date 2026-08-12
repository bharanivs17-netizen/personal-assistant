import { Tool, ToolResult } from '../types';

export const open_youtube: Tool = {
  name: 'open_youtube',
  description: 'Opens YouTube or searches for a query',
  execute: async (args?: { query?: string }): Promise<ToolResult> => {
    try {
      const query = args?.query?.trim();
      let url = 'https://www.youtube.com/';
      if (query) {
        url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      }
      return { success: true, message: 'Opening YouTube', data: { url } };
    } catch (error: any) {
      return { success: false, message: `Failed to construct YouTube URL: ${error.message}` };
    }
  }
};

export const search_web: Tool = {
  name: 'search_web',
  description: 'Searches the web for a query',
  execute: async (args?: { query: string }): Promise<ToolResult> => {
    try {
      const query = args?.query?.trim();
      if (!query) {
        return { success: false, message: 'No search query provided' };
      }
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      return { success: true, message: 'Searching the web', data: { url } };
    } catch (error: any) {
      return { success: false, message: `Failed to construct search URL: ${error.message}` };
    }
  }
};

export const open_google: Tool = {
  name: 'open_google',
  description: 'Opens Google',
  execute: async (): Promise<ToolResult> => {
    return { success: true, message: 'Opening Google', data: { url: 'https://www.google.com/' } };
  }
};

export const open_gmail: Tool = {
  name: 'open_gmail',
  description: 'Opens Gmail',
  execute: async (): Promise<ToolResult> => {
    return { success: true, message: 'Opening Gmail', data: { url: 'https://mail.google.com/' } };
  }
};

export const open_whatsapp_web: Tool = {
  name: 'open_whatsapp_web',
  description: 'Opens WhatsApp Web',
  execute: async (): Promise<ToolResult> => {
    return { success: true, message: 'Opening WhatsApp Web', data: { url: 'https://web.whatsapp.com/' } };
  }
};

import { registry } from '../registry';

export function registerWebTools() {
  registry.register(open_youtube);
  registry.register(search_web);
  registry.register(open_google);
  registry.register(open_gmail);
  registry.register(open_whatsapp_web);
}
