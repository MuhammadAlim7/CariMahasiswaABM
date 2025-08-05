import NimSearch from "./components/NimSearch";

export default function Home() {
   return (
      <div className="flex h-dvh items-center justify-center">
         <div className="grid max-w-screen-sm gap-2">
            <NimSearch />
         </div>
         <div className="absolute top-0 left-[calc(100%-96px)]">
            <aside className="bg-cyan-400 p-4">.</aside>
         </div>
      </div>
   );
}
