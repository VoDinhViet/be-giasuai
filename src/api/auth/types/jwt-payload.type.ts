export class JwtPayloadType {
  userId: string;
  role: string;
  sessionId: string;
  iat: number;
  exp: number;
}
