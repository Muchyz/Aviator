import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './AdminApp.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:20,color:'#ff4d6d',background:'#06080e',minHeight:'100vh',fontFamily:'monospace'}}>
          <h2>Admin Error</h2>
          <pre style={{whiteSpace:'pre-wrap',fontSize:12}}>{this.state.error.toString()}</pre>
          <pre style={{whiteSpace:'pre-wrap',fontSize:11,color:'#ffb703'}}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('admin-root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AdminApp />
    </ErrorBoundary>
  </StrictMode>
)
