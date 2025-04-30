import winston from 'winston';
import path from 'path';
import os from 'os';
import 'winston-daily-rotate-file';

export class NacosMcpRouteLogger {
  private static logger: winston.Logger | null = null;

  private static setupLogger(): void {
    const logDir = path.join(os.homedir(), 'logs', 'nacos_mcp_router');
    const logFile = path.join(logDir, 'router.log');

    // 确保日志目录存在
    if (!require('fs').existsSync(logDir)) {
      require('fs').mkdirSync(logDir, { recursive: true });
    }

    const formatter = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} | nacos_mcp_router | ${level.padEnd(8)} | ${message}`;
      })
    );

    NacosMcpRouteLogger.logger = winston.createLogger({
      level: 'info',
      format: formatter,
      transports: [
        new winston.transports.DailyRotateFile({
          filename: logFile,
          datePattern: 'YYYY-MM-DD',
          maxSize: '10m', // 10MB
          maxFiles: '5', // 保留5个备份文件
          zippedArchive: true,
          format: formatter
        })
      ]
    });
  }

  public static getLogger(): winston.Logger {
    if (!NacosMcpRouteLogger.logger) {
      NacosMcpRouteLogger.setupLogger();
    }
    return NacosMcpRouteLogger.logger || winston.createLogger();
  }

  public static info(message: string, ...args: any[]): void {
    NacosMcpRouteLogger.getLogger().info(message, ...args);
  }

  public static error(message: string, ...args: any[]): void {
    NacosMcpRouteLogger.getLogger().error(message, ...args);
  }

  public static warn(message: string, ...args: any[]): void {
    NacosMcpRouteLogger.getLogger().warn(message, ...args);
  }

  public static debug(message: string, ...args: any[]): void {
    NacosMcpRouteLogger.getLogger().debug(message, ...args);
  }
}

// 导出单例实例
export const logger = NacosMcpRouteLogger.getLogger();
