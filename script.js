let tasks = [];
let currentFilter = 'all';

// Cargar tareas del localStorage
function loadTasks() {
    const stored = localStorage.getItem('tasks');
    tasks = stored ? JSON.parse(stored) : [];
    renderTasks();
}

// Guardar tareas en localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Agregar nueva tarea
function addTask() {
    const input = document.getElementById('task-input');
    const priority = document.getElementById('priority-select').value;
    
    if (input.value.trim() === '' || priority === 'Prioridad') {
        alert('Por favor completa todos los campos');
        return;
    }

    const task = {
        id: Date.now(),
        text: input.value.trim(),
        priority: priority,
        status: 'Pendiente',
        createdAt: new Date().toLocaleDateString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    input.value = '';
    document.getElementById('priority-select').value = 'Normal';
}

// Alternar estado de la tarea
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = task.status === 'Pendiente' ? 'Completada' : 'Pendiente';
        saveTasks();
        renderTasks();
    }
}

// Eliminar tarea
function deleteTask(id) {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
}

// Filtrar tareas
function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-purple-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    event.target.classList.add('bg-purple-600', 'text-white');
    event.target.classList.remove('bg-gray-200', 'text-gray-700');
    renderTasks();
}

// Renderizar tareas
function renderTasks() {
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    
    let filtered = tasks;
    if (currentFilter === 'pending') {
        filtered = tasks.filter(t => t.status === 'Pendiente');
    } else if (currentFilter === 'completed') {
        filtered = tasks.filter(t => t.status === 'Completada');
    } else if (['Urgente', 'Normal', 'Luego'].includes(currentFilter)) {
        filtered = tasks.filter(t => t.priority === currentFilter);
    }

    taskList.innerHTML = '';
    
    if (filtered.length === 0) {
        emptyState.style.display = 'block';
        taskList.innerHTML = '';
    } else {
        emptyState.style.display = 'none';
        filtered.forEach(task => {
            const dot = task.priority === 'Urgente' ? 'dot-urgente' : 
                       task.priority === 'Normal' ? 'dot-normal' : 'dot-luego';
            
            const taskEl = document.createElement('div');
            taskEl.className = `task-item fade-in p-4 flex items-center gap-4 hover:bg-white transition ${task.status === 'Completada' ? 'task-completed' : ''}`;
            
            taskEl.innerHTML = `
                <input type="checkbox" ${task.status === 'Completada' ? 'checked' : ''} 
                    onchange="toggleTask(${task.id})" class="w-5 h-5 cursor-pointer">
                <span class="dot ${dot}"></span>
                <div class="flex-1 min-w-0">
                    <p class="text-gray-800 font-medium break-words ${task.status === 'Completada' ? 'line-through text-gray-500' : ''}">
                        ${task.text}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">${task.createdAt}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                    task.status === 'Completada' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                } whitespace-nowrap">
                    ${task.status}
                </span>
                <button onclick="deleteTask(${task.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition">
                    🗑️
                </button>
            `;
            taskList.appendChild(taskEl);
        });
    }

    updateCounters();
}

// Actualizar contadores
function updateCounters() {
    const pending = tasks.filter(t => t.status === 'Pendiente').length;
    const completed = tasks.filter(t => t.status === 'Completada').length;
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('completed-count').textContent = completed;
}

// Descargar tareas como texto
function downloadTasks() {
    if (tasks.length === 0) {
        alert('No hay tareas para descargar');
        return;
    }

    let content = 'GESTOR DE TAREAS\n';
    content += '===============\n\n';
    content += `Generado: ${new Date().toLocaleString()}\n`;
    content += `Total de tareas: ${tasks.length}\n`;
    content += `Pendientes: ${tasks.filter(t => t.status === 'Pendiente').length}\n`;
    content += `Completadas: ${tasks.filter(t => t.status === 'Completada').length}\n\n`;
    
    content += 'TAREAS:\n';
    content += '-------\n\n';
    
    tasks.forEach((task, index) => {
        const icon = task.priority === 'Urgente' ? '🔴' : task.priority === 'Normal' ? '🟢' : '🟠';
        const status = task.status === 'Completada' ? '✓' : '○';
        content += `${index + 1}. [${status}] ${icon} ${task.text}\n`;
        content += `   Prioridad: ${task.priority} | Estado: ${task.status}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tareas-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Permitir agregar con Enter
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && document.getElementById('task-input') === document.activeElement) {
        addTask();
    }
});

// Cargar tareas al iniciar
loadTasks();
