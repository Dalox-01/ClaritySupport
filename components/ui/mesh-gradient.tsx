"use client";

export function MeshGradient() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full mix-blend-multiply opacity-50 animate-blob transform-gpu dark:mix-blend-screen bg-[radial-gradient(circle,rgba(96,165,250,0.4)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(37,99,235,0.3)_0%,transparent_70%)]"></div>
      <div className="absolute top-0 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full mix-blend-multiply opacity-50 animate-blob animation-delay-2000 transform-gpu dark:mix-blend-screen bg-[radial-gradient(circle,rgba(192,132,252,0.4)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(147,51,234,0.3)_0%,transparent_70%)]"></div>
      <div className="absolute -bottom-32 left-1/3 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full mix-blend-multiply opacity-50 animate-blob animation-delay-4000 transform-gpu dark:mix-blend-screen bg-[radial-gradient(circle,rgba(34,211,238,0.4)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(8,145,178,0.3)_0%,transparent_70%)]"></div>
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full mix-blend-multiply opacity-50 animate-blob animation-delay-2000 transform-gpu dark:mix-blend-screen bg-[radial-gradient(circle,rgba(129,140,248,0.4)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(79,70,229,0.3)_0%,transparent_70%)]"></div>
    </div>
  );
}
