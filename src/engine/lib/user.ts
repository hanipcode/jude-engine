import * as url from 'url';

interface RequiredQuery {
  userId: string;
  phoneNumber: string;
}

function isAllNumber(str: string): boolean {
  return /^\d+$/.test(str);
}

function getQueryFromUrl(urlString: string): RequiredQuery {
  const parameters: any = url.parse(urlString, true);
  if (!parameters) throw new Error('Error while parsing url paramters');
  const { query }: { query: RequiredQuery } = parameters;
  return query;
}

export function getUserIdFromUrl(urlString: string): number {
  const query: RequiredQuery = getQueryFromUrl(urlString);
  const { userId } = query;
  if (!userId) throw new Error('Error: No userId parameter in query string');
  if (!isAllNumber(userId))
    throw new Error('Error: User Id parameter should be numeric');
  return parseInt(userId);
}

export function getPhoneNumberFromUrl(urlString: string): string {
  const query: RequiredQuery = getQueryFromUrl(urlString);
  const { phoneNumber } = query;
  if (!phoneNumber)
    throw new Error('Error: No phoneNumber parameter in query string');
  return phoneNumber;
}
