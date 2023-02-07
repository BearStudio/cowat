import { colors } from "./colors";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

const foundations = {
  colors,
  shadows,
  space: spacing,
  ...typography,
};

export default foundations;
