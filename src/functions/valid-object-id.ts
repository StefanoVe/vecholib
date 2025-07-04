export const isValidMongoObjectId = (id: string): boolean => {
  return id.match(/^[0-9a-fA-F]{24}$/) !== null;
};
