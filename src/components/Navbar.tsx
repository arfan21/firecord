import { Icon } from "@iconify/react";
import { Button } from "@mantine/core";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useIsLoggedIn } from "../hooks/useIsLoggedIn";
import { fbLogin, fbLogout } from "../network/firebase";

const Navbar = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useContext(AuthContext);
  const isLoggedIn = useIsLoggedIn();

  return (
    <header className="top-0 flex items-center justify-between w-full bg-zinc-900 p-5 min-h-[85px]">
      <h3 className="font-semibold text-transparent text-lg bg-clip-text bg-gradient-to-l from-white to-orange-300">
        Firecord
      </h3>
      {isLoggedIn ? (
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <p className="font-semibold text-sm w-[120px] sm:w-full truncate">
              {user?.displayName}
            </p>
            <Button
              variant="subtle"
              compact
              size="xs"
              className="p-0"
              onClick={() => fbLogout(setIsLoading)}
              loading={isLoading}
            >
              LOGOUT
            </Button>
          </div>
          <img
            src={user?.photoURL as string}
            alt="photoURL"
            referrerPolicy="no-referrer"
            className="w-[40px] h-[40px] rounded-full"
          />
        </div>
      ) : (
        <Button
          variant="subtle"
          compact
          leftIcon={<Icon icon="akar-icons:google-fill" />}
          onClick={() => fbLogin(setIsLoading)}
          loading={isLoading}
        >
          Sign in with Google
        </Button>
      )}
    </header>
  );
};

export default Navbar;
