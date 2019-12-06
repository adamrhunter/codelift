import { ListItem, Text } from "@chakra-ui/core";
import { Instance } from "mobx-state-tree";
import { FunctionComponent } from "react";
import { useMutation } from "urql";

import { observer, TailwindRule, useStore } from "../Store";

type RuleProps = {
  rule: Instance<typeof TailwindRule>;
};

const getReactElement = (element: HTMLElement) => {
  for (const key in element) {
    if (key.startsWith("__reactInternalInstance$")) {
      // @ts-ignore
      return element[key];
    }
  }
};

export const Rule: FunctionComponent<RuleProps> = observer(({ rule }) => {
  const [res, toggleClassName] = useMutation(`
    mutation ToggleClassName(
      $className: String!
      $fileName: String!
      $lineNumber: Int!
      ) {
        toggleClassName(
          className: $className
          fileName: $fileName
          lineNumber: $lineNumber
        )
      }
  `);

  if (res.error) {
    console.error(res.error);

    throw new Error(res.error.toString());
  }

  const store = useStore();
  const { selected } = store;
  const toggled = false;
  const toggleRule = (rule: Instance<typeof TailwindRule>) => {
    const { className } = rule;
    const { debugSource } = selected;

    if (!debugSource) {
      const error = new Error(
        "Selected element is missing _debugSource property"
      );

      console.error(error, selected);
      throw error;
    }

    selected.applyRule(rule);
    store.resetQuery();

    toggleClassName({ ...debugSource, className });
  };

  return (
    <ListItem
      cursor="pointer"
      fontFamily="mono"
      fontWeight="hairline"
      fontSize="xs"
      textDecoration={rule.isApplied && toggled ? "line-through" : undefined}
      onClick={() => toggleRule(rule)}
      onMouseEnter={() => selected.previewRule(rule)}
      onMouseLeave={() => selected.cancelRule(rule)}
      paddingX="2"
      paddingY="1"
      // @ts-ignore
      _hover={{
        bg: "gray.600"
      }}
    >
      <Text color={rule.isApplied ? "white" : "gray.400"}>
        {rule.className}
      </Text>
    </ListItem>
  );
});
