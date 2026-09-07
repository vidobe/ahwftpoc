/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-overview.js
  var import_overview_exports = {};
  __export(import_overview_exports, {
    default: () => import_overview_default
  });

  // tools/importer/parsers/title.js
  function parse(element, { document }) {
    const heading = element.querySelector("h1, h2, h3, h4, h5, h6");
    const paragraphs = Array.from(element.querySelectorAll("p"));
    if (!heading && paragraphs.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    contentCell.push(...paragraphs);
    const cells = [];
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "title", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tip.js
  function parse2(element, { document }) {
    const rowDivs = Array.from(element.querySelectorAll(":scope > div"));
    const labelRow = rowDivs[0];
    const bodyRow = rowDivs[1];
    const labelEl = labelRow ? labelRow.querySelector("p, strong") : null;
    const bodyParagraphs = bodyRow ? Array.from(bodyRow.querySelectorAll("p")) : [];
    if (!labelEl && bodyParagraphs.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (labelEl) cells.push([labelEl]);
    if (bodyParagraphs.length) cells.push([bodyParagraphs]);
    const block = WebImporter.Blocks.createBlock(document, { name: "tip", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/note.js
  function parse3(element, { document }) {
    const rowDivs = Array.from(element.querySelectorAll(":scope > div"));
    const labelRow = rowDivs[0];
    const bodyRow = rowDivs[1];
    const labelEl = labelRow ? labelRow.querySelector("p, strong") : null;
    const bodyParagraphs = bodyRow ? Array.from(bodyRow.querySelectorAll("p")) : [];
    if (!labelEl && bodyParagraphs.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (labelEl) cells.push([labelEl]);
    if (bodyParagraphs.length) cells.push([bodyParagraphs]);
    const block = WebImporter.Blocks.createBlock(document, { name: "note", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/heineken-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".floating-btn",
        ".modal",
        ".image-modal"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "aside.left-navigation-wrapper",
        "aside.right-rail",
        ".on-this-page-wrapper",
        "div.next-button.block"
      ]);
    }
  }

  // tools/importer/import-overview.js
  var parsers = {
    title: parse,
    tip: parse2,
    note: parse3
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "overview",
    description: "AEM Edge Delivery documentation guide page: page heading, intro title block, body copy with feature list, Quick Tip callout, Prerequisites, and a Note callout.",
    urls: [
      "https://main--heineken--adobe-demopoc.aem.live/overview"
    ],
    blocks: [
      {
        name: "title",
        instances: [".title.heading-3"]
      },
      {
        name: "tip",
        instances: [".tip"]
      },
      {
        name: "note",
        instances: [".note"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Overview content",
        selector: "body > main",
        style: null,
        blocks: ["title", "tip", "note"],
        defaultContent: ["h1#overview", "ul", "h3#prerequisites"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_overview_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_overview_exports);
})();
