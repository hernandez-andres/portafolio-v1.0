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

    // --- Lógica del Panel de Control y Navegación del Cyber-Mapa ---
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const nodes = document.querySelectorAll('.cyber-node-group');
    const sections = document.querySelectorAll('.section');
    const animationsToggle = document.getElementById('animations-toggle');
    const themeButtons = document.querySelectorAll('.theme-btn');

    settingsToggleBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
    });

    animationsToggle.addEventListener('change', () => {
        document.body.classList.toggle('no-animations', !animationsToggle.checked);
    });

    // Lógica para el cambio de temas
    const storedTheme = localStorage.getItem('theme') || 'cyber';
    document.body.classList.add(storedTheme + '-theme');

    themeButtons.forEach(button => {
        if (button.dataset.theme === storedTheme) {
            button.classList.add('active');
        }

        button.addEventListener('click', () => {
            const newTheme = button.dataset.theme;
            
            document.body.classList.remove('cyber-theme', 'light-theme', 'dark-theme');
            document.body.classList.add(newTheme + '-theme');
            
            themeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            localStorage.setItem('theme', newTheme);
        });
    });

    const setActiveState = (targetId) => {
        // Lógica para las secciones
        sections.forEach(sec => {
            const isActive = sec.id === targetId;
            sec.classList.toggle('active', isActive);
            if (isActive) {
                if (sec.id === 'habilidades') initSkills();
                if (sec.id === 'proyectos') fetchProjects();
            }
        });

        // Lógica para los nodos del mapa
        nodes.forEach(node => {
            const isActive = node.getAttribute('data-target') === targetId;
            node.classList.toggle('active', isActive);
        });

        // Lógica para las líneas del mapa
        const paths = document.querySelectorAll('.cyber-path');
        paths.forEach(path => path.classList.remove('active'));
        if (targetId === 'habilidades') document.getElementById('path-inicio-habilidades').classList.add('active');
        if (targetId === 'proyectos') document.getElementById('path-habilidades-proyectos').classList.add('active');
        if (targetId === 'contacto') document.getElementById('path-proyectos-contacto').classList.add('active');
    };

    nodes.forEach(node => {
        node.addEventListener('click', () => setActiveState(node.getAttribute('data-target')));
    });

    // Inicia la página en la sección de inicio
    setActiveState('inicio');

    // --- Lógica de Filtrado de Proyectos ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectsGrid = document.querySelector('.projects-grid');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            projectsGrid.querySelectorAll('.project-card').forEach(card => {
                const isVisible = filterValue === 'all' || card.classList.contains(filterValue);
                card.style.display = isVisible ? 'block' : 'none';
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

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar antes de dibujar

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + endAngle, false);
        ctx.strokeStyle = 'var(--color-primary)';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.fillStyle = 'var(--color-text-light)';
        ctx.font = '20px Roboto Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, centerX, centerY);
    };

    const initSkills = () => {
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

    // --- Funciones para la API de GitHub ---
    const GITHUB_USERNAME = 'hernandez-andres';
    const REPO_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

    const fetchProjects = async () => {
        try {
            projectsGrid.innerHTML = '<p>Cargando proyectos...</p>';
            const response = await fetch(REPO_URL);
            const data = await response.json();

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
        projectsGrid.innerHTML = '';
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            const languageClass = project.language ? project.language.toLowerCase() : 'desconocido';
            projectCard.className = `project-card ${languageClass}`;

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

            const data = await response.json();
            if (response.ok) {
                formStatus.textContent = '¡Mensaje enviado con éxito!';
                formStatus.className = 'success-message';
                contactForm.reset();
            } else {
                formStatus.textContent = data.errors ? data.errors.map(error => error.message).join(', ') : 'Ocurrió un error. Por favor, inténtalo de nuevo.';
                formStatus.className = 'error-message';
            }
        } catch (error) {
            formStatus.textContent = 'Ocurrió un error de conexión. Por favor, inténtalo de nuevo.';
            formStatus.className = 'error-message';
        }
    });
});