import { useState } from "react";

const useDrawer = () => {
  const [isDrawerShowing, setIsDrawerShowing] = useState(false);

  function toggleDrawer() {
    setIsDrawerShowing(!isDrawerShowing);
  }

  return {
    isDrawerShowing,
    toggleDrawer,
  };
};

export default useDrawer;
