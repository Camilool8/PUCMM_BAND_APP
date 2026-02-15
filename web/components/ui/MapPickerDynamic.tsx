import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-xl bg-surface-100 animate-shimmer flex items-center justify-center">
      <span className="text-xs text-gray-500">Cargando mapa...</span>
    </div>
  ),
});

export default MapPicker;
