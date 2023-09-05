import { Configuration, FrontendApi, LoginFlow } from "@ory/client";
import axios, { Axios, AxiosError } from "axios";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const baseUrlInternal =
  import.meta.env.VITE_ORY_SDK_URL || "https://playground.projects.oryapis.com";

const apiBaseFrontendUrlInternal =
  import.meta.env.VITE_KRATOS_PUBLIC_URL || baseUrlInternal;

const removeTrailingSlash = (s: string) => s.replace(/\/$/, "");

enum FlowType {
  Login = "login",
  Registration = "registration",
  Settings = "settings",
  Verification = "verification",
  Recovery = "recovery",
}

enum FlowQueryType {
  ReturnTo = "return_to",
  Aal = "aal",
  Refresh = "refresh",
  Flow = "flow",
  LoginChallenge = "login_challenge",
}

type UrlFlowConfig = {
  base?: string;
  query?: URLSearchParams;
};

const defaultUrlFlowConfig = {
  base: apiBaseFrontendUrlInternal,
  query: new URLSearchParams(),
};

const sdkError = (
  getFlow: ((flowId: string) => Promise<void | AxiosError>) | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFlow: React.Dispatch<React.SetStateAction<any>> | undefined,
  defaultNav: string | undefined,
  fatalToDash = false
) => {
  const navigate = useNavigate();

  return useCallback(
    (error: AxiosError): Promise<AxiosError | void> => {
      const responseData = error.response?.data || {};

      switch (error.response?.status) {
        case 400: {
          if (error.response.data?.error?.id === "session_already_available") {
            console.warn(
              "sdkError 400: `session_already_available`. Navigate to /"
            );
            navigate("/", { replace: true });
            return Promise.resolve();
          }
          // the request could contain invalid parameters which would set error messages in the flow
          if (setFlow !== undefined) {
            console.warn("sdkError 400: update flow data");
            setFlow(responseData);
            return Promise.resolve();
          }
          break;
        }
        case 401: {
          console.warn("sdkError 401: Navigate to /login");
          navigate("/login", { replace: true });
          return Promise.resolve();
        }
        case 403: {
          // the user might have a session, but would require 2FA (Two-Factor Authentication)
          if (responseData?.error?.id === "session_aal2_required") {
            navigate("/login?aal2=true", { replace: true });
            return Promise.resolve();
          }

          if (
            responseData?.error?.id === "session_refresh_required" &&
            responseData?.redirect_browser_to
          ) {
            console.warn("sdkError 403: Redirect browser to");
            window.location = responseData?.redirect_browser_to;
            return Promise.resolve();
          }
          break;
        }
        case 404: {
          if (defaultNav !== undefined) {
            console.warn("sdkError 404: Navigate to Error");
            const errorMsg = {
              data: error.response?.data || error,
              status: error.response?.status,
              statusText: error.response?.statusText,
              url: window.location.href,
            };

            navigate(
              `/error?error=${encodeURIComponent(JSON.stringify(errorMsg))}`,
              {
                replace: true,
              }
            );
            return Promise.resolve();
          }
          break;
        }
        case 410: {
          if (
            getFlow !== undefined &&
            responseData?.use_flow_id !== undefined
          ) {
            console.warn("sdkError 410: Update flow");
            return getFlow(responseData?.use_flow_id).catch((error) => {
              // Something went seriously wrong - log and redirect to defaultNav if possible
              console.error(error);

              if (defaultNav !== undefined) {
                navigate(defaultNav, { replace: true });
              } else {
                // Rethrow error when can't navigate and let caller handle
                throw error;
              }
            });
          } else if (defaultNav !== undefined) {
            console.warn("sdkError 410: Navigate to", defaultNav);
            navigate(defaultNav, { replace: true });
            return Promise.resolve();
          }
          break;
        }
        case 422: {
          if (responseData?.redirect_browser_to !== undefined) {
            const currentUrl = new URL(window.location.href);
            const redirect = new URL(
              responseData?.redirect_browser_to,
              // need to add the base url since the `redirect_browser_to` is a relative url with no hostname
              window.location.origin
            );

            // Path has changed
            if (currentUrl.pathname !== redirect.pathname) {
              console.warn("sdkError 422: Update path");
              // remove /ui prefix from the path in case it is present (not setup correctly inside the project config)
              // since this is an SPA we don't need to redirect to the Account Experience.
              redirect.pathname = redirect.pathname.replace("/ui", "");
              navigate(redirect.pathname + redirect.search, {
                replace: true,
              });
              return Promise.resolve();
            }

            // for webauthn we need to reload the flow
            const flowId = redirect.searchParams.get("flow");

            if (flowId != null && getFlow !== undefined) {
              // get new flow data based on the flow id in the redirect url
              console.warn("sdkError 422: Update flow");
              return getFlow(flowId).catch((error) => {
                // Something went seriously wrong - log and redirect to defaultNav if possible
                console.error(error);

                if (defaultNav !== undefined) {
                  navigate(defaultNav, { replace: true });
                } else {
                  // Rethrow error when can't navigate and let caller handle
                  throw error;
                }
              });
            } else {
              console.warn("sdkError 422: Redirect browser to");
              window.location = responseData?.redirect_browser_to;
              return Promise.resolve();
            }
          }
        }
      }

      console.error(error);

      if (fatalToDash) {
        console.warn("sdkError: fatal error redirect to dashboard");
        navigate("/", { replace: true });
        return Promise.resolve();
      }

      throw error;
    },
    [navigate, getFlow]
  );
};

const ory = {
  basePath: apiBaseFrontendUrlInternal,
  frontend: new FrontendApi(
    new Configuration({
      basePath: apiBaseFrontendUrlInternal,
    }),
    apiBaseFrontendUrlInternal
  ),
  FlowType,
  FlowQueryType,
  defaultUrlFlowConfig,
  getUrlForFlow: (
    flow: FlowType,
    config: UrlFlowConfig = defaultUrlFlowConfig
  ) => {
    let cfg = {
      ...defaultUrlFlowConfig,
      ...config,
    };
    return `${removeTrailingSlash(
      cfg?.base || ""
    )}/self-service/${flow}/browser${
      cfg.query ? `?${cfg.query.toString()}` : ""
    }`;
  },
  sdkError,
};

export default ory;
