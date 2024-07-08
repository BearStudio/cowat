import { alertTheme } from "@/theme/components/alert";
import { buttonTheme } from "@/theme/components/button";
import { cardTheme } from "@/theme/components/card";
import { switchTheme } from "@/theme/components/switch";
import { extendTheme } from "@chakra-ui/react";

import { config } from "./config";
import foundations from "./foundations";
import { styles } from "./styles";

export const theme = extendTheme({
  components: {
    Alert: alertTheme,
    Button: buttonTheme,
    Card: cardTheme,
    Switch: switchTheme,
  },
  config,
  styles,
  ...foundations,
});
