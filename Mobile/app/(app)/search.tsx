import { Redirect } from "expo-router";

// Search moved to select-shipment modal — launched by the FAB.
export default function SearchRedirect() {
  return <Redirect href="/(app)/select-shipment" />;
}
