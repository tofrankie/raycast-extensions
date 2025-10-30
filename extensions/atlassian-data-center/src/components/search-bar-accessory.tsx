import { List } from "@raycast/api";

import { SEARCH_BAR_ACCESSORY_CONFIGS } from "@/constants";
import type { SearchBarAccessoryCommandName, SearchFilter } from "@/types";

interface SearchBarAccessoryProps {
  commandName: SearchBarAccessoryCommandName;
  value: string;
  onChange: (filter: SearchFilter | null) => void;
}

export default function SearchBarAccessory({ commandName, value, onChange }: SearchBarAccessoryProps) {
  const filters = SEARCH_BAR_ACCESSORY_CONFIGS[commandName];

  const handleFilterChange = (filterValue: string) => {
    if (filterValue === "default") {
      onChange(null);
      return;
    }

    const filter = filters.find((item) => item.value === filterValue);
    if (filter) {
      const { value, query, transform, autoQuery, sectionTitle, logicOperator, orderBy } = filter;
      onChange({ value, query, transform, autoQuery, sectionTitle, logicOperator, orderBy });
    } else {
      onChange(null);
    }
  };

  return (
    <List.Dropdown tooltip="Filter Options" onChange={handleFilterChange} value={value} storeValue throttle>
      {filters.map((item) => (
        <List.Dropdown.Item key={item.value} title={item.title} value={item.value} icon={item.icon} />
      ))}
    </List.Dropdown>
  );
}
