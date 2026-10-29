import React from 'react';
import { useAuth } from '../components/ProtectedRoute';

// Company pages
import CompanyDashboard from './company/CompanyDashboard';
import CompanyProjects from './company/CompanyProjects';
import CompanyProjectDetail from './company/CompanyProjectDetail';
import CompanyMaterials from './company/CompanyMaterials';
import CompanyPayments from './company/CompanyPayments';
import CompanyDocuments from './company/CompanyDocuments';
import CompanyTeam from './company/CompanyTeam';

// Homeowner pages
import HomeownerDashboard from './homeowner/HomeownerDashboard';
import HomeownerProject from './homeowner/HomeownerProject';
import HomeownerPayments from './homeowner/HomeownerPayments';
import HomeownerDocuments from './homeowner/HomeownerDocuments';

// Contractor pages
import ContractorDashboard from './contractor/ContractorDashboard';
import ContractorMaterials from './contractor/ContractorMaterials';
import ContractorPayments from './contractor/ContractorPayments';
import ContractorDocuments from './contractor/ContractorDocuments';

export function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'homeowner') return <HomeownerDashboard />;
  if (user?.role === 'contractor') return <ContractorDashboard />;
  return <CompanyDashboard />;
}

export function ProjectsPage() {
  const { user } = useAuth();
  if (user?.role === 'homeowner') return <HomeownerProject />;
  if (user?.role === 'contractor') return <ContractorDashboard />;
  return <CompanyProjects />;
}

export function ProjectDetailPage() {
  const { user } = useAuth();
  if (user?.role === 'homeowner') return <HomeownerProject />;
  if (user?.role === 'contractor') return <ContractorDashboard />;
  return <CompanyProjectDetail />;
}

export function MaterialsPage() {
  const { user } = useAuth();
  if (user?.role === 'contractor') return <ContractorMaterials />;
  return <CompanyMaterials />;
}

export function PaymentsPage() {
  const { user } = useAuth();
  if (user?.role === 'homeowner') return <HomeownerPayments />;
  if (user?.role === 'contractor') return <ContractorPayments />;
  return <CompanyPayments />;
}

export function DocumentsPage() {
  const { user } = useAuth();
  if (user?.role === 'homeowner') return <HomeownerDocuments />;
  if (user?.role === 'contractor') return <ContractorDocuments />;
  return <CompanyDocuments />;
}

export function TeamPage() {
  return <CompanyTeam />;
}
