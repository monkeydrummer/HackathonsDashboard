import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, getTeam, getTeamProjects } from "@/lib/data";
import { calculateOverallScore, formatScore, getScoreColor } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function generateStaticParams() {
  const data = await getData();
  return data.teams.map((team) => ({
    id: team.id,
  }));
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  
  if (!team) {
    notFound();
  }

  const projects = await getTeamProjects(id);
  const data = await getData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {team.name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {team.members.map(member => (
              <span 
                key={member}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
              >
                👤 {member}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Projects ({projects.length})
        </h2>

        <div className="space-y-8">
          {projects.map(project => {
            const overallScore = calculateOverallScore(project.scores, data.config.categories);
            const hasScore = overallScore > 0;

            return (
              <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Project Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-white">
                      {project.title}
                    </h3>
                    {hasScore && (
                      <div className="bg-white rounded-lg px-4 py-2">
                        <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                          {formatScore(overallScore)}
                        </span>
                        <span className="text-gray-600 text-sm ml-1">/ 5.0</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Special Awards */}
                  {project.specialAwards.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.specialAwards.map(award => (
                        <span 
                          key={award}
                          className="px-3 py-1 bg-yellow-400 text-yellow-900 text-sm font-medium rounded-full"
                        >
                          🏅 {award}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Score Breakdown */}
                  {hasScore && (
                    <div className="mb-6 pb-6 border-b">
                      <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {data.config.categories.map(category => {
                          const score = project.scores[category.id];
                          return (
                            <div key={category.id} className="text-center">
                              <div className="text-2xl font-bold text-gray-900">
                                {score > 0 ? score : '-'}
                                <span className="text-sm text-gray-500">/5</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {category.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {project.description}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Images */}
                  {project.images.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Screenshots & Media</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.images.map((image, index) => (
                          <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                            <img 
                              src={`/images/${image}`} 
                              alt={`${project.title} screenshot ${index + 1}`}
                              className="w-full h-auto"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {project.links.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Links</h4>
                      <div className="flex flex-wrap gap-3">
                        {project.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            {link.label}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

