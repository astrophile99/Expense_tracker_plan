-- =====================================================
-- Finance Tracker - Row-Level Security Policies
-- Migration: 00003_rls
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────
-- USERS
-- ────────────────────────────────────────
CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view profiles in shared workspaces" ON public.profiles
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM public.workspace_members
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- ────────────────────────────────────────
-- WORKSPACES
-- ────────────────────────────────────────
CREATE POLICY "Members can view workspaces" ON public.workspaces
  FOR SELECT USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins and owners can update workspaces" ON public.workspaces
  FOR UPDATE USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners can delete workspaces" ON public.workspaces
  FOR DELETE USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ────────────────────────────────────────
-- WORKSPACE MEMBERS
-- ────────────────────────────────────────
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

CREATE POLICY "Admins and owners can update member roles" ON public.workspace_members
  FOR UPDATE USING (
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

CREATE POLICY "Members can leave workspace" ON public.workspace_members
  FOR DELETE USING (user_id = auth.uid());

-- ────────────────────────────────────────
-- WORKSPACE INVITATIONS
-- ────────────────────────────────────────
CREATE POLICY "Admins can view invitations" ON public.workspace_invitations
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Admins can create invitations" ON public.workspace_invitations
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    AND invited_by = auth.uid()
  );

CREATE POLICY "Admins can cancel invitations" ON public.workspace_invitations
  FOR UPDATE USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Invited user can accept" ON public.workspace_invitations
  FOR UPDATE USING (email = auth.email() AND status = 'pending');

-- ────────────────────────────────────────
-- CATEGORIES
-- ────────────────────────────────────────
CREATE POLICY "Users can view categories" ON public.categories
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    OR is_default = TRUE
  );

CREATE POLICY "Users can create categories" ON public.categories
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (
    (user_id = auth.uid() AND is_default = FALSE)
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ────────────────────────────────────────
-- TRANSACTIONS
-- ────────────────────────────────────────
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

-- ────────────────────────────────────────
-- RECURRING TRANSACTIONS
-- ────────────────────────────────────────
CREATE POLICY "Users can view own recurring" ON public.recurring_transactions
  FOR SELECT USING (
    created_by = auth.uid()
    OR (
      workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
      AND visibility = 'workspace'
    )
  );

CREATE POLICY "Users can create recurring" ON public.recurring_transactions
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own recurring" ON public.recurring_transactions
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can soft-delete own recurring" ON public.recurring_transactions
  FOR UPDATE USING (created_by = auth.uid())
  WITH CHECK (deleted_at IS NOT NULL);

CREATE POLICY "Users can delete own recurring" ON public.recurring_transactions
  FOR DELETE USING (created_by = auth.uid());

-- ────────────────────────────────────────
-- BUDGETS
-- ────────────────────────────────────────
CREATE POLICY "Users can view budgets" ON public.budgets
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create budgets" ON public.budgets
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update budgets" ON public.budgets
  FOR UPDATE USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can delete budgets" ON public.budgets
  FOR DELETE USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ────────────────────────────────────────
-- ACTIVITY LOGS
-- ────────────────────────────────────────
CREATE POLICY "Users can view activity logs" ON public.activity_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "System can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- ────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (user_id = auth.uid());
