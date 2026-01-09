import ResClient from 'resclient';

const API_URL = 'wss://api.iot.loiccapdeville.fr';

export const client = new ResClient(API_URL);

export const connectToSensor = (sensorType: string, deviceId: string, callback: (data: any) => void) => {
  const resourceId = `sensormanager.sensor.${sensorType}.${deviceId}`;
  
  client.get(resourceId).then((model: any) => {
    callback(model);
    
    // Listen for changes
    model.on('change', (event: any) => {
      callback(model);
    });
  }).catch((err: any) => {
    console.error(`Error connecting to ${sensorType}:`, err);
  });
};

export const recordSensorData = async (sensorType: string, params: any) => {
  try {
    const result = await client.call(`sensormanager.sensor.${sensorType}`, 'record', params);
    return result;
  } catch (error) {
    console.error(`Error recording ${sensorType} data:`, error);
    throw error;
  }
};