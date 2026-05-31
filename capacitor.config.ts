import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.billflow.erp',
  appName: 'BillFlow ERP',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
