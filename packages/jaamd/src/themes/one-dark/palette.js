export default {
  light: null,
  dark: {
    recessed: "#21252b",
    base: "#282c34",
    surface: "#2c313c",
    overlay: "#3e4451",
    text: "#abb2bf",
    bright: "#e6e6e6",

    primary: "#61afef",
    primaryLight: "#56b6c2",
    accent: "#c678dd",

    alert: {
      note: "#61afef",
      tip: "#98c379",
      important: "#c678dd",
      warning: "#e5c07b",
      caution: "#e06c75",
    },

    // Cards sit one step above the base, unlike the other dark themes.
    overrides: {
      "blockquote-bg": "#2c313c",
      "blockquote-fg": "#5c6370",
      "table-header-bg": "#21252b",
      "details-bg": "#2c313c",
      "details-border": "#3e4451",
    },
  },
};
