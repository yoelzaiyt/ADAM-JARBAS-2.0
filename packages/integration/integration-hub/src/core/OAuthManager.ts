import type { OAuthConfig, OAuthToken, OAuthState } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'OAuthManager' });

export class OAuthManager {
  private configs: Map<string, OAuthConfig> = new Map();
  private states: Map<string, OAuthState> = new Map();

  registerApi(apiId: string, config: OAuthConfig): void {
    this.configs.set(apiId, config);
    this.states.set(apiId, { apiId, status: 'idle' });
    log.info(`OAuth registered for API ${apiId}`);
  }

  unregisterApi(apiId: string): void {
    this.configs.delete(apiId);
    this.states.delete(apiId);
    log.info(`OAuth unregistered for API ${apiId}`);
  }

  getAuthUrl(apiId: string, state?: string): string | undefined {
    const config = this.configs.get(apiId);
    if (!config) return undefined;

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state: state || apiId,
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  async exchangeCode(apiId: string, code: string): Promise<OAuthToken | undefined> {
    const config = this.configs.get(apiId);
    if (!config) return undefined;

    const state = this.states.get(apiId);
    if (!state) return undefined;

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const data = await response.json() as Record<string, unknown>;
      const token: OAuthToken = {
        accessToken: data.access_token as string,
        refreshToken: data.refresh_token as string | undefined,
        tokenType: data.token_type as string,
        expiresIn: data.expires_in as number,
        expiresAt: new Date(Date.now() + (data.expires_in as number) * 1000),
        scope: (data.scope as string)?.split(' ') || config.scopes,
      };

      this.states.set(apiId, { apiId, status: 'authorized', token });
      log.info(`OAuth token obtained for API ${apiId}`);
      return token;
    } catch (error) {
      this.states.set(apiId, { apiId, status: 'error', error: String(error) });
      log.error(`OAuth token exchange failed for API ${apiId}`, error);
      return undefined;
    }
  }

  async refreshToken(apiId: string): Promise<OAuthToken | undefined> {
    const config = this.configs.get(apiId);
    const state = this.states.get(apiId);
    if (!config || !state?.token?.refreshToken) return undefined;

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: state.token.refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json() as Record<string, unknown>;
      const token: OAuthToken = {
        accessToken: data.access_token as string,
        refreshToken: (data.refresh_token as string) || state.token.refreshToken,
        tokenType: data.token_type as string,
        expiresIn: data.expires_in as number,
        expiresAt: new Date(Date.now() + (data.expires_in as number) * 1000),
        scope: (data.scope as string)?.split(' ') || state.token.scope,
      };

      this.states.set(apiId, { apiId, status: 'authorized', token });
      log.info(`OAuth token refreshed for API ${apiId}`);
      return token;
    } catch (error) {
      this.states.set(apiId, { apiId, status: 'error', error: String(error) });
      log.error(`OAuth token refresh failed for API ${apiId}`, error);
      return undefined;
    }
  }

  getState(apiId: string): OAuthState | undefined {
    return this.states.get(apiId);
  }

  getAccessToken(apiId: string): string | undefined {
    const state = this.states.get(apiId);
    if (!state?.token) return undefined;

    if (state.token.expiresAt < new Date()) {
      log.warn(`OAuth token expired for API ${apiId}`);
      return undefined;
    }

    return state.token.accessToken;
  }

  isAuthorized(apiId: string): boolean {
    const state = this.states.get(apiId);
    return state?.status === 'authorized' && !!this.getAccessToken(apiId);
  }

  revokeAccess(apiId: string): void {
    this.states.set(apiId, { apiId, status: 'idle' });
    log.info(`OAuth access revoked for API ${apiId}`);
  }

  getStats(): {
    total: number;
    authorized: number;
    expired: number;
    errors: number;
  } {
    const states = Array.from(this.states.values());
    return {
      total: states.length,
      authorized: states.filter(s => s.status === 'authorized').length,
      expired: states.filter(s => s.status === 'expired').length,
      errors: states.filter(s => s.status === 'error').length,
    };
  }
}
