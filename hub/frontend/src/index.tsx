import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import './styles/theme.less'

// 初始化应用
async function initApp() {
  const rootEl = document.getElementById('root')
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl)
    root.render(
      // <React.StrictMode>
      <App />
      // </React.StrictMode>
    )
  }
}

initApp()
