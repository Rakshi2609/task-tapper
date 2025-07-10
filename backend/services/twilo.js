import twilio from 'twilio';
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
export default client;
