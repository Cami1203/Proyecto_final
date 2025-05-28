<template>
  <TransitionGroup 
    name="notification" 
    tag="div" 
    class="notifications-container"
  >
    <div 
      v-for="notification in notifications" 
      :key="notification.id"
      :class="['notification', notification.type]"
    >
      <div class="notification-icon">
        <i :class="getIcon(notification.type)"></i>
      </div>
      <div class="notification-content">
        <h4>{{ notification.title }}</h4>
        <p>{{ notification.message }}</p>
      </div>
      <button 
        class="notification-close"
        @click="removeNotification(notification.id)"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </TransitionGroup>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'NotificationComponent',
  setup() {
    const notifications = ref([])
    let nextId = 1

    const getIcon = (type) => {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
      }
      return icons[type] || icons.info
    }

    const addNotification = ({ title, message, type = 'info', duration = 5000 }) => {
      const id = nextId++
      notifications.value.push({ id, title, message, type })
      
      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }
    }

    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    }

    onMounted(() => {
      window.$notify = addNotification
    })

    return {
      notifications,
      getIcon,
      removeNotification
    }
  }
}
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: flex-start;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.notification::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.notification.success::before {
  background: linear-gradient(45deg, #4CAF50, #45a049);
}

.notification.error::before {
  background: linear-gradient(45deg, #f44336, #e53935);
}

.notification.warning::before {
  background: linear-gradient(45deg, #ff9800, #f57c00);
}

.notification.info::before {
  background: linear-gradient(45deg, #2196F3, #1976D2);
}

.notification-icon {
  margin-right: 12px;
  font-size: 1.5rem;
}

.notification.success .notification-icon {
  color: #4CAF50;
}

.notification.error .notification-icon {
  color: #f44336;
}

.notification.warning .notification-icon {
  color: #ff9800;
}

.notification.info .notification-icon {
  color: #2196F3;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.notification-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #666;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 