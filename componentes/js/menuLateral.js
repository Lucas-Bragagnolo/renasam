    const sidebar = document.getElementById('sidebar');
    const menuItems = document.querySelectorAll('nav.sidebar li');
    const bottomItems = document.querySelectorAll('.bottom-nav a');
    const sections = document.querySelectorAll('.section');

    // Expansión del sidebar al hover
    sidebar.addEventListener('mouseenter', () => {
      sidebar.classList.add('sidebar-expanded');
      document.body.style.paddingLeft = '200px';
    });

    sidebar.addEventListener('mouseleave', () => {
      sidebar.classList.remove('sidebar-expanded');
      document.body.style.paddingLeft = '60px';
    });

    // Función para cambiar sección activa
    function activarSeccion(sectionId) {
      // Mostrar sección correspondiente
      sections.forEach(sec => {
        sec.classList.remove('active');
      });
      const target = document.getElementById(sectionId + '-section');
      if (target) target.classList.add('active');

      // Sidebar: actualizar item activo
      menuItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
      });

      // Bottom nav: actualizar item activo
      bottomItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
      });
    }

    // Eventos para sidebar
    menuItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        activarSeccion(item.dataset.section);
      });
    });

    // Eventos para barra inferior móvil
    bottomItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        activarSeccion(item.dataset.section);
      });
    });

    // Inicializar sección activa al cargar
    window.addEventListener('DOMContentLoaded', () => {
      activarSeccion('buscar');
    });