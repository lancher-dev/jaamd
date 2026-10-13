import type {
  MarkdownProcessor,
  ShikiConfig,
  UnifiedResolvedOptions,
} from "@astrojs/markdown-remark";
import type { SatteriResolvedOptions } from "@astrojs/markdown-satteri";
import type { AstroIntegration } from "astro";
import remarkDirective from "remark-directive";
import { remarkAlert } from "./src/plugins/remark-alert.js";
import remarkCodeTabs from "./src/plugins/remark-code-tabs.js";
import remarkToc from "./src/plugins/remark-toc.js";
import {
  satteriAlert,
  satteriCodeTabs,
  satteriDirectiveFallback,
  satteriToc,
} from "./src/plugins/satteri.js";
import { paths } from "./src/paths.js";
import { DEFAULT_SELECTOR } from "./src/scripts/utils.js";

// Same check as Astro's `isSatteriProcessor` / `isUnifiedProcessor`.
const isSatteri = (p: MarkdownProcessor): p is MarkdownProcessor<SatteriResolvedOptions> =>
  p.name === "satteri";
const isUnified = (p: MarkdownProcessor): p is MarkdownProcessor<UnifiedResolvedOptions> =>
  p.name === "unified";

export interface JaamdOptions {
  /**
   * CSS selector for the markdown content wrapper.
   * Must match the class on <MarkdownContent> (or your custom wrapper).
   * @default ".jaamd-content"
   */
  selector?: string;

  /**
   * Shiki theme. `{ light, dark }` enables dual-theme mode, which switches on a
   * `.dark` class on `<html>`.
   * @default "github-light"
   */
  theme?: string | { light: string; dark: string };

  /**
   * Skip injecting the default CSS variable fallbacks (`@lancher-dev/jaamd/default`).
   *
   * No effect with `<MarkdownContent>`, which imports them statically.
   * Applies to custom wrappers.
   * @default false
   */
  noDefault?: boolean;

  /**
   * Granular control over which markdown plugins are registered.
   * All enabled by default.
   */
  plugins?: {
    /** :::code-tabs directive. Requires `directive: true`. */
    codeTabs?: boolean;
    /** :::toc directive. Requires `directive: true`. */
    toc?: boolean;
    /** GitHub-style > [!NOTE] / [!WARNING] alerts */
    alerts?: boolean;
    /** `:::` directive syntax (prerequisite for codeTabs and toc) */
    directive?: boolean;
  };
}

/** Registers jaamd's markdown plugins on the configured processor and injects its stylesheets. */
export default function jaamd(options: JaamdOptions = {}): AstroIntegration {
  const {
    selector  = DEFAULT_SELECTOR,
    theme     = "github-light",
    noDefault = false,
    plugins   = {},
  } = options;
  const { codeTabs = true, toc = true, alerts = true, directive = true } = plugins;

  return {
    name: "@lancher-dev/jaamd",
    hooks: {
      "astro:config:setup": ({ config, updateConfig, injectScript, logger }) => {
        const needsDirective = directive || codeTabs || toc;

        const shikiConfig: ShikiConfig = { ...config.markdown.shikiConfig };

        // Dual-theme mode: { light, dark } → Shiki "themes" with CSS variables
        const isDualTheme = typeof theme === "object" && !!theme.light && !!theme.dark;
        if (isDualTheme) {
          delete shikiConfig.theme;
          shikiConfig.themes = { light: theme.light, dark: theme.dark } as ShikiConfig["themes"];
          shikiConfig.defaultColor = false;
        } else {
          shikiConfig.theme = (typeof theme === "string" ? theme : "github-light") as ShikiConfig["theme"];
        }

        shikiConfig.wrap ??= true;

        // Extended in place. New arrays, not unshift: a shared processor
        // would stack duplicates across setup runs.
        const processor = config.markdown.processor;
        let registered: number;
        let total: number;

        if (isSatteri(processor)) {
          const plugins = [
            ...(alerts ? [satteriAlert] : []),
            ...(codeTabs ? [satteriCodeTabs] : []),
            ...(toc ? [satteriToc] : []),
          ];
          const existing = processor.options.mdastPlugins;
          // Entries nest. Factories have no name.
          const namesIn = (entry: unknown): string[] =>
            Array.isArray(entry)
              ? entry.flatMap(namesIn)
              : entry && typeof entry === "object" && "name" in entry
                ? [String(entry.name)]
                : [];
          const existingNames = new Set(namesIn(existing));
          const missing = plugins.filter((p) => !existingNames.has(p.name));

          // After the user's plugins.
          const fallback =
            needsDirective && !existingNames.has(satteriDirectiveFallback.name)
              ? [satteriDirectiveFallback]
              : [];

          processor.options.mdastPlugins = [...missing, ...existing, ...fallback];
          if (needsDirective) {
            processor.options.features = { ...processor.options.features, directive: true };
          }
          [registered, total] = [missing.length, plugins.length];
        } else if (isUnified(processor)) {
          const plugins = [
            ...(alerts ? [remarkAlert] : []),
            // directive must come before its consumers
            ...(needsDirective ? [remarkDirective] : []),
            ...(codeTabs ? [remarkCodeTabs] : []),
            ...(toc ? [remarkToc] : []),
          ];
          const existing = processor.options.remarkPlugins;

          // Registering a plugin twice re-registers its micromark extensions.
          const nameOf = (p: unknown): string => {
            const fn = Array.isArray(p) ? p[0] : p;
            return typeof fn === "function" ? fn.name : "";
          };
          const existingNames = new Set(existing.map(nameOf).filter(Boolean));
          const missing = plugins.filter(
            (p) => !existing.includes(p) && !existingNames.has(nameOf(p)),
          );

          processor.options.remarkPlugins = [...missing, ...existing];
          [registered, total] = [missing.length, plugins.length];
        } else {
          logger.warn(
            `markdown processor "${processor.name}" is neither Sätteri nor unified; jaamd's plugins (alerts/code-tabs/toc) were not added. Pass them to your processor manually.`,
          );
          [registered, total] = [0, 0];
        }

        if (total > 0) {
          logger.info(
            `markdown processor: ${processor.name}, registered ${registered}/${total} plugin(s)`,
          );
        }

        updateConfig({
          vite: {
            // Without this, jaamd's .astro sources stay pre-bundled externals
            // and never reach the Astro compiler.
            ssr: { noExternal: ["@lancher-dev/jaamd"] },
          },
          markdown: { shikiConfig },
        });

        // Stylesheets go through "page-ssr". CSS imported from the client "page"
        // stage is dropped by Rollup in static builds.
        injectScript(
          "page-ssr",
          [
            ...(noDefault ? [] : [`import ${paths.variables};`]),
            ...(isDualTheme ? [`import ${paths.shikiDual};`] : []),
            `import ${paths.markdown};`,
          ].join("\n"),
        );

        injectScript(
          "page",
          [
            `import { initMarkdownEnhancements } from ${paths.client};`,
            `function __jaamdRun() { initMarkdownEnhancements(${JSON.stringify(selector)}); }`,
            `__jaamdRun();`,
            `document.addEventListener("astro:page-load", __jaamdRun);`,
          ].join("\n"),
        );

        logger.info("jaamd: markdown enhancements ready");
      },
    },
  };
}

// For manual processor setup
export {
  satteriAlert,
  satteriCodeTabs,
  satteriDirectiveFallback,
  satteriToc,
} from "./src/plugins/satteri.js";
export { default as remarkCodeTabs } from "./src/plugins/remark-code-tabs.js";
export { default as remarkToc } from "./src/plugins/remark-toc.js";
export { remarkAlert } from "./src/plugins/remark-alert.js";
export { default as remarkDirective } from "remark-directive";

export type { JaamdOptions as Options };