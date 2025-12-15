import { ReactNode } from "react";
import Pp2ImgIcon from "./pp2img/toolIcon";

export const TOOLS: {
  src: string;
  title: string;
  icon: ReactNode;
}[] = [
  {
    src: "/tools/pp2img",
    title: "Premiere to Image",
    icon: <Pp2ImgIcon />,
  },
];
