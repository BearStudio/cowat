import { buttonTheme } from "@/theme/components/button";
import { extendTheme } from "@chakra-ui/react";

import { config } from "./config";
import foundations from "./foundations";
import { styles } from "./styles";

export const theme = extendTheme({
  components: { Button: buttonTheme },
  config,
  styles,
  ...foundations,
});
