import dotenv from 'dotenv';
dotenv.config();

// Configuration par défaut (fallback)
const defaultConfig = {
  port: process.env.PORT || 4002,
  serviceName: process.env.SERVICE_NAME || 'terra-notification-service',
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'notification'
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'user.events',
    queue: process.env.RABBITMQ_QUEUE || 'queue.user.created'
  },
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  },
  eureka: {
    host: process.env.EUREKA_HOST || 'localhost',
    port: process.env.EUREKA_PORT || 8761
  }
};

let currentConfig = { ...defaultConfig };

export async function initializeConfig() {
  try {
    console.log('📡 Fetching configuration from Config Service...');
    
    const remoteConfig = await fetchConfigFromSpringConfig();
    
    // ⭐ CORRECTION : Fusion intelligente qui garde les valeurs par défaut ⭐
    currentConfig = {
      port: remoteConfig.port || defaultConfig.port,
      serviceName: remoteConfig.serviceName || defaultConfig.serviceName,
      database: { ...defaultConfig.database, ...remoteConfig.database },
      rabbitmq: { ...defaultConfig.rabbitmq, ...remoteConfig.rabbitmq },
      email: { ...defaultConfig.email, ...remoteConfig.email },
      eureka: { ...defaultConfig.eureka, ...remoteConfig.eureka }
    };
    
    console.log('✅ Configuration loaded successfully - Port:', currentConfig.port);
    return currentConfig;
    
  } catch (error) {
    console.log('⚠️ Using default configuration (Config Service unavailable)');
    console.log('🔧 Default port:', defaultConfig.port);
    return currentConfig;
  }
}

async function fetchConfigFromSpringConfig() {
  const configServiceUrl = process.env.CONFIG_SERVICE_URL || 'http://localhost:8888';
  const serviceName = process.env.SERVICE_NAME || 'terra-notification-service';
  
  try {
    console.log(`🔧 Calling: ${configServiceUrl}/${serviceName}/default`);
    
    const response = await fetch(`${configServiceUrl}/${serviceName}/default`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const configData = await response.json();
    console.log('📋 Config Service response received');
    
    return extractConfigFromSpringResponse(configData);
    
  } catch (error) {
    console.error('❌ Config Service error:', error.message);
    throw error;
  }
}

function extractConfigFromSpringResponse(springConfig) {
  const config = {};
  
  if (springConfig.propertySources && springConfig.propertySources.length > 0) {
    // Extraire toutes les propriétés
    const allProperties = {};
    springConfig.propertySources.forEach(source => {
      Object.assign(allProperties, source.source);
    });
    
    console.log('🔍 Properties found:', Object.keys(allProperties));
    
    // ⭐ CORRECTION : Avec valeurs par défaut ⭐
    config.port = allProperties['server.port'] || defaultConfig.port;
    config.serviceName = allProperties['spring.application.name'] || defaultConfig.serviceName;
    
    config.database = {
      host: extractHostFromUrl(allProperties['spring.datasource.url']) || defaultConfig.database.host,
      user: allProperties['spring.datasource.username'] || defaultConfig.database.user,
      password: allProperties['spring.datasource.password'] || defaultConfig.database.password,
      name: extractDbName(allProperties['spring.datasource.url']) || defaultConfig.database.name
    };
    
    config.rabbitmq = {
      url: allProperties['spring.rabbitmq.host'] 
        ? `amqp://${allProperties['spring.rabbitmq.host']}:${allProperties['spring.rabbitmq.port'] || 5672}`
        : defaultConfig.rabbitmq.url,
      exchange: allProperties['notification.rabbitmq.exchange'] || defaultConfig.rabbitmq.exchange,
      queue: allProperties['notification.rabbitmq.queue'] || defaultConfig.rabbitmq.queue
    };
    
    config.email = {
      user: allProperties['spring.mail.username'] || defaultConfig.email.user,
      pass: allProperties['spring.mail.password'] || defaultConfig.email.pass
    };
    
    config.eureka = {
      host: extractEurekaHost(allProperties['eureka.client.serviceUrl.defaultZone']) || defaultConfig.eureka.host,
      port: extractEurekaPort(allProperties['eureka.client.serviceUrl.defaultZone']) || defaultConfig.eureka.port
    };
  }
  
  return config;
}

function extractHostFromUrl(url) {
  if (!url) return null;
  const match = url.match(/:\/\/([^\/:]+)/);
  return match ? match[1] : null;
}

function extractDbName(url) {
  if (!url) return null;
  const match = url.match(/\/([^\/?]+)(\?|$)/);
  return match ? match[1] : null;
}

function extractEurekaHost(url) {
  if (!url) return null;
  const match = url.match(/https?:\/\/([^:]+)/);
  return match ? match[1] : 'localhost';
}

function extractEurekaPort(url) {
  if (!url) return null;
  const match = url.match(/https?:\/\/[^:]+:(\d+)/);
  return match ? parseInt(match[1]) : 8761;
}

// ⭐ AJOUTEZ LES EXPORTS POUR COMPATIBILITÉ ⭐
export const port = currentConfig.port;
export const serviceName = currentConfig.serviceName;
export const rabbiturl = currentConfig.rabbitmq.url;
export const emailUser = currentConfig.email.user;
export const emailPass = currentConfig.email.pass;

export default currentConfig;