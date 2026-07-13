/** US location reference data for address inputs (type-or-select via datalist). */

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
] as const;

/** Curated major US cities with their state + a representative ZIP (for the
 * city picker, state auto-fill, and ZIP auto-fill). */
export const US_CITIES: { name: string; state: string; zip: string }[] = [
  { name: "New York", state: "NY", zip: "10001" }, { name: "Los Angeles", state: "CA", zip: "90001" }, { name: "Chicago", state: "IL", zip: "60601" },
  { name: "Houston", state: "TX", zip: "77001" }, { name: "Phoenix", state: "AZ", zip: "85001" }, { name: "Philadelphia", state: "PA", zip: "19019" },
  { name: "San Antonio", state: "TX", zip: "78201" }, { name: "San Diego", state: "CA", zip: "92101" }, { name: "Dallas", state: "TX", zip: "75201" },
  { name: "San Jose", state: "CA", zip: "95101" }, { name: "Austin", state: "TX", zip: "78701" }, { name: "Jacksonville", state: "FL", zip: "32099" },
  { name: "Fort Worth", state: "TX", zip: "76101" }, { name: "Columbus", state: "OH", zip: "43085" }, { name: "Charlotte", state: "NC", zip: "28201" },
  { name: "San Francisco", state: "CA", zip: "94102" }, { name: "Indianapolis", state: "IN", zip: "46201" }, { name: "Seattle", state: "WA", zip: "98101" },
  { name: "Denver", state: "CO", zip: "80202" }, { name: "Washington", state: "DC", zip: "20001" }, { name: "Boston", state: "MA", zip: "02108" },
  { name: "El Paso", state: "TX", zip: "79901" }, { name: "Nashville", state: "TN", zip: "37201" }, { name: "Detroit", state: "MI", zip: "48201" },
  { name: "Oklahoma City", state: "OK", zip: "73101" }, { name: "Portland", state: "OR", zip: "97201" }, { name: "Las Vegas", state: "NV", zip: "89101" },
  { name: "Memphis", state: "TN", zip: "38101" }, { name: "Louisville", state: "KY", zip: "40202" }, { name: "Baltimore", state: "MD", zip: "21201" },
  { name: "Milwaukee", state: "WI", zip: "53202" }, { name: "Albuquerque", state: "NM", zip: "87101" }, { name: "Tucson", state: "AZ", zip: "85701" },
  { name: "Fresno", state: "CA", zip: "93650" }, { name: "Sacramento", state: "CA", zip: "94203" }, { name: "Kansas City", state: "MO", zip: "64101" },
  { name: "Mesa", state: "AZ", zip: "85201" }, { name: "Atlanta", state: "GA", zip: "30301" }, { name: "Omaha", state: "NE", zip: "68101" },
  { name: "Colorado Springs", state: "CO", zip: "80901" }, { name: "Raleigh", state: "NC", zip: "27601" }, { name: "Long Beach", state: "CA", zip: "90802" },
  { name: "Virginia Beach", state: "VA", zip: "23450" }, { name: "Miami", state: "FL", zip: "33101" }, { name: "Oakland", state: "CA", zip: "94601" },
  { name: "Minneapolis", state: "MN", zip: "55401" }, { name: "Tulsa", state: "OK", zip: "74101" }, { name: "Arlington", state: "TX", zip: "76001" },
  { name: "Tampa", state: "FL", zip: "33601" }, { name: "New Orleans", state: "LA", zip: "70112" }, { name: "Cleveland", state: "OH", zip: "44101" },
  { name: "Honolulu", state: "HI", zip: "96801" }, { name: "Anaheim", state: "CA", zip: "92801" }, { name: "Lexington", state: "KY", zip: "40507" },
  { name: "Cincinnati", state: "OH", zip: "45202" }, { name: "Irvine", state: "CA", zip: "92602" }, { name: "Orlando", state: "FL", zip: "32801" },
  { name: "Pittsburgh", state: "PA", zip: "15201" }, { name: "St. Louis", state: "MO", zip: "63101" }, { name: "Greensboro", state: "NC", zip: "27401" },
  { name: "Lincoln", state: "NE", zip: "68501" }, { name: "Plano", state: "TX", zip: "75023" }, { name: "Anchorage", state: "AK", zip: "99501" },
  { name: "Durham", state: "NC", zip: "27701" }, { name: "Jersey City", state: "NJ", zip: "07302" }, { name: "Buffalo", state: "NY", zip: "14201" },
  { name: "Madison", state: "WI", zip: "53703" }, { name: "Scottsdale", state: "AZ", zip: "85251" }, { name: "Reno", state: "NV", zip: "89501" },
  { name: "Boise", state: "ID", zip: "83702" }, { name: "Richmond", state: "VA", zip: "23219" }, { name: "Spokane", state: "WA", zip: "99201" },
  { name: "Baton Rouge", state: "LA", zip: "70801" }, { name: "Tacoma", state: "WA", zip: "98402" }, { name: "Charleston", state: "SC", zip: "29401" },
  { name: "Columbia", state: "SC", zip: "29201" }, { name: "Salt Lake City", state: "UT", zip: "84101" }, { name: "Des Moines", state: "IA", zip: "50309" },
  { name: "Grand Rapids", state: "MI", zip: "49503" }, { name: "Providence", state: "RI", zip: "02903" }, { name: "Knoxville", state: "TN", zip: "37902" },
  { name: "Savannah", state: "GA", zip: "31401" }, { name: "Cambridge", state: "MA", zip: "02138" }, { name: "Berkeley", state: "CA", zip: "94701" },
];

export const US_CITY_NAMES = US_CITIES.map((c) => c.name);

/** Map of exact city name → state, for auto-filling the state field. */
export const CITY_TO_STATE: Record<string, string> = Object.fromEntries(
  US_CITIES.map((c) => [c.name.toLowerCase(), c.state])
);

/** Map of exact city name → representative ZIP, for auto-filling the ZIP field. */
export const CITY_TO_ZIP: Record<string, string> = Object.fromEntries(
  US_CITIES.map((c) => [c.name.toLowerCase(), c.zip])
);

/** Common street-name suggestions (users can still type any address). */
export const STREET_SUGGESTIONS = [
  "Main St","Oak Ave","Maple St","Elm St","Washington Ave","Park Ave","2nd St","3rd St",
  "Pine St","Cedar St","Lake Dr","Hill Rd","Sunset Blvd","Broadway","Church St","Market St",
  "Highland Ave","Willow Ln","River Rd","Meadow Ln",
];
