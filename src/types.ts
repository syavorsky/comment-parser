export enum Markers {
  start = "/**",
  nostart = "/***",
  delim = "*",
  end = "*/",
}

export interface Tokens {
  start: string;
  delimiter: string;
  postDelimiter: string;
  tag: string;
  postTag: string;
  name: string;
  postName: string;
  type: string;
  postType: string;
  description: string;
  end: string;
}

export interface Line {
  number: number;
  source: string;
  tokens: Tokens;
}

export interface Spec {
  tag: string;
  name: string;
  default?: string;
  type: string;
  optional: boolean;
  description: string;
  problems: Problem[];
  source: Line[];
}

export interface Problem {
  code:
    | "unhandled"
    | "custom"
    | "tag:prefix"
    | "type:unpaired-curlies"
    | "name:unpaired-brackets"
    | "name:empty-name"
    | "name:invalid-default"
    | "name:empty-default";
  message: string;
  line: number;
  critical: boolean;
}
