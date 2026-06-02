import { OrderedList } from "@tiptap/extension-ordered-list";

export type ListStyleType = "decimal" | "lower-alpha" | "upper-alpha" | "lower-roman" | "upper-roman";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    orderedListStyle: {
      toggleOrderedListWithStyle: (listStyleType: ListStyleType) => ReturnType;
    };
  }
}

export const OrderedListWithStyle = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: "decimal" as ListStyleType,
        parseHTML: (element) =>
          (element.getAttribute("data-list-style") as ListStyleType) ||
          (element.style.listStyleType as ListStyleType) ||
          "decimal",
        renderHTML: (attributes) => {
          const type = (attributes.listStyleType as ListStyleType) || "decimal";
          return {
            "data-list-style": type,
            style: `list-style-type: ${type}`,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      toggleOrderedListWithStyle:
        (listStyleType: ListStyleType) =>
        ({ chain, editor }) => {
          if (editor.isActive(this.name)) {
            return chain().focus().updateAttributes(this.name, { listStyleType }).run();
          }
          return chain().focus().toggleOrderedList().updateAttributes(this.name, { listStyleType }).run();
        },
    };
  },
});
