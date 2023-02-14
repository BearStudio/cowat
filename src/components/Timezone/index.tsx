import { dayjsTz, dayjsTzConfig } from "@/utils/dayjs";
import { useEffect, useState } from "react";
import { Stack } from "@chakra-ui/react";
import { FormGroup } from "@/components/FormGroup";
import { Select } from "@/components/Select";

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
          value={
            timezone ? { value: timezone, label: timezone } : null
          }
          placeholder={`Auto (${dayjsTzConfig.guess()})`}
          isClearable
          onChange={(newValue) => {
            if (newValue && "value" in newValue) {
              setTimezone(newValue.value);
            } else {
              setTimezone("");
            }
          }}
          options={timezoneList.map((tz) => ({ value: tz, label: tz }))}
        />
      </FormGroup>
    </Stack>
  );
};
