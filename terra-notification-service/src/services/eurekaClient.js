import Eureka from 'eureka-js-client';
import config from '../config/index.js';

class EurekaService {
  constructor() {
    this.client = null;
    this.isRegistered = false;
  }

  initialize() {
    const { port, serviceName, eureka } = config;

    this.client = new Eureka({
      eureka: {
        host: eureka.host,
        port: eureka.port,
        servicePath: '/eureka/apps/',
        maxRetries: 10,
        requestRetryDelay: 2000,
      },
      instance: {
        app: serviceName,
        hostName: process.env.HOSTNAME || 'localhost',
        ipAddr: process.env.INSTANCE_IP || '127.0.0.1',
        statusPageUrl: `http://localhost:${port}/health`,
        healthCheckUrl: `http://localhost:${port}/health`,
        homePageUrl: `http://localhost:${port}`,
        port: {
          '$': port,
          '@enabled': true,
        },
        vipAddress: serviceName,
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn',
        },
        metadata: {
          'version': '1.0.0',
          'environment': process.env.NODE_ENV || 'development'
        }
      },
    });

    this.setupEventHandlers();
    return this.client;
  }

  setupEventHandlers() {
    this.client.on('registered', () => {
      this.isRegistered = true;
      console.log('✅ Successfully registered with Eureka');
    });

    this.client.on('deregistered', () => {
      this.isRegistered = false;
      console.log('❌ Deregistered from Eureka');
    });

    this.client.on('heartbeat', () => {
      console.log('💓 Eureka heartbeat sent');
    });

    this.client.on('registryUpdated', () => {
      console.log('Eureka registry updated');
    });
  }

  start() {
    if (!this.client) {
      this.initialize();
    }

    this.client.start(error => {
      if (error) {
        console.error('Eureka registration failed:', error);
        setTimeout(() => this.start(), 5000);
      }
    });
  }

  stop() {
    if (this.client) {
      this.client.stop();
      console.log('Eureka client stopped');
    }
  }

  isConnected() {
    return this.isRegistered;
  }
}

export default new EurekaService();