import React, { Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'

// Lazy load remotes
const Dashboard = React.lazy(() => import('dashboard/App'))
const Units = React.lazy(() => import('units/App'))
// Maintenance might export 'App' or specific components. Assuming App for now.
const Maintenance = React.lazy(() => import('maintenance/App')) 
const Personnel = React.lazy(() => import('personnel/App'))
const FleetMonitor = React.lazy(() => import('fleetMonitor/App'))
const Trips = React.lazy(() => import('trips/App'))
const Finances = React.lazy(() => import('finances/App'))

function App() {
  return (
    <div className="app-container">
      <nav style={{ padding: '1rem', background: '#f0f0f0', display: 'flex', gap: '1rem' }}>
        <Link to="/">Dashboard</Link>
        <Link to="/units">Units</Link>
        <Link to="/maintenance">Maintenance</Link>
        <Link to="/personnel">Personnel</Link>
        <Link to="/fleet-monitor">Fleet Monitor</Link>
        <Link to="/trips">Trips</Link>
        <Link to="/finances">Finances</Link>
      </nav>

      <Suspense fallback={<div>Loading Module...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/units/*" element={<Units />} />
          <Route path="/maintenance/*" element={<Maintenance />} />
          <Route path="/personnel/*" element={<Personnel />} />
          <Route path="/fleet-monitor/*" element={<FleetMonitor />} />
          <Route path="/trips/*" element={<Trips />} />
          <Route path="/finances/*" element={<Finances />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
