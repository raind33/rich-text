import vue from 'vue'
import './style.css'
import App from './App.vue'

new vue({
  render(h) {
    return h(App)
  }
}).$mount('#app')
