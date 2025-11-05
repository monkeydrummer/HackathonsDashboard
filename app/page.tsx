import Link from "next/link";
import Image from "next/image";
import { getHackathonsList } from "@/lib/data";

export default async function Home() {
  const { hackathons } = await getHackathonsList();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/images/rocscience_logo.jpg"
                alt="Rocscience"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Rocscience Hackathon Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              View results from all our hackathon events
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Select a Hackathon
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map(hackathon => {
            const dateObj = new Date(hackathon.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <Link
                key={hackathon.id}
                href={`/hackathon/${hackathon.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {hackathon.name}
                  </h3>
                  <span className="text-3xl">{hackathon.emoji || '🎉'}</span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {hackathon.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formattedDate}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center text-blue-600 font-medium">
                  View Results
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {hackathons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hackathons yet. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  );
}
