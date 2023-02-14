import { dayjsTz, dayjsTzConfig } from "@/utils/dayjs";
import { useEffect, useState } from "react";
import { Select, Stack } from "@chakra-ui/react";
import { FormGroup } from "@/components/FormGroup";

export const useTimezone = () => {
  const [tz, setTz] = useState<string | null>(null);
  useEffect(() => {
    const localStorageTimezone = window.localStorage.getItem("timezone");
    if (localStorageTimezone) {
      if (!localStorageTimezone) {
        setTz(null);
        dayjsTzConfig.setDefault();
      } else {
        setTz(localStorageTimezone);
        dayjsTzConfig.setDefault(localStorageTimezone);
      }
    }
  }, []);

  const setTimezone = (newTimezone: string) => {
    if (!newTimezone) {
      setTz(null);
      window.localStorage.removeItem("timezone");
      dayjsTzConfig.setDefault();
    } else {
      setTz(newTimezone);
      window.localStorage.setItem("timezone", newTimezone);
      dayjsTzConfig.setDefault(newTimezone);
    }
  };

  return { timezone: tz, setTimezone } as const;
};

export const TimezoneSelect = () => {
  const { timezone, setTimezone } = useTimezone();

  const changeTimezone = (newTimezone: string) => {
    setTimezone(newTimezone);
  };

  const timezoneList: string[] =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Intl as any).supportedValuesOf?.("timeZone") ?? [];

  return (
    <Stack>
      <FormGroup
        label="Display Timezone"
        helper={dayjsTz().format("ddd DD MMM YYYY, HH:mm (YYY)")}
      >
        <Select
          value={timezone ?? ""}
          placeholder={`Auto (${dayjsTzConfig.guess()})`}
          onChange={(e) => changeTimezone(e.target.value)}
        >
          {timezoneList.map((tz) => (
            <option value={tz} key={tz}>
              {tz}
            </option>
          ))}
        </Select>
      </FormGroup>
    </Stack>
  );
};
