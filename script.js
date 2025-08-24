document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica de la Pantalla de Bienvenida ---
    const splashScreen = document.getElementById('splash-screen');
    const countdownText = document.getElementById('countdown-text');
    let count = 3;

    const startCountdown = () => {
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.textContent = count;
                countdownText.dataset.text = count;
            } else {
                countdownText.textContent = 'INICIANDO';
                countdownText.dataset.text = 'INICIANDO';
                clearInterval(countdownInterval);
                setTimeout(() => {
                    splashScreen.style.opacity = '0';
                    setTimeout(() => {
                        splashScreen.style.display = 'none';
                    }, 1500);
                }, 1000);
            }
        }, 1000);
    };

    startCountdown();

    // --- Lógica del Panel de Control ---
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const settingsPanel = document.getElementById('settings-panel');

    settingsToggleBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
    });

    // --- Lógica de Navegación del Portafolio (con Smooth Scroll) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const h1Element = document.querySelector('.glitch');
    const h1Text = "Hola, soy Andrés Hernández";

    // Actualiza los enlaces de redes sociales en la sección de contacto
    const githubLink = document.querySelector('#contacto a:nth-child(2)');
    const whatsappLink = document.querySelector('#contacto a:nth-child(3)');

    if (githubLink) {
        githubLink.href = 'https://github.com/hernandez-andres';
    }

    if (whatsappLink) {
        const phoneNumber = 56984025253; // Reemplaza con tu número. Ej: "56912345678"
        const message = "Hola, vi tu portafolio web y me gustaría contactarte.";
        whatsappLink.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Oculta todas las secciones excepto la de destino
            sections.forEach(sec => {
                if ('#' + sec.id === e.target.getAttribute('href')) {
                    sec.classList.add('active');
                    // Si la sección activa es 'habilidades', inicializar la animación
                    if (sec.id === 'habilidades') {
                        initSkills();
                    } else if (sec.id === 'proyectos') {
                        // Si la sección es 'proyectos', cargar desde la API
                        fetchProjects();
                    }
                } else {
                    sec.classList.remove('active');
                }
            });

            // Agrega o elimina la clase 'active' para los enlaces de navegación
            navLinks.forEach(nav => nav.classList.remove('active'));
            e.target.classList.add('active');

            // Lógica para el efecto glitch del título
            if (e.target.getAttribute('href') === '#inicio') {
                 h1Element.textContent = h1Text;
                 h1Element.dataset.text = h1Text;
            } else {
                 h1Element.textContent = '';
                 h1Element.dataset.text = '';
            }

            // Desplazamiento suave (smooth scroll)
            const targetId = e.target.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // --- Lógica de Filtrado de Proyectos (Actualizada) ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectsGrid = document.querySelector('.projects-grid');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            // Iterar sobre las tarjetas de proyecto generadas
            projectsGrid.querySelectorAll('.project-card').forEach(card => {
                if (filterValue === 'all' || card.classList.contains(filterValue)) {
                    card.style.display = 'block'; // O el display original, por ejemplo 'flex'
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --- Lógica para la Sección de Habilidades Interactiva ---
    const skills = [
        { name: 'HTML', percentage: 90 },
        { name: 'CSS', percentage: 85 },
        { name: 'JavaScript', percentage: 75 },
        { name: 'Swift/Xcode', percentage: 70 },
        { name: 'React', percentage: 65 },
        { name: 'Node.js', percentage: 50 }
    ];

    const skillsGrid = document.querySelector('.skills-grid');

    const drawSkillCircle = (canvas, percentage) => {
        const ctx = canvas.getContext('2d');
        const radius = 50;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const endAngle = (Math.PI * 2) * (percentage / 100);

        // Fondo del círculo
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Círculo de progreso
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + endAngle, false);
        ctx.strokeStyle = 'var(--color-primary)';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Texto del porcentaje
        ctx.fillStyle = 'var(--color-text-light)';
        ctx.font = '20px Roboto Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, centerX, centerY);
    };

    const initSkills = () => {
        // Limpiar el grid antes de dibujar (para evitar duplicados)
        skillsGrid.innerHTML = '';
        skills.forEach(skill => {
            const skillCard = document.createElement('div');
            skillCard.className = 'skill-card';

            const canvas = document.createElement('canvas');
            canvas.className = 'skill-canvas';
            canvas.width = 120;
            canvas.height = 120;

            const skillTitle = document.createElement('h3');
            skillTitle.className = 'skill-title';
            skillTitle.textContent = skill.name;

            skillCard.appendChild(canvas);
            skillCard.appendChild(skillTitle);
            skillsGrid.appendChild(skillCard);

            drawSkillCircle(canvas, skill.percentage);
        });
    };

    // --- Nuevas funciones para la API de GitHub ---
    const GITHUB_USERNAME = 'hernandez-andres';
    const REPO_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

    const fetchProjects = async () => {
        try {
            // Limpiar el contenedor de proyectos mientras se carga
            projectsGrid.innerHTML = '<p>Cargando proyectos...</p>';
            const response = await fetch(REPO_URL);
            const data = await response.json();

            // Si la respuesta es un array de proyectos, renderizarlos
            if (Array.isArray(data)) {
                renderProjects(data);
            } else {
                projectsGrid.innerHTML = '<p>No se pudieron cargar los proyectos. Inténtalo de nuevo más tarde.</p>';
            }

        } catch (error) {
            console.error('Error al obtener los proyectos:', error);
            projectsGrid.innerHTML = '<p>Error al cargar los proyectos. Revisa tu nombre de usuario de GitHub.</p>';
        }
    };

    const renderProjects = (projects) => {
        // Limpiar el contenedor antes de renderizar
        projectsGrid.innerHTML = '';
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            // Aquí puedes agregar clases basadas en el idioma para el filtrado, si lo deseas
            projectCard.className = `project-card ${project.language ? project.language.toLowerCase() : ''}`;

            projectCard.innerHTML = `
                <h3 class="project-title">${project.name}</h3>
                <p class="project-description">${project.description || 'No hay descripción disponible.'}</p>
                <span class="project-tags">#${project.language || 'Desconocido'}</span>
                <a href="${project.html_url}" target="_blank" class="project-link">Ver en GitHub</a>
            `;
            projectsGrid.appendChild(projectCard);
        });
    };

    // --- Lógica del Formulario de Contacto (con Formspree) ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);

        // Muestra un mensaje de "Enviando..."
        formStatus.textContent = 'Enviando...';
        formStatus.className = '';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.textContent = '¡Mensaje enviado con éxito!';
                formStatus.className = 'success-message';
                contactForm.reset();
            } else {
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    formStatus.textContent = data.errors.map(error => error.message).join(', ');
                } else {
                    formStatus.textContent = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
                }
                formStatus.className = 'error-message';
            }
        } catch (error) {
            formStatus.textContent = 'Ocurrió un error de conexión. Por favor, inténtalo de nuevo.';
            formStatus.className = 'error-message';
        }
    });
});