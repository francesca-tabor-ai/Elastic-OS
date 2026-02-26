"use client";

interface Props {
  engagementDistribution: {
    fullCount: number;
    partialCount: number;
    elasticCount: number;
    minimalCount: number;
  };
  currentPayroll: number;
  fullCapacityPayroll: number;
  savings: number;
}

export function EmployerDashboardClient({
  engagementDistribution,
  currentPayroll,
  fullCapacityPayroll,
  savings,
}: Props) {
  const total =
    engagementDistribution.fullCount +
    engagementDistribution.partialCount +
    engagementDistribution.elasticCount +
    engagementDistribution.minimalCount;

  return (
    <div className="space-y-8">
      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Workforce engagement distribution</h2>
        {total === 0 ? (
          <p className="text-gray-500">No workers with active affiliations yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">
                {engagementDistribution.fullCount}
              </div>
              <div className="text-sm text-gray-500">Full engagement (80%+)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">
                {engagementDistribution.partialCount}
              </div>
              <div className="text-sm text-gray-500">Partial (50-80%)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">
                {engagementDistribution.elasticCount}
              </div>
              <div className="text-sm text-gray-500">Elastic retention (30-50%)</div>
            </div>
            <div className="p-3 rounded border">
              <div className="text-2xl font-bold">
                {engagementDistribution.minimalCount}
              </div>
              <div className="text-sm text-gray-500">Minimal (&lt;30%)</div>
            </div>
          </div>
        )}
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Payroll elasticity</h2>
        <div className="space-y-2">
          <div>
            Current payroll (at engagement levels): £
            {currentPayroll.toLocaleString()}
          </div>
          <div>
            Full capacity payroll (all at 100%): £
            {fullCapacityPayroll.toLocaleString()}
          </div>
          <div className="font-medium text-green-600 dark:text-green-400">
            Savings from elasticity: £{savings.toLocaleString()}
          </div>
        </div>
      </section>

      <section className="p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold mb-4">Cost savings vs layoff</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          By using elastic engagement instead of layoffs, you retain human
          capital and avoid rehiring costs. Workers in elastic retention remain
          affiliated and can be reactivated when demand recovers.
        </p>
      </section>
    </div>
  );
}
