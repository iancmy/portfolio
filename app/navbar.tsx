"use client";
import {
  ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Coffee } from "lucide-react";

const navItems = [
  {
    name: "Work",
    link: "/work",
  },
  {
    name: "Dev",
    children: [
      { name: "Projects", link: "/dev" },
      { name: "Tools", link: "/tools" },
    ],
  },
  {
    name: "Bits",
    link: "/bits",
  },
  {
    name: "Fun",
    link: "/fun",
  },
  {
    name: "Contact",
    link: "/chat",
  },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <ResizableNavbar>
      {/* Desktop */}

      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center">
          <NavbarButton
            href="https://ko-fi.com/Z8Z21JJ65S"
            target="_blank"
            variant="secondary"
          >
            <Coffee size="1.25em" />
          </NavbarButton>
          <ThemeToggle />
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav isOpen={isMobileMenuOpen}>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          items={navItems}
          isOpen={isMobileMenuOpen}
          setIsOpen={setIsMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          <ThemeToggle />
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}
