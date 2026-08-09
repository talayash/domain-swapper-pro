import { useState } from 'react';
import { Plus, Pencil, Trash2, Share2, FileText, Layers } from 'lucide-react';
import type { Profile, ProfileDomainEntry } from '~/types';
import { ENVIRONMENT_ROLES } from '~/types';
import { useStore } from '~/store';
import { ProfileEditorModal } from './ProfileEditorModal';
import { ProfileShareModal } from './ProfileShareModal';
import { TemplateSelector } from './TemplateSelector';
import type { ProfileTemplate } from '~/lib/profileTemplates';

export function Profiles() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [shareProfile, setShareProfile] = useState<Profile | null>(null);
  const [templateEntries, setTemplateEntries] = useState<Omit<ProfileDomainEntry, 'id' | 'order'>[] | undefined>(undefined);

  const profiles = useStore((state) => state.profiles);
  const addProfile = useStore((state) => state.addProfile);
  const updateProfile = useStore((state) => state.updateProfile);
  const deleteProfile = useStore((state) => state.deleteProfile);

  const handleCreate = () => {
    setEditingProfile(null);
    setTemplateEntries(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setTemplateEntries(undefined);
    setIsEditorOpen(true);
  };

  const handleDelete = (profile: Profile) => {
    if (confirm(`Delete profile "${profile.name}"? This cannot be undone.`)) {
      deleteProfile(profile.id);
    }
  };

  const handleShare = (profile: Profile) => {
    setShareProfile(profile);
    setIsShareOpen(true);
  };

  const handleTemplateSelect = (template: ProfileTemplate) => {
    setShowTemplates(false);
    setEditingProfile(null);
    setTemplateEntries(template.profile.entries);
    setIsEditorOpen(true);
  };

  const handleSave = (data: {
    name: string;
    description?: string;
    entries: Omit<ProfileDomainEntry, 'id' | 'order'>[];
  }) => {
    if (editingProfile) {
      updateProfile(editingProfile.id, data);
    } else {
      addProfile(data);
    }
  };

  if (showTemplates) {
    return (
      <TemplateSelector
        onSelect={handleTemplateSelect}
        onCancel={() => setShowTemplates(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Environment Profiles</h3>
          <div className="flex gap-2">
            <button onClick={() => setShowTemplates(true)} className="btn btn-secondary text-sm">
              <FileText className="h-4 w-4 mr-2" />
              From Template
            </button>
            <button onClick={handleCreate} className="btn btn-primary text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Group related domains by environment (production, staging, dev, etc.) for quick switching.
          Share profiles with teammates using encoded links.
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Layers className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No profiles yet</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setShowTemplates(true)} className="btn btn-secondary text-sm">
              <FileText className="h-4 w-4 mr-2" />
              Start from Template
            </button>
            <button onClick={handleCreate} className="btn btn-primary text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="border rounded-lg p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium">{profile.name}</h4>
                  {profile.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{profile.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShare(profile)}
                    className="action-btn"
                    title="Share"
                  >
                    <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleEdit(profile)}
                    className="action-btn"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(profile)}
                    className="action-btn-danger"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {[...profile.entries]
                  .sort((a, b) => a.order - b.order)
                  .map((entry) => {
                    const roleConfig = ENVIRONMENT_ROLES[entry.role];
                    return (
                      <div
                        key={entry.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: roleConfig.dotColor }}
                        />
                        <span className="font-medium">{roleConfig.shortLabel}</span>
                        <span className="text-muted-foreground">{entry.label || entry.url}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      <ProfileEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingProfile(null);
          setTemplateEntries(undefined);
        }}
        onSave={handleSave}
        editingProfile={editingProfile}
        initialEntries={templateEntries}
      />

      <ProfileShareModal
        isOpen={isShareOpen}
        onClose={() => {
          setIsShareOpen(false);
          setShareProfile(null);
        }}
        profile={shareProfile}
      />
    </div>
  );
}
