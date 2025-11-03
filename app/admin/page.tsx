'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HackathonData, Project } from '@/lib/types';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<HackathonData | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    const response = await fetch('/api/data');
    const result = await response.json();
    setData(result);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper auth
    if (password === 'hackathon2024' || password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
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
        body: JSON.stringify(data),
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

  const toggleSpecialAward = (projectId: string, award: string) => {
    if (!data) return;

    const updatedProjects = data.projects.map(project => {
      if (project.id === projectId) {
        const hasAward = project.specialAwards.includes(award);
        const updatedProject = {
          ...project,
          specialAwards: hasAward
            ? project.specialAwards.filter(a => a !== award)
            : [...project.specialAwards, award],
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
          <Link href="/" className="block text-center text-blue-600 hover:text-blue-800 mt-4 text-sm">
            ← Back to Home
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
              <p className="text-gray-600 mt-1">Edit scores, descriptions, and awards</p>
            </div>
            <div className="flex gap-3">
              {message && (
                <span className={`px-4 py-2 rounded-lg ${
                  message.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {message}
                </span>
              )}
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Projects</h2>
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                {data.projects.map(project => {
                  const team = data.teams.find(t => t.id === project.teamId);
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
                      <div className="font-medium text-gray-900">{project.title}</div>
                      <div className="text-xs text-gray-600">{team?.name}</div>
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
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                    <p className="text-gray-600">
                      {data.teams.find(t => t.id === selectedProject.teamId)?.name}
                    </p>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
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

