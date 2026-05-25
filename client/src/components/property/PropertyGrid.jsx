const PropertyCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="skeleton aspect-[4/3] rounded-2xl mb-3" />
    <div className="space-y-2">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-4 w-1/3 rounded" />
    </div>
  </div>
);

const PropertyGrid = ({ properties, loading, columns = 4 }) => {
  const skeletons = Array.from({ length: 8 });

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  if (loading) {
    return (
      <div className={`grid ${gridCols[columns] || gridCols[4]} gap-6`}>
        {skeletons.map((_, i) => (
          <PropertyCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
        <p className="text-gray-500">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return null; // Parent handles grid rendering with PropertyCard
};

export { PropertyCardSkeleton };
export default PropertyGrid;
