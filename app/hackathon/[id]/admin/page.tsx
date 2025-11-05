'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HackathonData, Project, SpecialAward, HackathonsList, HackathonInfo, Team } from '@/lib/types';
import { calculateOverallScore, formatScore, getScoreColor } from '@/lib/utils';
import { verifyPassword } from '@/lib/auth';

export default function AdminPage() {
  const params = useParams();
  const hackathonId = params.id as string;
  
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<HackathonData | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showAwardsManager, setShowAwardsManager] = useState(false);
  const [showHackathonSettings, setShowHackathonSettings] = useState(false);
  const [showTeamManager, setShowTeamManager] = useState(false);
  const [editingAward, setEditingAward] = useState<SpecialAward | null>(null);
  const [newAwardName, setNewAwardName] = useState('');
  const [newAwardEmoji, setNewAwardEmoji] = useState('🏆');
  const [hackathonsList, setHackathonsList] = useState<HackathonsList | null>(null);
  const [currentHackathon, setCurrentHackathon] = useState<HackathonInfo | null>(null);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState('');
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectTeam, setNewProjectTeam] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [projectSortBy, setProjectSortBy] = useState<'score-desc' | 'score-asc' | 'alpha' | 'team'>('score-desc');

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetchHackathonsList();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    const response = await fetch(`/api/data?hackathonId=${hackathonId}`);
    const result = await response.json();
    setData(result);
  };

  const fetchHackathonsList = async () => {
    const response = await fetch('/api/hackathons');
    const result = await response.json();
    setHackathonsList(result);
    const current = result.hackathons.find((h: HackathonInfo) => h.id === hackathonId);
    setCurrentHackathon(current || null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify against obfuscated password
    if (verifyPassword(password)) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleSave = async () => {
    if (!data || !selectedProject) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hackathonId, data }),
      });

      if (response.ok) {
        setMessage('✓ Changes saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('✗ Error saving changes');
      }
    } catch (error) {
      setMessage('✗ Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const saveTeamData = async () => {
    if (!data) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hackathonId, data }),
      });

      if (response.ok) {
        setMessage('✓ Team changes saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('✗ Error saving team changes');
      }
    } catch (error) {
      setMessage('✗ Error saving team changes');
    } finally {
      setSaving(false);
    }
  };

  const saveHackathonSettings = async () => {
    if (!hackathonsList || !currentHackathon) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/hackathons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hackathonsList),
      });

      if (response.ok) {
        setMessage('✓ Hackathon settings saved!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('✗ Error saving settings');
      }
    } catch (error) {
      setMessage('✗ Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateHackathonInfo = (field: keyof HackathonInfo, value: string | boolean) => {
    if (!hackathonsList || !currentHackathon) return;

    const updatedHackathon = { ...currentHackathon, [field]: value };
    const updatedList = {
      hackathons: hackathonsList.hackathons.map(h =>
        h.id === hackathonId ? updatedHackathon : h
      ),
    };

    setCurrentHackathon(updatedHackathon);
    setHackathonsList(updatedList);
  };

  const updateProjectScore = (projectId: string, categoryId: string, value: number) => {
    if (!data) return;

    const updatedProjects = data.projects.map(project => {
      if (project.id === projectId) {
        const updatedProject = {
          ...project,
          scores: {
            ...project.scores,
            [categoryId]: value,
          },
        };
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
        return updatedProject;
      }
      return project;
    });

    setData({ ...data, projects: updatedProjects });
  };

  const updateProjectDescription = (projectId: string, description: string) => {
    if (!data) return;

    const updatedProjects = data.projects.map(project => {
      if (project.id === projectId) {
        const updatedProject = { ...project, description };
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
        return updatedProject;
      }
      return project;
    });

    setData({ ...data, projects: updatedProjects });
  };

  const updateProjectJudgesNotes = (projectId: string, judgesNotes: string) => {
    if (!data) return;

    const updatedProjects = data.projects.map(project => {
      if (project.id === projectId) {
        const updatedProject = { ...project, judgesNotes };
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
        return updatedProject;
      }
      return project;
    });

    setData({ ...data, projects: updatedProjects });
  };

  const updateProjectTitle = (projectId: string, title: string) => {
    if (!data) return;

    const updatedProjects = data.projects.map(project => {
      if (project.id === projectId) {
        const updatedProject = { ...project, title };
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
        return updatedProject;
      }
      return project;
    });

    setData({ ...data, projects: updatedProjects });
  };

  const toggleSpecialAward = (projectId: string, awardId: string) => {
    if (!data) return;

    const updatedProjects = data.projects.map(project => {
      if (project.id === projectId) {
        const hasAward = project.specialAwards.includes(awardId);
        const updatedProject = {
          ...project,
          specialAwards: hasAward
            ? project.specialAwards.filter(a => a !== awardId)
            : [...project.specialAwards, awardId],
        };
        if (selectedProject?.id === projectId) {
          setSelectedProject(updatedProject);
        }
        return updatedProject;
      }
      return project;
    });

    setData({ ...data, projects: updatedProjects });
  };

  const addSpecialAward = () => {
    if (!data || !newAwardName.trim()) return;

    const newAward: SpecialAward = {
      id: newAwardName.toLowerCase().replace(/\s+/g, '-'),
      name: newAwardName.trim(),
      emoji: newAwardEmoji,
    };

    setData({
      ...data,
      config: {
        ...data.config,
        specialAwards: [...data.config.specialAwards, newAward],
      },
    });

    setNewAwardName('');
    setNewAwardEmoji('🏆');
    setMessage('✓ Award added! Remember to save changes.');
    setTimeout(() => setMessage(''), 3000);
  };

  const updateSpecialAward = (awardId: string, name: string, emoji: string) => {
    if (!data) return;

    const updatedAwards = data.config.specialAwards.map(award =>
      award.id === awardId ? { ...award, name, emoji } : award
    );

    setData({
      ...data,
      config: {
        ...data.config,
        specialAwards: updatedAwards,
      },
    });
  };

  const deleteSpecialAward = (awardId: string) => {
    if (!data) return;
    if (!confirm('Are you sure you want to delete this award? It will be removed from all projects.')) return;

    // Remove from config
    const updatedAwards = data.config.specialAwards.filter(award => award.id !== awardId);

    // Remove from all projects
    const updatedProjects = data.projects.map(project => ({
      ...project,
      specialAwards: project.specialAwards.filter(a => a !== awardId),
    }));

    setData({
      ...data,
      config: {
        ...data.config,
        specialAwards: updatedAwards,
      },
      projects: updatedProjects,
    });

    if (selectedProject) {
      const updated = updatedProjects.find(p => p.id === selectedProject.id);
      if (updated) setSelectedProject(updated);
    }

    setMessage('✓ Award deleted! Remember to save changes.');
    setTimeout(() => setMessage(''), 3000);
  };

  const addTeam = () => {
    if (!data || !newTeamName.trim()) return;

    const teamId = newTeamName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const members = newTeamMembers.split(',').map(m => m.trim()).filter(m => m.length > 0);

    const newTeam = {
      id: teamId,
      name: newTeamName.trim(),
      members: members,
      projects: [],
    };

    setData({
      ...data,
      teams: [...data.teams, newTeam],
    });

    setNewTeamName('');
    setNewTeamMembers('');
    setMessage('✓ Team added! Remember to save changes.');
    setTimeout(() => setMessage(''), 3000);
  };

  const updateTeam = (teamId: string, name: string, members: string[]) => {
    if (!data) return;

    const updatedTeams = data.teams.map(team =>
      team.id === teamId ? { ...team, name, members } : team
    );

    setData({
      ...data,
      teams: updatedTeams,
    });
  };

  const deleteTeam = (teamId: string) => {
    if (!data) return;

    const team = data.teams.find(t => t.id === teamId);
    const projectsForTeam = data.projects.filter(p => p.teamId === teamId);

    if (projectsForTeam.length > 0) {
      if (!confirm(`This team has ${projectsForTeam.length} project(s). Deleting the team will also delete these projects. Are you sure?`)) return;
    } else {
      if (!confirm('Are you sure you want to delete this team?')) return;
    }

    // Remove team and its projects
    const updatedTeams = data.teams.filter(t => t.id !== teamId);
    const updatedProjects = data.projects.filter(p => p.teamId !== teamId);

    setData({
      ...data,
      teams: updatedTeams,
      projects: updatedProjects,
    });

    if (selectedProject && selectedProject.teamId === teamId) {
      setSelectedProject(null);
    }

    setMessage('✓ Team deleted! Remember to save changes.');
    setTimeout(() => setMessage(''), 3000);
  };

  const addProject = () => {
    if (!data || !newProjectTitle.trim() || !newProjectTeam) return;

    const projectId = newProjectTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newProject: Project = {
      id: projectId,
      teamId: newProjectTeam,
      title: newProjectTitle.trim(),
      description: '',
      judgesNotes: '',
      images: [],
      links: [],
      scores: {
        workScope: 0,
        polish: 0,
        funUseful: 0,
        creativity: 0,
        innovation: 0,
        doesItWork: 0,
      },
      specialAwards: [],
    };

    // Add project to team's projects list
    const updatedTeams = data.teams.map(team =>
      team.id === newProjectTeam
        ? { ...team, projects: [...team.projects, projectId] }
        : team
    );

    setData({
      ...data,
      projects: [...data.projects, newProject],
      teams: updatedTeams,
    });

    setNewProjectTitle('');
    setNewProjectTeam('');
    setMessage('✓ Project added! Remember to save changes.');
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteProject = (projectId: string) => {
    if (!data) return;
    if (!confirm('Are you sure you want to delete this project?')) return;

    const project = data.projects.find(p => p.id === projectId);
    
    // Remove project from team's projects list
    const updatedTeams = data.teams.map(team =>
      team.id === project?.teamId
        ? { ...team, projects: team.projects.filter(p => p !== projectId) }
        : team
    );

    const updatedProjects = data.projects.filter(p => p.id !== projectId);

    setData({
      ...data,
      projects: updatedProjects,
      teams: updatedTeams,
    });

    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }

    setMessage('✓ Project deleted! Remember to save changes.');
    setTimeout(() => setMessage(''), 3000);
  };

  const updateProjectTeam = (projectId: string, newTeamId: string) => {
    if (!data) return;

    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    const oldTeamId = project.teamId;

    // Remove from old team
    const updatedTeams = data.teams.map(team => {
      if (team.id === oldTeamId) {
        return { ...team, projects: team.projects.filter(p => p !== projectId) };
      } else if (team.id === newTeamId) {
        return { ...team, projects: [...team.projects, projectId] };
      }
      return team;
    });

    // Update project's teamId
    const updatedProjects = data.projects.map(p =>
      p.id === projectId ? { ...p, teamId: newTeamId } : p
    );

    setData({
      ...data,
      projects: updatedProjects,
      teams: updatedTeams,
    });

    if (selectedProject?.id === projectId) {
      setSelectedProject({ ...selectedProject, teamId: newTeamId });
    }
  };

  const updateCategoryWeight = (categoryId: string, weight: number) => {
    if (!data) return;

    const updatedCategories = data.config.categories.map(cat =>
      cat.id === categoryId ? { ...cat, weight } : cat
    );

    setData({
      ...data,
      config: {
        ...data.config,
        categories: updatedCategories,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
          <Link href={`/hackathon/${hackathonId}`} className="block text-center text-blue-600 hover:text-blue-800 mt-4 text-sm">
            ← Back to Results
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-600">Edit scores, descriptions, and awards</p>
                {currentHackathon && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentHackathon.resultsPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentHackathon.resultsPublished ? '✓ Results Published' : '📝 Draft Mode'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {message && (
                <span className={`px-4 py-2 rounded-lg ${
                  message.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </span>
              )}
              <button
                onClick={() => {
                  setShowHackathonSettings(!showHackathonSettings);
                  setShowAwardsManager(false);
                  setShowTeamManager(false);
                  setShowProjectManager(false);
                  setShowCategoryManager(false);
                }}
                className="px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                ⚙️ Hackathon Settings
              </button>
              <button
                onClick={() => {
                  setShowCategoryManager(!showCategoryManager);
                  setShowProjectManager(false);
                  setShowTeamManager(false);
                  setShowAwardsManager(false);
                  setShowHackathonSettings(false);
                }}
                className="px-4 py-2 border border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                ⚖️ Score Categories
              </button>
              <button
                onClick={() => {
                  setShowProjectManager(!showProjectManager);
                  setShowTeamManager(false);
                  setShowAwardsManager(false);
                  setShowHackathonSettings(false);
                  setShowCategoryManager(false);
                }}
                className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                📋 Manage Projects
              </button>
              <button
                onClick={() => {
                  setShowTeamManager(!showTeamManager);
                  setShowAwardsManager(false);
                  setShowHackathonSettings(false);
                  setShowProjectManager(false);
                  setShowCategoryManager(false);
                }}
                className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                👥 Manage Teams
              </button>
              <button
                onClick={() => {
                  setShowAwardsManager(!showAwardsManager);
                  setShowHackathonSettings(false);
                  setShowTeamManager(false);
                  setShowProjectManager(false);
                  setShowCategoryManager(false);
                }}
                className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                🏆 Manage Awards
              </button>
              <Link
                href={`/hackathon/${hackathonId}`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hackathon Settings */}
        {showHackathonSettings && currentHackathon && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Hackathon Settings</h2>
            
            <div className="space-y-4">
              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emoticon
                </label>
                <input
                  type="text"
                  value={currentHackathon.emoji}
                  onChange={(e) => updateHackathonInfo('emoji', e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center text-3xl focus:ring-2 focus:ring-purple-500"
                  maxLength={2}
                  placeholder="🎃"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Choose an emoji that represents this hackathon
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={currentHackathon.name}
                  onChange={(e) => updateHackathonInfo('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Halloween Hackathon 2025"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={currentHackathon.description}
                  onChange={(e) => updateHackathonInfo('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe this hackathon event..."
                />
              </div>

              {/* Date (read-only info) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={currentHackathon.date}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Date cannot be changed (it's part of the hackathon ID)
                </p>
              </div>

              {/* Publish Results Toggle */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">Publish Results</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      When published, the Top 3 rankings will be visible to everyone.
                      <br />
                      Keep unpublished while you're still entering scores.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentHackathon.resultsPublished}
                      onChange={(e) => updateHackathonInfo('resultsPublished', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {currentHackathon.resultsPublished ? 'Published ✓' : 'Draft'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={saveHackathonSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Save Hackathon Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Score Categories Manager */}
        {showCategoryManager && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚖️ Score Categories & Weights</h2>
            
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">About Weights</h3>
              <p className="text-sm text-gray-700">
                Adjust the weight of each scoring category to reflect its importance. 
                Higher weights mean the category has more influence on the overall score.
                <br />
                <span className="font-medium">Example:</span> If "Innovation" has weight 2 and "Polish" has weight 1, 
                Innovation counts twice as much toward the final score.
              </p>
            </div>

            <div className="space-y-3">
              {data.config.categories.map(category => (
                <div key={category.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{category.label}</h4>
                      <p className="text-xs text-gray-500 mt-1">ID: {category.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">
                        Weight:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={category.weight}
                        onChange={(e) => updateCategoryWeight(category.id, parseFloat(e.target.value) || 1)}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">💡 Tip:</span> The weights will be applied when calculating overall scores. 
                Projects are ranked based on the weighted average of all category scores.
              </p>
            </div>
          </div>
        )}

        {/* Project Manager */}
        {showProjectManager && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Project Manager</h2>
            
            {/* Add New Project */}
            <div className="mb-6 p-4 bg-orange-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Add New Project</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="e.g., Stereonet Aim Trainer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Team
                  </label>
                  <select
                    value={newProjectTeam}
                    onChange={(e) => setNewProjectTeam(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select a team...</option>
                    {data.teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.members.join(', ')})
                      </option>
                    ))}
                  </select>
                  {data.teams.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No teams available. Create a team first in the Team Manager.
                    </p>
                  )}
                </div>
                <button
                  onClick={addProject}
                  disabled={!newProjectTitle.trim() || !newProjectTeam}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
                >
                  Add Project
                </button>
              </div>
            </div>

            {/* Existing Projects */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Current Projects ({data.projects.length})</h3>
              <div className="space-y-3">
                {data.projects.map(project => {
                  const team = data.teams.find(t => t.id === project.teamId);
                  
                  return (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{project.title}</h4>
                          <div className="mt-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Assigned Team:
                            </label>
                            <select
                              value={project.teamId}
                              onChange={(e) => updateProjectTeam(project.id, e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500"
                            >
                              {data.teams.map(t => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            ID: {project.id} | Team: {team?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Edit Details
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {data.projects.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No projects yet. Add your first project above!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Team Manager */}
        {showTeamManager && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Team Manager</h2>
            
            {/* Add New Team */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Add New Team</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g., Alpha.ai Team"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newTeamMembers}
                    onChange={(e) => setNewTeamMembers(e.target.value)}
                    placeholder="e.g., Ted, Ali, Arnav"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate member names with commas
                  </p>
                </div>
                <button
                  onClick={addTeam}
                  disabled={!newTeamName.trim()}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  Add Team
                </button>
              </div>
            </div>

            {/* Existing Teams */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Current Teams ({data.teams.length})</h3>
              <div className="space-y-3">
                {data.teams.map(team => {
                  const isEditing = editingTeam === team.id;
                  const teamProjects = data.projects.filter(p => p.teamId === team.id);
                  
                  return (
                    <div key={team.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            id={`team-name-${team.id}`}
                            defaultValue={team.name}
                            onChange={(e) => {
                              const membersInput = document.getElementById(`team-members-${team.id}`) as HTMLTextAreaElement;
                              const newMembers = membersInput.value.split(',').map(m => m.trim()).filter(m => m.length > 0);
                              updateTeam(team.id, e.target.value, newMembers);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                          />
                          <textarea
                            id={`team-members-${team.id}`}
                            defaultValue={team.members.join(', ')}
                            onChange={(e) => {
                              const nameInput = document.getElementById(`team-name-${team.id}`) as HTMLInputElement;
                              const newMembers = e.target.value.split(',').map(m => m.trim()).filter(m => m.length > 0);
                              updateTeam(team.id, nameInput.value, newMembers);
                            }}
                            placeholder="Member names, comma-separated"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            rows={2}
                          />
                          <button
                            onClick={async () => {
                              setEditingTeam(null);
                              await saveTeamData();
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Done Editing
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{team.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Members:</span> {team.members.join(', ')}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {teamProjects.length} project{teamProjects.length !== 1 ? 's' : ''}
                                {teamProjects.length > 0 && ': ' + teamProjects.map(p => p.title).join(', ')}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => setEditingTeam(team.id)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTeam(team.id)}
                                className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {data.teams.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No teams yet. Add your first team above!
                </p>
              )}
            </div>
          </div>
        )}

        {/* Awards Manager */}
        {showAwardsManager && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Special Awards Manager</h2>
            
            {/* Add New Award */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Add New Award</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={newAwardName}
                    onChange={(e) => setNewAwardName(e.target.value)}
                    placeholder="Award name (e.g., Best Demo)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAwardEmoji}
                    onChange={(e) => setNewAwardEmoji(e.target.value)}
                    placeholder="Emoji"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl focus:ring-2 focus:ring-blue-500"
                    maxLength={2}
                  />
                  <button
                    onClick={addSpecialAward}
                    disabled={!newAwardName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    Add
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                💡 Tip: Use emojis like 🎉 🎨 ⭐ 💡 🔧 🏅 🚀 ✨ 🎯 🌟
              </p>
            </div>

            {/* Existing Awards */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Current Awards</h3>
              <div className="space-y-2">
                {data.config.specialAwards.map(award => (
                  <div key={award.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={award.emoji}
                      onChange={(e) => updateSpecialAward(award.id, award.name, e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-2xl"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      value={award.name}
                      onChange={(e) => updateSpecialAward(award.id, e.target.value, award.emoji)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => deleteSpecialAward(award.id)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Projects
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({data.projects.filter(p => calculateOverallScore(p.scores, data.config.categories) > 0).length}/{data.projects.length} reviewed)
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600">Sort by:</label>
                  <select
                    value={projectSortBy}
                    onChange={(e) => setProjectSortBy(e.target.value as any)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="score-desc">Score (High to Low)</option>
                    <option value="score-asc">Score (Low to High)</option>
                    <option value="alpha">Alphabetical</option>
                    <option value="team">Team Name</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {[...data.projects].sort((a, b) => {
                  const scoreA = calculateOverallScore(a.scores, data.config.categories);
                  const scoreB = calculateOverallScore(b.scores, data.config.categories);
                  const teamA = data.teams.find(t => t.id === a.teamId);
                  const teamB = data.teams.find(t => t.id === b.teamId);
                  
                  switch (projectSortBy) {
                    case 'score-desc':
                      return scoreB - scoreA;
                    case 'score-asc':
                      return scoreA - scoreB;
                    case 'alpha':
                      return a.title.localeCompare(b.title);
                    case 'team':
                      return (teamA?.name || '').localeCompare(teamB?.name || '');
                    default:
                      return 0;
                  }
                }).map(project => {
                  const team = data.teams.find(t => t.id === project.teamId);
                  const overallScore = calculateOverallScore(project.scores, data.config.categories);
                  const isReviewed = overallScore > 0;
                  
                  return (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedProject?.id === project.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {isReviewed ? (
                              <span className="text-green-500 text-xs">✓</span>
                            ) : (
                              <span className="text-orange-500 text-xs">⚠</span>
                            )}
                            <span className="truncate">{project.title}</span>
                          </div>
                          <div className="text-xs text-gray-600">{team?.name}</div>
                        </div>
                        {isReviewed && (
                          <div className="flex-shrink-0">
                            <span className={`text-sm font-bold ${getScoreColor(overallScore)}`}>
                              {formatScore(overallScore)}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Edit Panel */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                    <p className="text-gray-600">
                      {data.teams.find(t => t.id === selectedProject.teamId)?.name}
                    </p>
                    {(() => {
                      const overallScore = calculateOverallScore(selectedProject.scores, data.config.categories);
                      return overallScore > 0 ? (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Overall Score:</span>
                          <span className={`text-xl font-bold ${getScoreColor(overallScore)}`}>
                            {formatScore(overallScore)}
                          </span>
                          <span className="text-sm text-gray-500">/ 5.0</span>
                        </div>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg border border-orange-200">
                          <span className="text-sm font-medium text-orange-700">⚠ Not yet reviewed</span>
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {/* Project Title */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Project Title</h3>
                  <input
                    type="text"
                    value={selectedProject.title}
                    onChange={(e) => updateProjectTitle(selectedProject.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter project title"
                  />
                </div>

                {/* Scores */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Scores (1-5)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.config.categories.map(category => (
                      <div key={category.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {category.label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="1"
                          value={selectedProject.scores[category.id]}
                          onChange={(e) => updateProjectScore(
                            selectedProject.id,
                            category.id,
                            parseInt(e.target.value) || 0
                          )}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Awards */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Special Awards</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.config.specialAwards.map(award => (
                      <button
                        key={award.id}
                        onClick={() => toggleSpecialAward(selectedProject.id, award.id)}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                          selectedProject.specialAwards.includes(award.id)
                            ? 'bg-yellow-400 text-yellow-900 font-medium'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-xl">{award.emoji}</span>
                        <span>
                          {selectedProject.specialAwards.includes(award.id) ? '✓ ' : ''}
                          {award.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {data.config.specialAwards.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No awards defined yet. Click "🏆 Manage Awards" to add some!
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Description (Markdown)</h3>
                  <textarea
                    value={selectedProject.description}
                    onChange={(e) => updateProjectDescription(selectedProject.id, e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Use markdown formatting..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supports Markdown: ## Headings, **bold**, *italic*, [links](url), bullet lists, etc.
                  </p>
                </div>

                {/* Judges Notes */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📝 Judges Notes (Markdown)
                    <span className="text-xs font-normal text-gray-500">— Visible to all viewers</span>
                  </h3>
                  <textarea
                    value={selectedProject.judgesNotes || ''}
                    onChange={(e) => updateProjectJudgesNotes(selectedProject.id, e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-yellow-50"
                    placeholder="Add notes from judges... (e.g., highlights, feedback, commendations)"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 This section will be displayed publicly on the project page.
                  </p>
                </div>

                {/* Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Project Links</h3>
                  <div className="space-y-2">
                    {selectedProject.links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">{link.label}:</span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 truncate flex-1"
                        >
                          {link.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
                Select a project to edit
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

