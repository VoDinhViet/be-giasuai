export type RefreshJwtPayloadType = {
  sessionId: string;
  hash: string;
  iat: number;
  exp: number;
};
