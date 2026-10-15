export const navigation = {
  assign(url: string) {
    window.location.assign(url);
  },
  replacePath(path: string) {
    window.history.replaceState({}, '', path);
  },
};
