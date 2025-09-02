import NimSearch from "./components/NimSearch";

export default function Home() {
   return (
      <div className="flex h-dvh items-center justify-center">
         <div className="grid max-w-screen-sm gap-2">
            <NimSearch />
         </div>
      </div>
   );
}
