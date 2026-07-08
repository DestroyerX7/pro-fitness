import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailVerificationOtp = async (email: string, otp: string) => {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email",
    html: `<p>Your verification code is <strong>${otp}</strong></p>`,
  });
};

export const sendForgotPasswordOtp = async (email: string, otp: string) => {
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset password OTP",
    html: `<p>Your reset password code is <strong>${otp}</strong></p>`,
  });
};
