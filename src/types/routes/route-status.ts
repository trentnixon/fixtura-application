export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RouteImplementationStatus =
  | "planned"
  | "in-progress"
  | "ready"
  | "deprecated"
  | "disabled";
