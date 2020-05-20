export interface GlobalOptions {
  workspaceId?: string;

  clientId?: string;
  clientSecret?: string;
}

export interface PlanningOptions {
  dataPlanId?: string;
  dataPlanFile?: string;
  dataPlanVersionFile?: string;
  versionNumber?: number;
}

export interface ConfigOptions {
  global?: GlobalOptions;
  planningConfig?: PlanningOptions;
}

const defaults: ConfigOptions = {
  global: {},
};

export default class mpConfig {
  private _global?: GlobalOptions = {};
  private _planningConfig?: PlanningOptions = {};

  constructor(config: ConfigOptions = defaults) {
    this._global = config?.global;
    this._planningConfig = config?.planningConfig ?? {};
  }

  get workspaceId() {
    return this._global?.workspaceId;
  }

  get clientId() {
    return this._global?.clientId;
  }

  get clientSecret() {
    return this._global?.clientSecret;
  }

  get planningConfig() {
    return this._planningConfig;
  }
}
