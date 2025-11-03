import Link from "next/link";
import { getData, getHackathonsList } from "@/lib/data";
import { calculateOverallScore } from "@/lib/utils";

export async function generateStaticParams() {
  const { hackathons } = await getHackathonsList();
  return hackathons.map((hackathon) => ({
    id: hackathon.id,
  }));
}

export default async function HackathonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getData(id);
  const { hackathons } = await getHackathonsList();
  const hackathonInfo = hackathons.find(h => h.id === id);
  
  // Calculate project scores and sort for leaderboard
  const projectsWithScores = data.projects.map(project => ({
    ...project,
    overallScore: calculateOverallScore(project.scores, data.config.categories)
  })).sort((a, b) => b.overallScore - a.overallScore);

  // Get top 3 projects
  const top3Projects = projectsWithScores.slice(0, 3);
  
  // Get remaining projects sorted alphabetically by title
  const remainingProjects = projectsWithScores.slice(3).sort((a, b) => 
    a.title.localeCompare(b.title)
  );

  // Get special award winners
  const awardWinners = data.projects.filter(p => p.specialAwards.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to All Hackathons
          </Link>
          <div className="flex justify-between items-center mt-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                {hackathonInfo?.emoji && <span className="text-4xl">{hackathonInfo.emoji}</span>}
                {hackathonInfo?.name || 'Hackathon Results'}
              </h1>
              <p className="text-gray-600 mt-1">
                {data.teams.length} Teams · {data.projects.length} Projects
              </p>
            </div>
            <Link
              href={`/hackathon/${id}/admin`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top 3 Projects - Only show if results are published */}
        {hackathonInfo?.resultsPublished && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🥇 Top 3 Projects
            </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {top3Projects.map((project, index) => {
                    const team = data.teams.find(t => t.id === project.teamId);
                    
                    return (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-2xl font-bold ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 
                            'text-orange-600'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            href={`/hackathon/${id}/team/${project.teamId}`}
                            className="text-blue-600 hover:text-blue-800 font-medium text-lg"
                          >
                            {project.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {team?.name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </section>
        )}

        {/* All Projects (or "All Other Projects" if results are published) */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📋 {hackathonInfo?.resultsPublished ? 'All Other Projects' : 'All Projects'}
          </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(hackathonInfo?.resultsPublished ? remainingProjects : projectsWithScores).map((project) => {
                    const team = data.teams.find(t => t.id === project.teamId);
                    
                    return (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link 
                            href={`/hackathon/${id}/team/${project.teamId}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {project.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {team?.name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Special Awards */}
        {awardWinners.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ⭐ Special Awards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awardWinners.map(project => {
                const team = data.teams.find(t => t.id === project.teamId);
                return (
                  <div key={project.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-400">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.title}
                      </h3>
                      <span className="text-2xl">🏅</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{team?.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.specialAwards.map(awardId => {
                        const award = data.config.specialAwards.find(a => a.id === awardId);
                        if (!award) return null;
                        return (
                          <span 
                            key={awardId}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full flex items-center gap-1"
                          >
                            <span>{award.emoji}</span>
                            <span>{award.name}</span>
                          </span>
                        );
                      })}
                    </div>
                    <Link
                      href={`/hackathon/${id}/team/${project.teamId}`}
                      className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* All Teams */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            👥 All Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.teams.map(team => {
              const teamProjects = data.projects.filter(p => p.teamId === team.id);

              return (
                <Link
                  key={team.id}
                  href={`/hackathon/${id}/team/${team.id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-400"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {team.name}
                  </h3>
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Team Members:</p>
                    <div className="flex flex-wrap gap-2">
                      {team.members.map(member => (
                        <span 
                          key={member}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-600">
                      {teamProjects.length} {teamProjects.length === 1 ? 'Project' : 'Projects'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

