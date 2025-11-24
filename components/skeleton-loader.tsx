import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function EmailSkeletonLoader() {
  return (
    <Card className="animate-slide-up">
      <CardHeader className="space-y-3">
        <div className="skeleton h-6 w-3/4 rounded-md"></div>
        <div className="skeleton h-4 w-1/2 rounded-md"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded-md"></div>
          <div className="skeleton h-4 w-full rounded-md"></div>
          <div className="skeleton h-4 w-5/6 rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded-md"></div>
          <div className="skeleton h-4 w-4/5 rounded-md"></div>
          <div className="skeleton h-4 w-full rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded-md"></div>
          <div className="skeleton h-4 w-3/4 rounded-md"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HistorySkeletonLoader() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-20 w-full rounded-lg" style={{ animationDelay: `${i * 0.1}s` }}></div>
      ))}
    </div>
  );
}

export function TemplateSkeletonLoader() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-32 w-full rounded-lg" style={{ animationDelay: `${i * 0.1}s` }}></div>
      ))}
    </div>
  );
}
