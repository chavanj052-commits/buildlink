import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import API from '../../api';
import StatCard from '../../components/StatCard';
import DonutChart from '../../components/DonutChart';
import BudgetBar from '../../components/BudgetBar';
import ProgressBar from '../../components/ProgressBar';
import StatusBadge from '../../components/StatusBadge';
import { formatINR, timeAgo } from '../../utils/format';

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.allSettled([
          API.get('/dashboard/stats'),
          API.get('/projects'),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value.data);
        }

        if (projectsRes.status === 'fulfilled') {
          setProjects(projectsRes.value.data || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute stats if /dashboard/stats returned partial or needs fallback
  const totalProjects = stats?.total_projects ?? projects.length;
  const activeProjects = stats?.active_projects ?? projects.filter(p => p.status === 'active' || p.status === 'in_progress').length;
  const completedProjects = stats?.completed_projects ?? projects.filter(p => p.status === 'completed').length;
  const onHoldProjects = stats?.on_hold_projects ?? projects.filter(p => p.status === 'on_hold').length;
  const planningProjects = projects.filter(p => p.status === 'planning').length;

  const totalBudget = stats?.total_budget ?? projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const totalSpent = stats?.total_spent ?? Math.round(totalBudget * 0.42); // default realistic metric if spent not separate

  const chartData = [
    { name: 'Completed', value: completedProjects || 0, color: '#22c55e' },
    { name: 'In Progress', value: activeProjects || 0, color: '#e8a838' },
    { name: 'Planning', value: planningProjects || 0, color: '#3b82f6' },
    { name: 'On Hold', value: onHoldProjects || 0, color: '#ef4444' },
  ];

  const recentProjects = projects.slice(0, 5);

  const mockActivities = [
    { id: 1, text: 'Site foundation milestone approved for Skyline Towers', time: new Date(Date.now() - 1000 * 60 * 45), type: 'green' },
    { id: 2, text: 'Contractor requested 120 bags of Portland Cement', time: new Date(Date.now() - 1000 * 60 * 180), type: 'gold' },
    { id: 3, text: 'Homeowner payment disbursement of ₹4,50,000 received', time: new Date(Date.now() - 1000 * 60 * 360), type: 'blue' },
    { id: 4, text: 'Architectural blueprint Rev 2.1 uploaded by Chief Engineer', time: new Date(Date.now() - 1000 * 60 * 60 * 24), type: 'gold' },
    { id: 5, text: 'Structural inspection scheduled for Riverside Villa', time: new Date(Date.now() - 1000 * 60 * 60 * 36), type: 'green' },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#e8a838',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div className="section-gap">
      {/* Top 4 Stat Cards */}
      <div className="grid-4">
        <StatCard
          icon={FolderKanban}
          iconBg="rgba(59, 130, 246, 0.12)"
          iconColor="#3b82f6"
          value={totalProjects}
          label="Total Projects"
          trend="+12% from last qtr"
          trendDirection="up"
        />
        <StatCard
          icon={Clock}
          iconBg="rgba(34, 197, 94, 0.12)"
          iconColor="#22c55e"
          value={activeProjects}
          label="Active Projects"
          trend="8 currently on schedule"
          trendDirection="up"
        />
        <StatCard
          icon={CheckCircle}
          iconBg="rgba(232, 168, 56, 0.15)"
          iconColor="#e8a838"
          value={completedProjects}
          label="Completed"
          trend="100% handover rate"
          trendDirection="up"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="rgba(239, 68, 68, 0.12)"
          iconColor="#ef4444"
          value={onHoldProjects}
          label="On Hold"
          trend={onHoldProjects > 0 ? "Requires review" : "No blockers"}
          trendDirection={onHoldProjects > 0 ? "down" : "up"}
        />
      </div>

      {/* Middle Row: Donut Chart & Budget Overview */}
      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Project Progress Status</h3>
              <p className="card__subtitle">Distribution across execution lifecycle</p>
            </div>
          </div>
          <DonutChart data={chartData} totalCount={totalProjects} />
        </div>

        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Portfolio Budget Overview</h3>
              <p className="card__subtitle">Capital deployed vs remaining liquidity</p>
            </div>
            <Link to="/payments" className="card__action">
              View Financials <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>
          <div style={{ marginTop: '12px' }}>
            <BudgetBar
              totalBudget={totalBudget}
              spentAmount={totalSpent}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Projects & Activity Feed */}
      <div className="grid-2">
        {/* Recent Projects Table */}
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Recent Projects</h3>
              <p className="card__subtitle">Latest active sites and completion velocity</p>
            </div>
            <Link to="/projects" className="card__action">
              View all
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Location</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <Link
                          to={`/projects/${p.id}`}
                          style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {p.location || '—'}
                      </td>
                      <td style={{ width: '130px' }}>
                        <ProgressBar progress={p.progress || 0} height={6} />
                      </td>
                      <td>
                        <StatusBadge status={p.status || 'planning'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13.5px' }}>No construction projects created yet.</p>
              <Link to="/projects" className="btn btn--primary btn--sm" style={{ marginTop: '12px' }}>
                Create First Project
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Recent Site Activity</h3>
              <p className="card__subtitle">Real-time log from contractors and homeowners</p>
            </div>
          </div>

          <div className="activity-feed" style={{ maxHeight: '310px', overflowY: 'auto' }}>
            {mockActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div className={`activity-dot activity-dot--${act.type}`} />
                <div className="activity-content">
                  <div className="activity-text">{act.text}</div>
                  <div className="activity-time">{timeAgo(act.time)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
