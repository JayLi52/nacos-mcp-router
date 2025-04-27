export class InputProperty {
  type: string;
  description: string;
  constructor(type: string, description: string) {
    this.type = type;
    this.description = description;
  }
  static from_dict(data: any): InputProperty {
    if (!data) return new InputProperty('', '');
    return new InputProperty(data.type, data.description);
  }
}

export class InputSchema {
  type: string;
  properties: Record<string, InputProperty>;
  constructor(type: string, properties: Record<string, InputProperty>) {
    this.type = type;
    this.properties = properties;
  }
  static from_dict(data: any): InputSchema {
    if (!data) return new InputSchema('', {});
    const props: Record<string, InputProperty> = {};
    for (const k in data.properties) {
      props[k] = InputProperty.from_dict(data.properties[k]);
    }
    return new InputSchema(data.type, props);
  }
}

export class Tool {
  name: string;
  description: string;
  inputSchema: InputSchema;
  constructor(name: string, description: string, inputSchema: InputSchema) {
    this.name = name;
    this.description = description;
    this.inputSchema = inputSchema;
  }
  static from_dict(data: any): Tool {
    return new Tool(data.name, data.description, InputSchema.from_dict(data.inputSchema));
  }
}

export class ToolSpec {
  tools: Tool[];
  toolsMeta: Record<string, any>;
  constructor(tools: Tool[], toolsMeta: Record<string, any>) {
    this.tools = tools;
    this.toolsMeta = toolsMeta;
  }
  static from_dict(data: any): ToolSpec {
    return new ToolSpec(
      (data.tools || []).map((t: any) => Tool.from_dict(t)),
      data.toolsMeta || {}
    );
  }
}

export class ServiceRef {
  namespaceId: string;
  groupName: string;
  serviceName: string;
  constructor(namespaceId: string, groupName: string, serviceName: string) {
    this.namespaceId = namespaceId;
    this.groupName = groupName;
    this.serviceName = serviceName;
  }
  static from_dict(data: any): ServiceRef {
    if (!data) return new ServiceRef('', '', '');
    return new ServiceRef(data.namespaceId, data.groupName, data.serviceName);
  }
}

export class RemoteServerConfig {
  serviceRef: ServiceRef;
  exportPath: string;
  credentials: Record<string, any>;
  constructor(serviceRef: ServiceRef, exportPath: string, credentials: Record<string, any> = {}) {
    this.serviceRef = serviceRef;
    this.exportPath = exportPath;
    this.credentials = credentials;
  }
  static from_dict(data: any): RemoteServerConfig {
    if (!data) return new RemoteServerConfig(ServiceRef.from_dict({}), '', {});
    return new RemoteServerConfig(
      ServiceRef.from_dict(data.serviceRef),
      data.exportPath,
      data.credentials || {}
    );
  }
}

export class BackendEndpoint {
  address: string;
  port: number;
  constructor(address: string, port: number) {
    this.address = address;
    this.port = port;
  }
  static from_dict(data: any): BackendEndpoint {
    if (!data) return new BackendEndpoint('', -1);
    return new BackendEndpoint(data.address, data.port);
  }
}

export class NacosMcpServerConfig {
  name: string;
  protocol: string;
  description?: string;
  version: string;
  remote_server_config: RemoteServerConfig;
  local_server_config: Record<string, any>;
  enabled: boolean;
  capabilities: string[];
  backend_endpoints: BackendEndpoint[];
  tool_spec: ToolSpec;
  constructor(
    name: string,
    protocol: string,
    description: string | undefined,
    version: string,
    remote_server_config: RemoteServerConfig,
    local_server_config: Record<string, any> = {},
    enabled: boolean = true,
    capabilities: string[] = [],
    backend_endpoints: BackendEndpoint[] = [],
    tool_spec: ToolSpec = new ToolSpec([], {})
  ) {
    this.name = name;
    this.protocol = protocol;
    this.description = description;
    this.version = version;
    this.remote_server_config = remote_server_config;
    this.local_server_config = local_server_config;
    this.enabled = enabled;
    this.capabilities = capabilities;
    this.backend_endpoints = backend_endpoints;
    this.tool_spec = tool_spec;
  }
  static from_dict(data: any): NacosMcpServerConfig {
    const tool_spec_data = data.toolSpec;
    const backend_endpoints_data = data.backendEndpoints;
    return new NacosMcpServerConfig(
      data.name,
      data.protocol,
      data.description,
      data.version,
      RemoteServerConfig.from_dict(data.remoteServerConfig),
      data.localServerConfig || {},
      data.enabled !== undefined ? data.enabled : true,
      data.capabilities || [],
      (backend_endpoints_data || []).map((e: any) => BackendEndpoint.from_dict(e)),
      tool_spec_data ? ToolSpec.from_dict(tool_spec_data) : new ToolSpec([], {})
    );
  }
} 