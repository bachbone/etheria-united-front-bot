export const constructMessage = (message: string, item: string): string => {
  return message.replace("{item}", item);
}