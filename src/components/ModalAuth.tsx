import { Button, Modal, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import ory from "../configs/ory";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginFlow, UpdateLoginFlowBody } from "@ory/client";
import { UserAuthCard } from "@ory/elements";

type Props = {
  opened: boolean;
  close: () => void;
  isLoading: boolean;
};

export const ModalAuth = ({ opened, close, isLoading }: Props) => {
  const formAuth = useForm({
    initialValues: {
      email: "",
      password: "",
      isLogin: true,
      username: "",
      passwordConfirmation: "",
    },
    validate: {
      email: (value) => {
        // email regex
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Invalid email address";
        }
        return true;
      },
      password: (value) => {
        if (value.length < 6) {
          return "Password should be at least 6 characters long";
        }
        return true;
      },
      passwordConfirmation: (value, values) => {
        if (values.isLogin && values.password !== value) {
          return "Passwords do not match";
        }
        return true;
      },
      username: (value, values) => {
        if (!values.isLogin && value.length < 3) {
          return "Username should be at least 3 characters long";
        }
        return true;
      },
    },

    validateInputOnChange: true,
  });

  const handleAuthSubmit = (values = formAuth.values) => {
    // TODO: handle auth
    console.log("Submitting", values);
    ory.frontend
      .createBrowserLoginFlow(
        {},
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log(res);
      });
  };

  const navigate = useNavigate();
  const [flow, setFlow] = useState<LoginFlow | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get the flow based on the flowId in the URL (.e.g redirect to this page after flow initialized)
  const getFlow = useCallback(
    (flowId: string) =>
      ory.frontend
        // the flow data contains the form fields, error messages and csrf token
        .getLoginFlow(
          { id: flowId },
          {
            withCredentials: true,
          }
        )
        .then(({ data: flow }) => setFlow(flow))
        .catch(sdkErrorHandler),
    []
  );

  const sdkErrorHandler = ory.sdkError(getFlow, setFlow, "/login", true);

  const createFlow = () => {
    const aal2 = searchParams.get("aal2");
    ory.frontend
      // aal2 is a query parameter that can be used to request Two-Factor authentication
      // aal1 is the default authentication level (Single-Factor)
      // we always pass refresh (true) on login so that the session can be refreshed when there is already an active session
      .createBrowserLoginFlow(
        { refresh: true, aal: aal2 ? "aal2" : "aal1" },
        {
          withCredentials: true,
        }
      )
      // flow contains the form fields and csrf token
      .then(({ data: flow }) => {
        // Update URI query params to include flow id
        setSearchParams({});
        // Set the flow data
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  // submit the login form data to Ory
  const submitFlow = (body: UpdateLoginFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) return navigate("/login", { replace: true });

    // we submit the flow to Ory with the form data
    ory.frontend
      .updateLoginFlow(
        { flow: flow.id, updateLoginFlowBody: body },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        // we successfully submitted the login flow, so lets redirect to the dashboard
        navigate("/", { replace: true });
      })
      .catch(sdkErrorHandler);
  };

  useEffect(() => {
    // we might redirect to this page after the flow is initialized, so we check for the flowId in the URL
    const flowId = searchParams.get("flow");
    // the flow already exists
    if (flowId) {
      getFlow(flowId).catch(createFlow); // if for some reason the flow has expired, we need to get a new one
      return;
    }

    // we assume there was no flow, so we create a new one
    createFlow();
  }, []);

  //   useEffect(() => {
  //     let aal = searchParams.get(ory.FlowQueryType.Aal);
  //     let refresh = searchParams.get(ory.FlowQueryType.Refresh);
  //     let returnTo = searchParams.get(ory.FlowQueryType.ReturnTo);
  //     let flow = searchParams.get(ory.FlowQueryType.Flow);
  //     let login_challenge = searchParams.get(ory.FlowQueryType.LoginChallenge);

  //     let queryParam = new URLSearchParams({
  //       [ory.FlowQueryType.Aal]: (aal?.toString() as string) || "",
  //       [ory.FlowQueryType.Refresh]: (refresh?.toString() as string) || "",
  //       [ory.FlowQueryType.ReturnTo]: (returnTo?.toString() as string) || "",
  //     });

  //     if (!flow) {
  //       window.location.href = ory.getUrlForFlow(ory.FlowType.Login);
  //     }

  //     if (login_challenge) {
  //       queryParam.append(ory.FlowQueryType.LoginChallenge, login_challenge);
  //     }

  //     ory.frontend
  //       .getLoginFlow(
  //         {
  //           id: flow as string,
  //         },
  //         {
  //           withCredentials: true,
  //         }
  //       )
  //       .then((res) => {
  //         console.log(res);
  //       });

  //     console.log(flow);
  //   }, []);

  // we check if the flow is set, if not we show a loading indicator
  return flow ? (
    // we render the login form using Ory Elements
    <Modal
      opened={true}
      onClose={() => navigate("/")}
      title={""}
      centered
      size="auto"
    >
      <div className="text-white-override-child">
        <UserAuthCard
          title={"Login"}
          flowType={"login"}
          // we always need the flow data which populates the form fields and error messages dynamically
          flow={flow}
          // the login card should allow the user to go to the registration page and the recovery page
          additionalProps={{
            forgotPasswordURL: "/recovery",
            signupURL: "/registration",
          }}
          // we might need webauthn support which requires additional js
          includeScripts={true}
          // we submit the form data to Ory
          onSubmit={({ body }) => submitFlow(body as UpdateLoginFlowBody)}
        />
      </div>
    </Modal>
  ) : (
    <div>Loading...</div>
  );

  //   return (
  //     <Modal
  //       opened={opened}
  //       onClose={() => navigate("/")}
  //       title={formAuth.values.isLogin ? "Sign In" : "Sign Up"}
  //       centered
  //     >
  //       {/* Modal content */}
  //       <form
  //         onSubmit={(e) => {
  //           e.preventDefault();
  //           handleAuthSubmit(formAuth.values);
  //         }}
  //       >
  //         {!formAuth.values.isLogin && (
  //           <div className="flex flex-col gap-3 py-1">
  //             <TextInput
  //               withAsterisk
  //               required
  //               label="Username"
  //               placeholder="your username"
  //               {...formAuth.getInputProps("username")}
  //             ></TextInput>
  //           </div>
  //         )}
  //         <div className="flex flex-col gap-3 py-1">
  //           <TextInput
  //             withAsterisk
  //             required
  //             label="Email"
  //             placeholder="your@email.com"
  //             {...formAuth.getInputProps("email")}
  //           ></TextInput>
  //         </div>
  //         <div className="flex flex-col gap-3 py-1">
  //           <PasswordInput
  //             withAsterisk
  //             required
  //             label="Password"
  //             placeholder="your password"
  //             {...formAuth.getInputProps("password")}
  //           ></PasswordInput>
  //         </div>
  //         {!formAuth.values.isLogin && (
  //           <div className="flex flex-col gap-3 py-1">
  //             <PasswordInput
  //               withAsterisk
  //               required
  //               label="Password Confirmation"
  //               placeholder="your password"
  //               {...formAuth.getInputProps("passwordConfirmation")}
  //             ></PasswordInput>
  //           </div>
  //         )}

  //         <div className="flex flex-col gap-3 py-1 ">
  //           <Button type="submit" variant="subtle" loading={isLoading}>
  //             {formAuth.values.isLogin ? "Sign In" : "Sign Up"}
  //           </Button>
  //         </div>

  //         <div className="flex flex-col gap-3 py-1 text-sm">
  //           <p>
  //             {formAuth.values.isLogin ? "Don't have" : "Already have"} an
  //             account?{" "}
  //             <a
  //               className="cursor-pointer hover:text-orange-400"
  //               onClick={() =>
  //                 formAuth.setFieldValue("isLogin", !formAuth.values.isLogin)
  //               }
  //             >
  //               {formAuth.values.isLogin ? "Sign up" : "Sign in"}
  //             </a>{" "}
  //           </p>
  //         </div>
  //       </form>
  //     </Modal>
  //   );
};
