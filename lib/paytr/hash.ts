import crypto from "crypto";

export interface PayTRParams {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  merchantOid: string;
  email: string;
  paymentAmount: number;
  userIp: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  merchantOkUrl: string;
  merchantFailUrl: string;
  currency?: string;
  testMode?: "0" | "1";
  noInstallment?: "0" | "1";
  maxInstallment?: string;
  basketItems: { name: string; price: number; count: number; category: string }[];
}

export function generatePayTRToken(params: PayTRParams): string {
  const {
    merchantId, merchantKey, merchantSalt,
    merchantOid, email, paymentAmount, userIp,
    userName, userAddress, userPhone,
    merchantOkUrl, merchantFailUrl,
    currency = "TL",
    testMode = "1",
    noInstallment = "0",
    maxInstallment = "0",
    basketItems,
  } = params;

  const userBasket = Buffer.from(JSON.stringify(
    basketItems.map(item => [item.name, (item.price * 100).toString(), item.count.toString()])
  )).toString("base64");

  const hashStr = [
    merchantId, userIp, merchantOid, email,
    (paymentAmount * 100).toString(),
    userBasket, noInstallment, maxInstallment,
    currency, testMode,
  ].join("");

  const paytrToken = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");

  return paytrToken;
}

export function verifyPayTRCallback(
  merchantKey: string,
  merchantSalt: string,
  postData: Record<string, string>
): boolean {
  const { merchant_oid, status, total_amount, hash } = postData;
  const hashStr = merchant_oid + merchantSalt + status + total_amount;
  const expectedHash = crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr)
    .digest("base64");
  return expectedHash === hash;
}
