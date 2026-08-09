import { PROFILE_TEMPLATES, type ProfileTemplate } from '~/lib/profileTemplates';
import { ENVIRONMENT_ROLES } from '~/types';

interface TemplateSelectorProps {
  onSelect: (template: ProfileTemplate) => void;
  onCancel: () => void;
}

export function TemplateSelector({ onSelect, onCancel }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-1">Choose a Template</h4>
        <p className="text-xs text-muted-foreground">
          Start with a pre-built template and customize the URLs for your project.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PROFILE_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="text-left p-3 rounded-lg border hover:border-primary/50 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">{template.icon}</span>
              <span className="text-sm font-medium">{template.name}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
            <div className="flex flex-wrap gap-1">
              {template.profile.entries.map((entry, i) => {
                const roleConfig = ENVIRONMENT_ROLES[entry.role];
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground"
                  >
                    {roleConfig.shortLabel}
                  </span>
                );
              })}
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={onCancel} className="btn btn-secondary text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
