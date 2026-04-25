export enum JobName {
  EMAIL_VERIFICATION = 'email_verification',
}

export interface IVerifyEmailJob {
  email: string;
  token: string;
}
