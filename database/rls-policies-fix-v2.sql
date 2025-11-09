-- Fix RLS Policies - Avoiding Infinite Recursion
-- Run this to replace the problematic policies

-- First, drop all existing policies
DROP POLICY IF EXISTS "Workspace members can view workspace" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update workspace" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete workspace" ON workspaces;

DROP POLICY IF EXISTS "Workspace members can view members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can add members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON workspace_members;

DROP POLICY IF EXISTS "Workspace members can view spaces" ON spaces;
DROP POLICY IF EXISTS "Workspace members can create spaces" ON spaces;
DROP POLICY IF EXISTS "Workspace members can update spaces" ON spaces;
DROP POLICY IF EXISTS "Workspace members can delete spaces" ON spaces;

DROP POLICY IF EXISTS "Workspace members can view lists" ON lists;
DROP POLICY IF EXISTS "Workspace members can create lists" ON lists;
DROP POLICY IF EXISTS "Workspace members can update lists" ON lists;
DROP POLICY IF EXISTS "Workspace members can delete lists" ON lists;

DROP POLICY IF EXISTS "Workspace members can view folders" ON folders;
DROP POLICY IF EXISTS "Workspace members can create folders" ON folders;
DROP POLICY IF EXISTS "Workspace members can update folders" ON folders;
DROP POLICY IF EXISTS "Workspace members can delete folders" ON folders;

DROP POLICY IF EXISTS "Workspace members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Workspace members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Workspace members can update tasks" ON tasks;
DROP POLICY IF EXISTS "Workspace members can delete tasks" ON tasks;

DROP POLICY IF EXISTS "Workspace members can view comments" ON comments;
DROP POLICY IF EXISTS "Workspace members can create comments" ON comments;
DROP POLICY IF EXISTS "Comment authors can update their comments" ON comments;
DROP POLICY IF EXISTS "Comment authors can delete their comments" ON comments;

DROP POLICY IF EXISTS "Workspace members can view attachments" ON attachments;
DROP POLICY IF EXISTS "Workspace members can create attachments" ON attachments;
DROP POLICY IF EXISTS "Attachment owners can delete attachments" ON attachments;

DROP POLICY IF EXISTS "Workspace members can view automations" ON automations;
DROP POLICY IF EXISTS "Workspace members can create automations" ON automations;
DROP POLICY IF EXISTS "Automation creators can update automations" ON automations;
DROP POLICY IF EXISTS "Automation creators can delete automations" ON automations;

DROP POLICY IF EXISTS "Users can view their brain logs" ON brain_logs;
DROP POLICY IF EXISTS "Users can create brain logs" ON brain_logs;

-- WORKSPACES: Owner-based access
CREATE POLICY "Users can view their workspaces" ON workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update workspace" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete workspace" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- WORKSPACE_MEMBERS: Direct user-based access (no recursion)
CREATE POLICY "Users can view workspace members" ON workspace_members
  FOR SELECT USING (user_id = auth.uid() OR workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Workspace owners can add members" ON workspace_members
  FOR INSERT WITH CHECK (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Workspace owners can update members" ON workspace_members
  FOR UPDATE USING (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

CREATE POLICY "Workspace owners can remove members" ON workspace_members
  FOR DELETE USING (workspace_id IN (
    SELECT id FROM workspaces WHERE owner_id = auth.uid()
  ));

-- SPACES: Access through workspace ownership or membership
CREATE POLICY "Users can view spaces" ON spaces
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR
    workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create spaces" ON spaces
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR
    workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update spaces" ON spaces
  FOR UPDATE USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR
    workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete spaces" ON spaces
  FOR DELETE USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

-- LISTS: Access through spaces
CREATE POLICY "Users can view lists" ON lists
  FOR SELECT USING (
    space_id IN (
      SELECT s.id FROM spaces s
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create lists" ON lists
  FOR INSERT WITH CHECK (
    space_id IN (
      SELECT s.id FROM spaces s
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update lists" ON lists
  FOR UPDATE USING (
    space_id IN (
      SELECT s.id FROM spaces s
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete lists" ON lists
  FOR DELETE USING (
    space_id IN (
      SELECT s.id FROM spaces s
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- FOLDERS: Access through spaces
CREATE POLICY "Users can view folders" ON folders
  FOR SELECT USING (
    space_id IN (
      SELECT s.id FROM spaces s
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create folders" ON folders
  FOR INSERT WITH CHECK (
    space_id IN (
      SELECT s.id FROM spaces s
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update folders" ON folders
  FOR UPDATE USING (
    space_id IN (
      SELECT s.id FROM spaces s
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete folders" ON folders
  FOR DELETE USING (
    space_id IN (
      SELECT s.id FROM spaces s
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- TASKS: Access through lists
CREATE POLICY "Users can view tasks" ON tasks
  FOR SELECT USING (
    list_id IN (
      SELECT l.id FROM lists l
      JOIN spaces s ON l.space_id = s.id
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    list_id IN (
      SELECT l.id FROM lists l
      JOIN spaces s ON l.space_id = s.id
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (
    list_id IN (
      SELECT l.id FROM lists l
      JOIN spaces s ON l.space_id = s.id
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete tasks" ON tasks
  FOR DELETE USING (
    list_id IN (
      SELECT l.id FROM lists l
      JOIN spaces s ON l.space_id = s.id
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- COMMENTS: Access through tasks
CREATE POLICY "Users can view comments" ON comments
  FOR SELECT USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN spaces s ON l.space_id = s.id
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN spaces s ON l.space_id = s.id
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- ATTACHMENTS: Access through tasks
CREATE POLICY "Users can view attachments" ON attachments
  FOR SELECT USING (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN spaces s ON l.space_id = s.id
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create attachments" ON attachments
  FOR INSERT WITH CHECK (
    task_id IN (
      SELECT t.id FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN spaces s ON l.space_id = s.id
      WHERE s.workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR s.workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their attachments" ON attachments
  FOR DELETE USING (auth.uid() = user_id);

-- AUTOMATIONS: Workspace-level access
CREATE POLICY "Users can view automations" ON automations
  FOR SELECT USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR
    workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create automations" ON automations
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
    OR
    workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their automations" ON automations
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their automations" ON automations
  FOR DELETE USING (auth.uid() = created_by);

-- BRAIN_LOGS: User-level access
CREATE POLICY "Users can view their brain logs" ON brain_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create brain logs" ON brain_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
