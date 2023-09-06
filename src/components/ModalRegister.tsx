import { Modal } from "@mantine/core";
import ory from "../configs/ory";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LoginFlow,
  RegistrationFlow,
  UpdateLoginFlowBody,
  UpdateRegistrationFlowBody,
} from "@ory/client";
import { UserAuthCard } from "@ory/elements";

export const ModalRegister = () => {
  const [flow, setFlow] = useState<RegistrationFlow | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  // Get the flow based on the flowId in the URL (.e.g redirect to this page after flow initialized)
  const getFlow = useCallback(
    (flowId: string) =>
      ory.frontend
        // the flow data contains the form fields, error messages and csrf token
        .getRegistrationFlow({ id: flowId }, { withCredentials: true })
        .then(({ data: flow }) => setFlow(flow))
        .catch(sdkErrorHandler),
    []
  );

  // initialize the sdkError for generic handling of errors
  const sdkErrorHandler = ory.sdkError(getFlow, setFlow, "/registration", true);

  // create a new registration flow
  const createFlow = () => {
    ory.frontend
      // we don't need to specify the return_to here since we are building an SPA. In server-side browser flows we would need to specify the return_to
      .createBrowserRegistrationFlow()
      .then(({ data: flow }) => {
        // Update URI query params to include flow id
        setSearchParams({ ["flow"]: flow.id });
        // Set the flow data
        setFlow(flow);
      })
      .catch(sdkErrorHandler);
  };

  // submit the registration form data to Ory
  const submitFlow = (body: UpdateRegistrationFlowBody) => {
    // something unexpected went wrong and the flow was not set
    if (!flow) return navigate("/registration", { replace: true });

    ory.frontend
      .updateRegistrationFlow({
        flow: flow.id,
        updateRegistrationFlowBody: body,
      })
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
  }, [navigate]);
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
          title={"Registration"}
          flowType={"registration"}
          // we always need to pass the flow to the card since it contains the form fields, error messages and csrf token
          flow={flow}
          // the registration card needs a way to navigate to the login page
          additionalProps={{
            loginURL: "/login",
          }}
          // we might need webauthn support which requires additional js
          includeScripts={true}
          // we submit the form data to Ory
          onSubmit={({ body }) =>
            submitFlow(body as UpdateRegistrationFlowBody)
          }
        />
      </div>
    </Modal>
  ) : (
    <div>Loading...</div>
  );
};
