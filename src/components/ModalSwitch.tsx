import { Switch } from "@mantine/core";
import { Route, Routes, useLocation } from "react-router-dom";
import { Home } from "../pages/Home";

export const ModalSwitch = () => {
  let location = useLocation();

  // This piece of state is set when one of the
  // gallery links is clicked. The `background` state
  // is the location that we were at when one of
  // the gallery links was clicked. If it's there,
  // use it as the location for the <Switch> so
  // we show the gallery in the background, behind
  // the modal.
  let background = location.state && location.state.background;

  return (
    <div>
      <Routes location={background || location}>
        <Route path="/" children={<Home />} />
      </Routes>
    </div>
  );
};
