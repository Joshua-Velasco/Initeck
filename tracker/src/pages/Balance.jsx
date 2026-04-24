import React from 'react';
import DashboardFinanciero from '../components/Empleados_Admin/DashboardFinanciero.jsx';

export default function Balance({ user }) {
  return (
    <div className="animate__animated animate__fadeIn">
      <DashboardFinanciero user={user} />
    </div>
  );
}