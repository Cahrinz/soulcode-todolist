import './styles/main.css'

class TodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || []
    this.currentFilter = 'all'
    this.init()
  }

  init() {
    this.applyTheme()
    this.initClock()
    this.initEventListeners()
    this.renderTasks()
    this.renderFilters()
  }

  // Relógio digital
  initClock() {
    const updateClock = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('pt-BR', { hour12: false })
      document.getElementById('digital-clock').textContent = timeString
    }
    updateClock()
    setInterval(updateClock, 1000)
  }

  // Event listeners
  initEventListeners() {
    document.getElementById('new-task-btn').addEventListener('click', () => this.showTaskModal())
    document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme())
  }

  // Modal de nova tarefa
  showTaskModal() {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    modal.innerHTML = `
      <div class="modal-content p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-2">✨</div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Nova Tarefa</h2>
          <p class="text-gray-600 dark:text-gray-400">Adicione uma nova tarefa à sua lista</p>
        </div>
        
        <form id="task-form" class="space-y-6">
          <div>
            <label class="form-label">📝 Título</label>
            <input type="text" id="task-title" class="form-input" placeholder="Ex: Estudar JavaScript" required>
          </div>
          
          <div>
            <label class="form-label">📄 Descrição</label>
            <textarea id="task-description" class="form-input" rows="3" placeholder="Descreva sua tarefa..." required></textarea>
          </div>
          
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              ✨ Criar Tarefa
            </button>
          </div>
        </form>
      </div>
    `
    
    modal.querySelector('#task-form').addEventListener('submit', (e) => {
      e.preventDefault()
      const title = document.getElementById('task-title').value.trim()
      const description = document.getElementById('task-description').value.trim()
      
      if (title && description) {
        this.addTask(title, description)
        modal.remove()
      }
    })
    
    document.getElementById('modal-container').appendChild(modal)
    
    // Focus no primeiro input
    setTimeout(() => {
      document.getElementById('task-title').focus()
    }, 100)
  }

  // Adicionar tarefa
  addTask(title, description) {
    const task = {
      id: Date.now().toString(),
      title,
      description,
      createdAt: new Date(),
      status: 'pending'
    }
    
    this.tasks.push(task)
    this.saveTasks()
    this.renderTasks()
    this.renderFilters()
  }

  // Salvar no localStorage
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks))
  }

  // Renderizar cards de tarefas
  renderTasks() {
    const container = document.getElementById('task-container')
    const filteredTasks = this.getFilteredTasks()
    
    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="text-6xl mb-4">📝</div>
          <h3 class="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h3>
          <p>Que tal adicionar uma nova tarefa?</p>
        </div>
      `
      return
    }

    container.innerHTML = filteredTasks.map(task => `
      <div class="task-card">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">${task.title}</h3>
          <span class="${task.status === 'completed' ? 'status-completed' : 'status-pending'}">
            ${task.status === 'completed' ? '✅ Concluída' : '⏳ Pendente'}
          </span>
        </div>
        
        <p class="text-gray-600 dark:text-gray-300 mb-4">${task.description}</p>
        
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500 dark:text-gray-400">
            📅 ${this.formatDate(task.createdAt)}
          </div>
          
          <div class="flex space-x-2">
            ${task.status === 'pending' ? `
              <button onclick="todoApp.completeTask('${task.id}')" class="btn-success">
                ✅ Concluir
              </button>
            ` : ''}
            <button onclick="todoApp.deleteTask('${task.id}')" class="btn-danger">
              🗑️ Excluir
            </button>
          </div>
        </div>
      </div>
    `).join('')
  }

  // Renderizar filtros
  renderFilters() {
    const container = document.getElementById('filter-controls')
    container.innerHTML = `
      <div class="flex space-x-2">
        <button onclick="todoApp.setFilter('all')" class="${this.currentFilter === 'all' ? 'filter-active' : 'filter-inactive'}">
          Todas (${this.tasks.length})
        </button>
        <button onclick="todoApp.setFilter('pending')" class="${this.currentFilter === 'pending' ? 'filter-active' : 'filter-inactive'}">
          Pendentes (${this.tasks.filter(t => t.status === 'pending').length})
        </button>
        <button onclick="todoApp.setFilter('completed')" class="${this.currentFilter === 'completed' ? 'filter-active' : 'filter-inactive'}">
          Concluídas (${this.tasks.filter(t => t.status === 'completed').length})
        </button>
      </div>
    `
  }

  // Filtrar tarefas
  getFilteredTasks() {
    if (this.currentFilter === 'all') return this.tasks
    return this.tasks.filter(task => task.status === this.currentFilter)
  }

  setFilter(filter) {
    this.currentFilter = filter
    this.renderTasks()
    this.renderFilters()
  }

  // Concluir tarefa
  completeTask(id) {
    this.showConfirmModal(
      'Marcar esta tarefa como concluída?',
      () => {
        const task = this.tasks.find(t => t.id === id)
        if (task) {
          task.status = 'completed'
          this.saveTasks()
          this.renderTasks()
          this.renderFilters()
        }
      },
      'complete'
    )
  }

  // Excluir tarefa
  deleteTask(id) {
    this.showConfirmModal(
      'Esta ação não pode ser desfeita. Tem certeza?',
      () => {
        this.tasks = this.tasks.filter(t => t.id !== id)
        this.saveTasks()
        this.renderTasks()
        this.renderFilters()
      },
      'delete'
    )
  }

  // Modal de confirmação
  showConfirmModal(message, onConfirm, type = 'confirm') {
    const modal = document.createElement('div')
    modal.className = 'modal-overlay'
    
    const icon = type === 'delete' ? '🗑️' : '✅'
    const confirmText = type === 'delete' ? 'Excluir' : 'Confirmar'
    const confirmClass = type === 'delete' ? 'btn-danger' : 'btn-success'
    
    modal.innerHTML = `
      <div class="modal-content p-8">
        <div class="text-center mb-6">
          <div class="text-4xl mb-3">${icon}</div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Confirmação</h2>
          <p class="text-gray-600 dark:text-gray-400">${message}</p>
        </div>
        
        <div class="flex justify-center space-x-3">
          <button class="btn-secondary" id="cancel-btn">
            Cancelar
          </button>
          <button class="${confirmClass}" id="confirm-btn">
            ${confirmText}
          </button>
        </div>
      </div>
    `
    
    modal.querySelector('#cancel-btn').addEventListener('click', () => modal.remove())
    modal.querySelector('#confirm-btn').addEventListener('click', () => {
      modal.remove()
      onConfirm()
    })
    
    document.getElementById('modal-container').appendChild(modal)
  }

  // Formatar data
  formatDate(date) {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Toggle tema
  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark')
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    }
  }

  applyTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light'
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
  window.todoApp = new TodoApp()
})