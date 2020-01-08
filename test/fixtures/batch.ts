export const sampleBatch: { [key: string]: any } = {
  events: [
    {
      event_type: 'custom_event',
      data: {
        event_name: 'Test Event',
        custom_event_type: 'other'
      }
    }
  ],
  environment: 'development',
  user_attributes: {
    $Age: 42
  },
  mpid: '12346'
};
