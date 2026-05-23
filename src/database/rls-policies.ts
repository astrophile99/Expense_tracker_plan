export const rlsPolicies = `
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Workspaces policies
CREATE POLICY "Users can view workspaces they belong to" ON public.workspaces
  FOR SELECT USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Workspace owners can update" ON public.workspaces
  FOR UPDATE USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Workspace owners can delete" ON public.workspaces
  FOR DELETE USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Workspace members policies
CREATE POLICY "Members can view workspace members" ON public.workspace_members
  FOR SELECT USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can add members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can remove members" ON public.workspace_members
  FOR DELETE USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    AND user_id != auth.uid()
  );

-- Categories policies
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create categories" ON public.categories
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (
    created_by = auth.uid()
    OR (
      workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
      AND visibility = 'workspace'
    )
  );

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (created_by = auth.uid());

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create budgets" ON public.budgets
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Activity logs policies
CREATE POLICY "Users can view activity logs" ON public.activity_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "System can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());
`