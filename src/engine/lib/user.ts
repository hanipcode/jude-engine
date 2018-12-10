import * as url from 'url';

interface RequiredQuery {
  userId: string;
}

function isAllNumber(str: string): boolean {
  return /^\d+$/.test(str);
}
export function getUserIdFromUrl(urlString: string): number {
  const parameters: any = url.parse(urlString, true);
  if (!parameters) throw new Error('Error while parsing url paramters');
  const { query }: { query: RequiredQuery } = parameters;
  const { userId } = query;
  if (!userId) throw new Error('Error: No userId parameter in query string');
  if (!isAllNumber(userId))
    throw new Error('Error: User Id parameter should be numeric');
  return parseInt(userId);
}
