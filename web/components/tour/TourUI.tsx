"use client";

import { TourOverlay } from "./TourOverlay";
import { TourPopover } from "./TourPopover";
import { TourSpotlight } from "./TourSpotlight";

/**
 * TourUI renders all the tour-related UI elements.
 * Should be placed in the layout after TourProvider.
 */
export function TourUI() {
  return (
    <>
      <TourOverlay />
      <TourSpotlight />
      <TourPopover />
    </>
  );
}

export default TourUI;
