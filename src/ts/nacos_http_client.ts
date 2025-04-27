import axios from 'axios';
import { McpServer } from './router_types';
import { NacosMcpServerConfig, ToolSpec, Tool } from './nacos_mcp_server_config';

class NacosHttpClient {
  nacosAddr: string;
  userName: string;
  passwd: string;

  constructor(nacosAddr: string, userName: string, passwd: string) {
    if (!nacosAddr) throw new Error('nacosAddr cannot be an empty string');
    if (!userName) throw new Error('userName cannot be an empty string');
    if (!passwd) throw new Error('passwd cannot be an empty string');
    this.nacosAddr = nacosAddr;
    this.userName = userName;
    this.passwd = passwd;
  }

  async get_mcp_server_by_name(name: string): Promise<McpServer> {
    const url = `http://${this.nacosAddr}/nacos/v3/admin/ai/mcp?mcpName=${name}`;
    const headers = {
      'Content-Type': 'application/json',
      'charset': 'utf-8',
      'userName': this.userName,
      'password': this.passwd
    };
    let mcp_server: McpServer = new McpServer(name, '', {});
    try {
      const response = await axios.get(url, { headers });
      if (response.status === 200) {
        const data = response.data.data;
        const config = NacosMcpServerConfig.from_dict(data);
        let mcpServer = new McpServer(config.name, config.description || '', config.local_server_config);
        mcpServer.mcp_config_detail = config;
        if (config.protocol !== 'stdio' && config.backend_endpoints.length > 0) {
          const endpoint = config.backend_endpoints[0];
          let http_schema = endpoint.port === 443 ? 'https' : 'http';
          let url = `${http_schema}://${endpoint.address}:${endpoint.port}${config.remote_server_config.export_path}`;
          if (!config.remote_server_config.export_path.startsWith('/')) {
            url = `${http_schema}://${endpoint.address}:${endpoint.port}/${config.remote_server_config.export_path}`;
          }
          if (!mcpServer.agentConfig['mcpServers']) {
            mcpServer.agentConfig['mcpServers'] = {};
          }
          const mcpServers = mcpServer.agentConfig['mcpServers'];
          const dct = { name: mcp_server.name, description: mcp_server.description, url };
          mcpServers[mcp_server.name] = dct;
        }
        return mcpServer;
      } else {
        console.warn(`failed to get mcp server ${mcp_server.name}, response: ${response.data}`);
      }
    } catch (e: any) {
      console.warn(`failed to get mcp server ${mcp_server.name}, error: ${e}`);
    }
    return mcp_server;
  }

  async get_mcp_servers_by_page(page_no: number, page_size: number): Promise<McpServer[]> {
    const mcpServers: McpServer[] = [];
    try {
      const url = `http://${this.nacosAddr}/nacos/v3/admin/ai/mcp/list?pageNo=${page_no}&pageSize=${page_size}`;
      const headers = {
        'Content-Type': 'application/json',
        'charset': 'utf-8',
        'userName': this.userName,
        'password': this.passwd
      };
      const response = await axios.get(url, { headers });
      if (response.status !== 200) {
        console.warn(`failed to get mcp server list response: ${response.data}`);
        return [];
      }
      const data = response.data.data;
      for (const mcp_server_dict of data.pageItems) {
        if (mcp_server_dict.enabled) {
          const mcp_name = mcp_server_dict.name;
          const mcpServer = await this.get_mcp_server_by_name(mcp_name);
          if (!mcpServer.description) continue;
          mcpServers.push(mcpServer);
        }
      }
      return mcpServers;
    } catch (e) {
      return mcpServers;
    }
  }

  async get_mcp_servers(): Promise<McpServer[]> {
    const mcpServers: McpServer[] = [];
    try {
      const page_size = 100;
      const page_no = 1;
      const url = `http://${this.nacosAddr}/nacos/v3/admin/ai/mcp/list?pageNo=${page_no}&pageSize=${page_size}`;
      const headers = {
        'Content-Type': 'application/json',
        'charset': 'utf-8',
        'userName': this.userName,
        'password': this.passwd
      };
      const response = await axios.get(url, { headers });
      if (response.status !== 200) {
        console.warn(`failed to get mcp server list, url ${url}, response: ${response.data}`);
        return [];
      }
      const total_count = response.data.data.totalCount;
      const total_pages = Math.floor(total_count / page_size) + 1;
      for (let i = 1; i <= total_pages; i++) {
        const mcps = await this.get_mcp_servers_by_page(i, page_size);
        for (const mcp_server of mcps) {
          mcpServers.push(mcp_server);
        }
      }
      return mcpServers;
    } catch (e) {
      return mcpServers;
    }
  }

  async update_mcp_tools(mcp_name: string, tools: Tool[]): Promise<boolean> {
    const url = `http://${this.nacosAddr}/nacos/v3/admin/ai/mcp?mcpName=${mcp_name}`;
    const headers = {
      'Content-Type': 'application/json',
      'charset': 'utf-8',
      'userName': this.userName,
      'password': this.passwd
    };
    try {
      const response = await axios.get(url, { headers });
      if (response.status === 200) {
        const data = response.data.data;
        const tool_list = tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }));
        const endpointSpecification: any = {};
        if (data.protocol !== 'stdio') {
          endpointSpecification['data'] = data.remoteServerConfig.serviceRef;
          endpointSpecification['type'] = 'REF';
        }
        if (!data.toolSpec) data.toolSpec = {};
        data.toolSpec.tools = tool_list;
        const params: any = {
          mcpName: mcp_name,
          serverSpecification: JSON.stringify({ ...data, toolSpec: undefined, backendEndpoints: undefined }),
          endpointSpecification: JSON.stringify(endpointSpecification),
          toolSpecification: JSON.stringify(data.toolSpec)
        };
        console.info('update mcp tools, params', params);
        const putUrl = `http://${this.nacosAddr}/nacos/v3/admin/ai/mcp?`;
        const putHeaders = {
          'Content-Type': 'application/x-www-form-urlencoded',
          'charset': 'utf-8',
          'userName': this.userName,
          'password': this.passwd
        };
        const response_update = await axios.put(putUrl, new URLSearchParams(params), { headers: putHeaders });
        if (response_update.status === 200) {
          return true;
        } else {
          console.warn(`failed to update mcp tools list, caused: ${response_update.data}`);
          return false;
        }
      } else {
        console.warn(`failed to update mcp tools list, caused: ${response.data}`);
        return false;
      }
    } catch (e: any) {
      console.warn(`failed to update mcp tools list, caused: ${e}`);
      return false;
    }
  }
}

export { NacosHttpClient }; 