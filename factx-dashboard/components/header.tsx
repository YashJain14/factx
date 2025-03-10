import Image from "next/image";
import Logo from "../public/logo.svg";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="">
      <div className="mx-auto flex h-24 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <div className="relative size-12 rounded-xl mr-4 overflow-hidden">
            <Image alt="Logo" src={Logo} fill />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-tight">FactX</h1>
            <p className="text-md text-muted-foreground">
              Flag Misinformation. Preserve Truth.
            </p>
          </div>
        </div>
        <Link target="_blank" href="https://github.com/YashJain14/factx">
          <Button variant="default" className="text-white">
            Chrome Extension
          </Button>
        </Link>
      </div>
    </header>
  );
}
