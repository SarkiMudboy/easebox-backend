// Dummy SMS service - replace with actual SMS provider (Twilio, etc.)
export class SmsService {
  sendSms(phone: string, message: string): boolean {
    // TODO: Integrate with actual SMS provider
    console.log(`[SMS Service] Sending to ${phone}: ${message}`);

    // Simulate SMS sending - always succeeds in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[SMS Service] OTP would be sent to ${phone}`);
      return true;
    }

    // In production, this would call an actual SMS API
    // Example with Twilio:
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({ body: message, from: twilioNumber, to: phone });

    return true;
  }

  sendVerificationSms(phone: string, otp: string): boolean {
    const message = `Your EaseBox verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSms(phone, message);
  }
}
