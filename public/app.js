const { createApp, ref, onMounted, computed, watch } = Vue;

createApp({
  setup() {
    // Configuración inicial
    const COCHABAMBA_COORDS = [-17.3895, -66.1568];
    const INITIAL_ZOOM = 13;
    const HEATMAP_RADIUS = 20;
    const HEATMAP_BLUR = 15;
    const HEATMAP_GRADIENT = {
      0.1: 'blue',
      0.3: 'cyan',
      0.5: 'lime',
      0.7: 'yellow',
      1.0: 'red'
    };

    // Datos reactivos
    const examenes = ref([]);
    const grupos = ref([]);
    const loading = ref(false);
    const loadingGroups = ref(false);
    const map = ref(null);
    const heatmapLayer = ref(null);
    const markersLayer = ref(null);
    const showHeatmap = ref(true);
    const showMarkers = ref(true);
    const topCount = ref(10);
    const selectedStudent = ref(null);
    const highlightedMarker = ref(null);
    const socket = io();
    
    // Computed properties
    const filteredTopExamenes = computed(() => {
      return [...examenes.value]
        .sort((a, b) => b.nota - a.nota || b.tiempoRespuesta - a.tiempoRespuesta)
        .slice(0, parseInt(topCount.value));
    });
    
    const estadisticas = computed(() => {
      if (examenes.value.length === 0) {
        return {
          promedio: 0,
          maxima: 0,
          minima: 0,
          tiempoPromedio: 0,
          total: 0
        };
      }
      
      const notas = examenes.value.map(e => e.nota);
      const tiempos = examenes.value.map(e => e.tiempoRespuesta || 0);
      
      return {
        promedio: notas.reduce((a, b) => a + b, 0) / notas.length,
        maxima: Math.max(...notas),
        minima: Math.min(...notas),
        tiempoPromedio: tiempos.reduce((a, b) => a + b, 0) / tiempos.length,
        total: examenes.value.length
      };
    });
    
    // Métodos
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const formatGroupDateRange = (grupo) => {
      if (grupo.length === 0) return '';
      const dates = grupo.map(p => new Date(p.createdAt));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      if (minDate.toDateString() === maxDate.toDateString()) {
        return minDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short'
        });
      }
      
      return `${minDate.getDate()}/${minDate.getMonth()+1} - ${maxDate.getDate()}/${maxDate.getMonth()+1}`;
    };
    
    const calculateAverage = (grupo) => {
      if (grupo.length === 0) return 0;
      return grupo.reduce((sum, persona) => sum + persona.nota, 0) / grupo.length;
    };
    
    const initMap = () => {
      // Verificar que Leaflet esté disponible
      if (typeof L === 'undefined') {
        console.error('Leaflet no está cargado');
        return;
      }
      
      // Inicializar mapa centrado en Cochabamba
      map.value = L.map('map', {
        zoomControl: true,
        preferCanvas: true
      }).setView(COCHABAMBA_COORDS, INITIAL_ZOOM);
      
      // Añadir capa base de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        detectRetina: true
      }).addTo(map.value);
      
      // Añadir control de escala
      L.control.scale({ imperial: false }).addTo(map.value);
      
      // Inicializar capas
      markersLayer.value = L.layerGroup().addTo(map.value);
      updateMapLayers();
      
      // Añadir leyenda
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
        div.innerHTML = `
          <h6>Leyenda de calor</h6>
          <div><i style="background: blue;"></i>0-20</div>
          <div><i style="background: cyan;"></i>21-40</div>
          <div><i style="background: lime;"></i>41-60</div>
          <div><i style="background: yellow;"></i>61-80</div>
          <div><i style="background: red;"></i>81-100</div>
        `;
        return div;
      };
      legend.addTo(map.value);
    };
    
    const updateMapLayers = () => {
      if (!map.value || typeof L.heatLayer !== 'function') {
        console.error('Leaflet heatLayer no está disponible');
        return;
      }

      // Limpiar capas existentes
      if (markersLayer.value) {
        markersLayer.value.clearLayers();
      }
      
      if (heatmapLayer.value) {
        map.value.removeLayer(heatmapLayer.value);
        heatmapLayer.value = null;
      }
      
      // Crear datos para el mapa de calor solo si hay exámenes
      if (examenes.value.length > 0) {
        const heatData = examenes.value.map(examen => [
          examen.latitud, 
          examen.longitud,
          examen.nota / 100 // Normalizar a 0-1
        ]);
        
        // Añadir mapa de calor si está activado
        if (showHeatmap.value) {
          heatmapLayer.value = L.heatLayer(heatData, {
            radius: HEATMAP_RADIUS,
            blur: HEATMAP_BLUR,
            maxZoom: 17,
            minOpacity: 0.5,
            gradient: HEATMAP_GRADIENT
          }).addTo(map.value);
        }
      }
      
      // Añadir marcadores si están activados
      if (showMarkers.value && examenes.value.length > 0) {
        examenes.value.forEach(examen => {
          const marker = L.marker([examen.latitud, examen.longitud], {
            icon: getMarkerIcon(examen.nota),
            riseOnHover: true
          }).addTo(markersLayer.value);
          
          marker.bindPopup(`
            <div style="min-width: 220px">
              <h6 class="mb-2 text-primary">${examen.nombre}</h6>
              <p class="mb-1"><strong>CI:</strong> ${examen.ci}</p>
              <p class="mb-1"><strong>Nota:</strong> <span class="badge ${examen.nota >= 80 ? 'bg-success' : examen.nota >= 50 ? 'bg-primary' : 'bg-danger'}">${examen.nota}</span></p>
              <p class="mb-1"><strong>Tiempo:</strong> ${examen.tiempoRespuesta}s</p>
              <p class="mb-1"><strong>Código:</strong> ${examen.codigo}</p>
              <p class="mb-0"><strong>Fecha:</strong> ${formatDate(examen.createdAt)}</p>
            </div>
          `);
          
          // Guardar referencia al marcador en el examen para búsqueda rápida
          examen.marker = marker;
          
          // Manejar clic en el marcador
          marker.on('click', () => {
            selectedStudent.value = examen._id;
          });
        });

        // Ajustar vista para mostrar todos los marcadores si hay datos
        const markerBounds = L.latLngBounds(examenes.value.map(e => [e.latitud, e.longitud]));
        if (markerBounds.isValid()) {
          map.value.flyToBounds(markerBounds, { 
            padding: [50, 50],
            maxZoom: 15,
            duration: 1
          });
        }
      }
    };
    
    const getMarkerIcon = (nota) => {
      let color;
      if (nota >= 80) color = '#28a745'; // verde
      else if (nota >= 50) color = '#007bff'; // azul
      else color = '#dc3545'; // rojo
      
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="background-color: ${color}" class="marker-pin"></div>
          <span>${nota}</span>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -36]
      });
    };
    
    const getHighlightedMarkerIcon = (nota) => {
      return L.divIcon({
        className: 'custom-marker highlighted-marker',
        html: `
          <div style="background-color: #ff00ff; border: 2px solid white" class="marker-pin"></div>
          <span style="color: #ff00ff; font-weight: bold">${nota}</span>
        `,
        iconSize: [34, 46],
        iconAnchor: [17, 46],
        popupAnchor: [0, -40]
      });
    };
    
    const toggleHeatmap = () => {
      updateMapLayers();
    };
    
    const toggleMarkers = () => {
      updateMapLayers();
    };
    
    const focusStudent = (examen) => {
      selectedStudent.value = examen._id;
      
      // Encontrar el marcador correspondiente
      const marker = examen.marker || 
        markersLayer.value.getLayers().find(l => 
          l.getLatLng().lat === examen.latitud && 
          l.getLatLng().lng === examen.longitud
        );
      
      if (marker) {
        // Quitar resaltado del marcador anterior
        if (highlightedMarker.value) {
          highlightedMarker.value.setIcon(
            getMarkerIcon(highlightedMarker.value.examenData?.nota)
          );
        }
        
        // Resaltar el nuevo marcador
        marker.setIcon(getHighlightedMarkerIcon(examen.nota));
        marker.examenData = examen;
        highlightedMarker.value = marker;
        
        // Centrar el mapa en el marcador
        map.value.flyTo([examen.latitud, examen.longitud], 16, { 
          duration: 0.5,
          easeLinearity: 0.1
        });
        
        // Abrir el popup
        marker.openPopup();
      }
    };
    
    const zoomToGroup = (grupo) => {
      if (grupo.length === 0 || !map.value) return;
      
      const latlngs = grupo.map(p => [p.latitud, p.longitud]);
      const bounds = L.latLngBounds(latlngs);
      map.value.flyToBounds(bounds, { 
        padding: [50, 50],
        duration: 1
      });
      
      // Resaltar los marcadores del grupo
      markersLayer.value.eachLayer(layer => {
        const latlng = layer.getLatLng();
        const inGroup = grupo.some(p => 
          Math.abs(p.latitud - latlng.lat) < 0.0001 && 
          Math.abs(p.longitud - latlng.lng) < 0.0001
        );
        
        if (inGroup) {
          layer.setZIndexOffset(1000);
          layer.openPopup();
        } else {
          layer.setZIndexOffset(0);
        }
      });
    };
    
    const loadExamenes = async () => {
      loading.value = true;
      try {
        const response = await axios.get('/api/examenes');
        examenes.value = response.data;
        updateMapLayers();
      } catch (error) {
        console.error('Error cargando exámenes:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const loadGrupos = async () => {
      loadingGroups.value = true;
      try {
        const response = await axios.get('/api/examenes/grupos');
        grupos.value = response.data;
      } catch (error) {
        console.error('Error cargando grupos:', error);
      } finally {
        loadingGroups.value = false;
      }
    };
    
    const exportToExcel = async () => {
      try {
        window.location.href = '/api/examenes/export';
      } catch (error) {
        console.error('Error exportando a Excel:', error);
        alert('Error al exportar');
      }
    };
    
    const exportGroup = async (grupo) => {
      try {
        // Crear libro de Excel
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(
          grupo.map(p => ({
            Nombre: p.nombre,
            CI: p.ci,
            Correo: p.correo,
            Nota: p.nota,
            'Tiempo (s)': p.tiempoRespuesta,
            Fecha: formatDate(p.createdAt),
            Código: p.codigo,
            Latitud: p.latitud,
            Longitud: p.longitud
          }))
        );
        
        XLSX.utils.book_append_sheet(workbook, worksheet, "Grupo");
        
        // Generar y descargar
        XLSX.writeFile(workbook, `grupo-examen-${new Date().toISOString().slice(0,10)}.xlsx`);
      } catch (error) {
        console.error('Error exportando grupo:', error);
        alert('Error al exportar el grupo');
      }
    };
    
    const refreshData = async () => {
      await Promise.all([loadExamenes(), loadGrupos()]);
    };
    
    // Watchers
    watch(topCount, () => {
      selectedStudent.value = null;
      if (highlightedMarker.value) {
        const examen = highlightedMarker.value.examenData;
        if (examen) {
          highlightedMarker.value.setIcon(getMarkerIcon(examen.nota));
        }
        highlightedMarker.value = null;
      }
    });
    
    // Inicialización
    onMounted(async () => {
      initMap();
      await refreshData();
      
      // Escuchar nuevos exámenes en tiempo real
      socket.on('nuevo_examen', (nuevoExamen) => {
        examenes.value.unshift(nuevoExamen);
        updateMapLayers();
        loadGrupos();
      });
    });

    return {
      examenes,
      grupos,
      filteredTopExamenes,
      estadisticas,
      loading,
      loadingGroups,
      showHeatmap,
      showMarkers,
      topCount,
      selectedStudent,
      formatDate,
      formatGroupDateRange,
      calculateAverage,
      exportToExcel,
      exportGroup,
      refreshData,
      toggleHeatmap,
      toggleMarkers,
      focusStudent,
      zoomToGroup
    };
  }
}).mount('#app');