const { createApp, ref, onMounted, computed } = Vue;

createApp({
  setup() {
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
    const socket = io();
    
    // Computed properties
    const topExamenes = computed(() => {
      return [...examenes.value]
        .sort((a, b) => b.nota - a.nota || b.tiempoRespuesta - a.tiempoRespuesta)
        .slice(0, 10);
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
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
    
    const calculateAverage = (grupo) => {
      return grupo.reduce((sum, persona) => sum + persona.nota, 0) / grupo.length;
    };
    
    const initMap = () => {
      // Inicializar mapa con vista por defecto
      map.value = L.map('map').setView([-17.7833, -63.1821], 13);
      
      // Añadir capa base de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map.value);
      
      // Inicializar capas
      markersLayer.value = L.layerGroup().addTo(map.value);
      updateMapLayers();
    };
    
    const updateMapLayers = () => {
      // Limpiar capas existentes
      markersLayer.value.clearLayers();
      if (heatmapLayer.value) {
        map.value.removeLayer(heatmapLayer.value);
      }
      
      // Crear datos para el mapa de calor
      const heatData = examenes.value.map(examen => [
        examen.latitud, 
        examen.longitud,
        examen.nota / 10 // Intensidad basada en la nota
      ]);
      
      // Añadir mapa de calor si está activado
      if (showHeatmap.value && examenes.value.length > 0) {
        heatmapLayer.value = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          minOpacity: 0.5,
          gradient: {0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red'}
        }).addTo(map.value);
      }
      
      // Añadir marcadores si están activados
      if (showMarkers.value) {
        examenes.value.forEach(examen => {
          const marker = L.marker([examen.latitud, examen.longitud], {
            icon: getMarkerIcon(examen.nota)
          }).addTo(markersLayer.value);
          
          marker.bindPopup(`
            <b>${examen.nombre}</b><br>
            CI: ${examen.ci}<br>
            Nota: <b>${examen.nota}</b><br>
            Tiempo: ${examen.tiempoRespuesta}s<br>
            ${formatDate(examen.createdAt)}
          `);
        });
      }
    };
    
    const getMarkerIcon = (nota) => {
      let color;
      if (nota >= 80) color = 'green';
      else if (nota >= 50) color = 'blue';
      else color = 'red';
      
      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}" class="marker-pin"></div><span>${nota}</span>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -36]
      });
    };
    
    const toggleHeatmap = () => {
      updateMapLayers();
    };
    
    const toggleMarkers = () => {
      updateMapLayers();
    };
    
    const zoomToGroup = (grupo) => {
      if (grupo.length === 0) return;
      
      const latlngs = grupo.map(p => [p.latitud, p.longitud]);
      const bounds = L.latLngBounds(latlngs);
      map.value.fitBounds(bounds, { padding: [50, 50] });
      
      // Resaltar los marcadores del grupo
      markersLayer.value.eachLayer(layer => {
        const latlng = layer.getLatLng();
        const inGroup = grupo.some(p => 
          p.latitud === latlng.lat && p.longitud === latlng.lng
        );
        
        if (inGroup) {
          layer.setZIndexOffset(1000);
          layer.openPopup();
        } else {
          layer.setZIndexOffset(0);
        }
      });
    };
    
    const zoomToLocation = (lat, lng) => {
      map.value.flyTo([lat, lng], 17);
      
      // Encontrar y abrir el marcador correspondiente
      markersLayer.value.eachLayer(layer => {
        const latlng = layer.getLatLng();
        if (latlng.lat === lat && latlng.lng === lng) {
          layer.openPopup();
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
    
    const refreshData = async () => {
      await Promise.all([loadExamenes(), loadGrupos()]);
    };
    
    // Inicialización
    onMounted(async () => {
      initMap();
      await refreshData();
      
      // Escuchar nuevos exámenes en tiempo real
      socket.on('nuevo_examen', (nuevoExamen) => {
        examenes.value.unshift(nuevoExamen);
        updateMapLayers();
        loadGrupos(); // Actualizar grupos
      });
    });
    
    return {
      examenes,
      grupos,
      topExamenes,
      estadisticas,
      loading,
      loadingGroups,
      showHeatmap,
      showMarkers,
      formatDate,
      calculateAverage,
      exportToExcel,
      refreshData,
      toggleHeatmap,
      toggleMarkers,
      zoomToGroup,
      zoomToLocation
    };
  }
}).mount('#app');