// Floating Action Button (FAB)

export function Fab({ onClick, label = 'Adicionar' }: { onClick: () => void; label?: string }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="fixed right-4 bottom-20 z-50 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors"
      title={label}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}
