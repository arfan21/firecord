import { Icon } from "@iconify/react";
import { Button, Modal, PasswordInput, TextInput } from "@mantine/core";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useSession } from "../hooks/useSession";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import ory from "../configs/ory";
import {
  Navigate,
  redirect,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useLogoutUrl } from "../hooks/useLogoutUrl";
// import { fbLogin, fbLogout } from "../network/firebase";

const Navbar = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, session] = useSession();
  const [logoutUrl] = useLogoutUrl();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSignInFlow = () => {
    let aal = searchParams.get(ory.FlowQueryType.Aal);
    let refresh = searchParams.get(ory.FlowQueryType.Refresh);
    let returnTo = searchParams.get(ory.FlowQueryType.ReturnTo);

    let queryParam = new URLSearchParams({
      [ory.FlowQueryType.Aal]: (aal?.toString() as string) || "",
      [ory.FlowQueryType.Refresh]: (refresh?.toString() as string) || "",
      [ory.FlowQueryType.ReturnTo]: (returnTo?.toString() as string) || "",
    });

    let url = ory.getUrlForFlow(ory.FlowType.Login, {
      query: queryParam,
    });
    console.log(url);
    window.location.href = url;
  };

  return (
    <header className="top-0 flex items-center justify-between w-full bg-zinc-900 p-5 min-h-[85px]">
      <h3
        className="font-semibold text-transparent text-lg bg-clip-text bg-gradient-to-l from-white to-orange-300 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Firecord
      </h3>
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <p className="font-semibold text-sm w-[120px] sm:w-full truncate">
              {session?.identity?.traits?.name?.full || ""}
            </p>
            <a href={logoutUrl}>
              <Button
                variant="subtle"
                compact
                size="xs"
                className="p-0"
                loading={isLoading}
              >
                LOGOUT
              </Button>
            </a>
          </div>
          <img
            src={session?.identity?.traits?.picture as string}
            alt="photoURL"
            referrerPolicy="no-referrer"
            className="w-[40px] h-[40px] rounded-full"
          />
        </div>
      ) : (
        <>
          <Button
            variant="subtle"
            compact
            onClick={() => handleSignInFlow()}
            loading={isLoading}
          >
            Sign in
          </Button>
        </>
      )}
    </header>
  );
};

export default Navbar;
