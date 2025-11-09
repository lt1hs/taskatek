-- Fix RLS Policies for Workspaces and related tables
-- Run this after the initial schema setup

-- Workspaces: Allow users to create workspaces
CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can update workspace" ON workspaces
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete workspace" ON workspaces
  FOR DELETE USING (auth.uid() = owner_id);

-- Workspace members: Allow workspace owners to manage members
CREATE POLICY "Workspace members can view members" ON workspace_members
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can add members" ON workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can remove members" ON workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
  );

-- Spaces: Allow workspace members to manage spaces
CREATE POLICY "Workspace members can view spaces" ON spaces
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create spaces" ON spaces
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update spaces" ON spaces
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete spaces" ON spaces
  FOR DELETE USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Lists: Allow workspace members to manage lists
CREATE POLICY "Workspace members can view lists" ON lists
  FOR SELECT USING (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create lists" ON lists
  FOR INSERT WITH CHECK (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update lists" ON lists
  FOR UPDATE USING (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete lists" ON lists
  FOR DELETE USING (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

-- Folders: Allow workspace members to manage folders
CREATE POLICY "Workspace members can view folders" ON folders
  FOR SELECT USING (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create folders" ON folders
  FOR INSERT WITH CHECK (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update folders" ON folders
  FOR UPDATE USING (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete folders" ON folders
  FOR DELETE USING (
    space_id IN (
      SELECT s.id FROM spaces s
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

-- Tasks: Delete policy already exists, just add it here for completeness
CREATE POLICY "Workspace members can delete tasks" ON tasks
  FOR DELETE USING (
    list_id IN (
      SELECT l.id FROM lists l
      JOIN spaces s ON l.space_id = s.id
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

-- Comments: Allow workspace members to manage comments
CREATE POLICY "Workspace members can view comments" ON comments
  FOR SELECT USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN spaces s ON l.space_id = s.id
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create comments" ON comments
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN spaces s ON l.space_id = s.id
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Comment authors can update their comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Comment authors can delete their comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Attachments: Allow workspace members to manage attachments
CREATE POLICY "Workspace members can view attachments" ON attachments
  FOR SELECT USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN spaces s ON l.space_id = s.id
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create attachments" ON attachments
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN spaces s ON l.space_id = s.id
      JOIN workspace_members wm ON s.workspace_id = wm.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Attachment owners can delete attachments" ON attachments
  FOR DELETE USING (auth.uid() = user_id);

-- Automations: Allow workspace members to manage automations
CREATE POLICY "Workspace members can view automations" ON automations
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create automations" ON automations
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Automation creators can update automations" ON automations
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Automation creators can delete automations" ON automations
  FOR DELETE USING (auth.uid() = created_by);

-- Brain logs: Allow users to manage their own logs
CREATE POLICY "Users can view their brain logs" ON brain_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create brain logs" ON brain_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
