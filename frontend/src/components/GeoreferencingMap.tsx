import React, { useEffect, useRef } from 'react';
import { Aprendiz } from '../types';
import { countApprovedItems } from '../data/seedData';
import { MapPin, Building2, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';

declare const L: any;

interface GeoreferencingMapProps {
  aprendices: Aprendiz[];
  onSelectAprendizForReview?: (aprendiz: Aprendiz) => void;
}

export const GeoreferencingMap: React.FC<GeoreferencingMapProps> = ({
  aprendices,
  onSelectAprendizForReview,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Filter only apprentices with company coordinates
  const validAprendices = aprendices.filter(
    (a) => a.empresa && typeof a.empresa.lat === 'number' && typeof a.empresa.lng === 'number'
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (typeof L === 'undefined') return;

    // Destroy existing map if already present
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center on Colombia (e.g. Bogotá / Central Andes)
    const map = L.map(mapContainerRef.current, {
      center: [5.0, -74.5],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | SENA Prácticas',
      maxZoom: 18,
    }).addTo(map);

    // Clear old markers
    markersRef.current = [];

    // Add markers
    validAprendices.forEach((apr) => {
      const empresa = apr.empresa!;
      const approvedCount = countApprovedItems(apr.items);
      const isCertified = approvedCount === 16;
      const isLectiva = apr.etapa === 'Lectiva';

      // Pin Color
      const pinColor = isCertified ? '#16a34a' : isLectiva ? '#2563eb' : '#d97706';

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${pinColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 11px;
            ">
              ${isCertified ? '✓' : approvedCount}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([empresa.lat, empresa.lng], { icon: customIcon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 230px; line-height: 1.4; color: #1e293b;">
          <div style="border-bottom: 2px solid #39A900; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="font-weight: 700; font-size: 13px; color: #00324D;">${empresa.razonSocial}</div>
            <div style="font-size: 10px; color: #64748b;">NIT: ${empresa.nit} · ${empresa.ciudad}</div>
          </div>
          
          <div style="margin-bottom: 6px;">
            <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">Aprendiz Asignado:</span>
            <div style="font-weight: 600; color: #0f172a;">${apr.nombre}</div>
            <div style="font-size: 11px; color: #475569;">Ficha ${apr.fichaNumero} · ${apr.programa}</div>
          </div>

          <div style="margin-bottom: 8px; background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <div style="font-size: 11px;"><strong>Tutor:</strong> ${empresa.tutorNombre}</div>
            <div style="font-size: 10px; color: #64748b;"><strong>Tel:</strong> ${empresa.tutorTelefono}</div>
            <div style="font-size: 10px; color: #64748b;"><strong>Modalidad:</strong> ${empresa.modalidad}</div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: ${isCertified ? '#16a34a' : '#d97706'};">
              ${isCertified ? 'CERTIFICAR (16/16)' : `LE FALTA (${approvedCount}/16)`}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersRef.current.push({ id: apr.id, marker, coords: [empresa.lat, empresa.lng] });
    });

    // Auto adjust bounds if markers exist
    if (validAprendices.length > 0) {
      const group = L.featureGroup(markersRef.current.map((m) => m.marker));
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [validAprendices.length]);

  const handleFlyTo = (lat: number, lng: number, aprId: string) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
      const target = markersRef.current.find((m) => m.id === aprId);
      if (target) {
        target.marker.openPopup();
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      
      {/* Header bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#39A900]" />
            <h3 className="font-bold text-base">Georreferenciación de Empresas y Sedes de Práctica</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo territorial en tiempo real de empresas co-formadoras y tutores en Colombia
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></span>
            <span>Certificable (16/16)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 border border-white"></span>
            <span>En Práctica (Le falta)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white"></span>
            <span>Etapa Lectiva</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Map Viewport */}
        <div className="lg:col-span-3 relative h-[520px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        </div>

        {/* Directory Sidebar */}
        <div className="p-4 bg-slate-50 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Empresas Vinculadas ({validAprendices.length})
            </span>
            <span className="text-[11px] text-slate-500">Haz clic para ubicar</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
            {validAprendices.map((apr) => {
              const empresa = apr.empresa!;
              const approvedCount = countApprovedItems(apr.items);
              const isCertified = approvedCount === 16;

              return (
                <div
                  key={apr.id}
                  onClick={() => handleFlyTo(empresa.lat, empresa.lng, apr.id)}
                  className="p-3 bg-white rounded-lg border border-slate-200 hover:border-[#39A900] hover:shadow-xs transition-all cursor-pointer text-xs"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-bold text-slate-900 leading-tight">
                      {empresa.razonSocial}
                    </span>
                    {isCertified ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                        16/16
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                        {approvedCount}/16
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                    <span>{empresa.ciudad}</span>
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 font-medium truncate max-w-[140px]">
                      {apr.nombre.split(' ')[0]} {apr.nombre.split(' ')[1]}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Ficha {apr.fichaNumero}
                    </span>
                  </div>

                  {onSelectAprendizForReview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAprendizForReview(apr);
                      }}
                      className="mt-2 w-full text-center py-1 bg-slate-100 hover:bg-[#39A900] hover:text-white text-slate-700 font-semibold rounded text-[11px] transition-colors"
                    >
                      Revisar en Matriz
                    </button>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
