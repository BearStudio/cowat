import { buttonTheme } from "@/theme/components/button";
import { cardTheme } from "@/theme/components/card";
import { extendTheme } from "@chakra-ui/react";

import { config } from "./config";
import foundations from "./foundations";
import { styles } from "./styles";

export const theme = extendTheme({
  components: { Button: buttonTheme, Card: cardTheme },
  config,
  styles,
  ...foundations,
});
