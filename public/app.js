const { createApp, ref, onMounted, computed } = Vue;

createApp({
  setup() {
    const examenes = ref([]);
    const grupos = ref([]);
    const map = ref(null);
    const heatmap = ref(null);
    const socket = io();
    
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
    
    const initMap = () => {
      map.value = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: { lat: examenes.value[0]?.latitud || -17.7833, lng: examenes.value[0]?.longitud || -63.1821 },
        mapTypeId: 'hybrid'
      });
      
      updateHeatmap();
    };
    
    const updateHeatmap = () => {
      if (heatmap.value) {
        heatmap.value.setMap(null);
      }
      
      const heatmapData = examenes.value.map(examen => ({
        location: new google.maps.LatLng(examen.latitud, examen.longitud),
        weight: examen.nota
      }));
      
      heatmap.value = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map.value,
        radius: 20
      });
    };
    
    const loadExamenes = async () => {
      try {
        const response = await axios.get('/api/examenes');
        examenes.value = response.data;
        updateHeatmap();
      } catch (error) {
        console.error('Error cargando exámenes:', error);
      }
    };
    
    const loadGrupos = async () => {
      try {
        const response = await axios.get('/api/examenes/grupos');
        grupos.value = response.data;
      } catch (error) {
        console.error('Error cargando grupos:', error);
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
    
    onMounted(async () => {
      await loadExamenes();
      await loadGrupos();
      initMap();
      
      // Escuchar nuevos exámenes en tiempo real
      socket.on('nuevo_examen', (nuevoExamen) => {
        examenes.value.unshift(nuevoExamen);
        updateHeatmap();
        loadGrupos(); // Actualizar grupos
      });
    });
    
    return {
      examenes,
      grupos,
      topExamenes,
      estadisticas,
      exportToExcel
    };
  }
}).mount('#app');