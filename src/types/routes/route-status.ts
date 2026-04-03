export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type RouteImplementationStatus =
  | "planned"
  | "in-progress"
  | "ready"
  | "deprecated"
  | "disabled";
