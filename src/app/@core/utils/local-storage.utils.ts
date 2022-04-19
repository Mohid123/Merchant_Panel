export enum StorageItem {
  User = 'App/user',
  LoggedInUser = 'App/loggedInUser',
  JwtToken = 'App/jwtToken',
  Key = 'App/key',
  Club = 'App/club',
  ActiveClub = 'App/activeClub',
  LastRole = 'App/lastRole',
  Creator = 'App/creator',
  CreatorStats = 'App/creatorStats',
  Theme = 'App/theme',
}

export const getItem = (itemName: StorageItem): any | null => {
  const item = localStorage.getItem(itemName);
  return item ? JSON.parse(item) : null;
};

export const setItem = (itemName: StorageItem, value: unknown): void => {
  localStorage.setItem(itemName, JSON.stringify(value));
};

export const removeItem = (itemName: StorageItem): void => {
  localStorage.removeItem(itemName);
};
