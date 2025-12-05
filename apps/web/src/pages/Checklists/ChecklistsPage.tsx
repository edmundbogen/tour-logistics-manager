import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Folder } from 'lucide-react';
import { getChecklistTemplates } from '../../lib/api';
import { cn } from '../../lib/utils';

export default function ChecklistsPage() {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['checklistTemplates'],
    queryFn: getChecklistTemplates
  });

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  const categoryOrder = ['Pre-Tour', 'Pre-Show', 'Day-Of', 'Travel', 'Venue', 'Safety', 'Post-Tour'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checklists</h1>
        <p className="text-gray-500 mt-1">Standard operating checklists for tour management</p>
      </div>

      <div className="space-y-8">
        {categoryOrder.map(category => {
          const categoryTemplates = groupedTemplates[category];
          if (!categoryTemplates) return null;

          return (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <Folder className="h-5 w-5 mr-2 text-primary-600" />
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTemplates.map(template => (
                  <div key={template.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <span className="badge badge-gray">
                        {template.items.length} items
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {template.items.slice(0, 4).map((item, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <CheckSquare className="h-4 w-4 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{item.text}</span>
                        </li>
                      ))}
                      {template.items.length > 4 && (
                        <li className="text-sm text-gray-400 pl-6">
                          +{template.items.length - 4} more items
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6 bg-primary-50 border-primary-200">
        <h3 className="font-semibold text-primary-900 mb-2">How to Use Checklists</h3>
        <p className="text-primary-700 text-sm">
          These checklist templates can be applied to individual shows. Go to any show detail page
          and you can add checklists from the available templates. Track progress as you complete
          each item on the day of the show.
        </p>
      </div>
    </div>
  );
}
