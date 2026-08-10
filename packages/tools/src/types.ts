export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface Tool {
  name: string;
  description: string;
  requiresConfirmation?: boolean;
  execute: (args?: any) => Promise<ToolResult>;
}
