export class McpServer {
  name: string;
  description: string;
  agentConfig: Record<string, any>;
  mcp_config_detail?: any;
  constructor(name: string, description: string, agentConfig: Record<string, any>) {
    this.name = name;
    this.description = description;
    this.agentConfig = agentConfig;
  }
  get_name(): string {
    return this.name;
  }
  get_description(): string {
    return this.description;
  }
  agent_config(): Record<string, any> {
    return this.agentConfig;
  }
  to_dict() {
    return {
      name: this.name,
      description: this.description,
      agentConfig: this.agentConfig,
    };
  }
} 