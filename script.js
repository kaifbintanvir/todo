document.addEventListener('DOMContentLoaded', function() {
    const addTaskForm = document.getElementById('addTaskForm');
    const taskContainers = document.querySelectorAll('.task-container');
    const editTaskModal = document.getElementById('editTaskModal');
    const editTaskForm = document.getElementById('editTaskForm');
    let draggedTask = null;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Load tasks from localStorage
    function loadTasks() {
        taskContainers.forEach(function(container) {
            container.innerHTML = '';
        });
        tasks.forEach(function(task) {
            const taskPlanet = createTaskPlanet(task);
            document.querySelector('[data-status="' + task.status + '"]').appendChild(taskPlanet);
        });
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Add new task
    addTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;

        const newTask = {
            id: Date.now().toString(),
            title: title,
            description: description,
            dueDate: dueDate,
            priority: priority,
            status: 'todo'
        };

        tasks.push(newTask);
        saveTasks();

        const taskPlanet = createTaskPlanet(newTask);
        document.querySelector('[data-status="todo"]').appendChild(taskPlanet);
        addTaskForm.reset();
    });

    // Create task planet
    function createTaskPlanet(task) {
        const taskPlanet = document.createElement('div');
        taskPlanet.classList.add('task-planet', task.priority);
        taskPlanet.setAttribute('draggable', 'true');
        taskPlanet.dataset.id = task.id;

        const title = document.createElement('h3');
        title.textContent = task.title;
        taskPlanet.appendChild(title);

        const details = document.createElement('div');
        details.classList.add('task-details');
        details.innerHTML = '<p>' + task.description + '</p>' +
            '<p>Due: ' + task.dueDate + '</p>' +
            '<p>Priority: ' + task.priority + '</p>';
        taskPlanet.appendChild(details);

        const editBtn = document.createElement('button');
        editBtn.classList.add('edit-btn');
        editBtn.textContent = '✎';
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openEditModal(task);
        });
        taskPlanet.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = '✖';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteTask(task.id);
        });
        taskPlanet.appendChild(deleteBtn);

        // Toggle task details
        taskPlanet.addEventListener('click', function() {
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });

        // Drag and drop events
        taskPlanet.addEventListener('dragstart', dragStart);
        taskPlanet.addEventListener('dragend', dragEnd);

        return taskPlanet;
    }

    // Edit task
    function openEditModal(task) {
        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description;
        document.getElementById('editTaskDueDate').value = task.dueDate;
        document.getElementById('editTaskPriority').value = task.priority;
        editTaskForm.dataset.taskId = task.id;
        editTaskModal.style.display = 'block';
    }

    editTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskId = editTaskForm.dataset.taskId;
        const task = tasks.find(function(t) { return t.id === taskId; });
        if (task) {
            task.title = document.getElementById('editTaskTitle').value;
            task.description = document.getElementById('editTaskDescription').value;
            task.dueDate = document.getElementById('editTaskDueDate').value;
            task.priority = document.getElementById('editTaskPriority').value;
            saveTasks();
            loadTasks();
            editTaskModal.style.display = 'none';
        }
    });

    // Delete task
    function deleteTask(taskId) {
        tasks = tasks.filter(function(t) { return t.id !== taskId; });
        saveTasks();
        loadTasks();
    }

    // Drag and drop functions
    function dragStart(e) {
        draggedTask = this;
        setTimeout(function() {
            this.classList.add('dragging');
        }.bind(this), 0);
    }

    function dragEnd() {
        this.classList.remove('dragging');
        draggedTask = null;
    }

    taskContainers.forEach(function(container) {
        container.addEventListener('dragover', dragOver);
        container.addEventListener('dragenter', dragEnter);
        container.addEventListener('dragleave', dragLeave);
        container.addEventListener('drop', drop);
    });

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    }

    function dragLeave() {
        this.classList.remove('drag-over');
    }

    function drop() {
        this.classList.remove('drag-over');
        this.appendChild(draggedTask);
        const taskId = draggedTask.dataset.id;
        const task = tasks.find(function(t) { return t.id === taskId; });
        if (task) {
            task.status = this.dataset.status;
            saveTasks();
        }
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == editTaskModal) {
            editTaskModal.style.display = "none";
        }
    }

    // Initial load
    loadTasks();
});

