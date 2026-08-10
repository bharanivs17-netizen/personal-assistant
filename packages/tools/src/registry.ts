import { Tool, ToolResult } from './types';

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool) {
    if (this.tools.has(tool.name)) {
      console.warn(`[ToolRegistry] Tool ${tool.name} is already registered. Overwriting.`);
    }
    this.tools.set(tool.name, tool);
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  async execute(name: string, args?: any): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        message: `Tool ${name} is not registered.`,
      };
    }

    try {
      return await tool.execute(args);
    } catch (error: any) {
      console.error(`[ToolRegistry] Error executing ${name}:`, error);
      return {
        success: false,
        message: `Failed to execute ${name}: ${error.message || 'Unknown error'}`,
      };
    }
  }
}

export const registry = new ToolRegistry();
