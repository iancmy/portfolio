"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";

import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { ChevronDown } from "lucide-react";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}

interface NavItem {
  name: string;
  link?: string;
  children?: NavItem[];
}

interface NavItemsProps {
  items: NavItem[];
  className?: string;
  visible?: boolean;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  visible?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  items: NavItem[];
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  visible?: boolean;
}

export const ResizableNavbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("sticky inset-x-0 top-10 z-40 w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 15 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 100,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-5xl flex-row items-center justify-between self-start rounded-3xl px-4 py-2 lg:flex transition-colors duration-500",
        visible ? "bg-secondary/80" : "bg-transparent",
        className
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const NavItems = ({ items, className, visible }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-lg font-medium lg:flex lg:space-x-2",
        className
      )}
    >
      {items.map((item, idx) => {
        if (item.children?.length) {
          return (
            <DropdownMenu key={`menu-${idx}`}>
              <DropdownMenuTrigger
                onMouseEnter={() => setHovered(idx)}
                className={cn(
                  "relative px-4 py-2 transition duration-500 text-foreground cursor-pointer"
                )}
              >
                {hovered === idx && (
                  <motion.div
                    layoutId="hovered"
                    className={cn(
                      "absolute inset-0 h-full w-full rounded-3xl",
                      visible ? "bg-background/20" : "bg-accent/20"
                    )}
                  />
                )}
                <span className="flex gap-2 items-center justify-center relative z-20">
                  <span>{item.name}</span>
                  <ChevronDown size="1em" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {item.children.map((item, idx) => (
                  <DropdownMenuItem key={`menu-item-${idx}`} asChild>
                    <Link
                      className={cn(
                        "relative px-4 py-2 transition duration-500 text-foreground cursor-pointer"
                      )}
                      key={`link-${idx}`}
                      href={item.link || ""}
                    >
                      <span className="flex gap-2 items-center justify-center relative z-20">
                        <span>{item.name}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Link
            onMouseEnter={() => setHovered(idx)}
            className={cn(
              "relative px-4 py-2 transition duration-500 text-foreground"
            )}
            key={`link-${idx}`}
            href={item.link || ""}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className={cn(
                  "absolute inset-0 h-full w-full rounded-3xl",
                  visible ? "bg-background/20" : "bg-accent/20"
                )}
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </Link>
        );
      })}
    </motion.div>
  );
};

export const MobileNav = ({
  children,
  className,
  visible,
  isOpen,
}: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "85%" : "90%",
        borderRadius: isOpen ? "1.5rem 1.5rem 0 0" : "1.5rem",
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between gap-4 px-4 py-2 lg:hidden transition duration-500 backdrop-blur-md",
        visible ? "bg-secondary/80" : "bg-transparent",
        className
      )}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible }
            )
          : child
      )}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  items,
  children,
  className,
  isOpen,
  setIsOpen,
  visible,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, backdropFilter: "blur(0px)" }}
          animate={{
            backdropFilter: "blur(10px)",
            opacity: 1,
            y: visible ? 5 : 0,
          }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col rounded-b-3xl items-start justify-start gap-4 px-8 py-8",
            visible ? "bg-secondary/80" : "bg-background/80",
            className
          )}
          onMouseLeave={() => setIsOpen(false)}
        >
          {items.map((item, idx) => {
            if (item.children?.length) {
              return (
                <div
                  key={`mobile-link-${idx}`}
                  className="relative flex flex-col gap-1"
                >
                  <span className="block">{item.name}</span>
                  {item.children.map((item, idx) => (
                    <Link
                      key={`mobile-link-${idx}`}
                      href={item.link || ""}
                      onClick={() => setIsOpen(false)}
                      className="ml-4 flex gap-2 items-center justify-start"
                    >
                      <span className="block">{item.name}</span>
                    </Link>
                  ))}
                </div>
              );
            }

            return (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link || ""}
                onClick={() => setIsOpen(false)}
                className="relative"
              >
                <span className="block">{item.name}</span>
              </Link>
            );
          })}
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <IconX className="text-black dark:text-white" onClick={onClick} />
  ) : (
    <IconMenu2 className="text-black dark:text-white" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-4 px-2 py-1"
    >
      <Image
        src="/images/dom-pixel.png"
        alt="dom-logo"
        width={40}
        height={40}
        className="drop-shadow-xs"
      />
      <span className="font-[family-name:var(--font-title)] text-2xl font-medium text-foreground">
        iancmy
      </span>
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
